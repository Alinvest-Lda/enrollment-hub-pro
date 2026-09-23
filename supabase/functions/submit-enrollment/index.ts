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

    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const company = formData.get("company") as string | null;
    const nuit = formData.get("nuit") as string;
    const province = formData.get("province") as string | null;
    const message = formData.get("message") as string | null;
    const courseId = formData.get("courseId") as string;
    const courseName = formData.get("courseName") as string;
    const paymentPlan = formData.get("paymentPlan") as string;
    const amountDue = parseFloat(formData.get("amountDue") as string);
    const totalPrice = parseFloat(formData.get("totalPrice") as string);
    const paymentMethod = formData.get("paymentMethod") as string | null;
    const file = formData.get("file") as File | null;

    // Validate required fields
    if (!fullName || !email || !phone || !courseId || !courseName || !paymentPlan || isNaN(amountDue) || isNaN(totalPrice)) {
      return new Response(
        JSON.stringify({ success: false, error: "Campos obrigatórios em falta" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: "Email inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate phone
    const normalizedPhone = phone.replace(/\D/g, "").replace(/^258/, "");
    if (!/^(84|85|86|87)\d{7}$/.test(normalizedPhone)) {
      return new Response(
        JSON.stringify({ success: false, error: "Telefone inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Re-read the course and payment plan server-side. Never trust prices sent by the browser.
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("slug, title, price, is_active, payment_plan_group")
      .eq("slug", courseId)
      .eq("is_active", true)
      .maybeSingle();

    if (courseError || !course) {
      return new Response(
        JSON.stringify({ success: false, error: "Curso indisponível ou inválido." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: plan, error: planError } = await supabase
      .from("payment_plans")
      .select("id, installments, is_active, payment_plan_group")
      .eq("id", paymentPlan)
      .eq("is_active", true)
      .maybeSingle();

    if (planError || !plan) {
      return new Response(
        JSON.stringify({ success: false, error: "Plano de pagamento inválido." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const coursePrice = Number(course.price);
    const installments = Array.isArray(plan.installments)
      ? plan.installments as Array<{ percent?: number }>
      : [];
    const firstPercent = Number(installments[0]?.percent ?? 100);
    const expectedAmountDue = Math.round(coursePrice * firstPercent) / 100;
    const planGroup = course.payment_plan_group || "2-weeks";
    const planIsCompatible = plan.payment_plan_group === "all" || plan.payment_plan_group === planGroup;

    if (
      !planIsCompatible ||
      !Number.isFinite(coursePrice) ||
      !Number.isFinite(expectedAmountDue) ||
      Math.abs(totalPrice - coursePrice) > 0.01 ||
      Math.abs(amountDue - expectedAmountDue) > 0.01
    ) {
      return new Response(
        JSON.stringify({ success: false, error: "Os valores da inscrição foram alterados. Actualize a página e tente novamente." }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("enrollments")
      .insert({
        full_name: fullName.trim().substring(0, 100),
        email: email.trim().substring(0, 255),
        phone: normalizedPhone,
        company: company?.trim().substring(0, 100) || null,
        nuit: nuit?.trim().substring(0, 20) || null,
        province: province?.trim().substring(0, 50) || null,
        message: message?.trim().substring(0, 500) || null,
        course_id: courseId.substring(0, 100),
        course_name: String(course.title).substring(0, 200),
        payment_plan: paymentPlan,
        amount_due: expectedAmountDue,
        total_price: coursePrice,
        payment_method: paymentMethod || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (enrollmentError) {
      console.error("Enrollment insert error:", enrollmentError);
      return new Response(
        JSON.stringify({ success: false, error: "Erro ao criar inscrição" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let proofData = null;

    // Upload file if provided
    if (file) {
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

      const ext = file.name.split(".").pop() || "bin";
      const filePath = `${enrollment.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(filePath, file, { contentType: file.type });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        // Enrollment was created but file failed — still return success with warning
      } else {
        const { error: proofError } = await supabase
          .from("payment_proofs")
          .insert({
            enrollment_id: enrollment.id,
            file_path: filePath,
            file_name: file.name.substring(0, 200),
            file_type: file.type,
            installment_number: 1,
          });

        if (proofError) {
          console.error("Proof insert error:", proofError);
        } else {
          proofData = { filePath, fileName: file.name };
        }
      }
    }

    // Trigger admin notification (fire and forget)
    try {
      await supabase.functions.invoke("notify-admin", {
        body: {
          enrollmentId: enrollment.id,
          courseName: courseName,
          studentName: fullName,
          amount: amountDue,
        },
      });
    } catch (notifErr) {
      console.error("Notification error (non-blocking):", notifErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        enrollmentId: enrollment.id,
        proof: proofData,
        message: "Inscrição criada com sucesso",
      }),
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
