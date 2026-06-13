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
      admin_users: {
        Row: {
          created_at: string
          email: string | null
          id: string
          password_hash: string
          pushover_alert_enabled: boolean
          pushover_daily_report: boolean
          pushover_missed_checkoff: boolean
          pushover_missed_checkoff_fup: boolean
          pushover_shift_1: boolean
          pushover_shift_2: boolean
          pushover_shift_3: boolean
          pushover_user_key: string | null
          receives_daily_report: boolean
          receives_weekly_issues_digest: boolean
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          password_hash: string
          pushover_alert_enabled?: boolean
          pushover_daily_report?: boolean
          pushover_missed_checkoff?: boolean
          pushover_missed_checkoff_fup?: boolean
          pushover_shift_1?: boolean
          pushover_shift_2?: boolean
          pushover_shift_3?: boolean
          pushover_user_key?: string | null
          receives_daily_report?: boolean
          receives_weekly_issues_digest?: boolean
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          password_hash?: string
          pushover_alert_enabled?: boolean
          pushover_daily_report?: boolean
          pushover_missed_checkoff?: boolean
          pushover_missed_checkoff_fup?: boolean
          pushover_shift_1?: boolean
          pushover_shift_2?: boolean
          pushover_shift_3?: boolean
          pushover_user_key?: string | null
          receives_daily_report?: boolean
          receives_weekly_issues_digest?: boolean
          updated_at?: string
          username?: string
        }
        Relationships: []
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
      compartment_checks: {
        Row: {
          checked_by: string | null
          compartment_id: string | null
          completed_at: string | null
          created_at: string
          id: string
          item_data: Json
          last_activity_at: string
          shift_date: string
          shift_period: Database["public"]["Enums"]["shift_period"]
          started_at: string | null
          status: Database["public"]["Enums"]["check_status"]
          submitted_at: string | null
          target_id: string | null
          target_type: string | null
          time_on_page: number
          time_to_complete_seconds: number | null
          unit_id: string
          unit_kit_id: string | null
          updated_at: string
        }
        Insert: {
          checked_by?: string | null
          compartment_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          item_data?: Json
          last_activity_at?: string
          shift_date: string
          shift_period: Database["public"]["Enums"]["shift_period"]
          started_at?: string | null
          status?: Database["public"]["Enums"]["check_status"]
          submitted_at?: string | null
          target_id?: string | null
          target_type?: string | null
          time_on_page?: number
          time_to_complete_seconds?: number | null
          unit_id: string
          unit_kit_id?: string | null
          updated_at?: string
        }
        Update: {
          checked_by?: string | null
          compartment_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          item_data?: Json
          last_activity_at?: string
          shift_date?: string
          shift_period?: Database["public"]["Enums"]["shift_period"]
          started_at?: string | null
          status?: Database["public"]["Enums"]["check_status"]
          submitted_at?: string | null
          target_id?: string | null
          target_type?: string | null
          time_on_page?: number
          time_to_complete_seconds?: number | null
          unit_id?: string
          unit_kit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compartment_checks_checked_by_fkey"
            columns: ["checked_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compartment_checks_compartment_id_fkey"
            columns: ["compartment_id"]
            isOneToOne: false
            referencedRelation: "unit_compartments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compartment_checks_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compartment_checks_unit_kit_id_fkey"
            columns: ["unit_kit_id"]
            isOneToOne: false
            referencedRelation: "unit_kits"
            referencedColumns: ["id"]
          },
        ]
      }
      compartment_checks_backup_20260607: {
        Row: {
          checked_by: string | null
          compartment_id: string | null
          completed_at: string | null
          created_at: string | null
          id: string | null
          item_data: Json | null
          last_activity_at: string | null
          shift_date: string | null
          shift_period: Database["public"]["Enums"]["shift_period"] | null
          started_at: string | null
          status: Database["public"]["Enums"]["check_status"] | null
          submitted_at: string | null
          time_on_page: number | null
          time_to_complete_seconds: number | null
          unit_id: string | null
          unit_kit_id: string | null
          updated_at: string | null
        }
        Insert: {
          checked_by?: string | null
          compartment_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string | null
          item_data?: Json | null
          last_activity_at?: string | null
          shift_date?: string | null
          shift_period?: Database["public"]["Enums"]["shift_period"] | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["check_status"] | null
          submitted_at?: string | null
          time_on_page?: number | null
          time_to_complete_seconds?: number | null
          unit_id?: string | null
          unit_kit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          checked_by?: string | null
          compartment_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string | null
          item_data?: Json | null
          last_activity_at?: string | null
          shift_date?: string | null
          shift_period?: Database["public"]["Enums"]["shift_period"] | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["check_status"] | null
          submitted_at?: string | null
          time_on_page?: number | null
          time_to_complete_seconds?: number | null
          unit_id?: string | null
          unit_kit_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_email_report_runs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          recipient_count: number
          report_date: string
          resend_message_id: string | null
          sent_at: string
          status: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_count?: number
          report_date: string
          resend_message_id?: string | null
          sent_at?: string
          status: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_count?: number
          report_date?: string
          resend_message_id?: string | null
          sent_at?: string
          status?: string
        }
        Relationships: []
      }
      daily_manual_restock_items: {
        Row: {
          addressed: boolean
          addressed_at: string | null
          addressed_by: string | null
          created_at: string
          id: string
          item_name: string
          note: string
          shift_date: string
          shift_period: Database["public"]["Enums"]["shift_period"]
          source_name: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          addressed?: boolean
          addressed_at?: string | null
          addressed_by?: string | null
          created_at?: string
          id?: string
          item_name: string
          note?: string
          shift_date: string
          shift_period?: Database["public"]["Enums"]["shift_period"]
          source_name?: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          addressed?: boolean
          addressed_at?: string | null
          addressed_by?: string | null
          created_at?: string
          id?: string
          item_name?: string
          note?: string
          shift_date?: string
          shift_period?: Database["public"]["Enums"]["shift_period"]
          source_name?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_manual_restock_items_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_restock_items: {
        Row: {
          addressed: boolean
          addressed_at: string | null
          addressed_by: string | null
          created_at: string
          id: string
          issue_type: string
          item_id: string
          shift_date: string
          shift_period: Database["public"]["Enums"]["shift_period"]
          target_id: string
          target_type: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          addressed?: boolean
          addressed_at?: string | null
          addressed_by?: string | null
          created_at?: string
          id?: string
          issue_type: string
          item_id: string
          shift_date: string
          shift_period?: Database["public"]["Enums"]["shift_period"]
          target_id: string
          target_type: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          addressed?: boolean
          addressed_at?: string | null
          addressed_by?: string | null
          created_at?: string
          id?: string
          issue_type?: string
          item_id?: string
          shift_date?: string
          shift_period?: Database["public"]["Enums"]["shift_period"]
          target_id?: string
          target_type?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_restock_items_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_section_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          shift_date: string
          shift_period: Database["public"]["Enums"]["shift_period"]
          source_id: string
          source_name: string
          source_type: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          shift_date: string
          shift_period?: Database["public"]["Enums"]["shift_period"]
          source_id: string
          source_name: string
          source_type: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          shift_date?: string
          shift_period?: Database["public"]["Enums"]["shift_period"]
          source_id?: string
          source_name?: string
          source_type?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_section_comments_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_unit_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          shift_date: string
          shift_period: Database["public"]["Enums"]["shift_period"]
          unit_id: string
          updated_at: string
        }
        Insert: {
          comment?: string
          created_at?: string
          id?: string
          shift_date: string
          shift_period?: Database["public"]["Enums"]["shift_period"]
          unit_id: string
          updated_at?: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          shift_date?: string
          shift_period?: Database["public"]["Enums"]["shift_period"]
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_unit_comments_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_unit_crews: {
        Row: {
          created_at: string
          id: string
          locked: boolean
          provider_names: string
          shift_date: string
          shift_period: Database["public"]["Enums"]["shift_period"]
          unit_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          locked?: boolean
          provider_names?: string
          shift_date: string
          shift_period?: Database["public"]["Enums"]["shift_period"]
          unit_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          locked?: boolean
          provider_names?: string
          shift_date?: string
          shift_period?: Database["public"]["Enums"]["shift_period"]
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_unit_crews_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_unit_ledgers: {
        Row: {
          archived: boolean
          created_at: string
          id: string
          shift_date: string
          shift_period: Database["public"]["Enums"]["shift_period"]
          status_note: string | null
          total_compartments: number
          unit_id: string
          unit_name: string
          unit_status: string
        }
        Insert: {
          archived?: boolean
          created_at?: string
          id?: string
          shift_date: string
          shift_period: Database["public"]["Enums"]["shift_period"]
          status_note?: string | null
          total_compartments?: number
          unit_id: string
          unit_name: string
          unit_status: string
        }
        Update: {
          archived?: boolean
          created_at?: string
          id?: string
          shift_date?: string
          shift_period?: Database["public"]["Enums"]["shift_period"]
          status_note?: string | null
          total_compartments?: number
          unit_id?: string
          unit_name?: string
          unit_status?: string
        }
        Relationships: []
      }
      equipment_catalog: {
        Row: {
          category: string
          created_at: string
          default_par_level: number | null
          id: string
          input_type: Database["public"]["Enums"]["item_input_type"]
          name: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          default_par_level?: number | null
          id?: string
          input_type?: Database["public"]["Enums"]["item_input_type"]
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          default_par_level?: number | null
          id?: string
          input_type?: Database["public"]["Enums"]["item_input_type"]
          name?: string
          updated_at?: string
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
      issue_notes: {
        Row: {
          created_at: string
          created_by: string
          id: string
          issue_id: string
          text: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          issue_id: string
          text: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          issue_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_notes_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          status: string
          tags: string[] | null
          title: string
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          status?: string
          tags?: string[] | null
          title: string
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          status?: string
          tags?: string[] | null
          title?: string
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "issues_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      kit_item_groups: {
        Row: {
          created_at: string
          id: string
          kit_id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          kit_id: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          kit_id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kit_item_groups_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "kits"
            referencedColumns: ["id"]
          },
        ]
      }
      kit_items: {
        Row: {
          created_at: string
          equipment_id: string
          group_id: string | null
          id: string
          input_type: Database["public"]["Enums"]["item_input_type"]
          kit_id: string
          par_level: number | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          equipment_id: string
          group_id?: string | null
          id?: string
          input_type: Database["public"]["Enums"]["item_input_type"]
          kit_id: string
          par_level?: number | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          equipment_id?: string
          group_id?: string | null
          id?: string
          input_type?: Database["public"]["Enums"]["item_input_type"]
          kit_id?: string
          par_level?: number | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kit_items_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kit_items_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "kit_item_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kit_items_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "kits"
            referencedColumns: ["id"]
          },
        ]
      }
      kits: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          name: string
          photo_url: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name: string
          photo_url?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          photo_url?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          created_at: string
          id: string
          message_text: string
          sender: Database["public"]["Enums"]["message_sender"]
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_text: string
          sender: Database["public"]["Enums"]["message_sender"]
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_text?: string
          sender?: Database["public"]["Enums"]["message_sender"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      preceptors: {
        Row: {
          bio: string | null
          full_name: string
          id: string
          image_url: string | null
          is_active: boolean
          specialty_tags: string[] | null
          station_unit: Database["public"]["Enums"]["station_unit"] | null
        }
        Insert: {
          bio?: string | null
          full_name: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          specialty_tags?: string[] | null
          station_unit?: Database["public"]["Enums"]["station_unit"] | null
        }
        Update: {
          bio?: string | null
          full_name?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          specialty_tags?: string[] | null
          station_unit?: Database["public"]["Enums"]["station_unit"] | null
        }
        Relationships: []
      }
      qr_targets: {
        Row: {
          active: boolean
          code: string
          compartment_id: string | null
          created_at: string
          id: string
          unit_id: string
          unit_kit_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          compartment_id?: string | null
          created_at?: string
          id?: string
          unit_id: string
          unit_kit_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          compartment_id?: string | null
          created_at?: string
          id?: string
          unit_id?: string
          unit_kit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_targets_compartment_id_fkey"
            columns: ["compartment_id"]
            isOneToOne: false
            referencedRelation: "unit_compartments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_targets_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_targets_unit_kit_id_fkey"
            columns: ["unit_kit_id"]
            isOneToOne: false
            referencedRelation: "unit_kits"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          created_at: string
          date: string
          id: string
          shift_type: Database["public"]["Enums"]["shift_type"]
          status: Database["public"]["Enums"]["schedule_status"]
          student_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          shift_type: Database["public"]["Enums"]["shift_type"]
          status?: Database["public"]["Enums"]["schedule_status"]
          student_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          shift_type?: Database["public"]["Enums"]["shift_type"]
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
      shift_archives: {
        Row: {
          check_data: Json
          checked_by: string | null
          completed_compartments: number
          completion_percentage: number
          created_at: string
          id: string
          last_activity_at: string | null
          operational_date: string | null
          shift_date: string
          shift_id: string | null
          shift_period: Database["public"]["Enums"]["shift_period"]
          started_at: string | null
          status: Database["public"]["Enums"]["check_status"]
          submitted_at: string | null
          time_to_complete_seconds: number | null
          total_compartments: number
          unit_id: string
        }
        Insert: {
          check_data?: Json
          checked_by?: string | null
          completed_compartments?: number
          completion_percentage?: number
          created_at?: string
          id?: string
          last_activity_at?: string | null
          operational_date?: string | null
          shift_date: string
          shift_id?: string | null
          shift_period: Database["public"]["Enums"]["shift_period"]
          started_at?: string | null
          status: Database["public"]["Enums"]["check_status"]
          submitted_at?: string | null
          time_to_complete_seconds?: number | null
          total_compartments?: number
          unit_id: string
        }
        Update: {
          check_data?: Json
          checked_by?: string | null
          completed_compartments?: number
          completion_percentage?: number
          created_at?: string
          id?: string
          last_activity_at?: string | null
          operational_date?: string | null
          shift_date?: string
          shift_id?: string | null
          shift_period?: Database["public"]["Enums"]["shift_period"]
          started_at?: string | null
          status?: Database["public"]["Enums"]["check_status"]
          submitted_at?: string | null
          time_to_complete_seconds?: number | null
          total_compartments?: number
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_archives_checked_by_fkey"
            columns: ["checked_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_archives_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shift_calendar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_archives_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_calendar: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          operational_date: string
          shift_name: string
          starts_at: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          id?: string
          operational_date: string
          shift_name: string
          starts_at: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          operational_date?: string
          shift_name?: string
          starts_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          access_until: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          instructor_contact: string
          instructor_name: string
          is_blacklisted: boolean
          legal_signature: string | null
          no_show_count: number
          phone: string | null
          school_name: string
          signature_ip: string | null
          signature_timestamp: string | null
          status: Database["public"]["Enums"]["student_status"]
        }
        Insert: {
          access_until?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          instructor_contact: string
          instructor_name: string
          is_blacklisted?: boolean
          legal_signature?: string | null
          no_show_count?: number
          phone?: string | null
          school_name: string
          signature_ip?: string | null
          signature_timestamp?: string | null
          status?: Database["public"]["Enums"]["student_status"]
        }
        Update: {
          access_until?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          instructor_contact?: string
          instructor_name?: string
          is_blacklisted?: boolean
          legal_signature?: string | null
          no_show_count?: number
          phone?: string | null
          school_name?: string
          signature_ip?: string | null
          signature_timestamp?: string | null
          status?: Database["public"]["Enums"]["student_status"]
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_name: string | null
          actor_type: string
          after_data: Json | null
          area: string
          before_data: Json | null
          created_at: string
          id: string
          message: string | null
          metadata: Json | null
          result: string
          target_id: string | null
          target_name: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_name?: string | null
          actor_type: string
          after_data?: Json | null
          area: string
          before_data?: Json | null
          created_at?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          result?: string
          target_id?: string | null
          target_name?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_name?: string | null
          actor_type?: string
          after_data?: Json | null
          area?: string
          before_data?: Json | null
          created_at?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          result?: string
          target_id?: string | null
          target_name?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      template_compartment_items: {
        Row: {
          compartment_id: string
          created_at: string
          equipment_id: string
          id: string
          input_type: Database["public"]["Enums"]["item_input_type"]
          par_level: number | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          compartment_id: string
          created_at?: string
          equipment_id: string
          id?: string
          input_type: Database["public"]["Enums"]["item_input_type"]
          par_level?: number | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          compartment_id?: string
          created_at?: string
          equipment_id?: string
          id?: string
          input_type?: Database["public"]["Enums"]["item_input_type"]
          par_level?: number | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_compartment_items_compartment_id_fkey"
            columns: ["compartment_id"]
            isOneToOne: false
            referencedRelation: "template_compartments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_compartment_items_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      template_compartments: {
        Row: {
          created_at: string
          grid_position: Json
          id: string
          name: string
          photo_url: string | null
          sort_order: number
          template_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          grid_position?: Json
          id?: string
          name: string
          photo_url?: string | null
          sort_order?: number
          template_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          grid_position?: Json
          id?: string
          name?: string
          photo_url?: string | null
          sort_order?: number
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_compartments_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      unit_compartment_item_groups: {
        Row: {
          compartment_id: string
          created_at: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          compartment_id: string
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          compartment_id?: string
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "unit_compartment_item_groups_compartment_id_fkey"
            columns: ["compartment_id"]
            isOneToOne: false
            referencedRelation: "unit_compartments"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_compartment_items: {
        Row: {
          compartment_id: string
          created_at: string
          equipment_id: string
          group_id: string | null
          id: string
          input_type: Database["public"]["Enums"]["item_input_type"]
          par_level: number | null
          sort_order: number
          subcategory: string | null
          subcategory_sort_order: number | null
          updated_at: string
        }
        Insert: {
          compartment_id: string
          created_at?: string
          equipment_id: string
          group_id?: string | null
          id?: string
          input_type: Database["public"]["Enums"]["item_input_type"]
          par_level?: number | null
          sort_order?: number
          subcategory?: string | null
          subcategory_sort_order?: number | null
          updated_at?: string
        }
        Update: {
          compartment_id?: string
          created_at?: string
          equipment_id?: string
          group_id?: string | null
          id?: string
          input_type?: Database["public"]["Enums"]["item_input_type"]
          par_level?: number | null
          sort_order?: number
          subcategory?: string | null
          subcategory_sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "unit_compartment_items_compartment_id_fkey"
            columns: ["compartment_id"]
            isOneToOne: false
            referencedRelation: "unit_compartments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_compartment_items_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_compartment_items_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "unit_compartment_item_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_compartments: {
        Row: {
          created_at: string
          grid_position: Json
          id: string
          name: string
          photo_url: string | null
          qr_location_note: string | null
          sort_order: number
          unit_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          grid_position?: Json
          id?: string
          name: string
          photo_url?: string | null
          qr_location_note?: string | null
          sort_order?: number
          unit_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          grid_position?: Json
          id?: string
          name?: string
          photo_url?: string | null
          qr_location_note?: string | null
          sort_order?: number
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "unit_compartments_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_kits: {
        Row: {
          created_at: string
          id: string
          kit_id: string
          qr_location_note: string | null
          sort_order: number
          unit_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          kit_id: string
          qr_location_note?: string | null
          sort_order?: number
          unit_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          kit_id?: string
          qr_location_note?: string | null
          sort_order?: number
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "unit_kits_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_kits_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          monthly_check_day: number | null
          name: string
          oos_at: string | null
          oos_by_name: string | null
          status: Database["public"]["Enums"]["unit_status"]
          unit_kind: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          monthly_check_day?: number | null
          name: string
          oos_at?: string | null
          oos_by_name?: string | null
          status?: Database["public"]["Enums"]["unit_status"]
          unit_kind?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          monthly_check_day?: number | null
          name?: string
          oos_at?: string | null
          oos_by_name?: string | null
          status?: Database["public"]["Enums"]["unit_status"]
          unit_kind?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      weekly_email_report_runs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          recipient_count: number
          report_week_start: string
          sent_at: string
          status: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_count?: number
          report_week_start: string
          sent_at?: string
          status: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_count?: number
          report_week_start?: string
          sent_at?: string
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clear_operational_records: {
        Args: { from_date: string; to_date: string; unit_id?: string }
        Returns: Json
      }
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      delete_old_system_logs: { Args: never; Returns: number }
      get_database_size: { Args: never; Returns: number }
      is_admin: { Args: never; Returns: boolean }
      is_supervisor_or_admin: { Args: never; Returns: boolean }
      preview_operational_counts: {
        Args: { from_date: string; to_date: string; unit_id?: string }
        Returns: Json
      }
      save_compartment_check_atomic: {
        Args: {
          p_checked_by?: string
          p_item_data?: Json
          p_shift_date: string
          p_shift_period: Database["public"]["Enums"]["shift_period"]
          p_status: Database["public"]["Enums"]["check_status"]
          p_target_id: string
          p_target_type: string
          p_time_on_page?: number
          p_unit_id: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "user" | "supervisor" | "admin"
      check_status: "in_progress" | "completed" | "partially_complete"
      item_input_type: "quantity" | "checkbox" | "condition"
      message_sender: "student" | "admin"
      note_priority: "normal" | "high_accessibility"
      schedule_status: "pending" | "approved" | "rejected"
      shift_period: "daily"
      shift_type: "full" | "day" | "night"
      station_unit:
        | "Station 1 - Downtown HQ"
        | "Station 2 - West Side"
        | "Station 3 - Industrial"
      student_status: "pending" | "certified" | "expired"
      unit_status: "in_service" | "out_of_service"
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
      app_role: ["user", "supervisor", "admin"],
      check_status: ["in_progress", "completed", "partially_complete"],
      item_input_type: ["quantity", "checkbox", "condition"],
      message_sender: ["student", "admin"],
      note_priority: ["normal", "high_accessibility"],
      schedule_status: ["pending", "approved", "rejected"],
      shift_period: ["daily"],
      shift_type: ["full", "day", "night"],
      station_unit: [
        "Station 1 - Downtown HQ",
        "Station 2 - West Side",
        "Station 3 - Industrial",
      ],
      student_status: ["pending", "certified", "expired"],
      unit_status: ["in_service", "out_of_service"],
    },
  },
} as const

