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
          notify_class_mou: boolean
          notify_daily_report: boolean
          notify_evaluation_flagged: boolean
          notify_onboarding_complete: boolean
          notify_student_messages: boolean
          rank: string | null
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_active?: boolean
          notify_class_mou?: boolean
          notify_daily_report?: boolean
          notify_evaluation_flagged?: boolean
          notify_onboarding_complete?: boolean
          notify_student_messages?: boolean
          rank?: string | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          notify_class_mou?: boolean
          notify_daily_report?: boolean
          notify_evaluation_flagged?: boolean
          notify_onboarding_complete?: boolean
          notify_student_messages?: boolean
          rank?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      admin_message_thread_state: {
        Row: {
          admin_account_id: string
          last_read_student_message_at: string
          student_id: string
          updated_at: string
        }
        Insert: {
          admin_account_id: string
          last_read_student_message_at: string
          student_id: string
          updated_at?: string
        }
        Update: {
          admin_account_id?: string
          last_read_student_message_at?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_message_thread_state_admin_account_id_fkey"
            columns: ["admin_account_id"]
            isOneToOne: false
            referencedRelation: "admin_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_message_thread_state_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      class_mous: {
        Row: {
          created_at: string
          effective_date: string
          id: string
          mou_body_snapshot: string
          pdf_generated_at: string | null
          representative_name: string
          representative_signature: string
          representative_signed_at: string
          representative_title: string
          training_class_id: string
          training_organization_name: string
          updated_at: string
          wfems_signed_at: string | null
          wfems_signed_by: string | null
        }
        Insert: {
          created_at?: string
          effective_date?: string
          id?: string
          mou_body_snapshot?: string
          pdf_generated_at?: string | null
          representative_name?: string
          representative_signature?: string
          representative_signed_at?: string
          representative_title?: string
          training_class_id: string
          training_organization_name?: string
          updated_at?: string
          wfems_signed_at?: string | null
          wfems_signed_by?: string | null
        }
        Update: {
          created_at?: string
          effective_date?: string
          id?: string
          mou_body_snapshot?: string
          pdf_generated_at?: string | null
          representative_name?: string
          representative_signature?: string
          representative_signed_at?: string
          representative_title?: string
          training_class_id?: string
          training_organization_name?: string
          updated_at?: string
          wfems_signed_at?: string | null
          wfems_signed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_mous_training_class_id_fkey"
            columns: ["training_class_id"]
            isOneToOne: true
            referencedRelation: "training_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_mous_wfems_signed_by_fkey"
            columns: ["wfems_signed_by"]
            isOneToOne: false
            referencedRelation: "admin_accounts"
            referencedColumns: ["id"]
          },
        ]
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
      instructors: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          business_phone: string | null
          contact_instructions: string | null
          created_at: string
          credentials: string
          email: string
          first_name: string
          id: string
          last_name: string
          mobile_phone: string
          preferred_contact_hours: string
          preferred_contact_method: string
          status: Database["public"]["Enums"]["registry_status"]
          title: string
          training_site_id: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          business_phone?: string | null
          contact_instructions?: string | null
          created_at?: string
          credentials: string
          email: string
          first_name: string
          id?: string
          last_name: string
          mobile_phone: string
          preferred_contact_hours: string
          preferred_contact_method: string
          status?: Database["public"]["Enums"]["registry_status"]
          title: string
          training_site_id?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          business_phone?: string | null
          contact_instructions?: string | null
          created_at?: string
          credentials?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          mobile_phone?: string
          preferred_contact_hours?: string
          preferred_contact_method?: string
          status?: Database["public"]["Enums"]["registry_status"]
          title?: string
          training_site_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "instructors_training_site_id_fkey"
            columns: ["training_site_id"]
            isOneToOne: false
            referencedRelation: "training_sites"
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
      onboarding_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          expires_at: string
          id: string
          student_id: string
          token_hash: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          student_id: string
          token_hash: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          student_id?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_sessions_student_id_fkey"
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
          image_url: string | null
          is_active: boolean
          is_non_compliant: boolean
          label: string
          option_text: string | null
          reason: string
          rule_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_non_compliant?: boolean
          label: string
          option_text?: string | null
          reason: string
          rule_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_non_compliant?: boolean
          label?: string
          option_text?: string | null
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
          question_type: string
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
          question_type?: string
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
          question_type?: string
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
          file_url: string | null
          id: string
          is_active: boolean
          map_embed_url: string | null
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          file_type?: string
          file_url?: string | null
          id?: string
          is_active?: boolean
          map_embed_url?: string | null
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          file_type?: string
          file_url?: string | null
          id?: string
          is_active?: boolean
          map_embed_url?: string | null
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
      schedule_reminders: {
        Row: {
          claimed_at: string
          created_at: string
          delivered_at: string | null
          error_message: string | null
          id: string
          reminder_type: string
          schedule_id: string
          status: string
        }
        Insert: {
          claimed_at?: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          reminder_type: string
          schedule_id: string
          status?: string
        }
        Update: {
          claimed_at?: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          reminder_type?: string
          schedule_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_reminders_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_blocks: {
        Row: {
          created_at: string
          created_by: string | null
          date: string
          reason: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date: string
          reason?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date?: string
          reason?: string | null
          updated_at?: string
        }
        Relationships: []
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
          instructor_id: string | null
          instructor_name: string
          is_blacklisted: boolean
          is_test_record: boolean | null
          legal_signature: string | null
          no_show_count: number
          onboarding_completed_at: string | null
          password_changed: boolean
          phone: string | null
          previous_student_id: string | null
          school_name: string
          signature_ip: string | null
          signature_timestamp: string | null
          status: Database["public"]["Enums"]["student_status"]
          training_class_id: string | null
          training_site_id: string | null
        }
        Insert: {
          access_until?: string | null
          auth_user_id?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          instructor_contact: string
          instructor_id?: string | null
          instructor_name: string
          is_blacklisted?: boolean
          is_test_record?: boolean | null
          legal_signature?: string | null
          no_show_count?: number
          onboarding_completed_at?: string | null
          password_changed?: boolean
          phone?: string | null
          previous_student_id?: string | null
          school_name: string
          signature_ip?: string | null
          signature_timestamp?: string | null
          status?: Database["public"]["Enums"]["student_status"]
          training_class_id?: string | null
          training_site_id?: string | null
        }
        Update: {
          access_until?: string | null
          auth_user_id?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          instructor_contact?: string
          instructor_id?: string | null
          instructor_name?: string
          is_blacklisted?: boolean
          is_test_record?: boolean | null
          legal_signature?: string | null
          no_show_count?: number
          onboarding_completed_at?: string | null
          password_changed?: boolean
          phone?: string | null
          previous_student_id?: string | null
          school_name?: string
          signature_ip?: string | null
          signature_timestamp?: string | null
          status?: Database["public"]["Enums"]["student_status"]
          training_class_id?: string | null
          training_site_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_training_class_id_fkey"
            columns: ["training_class_id"]
            isOneToOne: false
            referencedRelation: "training_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_training_site_id_fkey"
            columns: ["training_site_id"]
            isOneToOne: false
            referencedRelation: "training_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      system_job_runs: {
        Row: {
          created_at: string
          duration_ms: number
          error_message: string | null
          finished_at: string
          id: string
          job_name: string
          started_at: string
          status: string
          summary: Json
        }
        Insert: {
          created_at?: string
          duration_ms: number
          error_message?: string | null
          finished_at: string
          id?: string
          job_name: string
          started_at: string
          status: string
          summary?: Json
        }
        Update: {
          created_at?: string
          duration_ms?: number
          error_message?: string | null
          finished_at?: string
          id?: string
          job_name?: string
          started_at?: string
          status?: string
          summary?: Json
        }
        Relationships: []
      }
      training_classes: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          class_start_date: string
          created_at: string
          id: string
          instructor_id: string
          name: string
          notes: string | null
          ride_time_end_date: string
          status: Database["public"]["Enums"]["registry_status"]
          training_site_id: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          class_start_date: string
          created_at?: string
          id?: string
          instructor_id: string
          name: string
          notes?: string | null
          ride_time_end_date: string
          status?: Database["public"]["Enums"]["registry_status"]
          training_site_id: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          class_start_date?: string
          created_at?: string
          id?: string
          instructor_id?: string
          name?: string
          notes?: string | null
          ride_time_end_date?: string
          status?: Database["public"]["Enums"]["registry_status"]
          training_site_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_classes_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_classes_training_site_id_fkey"
            columns: ["training_site_id"]
            isOneToOne: false
            referencedRelation: "training_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      training_sites: {
        Row: {
          address: string
          approved_at: string | null
          approved_by: string | null
          city: string
          created_at: string
          id: string
          main_phone: string | null
          name: string
          organization_name: string
          state: string
          status: Database["public"]["Enums"]["registry_status"]
          updated_at: string
          zip_code: string
        }
        Insert: {
          address: string
          approved_at?: string | null
          approved_by?: string | null
          city: string
          created_at?: string
          id?: string
          main_phone?: string | null
          name: string
          organization_name: string
          state: string
          status?: Database["public"]["Enums"]["registry_status"]
          updated_at?: string
          zip_code: string
        }
        Update: {
          address?: string
          approved_at?: string | null
          approved_by?: string | null
          city?: string
          created_at?: string
          id?: string
          main_phone?: string | null
          name?: string
          organization_name?: string
          state?: string
          status?: Database["public"]["Enums"]["registry_status"]
          updated_at?: string
          zip_code?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      block_schedule_date_range: {
        Args: {
          p_admin_id: string
          p_end_date: string
          p_reason: string
          p_start_date: string
        }
        Returns: {
          already_blocked: number
          approved_schedules: number
          created_blocks: number
          pending_schedules: number
          total_days: number
        }[]
      }
      get_admin_message_inbox: {
        Args: { p_admin_account_id: string }
        Returns: {
          is_unread: boolean
          latest_message_at: string
          latest_message_sender: Database["public"]["Enums"]["message_sender"]
          latest_message_text: string
          latest_student_message_at: string | null
          needs_reply: boolean
          student_id: string
          student_name: string
        }[]
      }
      refresh_pgrst_schema: { Args: never; Returns: undefined }
      resolve_schedule_and_block_day: {
        Args: {
          p_action: Database["public"]["Enums"]["schedule_status"]
          p_admin_id: string
          p_reason: string
          p_schedule_id: string
        }
        Returns: {
          schedule_date: string
          schedule_id: string
          schedule_status: Database["public"]["Enums"]["schedule_status"]
        }[]
      }
      register_onboarding_student:
        | {
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
        | {
            Args: {
              p_email: string
              p_full_name: string
              p_instructor_contact: string
              p_instructor_name: string
              p_phone: string
              p_school_name: string
              p_training_class_id: string
            }
            Returns: string
          }
    }
    Enums: {
      message_sender: "student" | "admin"
      note_priority: "normal" | "high_accessibility"
      registry_status:
        | "pending"
        | "active"
        | "rejected"
        | "suspended"
        | "archived"
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
      registry_status: [
        "pending",
        "active",
        "rejected",
        "suspended",
        "archived",
      ],
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
