export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      certificate_templates: {
        Row: {
          background_color: string
          body_template: string
          border_style: string
          closing_text: string
          created_at: string
          description: string
          example_image_url: string | null
          footer_text: string
          header_text: string
          id: string
          institution_name: string
          intro_text: string
          is_active: boolean
          is_default: boolean
          language: string
          logo_url: string | null
          name: string
          signature_label: string
          signature_name: string
          signature2_label: string
          signature2_name: string
          updated_at: string
          variables: string[]
        }
        Insert: {
          background_color?: string
          body_template?: string
          border_style?: string
          closing_text?: string
          created_at?: string
          description?: string
          example_image_url?: string | null
          footer_text?: string
          header_text?: string
          id?: string
          institution_name?: string
          intro_text?: string
          is_active?: boolean
          is_default?: boolean
          language?: string
          logo_url?: string | null
          name: string
          signature_label?: string
          signature_name?: string
          signature2_label?: string
          signature2_name?: string
          updated_at?: string
          variables?: string[]
        }
        Update: {
          background_color?: string
          body_template?: string
          border_style?: string
          closing_text?: string
          created_at?: string
          description?: string
          example_image_url?: string | null
          footer_text?: string
          header_text?: string
          id?: string
          institution_name?: string
          intro_text?: string
          is_active?: boolean
          is_default?: boolean
          language?: string
          logo_url?: string | null
          name?: string
          signature_label?: string
          signature_name?: string
          signature2_label?: string
          signature2_name?: string
          updated_at?: string
          variables?: string[]
        }
        Relationships: []
      }
      certificates: {
        Row: {
          certificate_code: string
          course_duration: string
          course_name: string
          created_at: string
          custom_fields: Json
          end_date: string | null
          enrollment_id: string | null
          id: string
          issue_date: string
          language: string
          start_date: string | null
          status: string
          student_name: string
          template_id: string | null
          trainer_name: string
          updated_at: string
        }
        Insert: {
          certificate_code: string
          course_duration?: string
          course_name: string
          created_at?: string
          custom_fields?: Json
          end_date?: string | null
          enrollment_id?: string | null
          id?: string
          issue_date?: string
          language?: string
          start_date?: string | null
          status?: string
          student_name: string
          template_id?: string | null
          trainer_name?: string
          updated_at?: string
        }
        Update: {
          certificate_code?: string
          course_duration?: string
          course_name?: string
          created_at?: string
          custom_fields?: Json
          end_date?: string | null
          enrollment_id?: string | null
          id?: string
          issue_date?: string
          language?: string
          start_date?: string | null
          status?: string
          student_name?: string
          template_id?: string | null
          trainer_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "certificate_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string
          created_at: string
          currency: string
          description: string
          duration: string
          duration_weeks: number
          highlights: string[]
          id: string
          image: string
          is_active: boolean
          payment_plan_group: string
          price: number
          slug: string
          start_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          currency?: string
          description?: string
          duration?: string
          duration_weeks?: number
          highlights?: string[]
          id?: string
          image?: string
          is_active?: boolean
          payment_plan_group?: string
          price?: number
          slug: string
          start_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          currency?: string
          description?: string
          duration?: string
          duration_weeks?: number
          highlights?: string[]
          id?: string
          image?: string
          is_active?: boolean
          payment_plan_group?: string
          price?: number
          slug?: string
          start_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          admin_notes: string | null
          amount_due: number
          company: string | null
          course_id: string
          course_name: string
          created_at: string
          email: string
          full_name: string
          id: string
          message: string | null
          nuit: string | null
          payment_method: string | null
          payment_plan: Database["public"]["Enums"]["payment_plan_type"]
          phone: string
          source: Database["public"]["Enums"]["enrollment_source"]
          status: Database["public"]["Enums"]["payment_status"]
          total_price: number
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          amount_due: number
          company?: string | null
          course_id: string
          course_name: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          message?: string | null
          nuit?: string | null
          payment_method?: string | null
          payment_plan?: Database["public"]["Enums"]["payment_plan_type"]
          phone: string
          source?: Database["public"]["Enums"]["enrollment_source"]
          status?: Database["public"]["Enums"]["payment_status"]
          total_price: number
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          amount_due?: number
          company?: string | null
          course_id?: string
          course_name?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          nuit?: string | null
          payment_method?: string | null
          payment_plan?: Database["public"]["Enums"]["payment_plan_type"]
          phone?: string
          source?: Database["public"]["Enums"]["enrollment_source"]
          status?: Database["public"]["Enums"]["payment_status"]
          total_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      installments: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          due_date: string
          enrollment_id: string
          id: string
          installment_number: number
          paid_date: string | null
          payment_method: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          due_date?: string
          enrollment_id: string
          id?: string
          installment_number?: number
          paid_date?: string | null
          payment_method?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          due_date?: string
          enrollment_id?: string
          id?: string
          installment_number?: number
          paid_date?: string | null
          payment_method?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "installments_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_plans: {
        Row: {
          created_at: string
          description: string
          id: string
          installments: Json
          is_active: boolean
          is_default: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          installments?: Json
          is_active?: boolean
          is_default?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          installments?: Json
          is_active?: boolean
          is_default?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_proofs: {
        Row: {
          created_at: string
          enrollment_id: string
          file_name: string
          file_path: string
          file_type: string
          id: string
          installment_number: number
        }
        Insert: {
          created_at?: string
          enrollment_id: string
          file_name: string
          file_path: string
          file_type: string
          id?: string
          installment_number?: number
        }
        Update: {
          created_at?: string
          enrollment_id?: string
          file_name?: string
          file_path?: string
          file_type?: string
          id?: string
          installment_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "payment_proofs_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          client_email: string
          client_name: string
          client_phone: string
          client_type: string
          created_at: string
          currency: string
          discount_percent: number
          id: string
          items: Json
          notes: string | null
          organization_name: string | null
          quotation_number: string
          status: string
          subtotal: number
          tax_percent: number
          terms: string | null
          total: number
          training_request_id: string | null
          training_topic: string
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          client_email: string
          client_name: string
          client_phone: string
          client_type?: string
          created_at?: string
          currency?: string
          discount_percent?: number
          id?: string
          items?: Json
          notes?: string | null
          organization_name?: string | null
          quotation_number: string
          status?: string
          subtotal?: number
          tax_percent?: number
          terms?: string | null
          total?: number
          training_request_id?: string | null
          training_topic: string
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          client_email?: string
          client_name?: string
          client_phone?: string
          client_type?: string
          created_at?: string
          currency?: string
          discount_percent?: number
          id?: string
          items?: Json
          notes?: string | null
          organization_name?: string | null
          quotation_number?: string
          status?: string
          subtotal?: number
          tax_percent?: number
          terms?: string | null
          total?: number
          training_request_id?: string | null
          training_topic?: string
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_training_request_id_fkey"
            columns: ["training_request_id"]
            isOneToOne: false
            referencedRelation: "training_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          is_secret: boolean
          key: string
          label: string
          updated_at: string
          value: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          is_secret?: boolean
          key: string
          label?: string
          updated_at?: string
          value?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          is_secret?: boolean
          key?: string
          label?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      training_requests: {
        Row: {
          admin_notes: string | null
          budget_range: string | null
          client_type: Database["public"]["Enums"]["client_type"]
          created_at: string
          email: string
          full_name: string
          id: string
          num_participants: number | null
          organization_name: string | null
          organization_sector: string | null
          phone: string
          preferred_start: string | null
          status: string
          training_details: string | null
          training_topic: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          budget_range?: string | null
          client_type?: Database["public"]["Enums"]["client_type"]
          created_at?: string
          email: string
          full_name: string
          id?: string
          num_participants?: number | null
          organization_name?: string | null
          organization_sector?: string | null
          phone: string
          preferred_start?: string | null
          status?: string
          training_details?: string | null
          training_topic: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          budget_range?: string | null
          client_type?: Database["public"]["Enums"]["client_type"]
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          num_participants?: number | null
          organization_name?: string | null
          organization_sector?: string | null
          phone?: string
          preferred_start?: string | null
          status?: string
          training_details?: string | null
          training_topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_templates: {
        Row: {
          body: string
          category: string
          created_at: string
          id: string
          is_active: boolean
          language: string
          name: string
          updated_at: string
          variables: string[]
        }
        Insert: {
          body?: string
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          language?: string
          name: string
          updated_at?: string
          variables?: string[]
        }
        Update: {
          body?: string
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          language?: string
          name?: string
          updated_at?: string
          variables?: string[]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
      client_type: "individual" | "empresa" | "ong" | "estado"
      enrollment_source:
        | "site"
        | "presencial"
        | "telefone"
        | "whatsapp"
        | "email"
        | "csv_import"
        | "outro"
      payment_plan_type: "full" | "60-40" | "60-20-20"
      payment_status: "pending" | "approved" | "rejected" | "partial"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      client_type: ["individual", "empresa", "ong", "estado"],
      enrollment_source: [
        "site",
        "presencial",
        "telefone",
        "whatsapp",
        "email",
        "csv_import",
        "outro",
      ],
      payment_plan_type: ["full", "60-40", "60-20-20"],
      payment_status: ["pending", "approved", "rejected", "partial"],
    },
  },
} as const
