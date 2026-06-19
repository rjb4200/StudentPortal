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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_accounts: {
        Row: {
          auth_user_id: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          notify_daily_report: boolean
          notify_evaluation_flagged: boolean
          notify_onboarding_complete: boolean
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_active?: boolean
          notify_daily_report?: boolean
          notify_evaluation_flagged?: boolean
          notify_onboarding_complete?: boolean
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          notify_daily_report?: boolean
          notify_evaluation_flagged?: boolean
          notify_onboarding_complete?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      admin_notes: {
        Row: {
          created_at: string
          id: string
          note_text: string
          priority: Database["public"]["Enums"]["note_priority"]
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note_text: string
          priority?: Database["public"]["Enums"]["note_priority"]
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note_text?: string
          priority?: Database["public"]["Enums"]["note_priority"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          id: string
          performed_by: string
          timestamp: string
        }
        Insert: {
          action: string
          id?: string
          performed_by: string
          timestamp?: string
        }
        Update: {
          action?: string
          id?: string
          performed_by?: string
          timestamp?: string
        }
        Relationships: []
      }
      broadcasts: {
        Row: {
          body: string
          id: string
          recipient_count: number
          sent_at: string
          sent_by: string
          title: string
        }
        Insert: {
          body: string
          id?: string
          recipient_count?: number
          sent_at?: string
          sent_by: string
          title: string
        }
        Update: {
          body?: string
          id?: string
          recipient_count?: number
          sent_at?: string
          sent_by?: string
          title?: string
        }
        Relationships: []
      }
      evaluations: {
        Row: {
          clinical_rating: number
          comments: string | null
          created_at: string
          id: string
          is_flagged: boolean
          overall_rating: number
          preceptor_id: string
          safety_rating: number
          student_id: string
          teaching_rating: number
        }
        Insert: {
          clinical_rating: number
          comments?: string | null
          created_at?: string
          id?: string
          is_flagged?: boolean
          overall_rating: number
          preceptor_id: string
          safety_rating: number
          student_id: string
          teaching_rating: number
        }
        Update: {
          clinical_rating?: number
          comments?: string | null
          created_at?: string
          id?: string
          is_flagged?: boolean
          overall_rating?: number
          preceptor_id?: string
          safety_rating?: number
          student_id?: string
          teaching_rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_preceptor_id_fkey"
            columns: ["preceptor_id"]
            isOneToOne: false
            referencedRelation: "preceptors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          body_text: string
          created_at: string
          id: string
          is_active: boolean
          require_checkbox: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          body_text: string
          created_at?: string
          id?: string
          is_active?: boolean
          require_checkbox?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          body_text?: string
          created_at?: string
          id?: string
          is_active?: boolean
          require_checkbox?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          body: string
          created_at: string
          id: string
          is_active: boolean
          template_type: string
          title: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_active?: boolean
          template_type?: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_active?: boolean
          template_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          broadcast_id: string | null
          created_at: string
          id: string
          message_text: string
          sender: Database["public"]["Enums"]["message_sender"]
          student_id: string
        }
        Insert: {
          broadcast_id?: string | null
          created_at?: string
          id?: string
          message_text: string
          sender: Database["public"]["Enums"]["message_sender"]
          student_id: string
        }
        Update: {
          broadcast_id?: string | null
          created_at?: string
          id?: string
          message_text?: string
          sender?: Database["public"]["Enums"]["message_sender"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_broadcast_id_fkey"
            columns: ["broadcast_id"]
            isOneToOne: false
            referencedRelation: "broadcasts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      preceptors: {
        Row: {
          auth_user_id: string | null
          bio: string | null
          email: string | null
          full_name: string
          id: string
          image_url: string | null
          is_active: boolean
          notify_evaluation: boolean
          notify_schedule_approved: boolean
          specialty_tags: string[] | null
          station_unit: Database["public"]["Enums"]["station_unit"] | null
        }
        Insert: {
          auth_user_id?: string | null
          bio?: string | null
          email?: string | null
          full_name: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          notify_evaluation?: boolean
          notify_schedule_approved?: boolean
          specialty_tags?: string[] | null
          station_unit?: Database["public"]["Enums"]["station_unit"] | null
        }
        Update: {
          auth_user_id?: string | null
          bio?: string | null
          email?: string | null
          full_name?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          notify_evaluation?: boolean
          notify_schedule_approved?: boolean
          specialty_tags?: string[] | null
          station_unit?: Database["public"]["Enums"]["station_unit"] | null
        }
        Relationships: []
      }
      quiz_flags: {
        Row: {
          acknowledged: boolean
          acknowledged_at: string | null
          acknowledged_by: string | null
          attempt_count: number
          created_at: string
          id: string
          rule_id: string
          rule_title: string
          student_email: string
          student_id: string
          student_name: string
        }
        Insert: {
          acknowledged?: boolean
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          attempt_count?: number
          created_at?: string
          id?: string
          rule_id: string
          rule_title: string
          student_email: string
          student_id: string
          student_name: string
        }
        Update: {
          acknowledged?: boolean
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          attempt_count?: number
          created_at?: string
          id?: string
          rule_id?: string
          rule_title?: string
          student_email?: string
          student_id?: string
          student_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_flags_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "admin_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_flags_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "quiz_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_flags_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_photos: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          is_non_compliant: boolean
          label: string
          reason: string
          rule_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          is_non_compliant?: boolean
          label: string
          reason: string
          rule_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          is_non_compliant?: boolean
          label?: string
          reason?: string
          rule_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_photos_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "quiz_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_rules: {
        Row: {
          created_at: string
          id: string
          instruction: string
          is_active: boolean
          rule_text: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          instruction: string
          is_active?: boolean
          rule_text: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          instruction?: string
          is_active?: boolean
          rule_text?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      registration_fields: {
        Row: {
          created_at: string
          field_key: string
          field_type: string
          id: string
          is_active: boolean
          is_permanent: boolean
          is_required: boolean
          label: string
          options: string | null
          placeholder: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          field_key: string
          field_type?: string
          id?: string
          is_active?: boolean
          is_permanent?: boolean
          is_required?: boolean
          label: string
          options?: string | null
          placeholder?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          field_key?: string
          field_type?: string
          id?: string
          is_active?: boolean
          is_permanent?: boolean
          is_required?: boolean
          label?: string
          options?: string | null
          placeholder?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      resource_categories: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      resource_documents: {
        Row: {
          category_id: string
          created_at: string
          file_type: string
          file_url: string
          id: string
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          file_type?: string
          file_url: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          file_type?: string
          file_url?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_documents_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "resource_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          cancel_note: string | null
          cancelled_by: string | null
          created_at: string
          date: string
          end_time: string | null
          id: string
          shift_type: Database["public"]["Enums"]["shift_type"]
          start_time: string | null
          status: Database["public"]["Enums"]["schedule_status"]
          student_id: string
        }
        Insert: {
          cancel_note?: string | null
          cancelled_by?: string | null
          created_at?: string
          date: string
          end_time?: string | null
          id?: string
          shift_type: Database["public"]["Enums"]["shift_type"]
          start_time?: string | null
          status?: Database["public"]["Enums"]["schedule_status"]
          student_id: string
        }
        Update: {
          cancel_note?: string | null
          cancelled_by?: string | null
          created_at?: string
          date?: string
          end_time?: string | null
          id?: string
          shift_type?: Database["public"]["Enums"]["shift_type"]
          start_time?: string | null
          status?: Database["public"]["Enums"]["schedule_status"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_field_values: {
        Row: {
          created_at: string
          field_id: string
          id: string
          student_id: string
          value: string
        }
        Insert: {
          created_at?: string
          field_id: string
          id?: string
          student_id: string
          value?: string
        }
        Update: {
          created_at?: string
          field_id?: string
          id?: string
          student_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_field_values_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "registration_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_field_values_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_legal_acceptances: {
        Row: {
          accepted_at: string
          document_id: string
          id: string
          student_id: string
        }
        Insert: {
          accepted_at?: string
          document_id: string
          id?: string
          student_id: string
        }
        Update: {
          accepted_at?: string
          document_id?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_legal_acceptances_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_legal_acceptances_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          access_until: string | null
          auth_user_id: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          instructor_contact: string
          instructor_name: string
          is_blacklisted: boolean
          is_test_record: boolean | null
          legal_signature: string | null
          no_show_count: number
          password_changed: boolean
          phone: string | null
          previous_student_id: string | null
          school_name: string
          signature_ip: string | null
          signature_timestamp: string | null
          status: Database["public"]["Enums"]["student_status"]
        }
        Insert: {
          access_until?: string | null
          auth_user_id?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          instructor_contact: string
          instructor_name: string
          is_blacklisted?: boolean
          is_test_record?: boolean | null
          legal_signature?: string | null
          no_show_count?: number
          password_changed?: boolean
          phone?: string | null
          previous_student_id?: string | null
          school_name: string
          signature_ip?: string | null
          signature_timestamp?: string | null
          status?: Database["public"]["Enums"]["student_status"]
        }
        Update: {
          access_until?: string | null
          auth_user_id?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          instructor_contact?: string
          instructor_name?: string
          is_blacklisted?: boolean
          is_test_record?: boolean | null
          legal_signature?: string | null
          no_show_count?: number
          password_changed?: boolean
          phone?: string | null
          previous_student_id?: string | null
          school_name?: string
          signature_ip?: string | null
          signature_timestamp?: string | null
          status?: Database["public"]["Enums"]["student_status"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      refresh_pgrst_schema: { Args: never; Returns: undefined }
      register_onboarding_student: {
        Args: {
          p_email: string
          p_full_name: string
          p_instructor_contact: string
          p_instructor_name: string
          p_phone: string
          p_school_name: string
        }
        Returns: string
      }
    }
    Enums: {
      message_sender: "student" | "admin"
      note_priority: "normal" | "high_accessibility"
      schedule_status: "pending" | "approved" | "rejected" | "cancelled"
      shift_type: "full" | "day" | "night" | "custom"
      station_unit:
        | "Station 1 - Downtown HQ"
        | "Station 2 - West Side"
        | "Station 3 - Industrial"
      student_status: "pending" | "certified" | "expired" | "archived"
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
      message_sender: ["student", "admin"],
      note_priority: ["normal", "high_accessibility"],
      schedule_status: ["pending", "approved", "rejected", "cancelled"],
      shift_type: ["full", "day", "night", "custom"],
      station_unit: [
        "Station 1 - Downtown HQ",
        "Station 2 - West Side",
        "Station 3 - Industrial",
      ],
      student_status: ["pending", "certified", "expired", "archived"],
    },
  },
} as const
