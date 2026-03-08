import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const enrollmentId = formData.get("enrollmentId") as string;
    const installmentNumber = parseInt(formData.get("installmentNumber") as string, 10);
    const file = formData.get("file") as File | null;

    if (!enrollmentId || !installmentNumber || !file) {
      return new Response(
        JSON.stringify({ success: false, error: "Campos obrigatórios em falta" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate file
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ success: false, error: "Tipo de ficheiro não suportado. Use JPG, PNG ou PDF." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (file.size > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ success: false, error: "Ficheiro muito grande. Máximo 10MB." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify enrollment exists
    const { data: enrollment, error: eErr } = await supabase
      .from("enrollments")
      .select("id")
      .eq("id", enrollmentId)
      .maybeSingle();

    if (eErr || !enrollment) {
      return new Response(
        JSON.stringify({ success: false, error: "Inscrição não encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Upload file to storage
    const ext = file.name.split(".").pop() || "bin";
    const filePath = `${enrollmentId}/installment-${installmentNumber}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("payment-proofs")
      .upload(filePath, file, { contentType: file.type });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(
        JSON.stringify({ success: false, error: "Erro ao enviar ficheiro" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert proof record
    const { error: proofError } = await supabase
      .from("payment_proofs")
      .insert({
        enrollment_id: enrollmentId,
        file_path: filePath,
        file_name: file.name.substring(0, 200),
        file_type: file.type,
        installment_number: installmentNumber,
      });

    if (proofError) {
      console.error("Proof insert error:", proofError);
      return new Response(
        JSON.stringify({ success: false, error: "Erro ao registar comprovativo" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, filePath, message: "Comprovativo enviado com sucesso" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
