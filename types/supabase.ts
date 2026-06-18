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
      allowed_domains: {
        Row: {
          created_at: string | null
          domain: string
          id: string
          is_active: boolean
          org_id: string
        }
        Insert: {
          created_at?: string | null
          domain: string
          id?: string
          is_active?: boolean
          org_id?: string
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: string
          is_active?: boolean
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "allowed_domains_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      allowed_emails: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean
          note: string | null
          org_id: string
          preset_role: Database["public"]["Enums"]["app_role"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean
          note?: string | null
          org_id?: string
          preset_role?: Database["public"]["Enums"]["app_role"]
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean
          note?: string | null
          org_id?: string
          preset_role?: Database["public"]["Enums"]["app_role"]
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "allowed_emails_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          org_id: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          org_id?: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          created_at: string | null
          created_by: string | null
          department_id: string | null
          description: string | null
          html_content: string | null
          id: string
          org_id: string
          status: Database["public"]["Enums"]["content_status"]
          tags: string[] | null
          title: string
          updated_at: string | null
          workflow_notes: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          html_content?: string | null
          id?: string
          org_id?: string
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[] | null
          title: string
          updated_at?: string | null
          workflow_notes?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          html_content?: string | null
          id?: string
          org_id?: string
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          workflow_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      campuses: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          external_id: string | null
          id: string
          institution_id: string
          metadata: Json
          name: string
          org_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          external_id?: string | null
          id?: string
          institution_id: string
          metadata?: Json
          name?: string
          org_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          external_id?: string | null
          id?: string
          institution_id?: string
          metadata?: Json
          name?: string
          org_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campuses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campuses_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campuses_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campuses_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_progress: {
        Row: {
          checked_items: string[] | null
          content_id: string
          id: string
          org_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          checked_items?: string[] | null
          content_id: string
          id?: string
          org_id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          checked_items?: string[] | null
          content_id?: string
          id?: string
          org_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_progress_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_progress_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string
          created_by: string | null
          custom_attributes: Json
          deleted_at: string | null
          email: string | null
          external_id: string | null
          full_name: string
          id: string
          metadata: Json
          org_id: string
          phone: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          custom_attributes?: Json
          deleted_at?: string | null
          email?: string | null
          external_id?: string | null
          full_name?: string
          id?: string
          metadata?: Json
          org_id?: string
          phone?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          custom_attributes?: Json
          deleted_at?: string | null
          email?: string | null
          external_id?: string | null
          full_name?: string
          id?: string
          metadata?: Json
          org_id?: string
          phone?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contents: {
        Row: {
          blocks: Json | null
          body_en: string | null
          body_es: string | null
          body_pt: string | null
          category: string | null
          content_type: string | null
          created_at: string | null
          created_by: string | null
          department_id: string | null
          id: string
          is_featured: boolean | null
          org_id: string
          read_minutes: number | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          summary: string | null
          tags: string[] | null
          title_en: string | null
          title_es: string | null
          title_pt: string
          updated_at: string | null
          updated_by: string | null
          version: string | null
          visibility: string | null
        }
        Insert: {
          blocks?: Json | null
          body_en?: string | null
          body_es?: string | null
          body_pt?: string | null
          category?: string | null
          content_type?: string | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          id?: string
          is_featured?: boolean | null
          org_id?: string
          read_minutes?: number | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string | null
          tags?: string[] | null
          title_en?: string | null
          title_es?: string | null
          title_pt: string
          updated_at?: string | null
          updated_by?: string | null
          version?: string | null
          visibility?: string | null
        }
        Update: {
          blocks?: Json | null
          body_en?: string | null
          body_es?: string | null
          body_pt?: string | null
          category?: string | null
          content_type?: string | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          id?: string
          is_featured?: boolean | null
          org_id?: string
          read_minutes?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string | null
          tags?: string[] | null
          title_en?: string | null
          title_es?: string | null
          title_pt?: string
          updated_at?: string | null
          updated_by?: string | null
          version?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contents_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contents_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_presets: {
        Row: {
          created_at: string
          deposit_weeks: number
          enrolment_fee: number
          has_material: boolean
          id: string
          is_active: boolean
          material_fee: number
          name: string
          org_id: string
          payment_frequency: string
          payment_parts: number
          provider: string
          rate_per_week: number
          scholarship: number
          sort_order: number
          timetable: string
          tuition: number
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deposit_weeks?: number
          enrolment_fee?: number
          has_material?: boolean
          id?: string
          is_active?: boolean
          material_fee?: number
          name: string
          org_id?: string
          payment_frequency?: string
          payment_parts?: number
          provider: string
          rate_per_week?: number
          scholarship?: number
          sort_order?: number
          timetable?: string
          tuition?: number
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deposit_weeks?: number
          enrolment_fee?: number
          has_material?: boolean
          id?: string
          is_active?: boolean
          material_fee?: number
          name?: string
          org_id?: string
          payment_frequency?: string
          payment_parts?: number
          provider?: string
          rate_per_week?: number
          scholarship?: number
          sort_order?: number
          timetable?: string
          tuition?: number
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_presets_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      course_price_versions: {
        Row: {
          course_id: string
          created_at: string
          created_by: string | null
          currency_code: string
          deposit_weeks: number
          enrolment_fee_in_cents: number
          has_material: boolean
          id: string
          market_id: string | null
          material_fee_in_cents: number
          metadata: Json
          nationality: string | null
          org_id: string
          payment_frequency: string
          payment_parts: number
          rate_per_week_in_cents: number
          scholarship_in_cents: number
          source_document_id: string | null
          tuition_in_cents: number
          updated_at: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          created_by?: string | null
          currency_code?: string
          deposit_weeks?: number
          enrolment_fee_in_cents?: number
          has_material?: boolean
          id?: string
          market_id?: string | null
          material_fee_in_cents?: number
          metadata?: Json
          nationality?: string | null
          org_id?: string
          payment_frequency?: string
          payment_parts?: number
          rate_per_week_in_cents?: number
          scholarship_in_cents?: number
          source_document_id?: string | null
          tuition_in_cents?: number
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          created_by?: string | null
          currency_code?: string
          deposit_weeks?: number
          enrolment_fee_in_cents?: number
          has_material?: boolean
          id?: string
          market_id?: string | null
          material_fee_in_cents?: number
          metadata?: Json
          nationality?: string | null
          org_id?: string
          payment_frequency?: string
          payment_parts?: number
          rate_per_week_in_cents?: number
          scholarship_in_cents?: number
          source_document_id?: string | null
          tuition_in_cents?: number
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_price_versions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_price_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_price_versions_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_price_versions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          campus_id: string | null
          confidence: number
          created_at: string
          created_by: string | null
          cricos: string | null
          currency_code: string
          default_intake: string | null
          deleted_at: string | null
          english_level: string | null
          external_id: string | null
          id: string
          institution_id: string
          is_active: boolean
          metadata: Json
          name: string
          org_id: string
          source: string
          timetable: string
          type: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          campus_id?: string | null
          confidence?: number
          created_at?: string
          created_by?: string | null
          cricos?: string | null
          currency_code?: string
          default_intake?: string | null
          deleted_at?: string | null
          english_level?: string | null
          external_id?: string | null
          id?: string
          institution_id: string
          is_active?: boolean
          metadata?: Json
          name: string
          org_id?: string
          source?: string
          timetable?: string
          type: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          campus_id?: string | null
          confidence?: number
          created_at?: string
          created_by?: string | null
          cricos?: string | null
          currency_code?: string
          default_intake?: string | null
          deleted_at?: string | null
          english_level?: string | null
          external_id?: string | null
          id?: string
          institution_id?: string
          is_active?: boolean
          metadata?: Json
          name?: string
          org_id?: string
          source?: string
          timetable?: string
          type?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          color: string | null
          created_at: string | null
          description_en: string | null
          description_es: string | null
          description_pt: string | null
          icon: string | null
          id: string
          is_active: boolean
          name_en: string
          name_es: string
          name_pt: string
          org_id: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description_en?: string | null
          description_es?: string | null
          description_pt?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name_en: string
          name_es: string
          name_pt: string
          org_id?: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description_en?: string | null
          description_es?: string | null
          description_pt?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name_en?: string
          name_es?: string
          name_pt?: string
          org_id?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_profiles: {
        Row: {
          abn: string | null
          account_name: string | null
          account_number: string | null
          bank_name: string | null
          bsb: string | null
          created_at: string
          currency_code: string
          deleted_at: string | null
          external_id: string | null
          hourly_rate_in_cents: number
          id: string
          metadata: Json
          org_id: string
          profile_id: string | null
          updated_at: string
        }
        Insert: {
          abn?: string | null
          account_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          bsb?: string | null
          created_at?: string
          currency_code?: string
          deleted_at?: string | null
          external_id?: string | null
          hourly_rate_in_cents?: number
          id?: string
          metadata?: Json
          org_id?: string
          profile_id?: string | null
          updated_at?: string
        }
        Update: {
          abn?: string | null
          account_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          bsb?: string | null
          created_at?: string
          currency_code?: string
          deleted_at?: string | null
          external_id?: string | null
          hourly_rate_in_cents?: number
          id?: string
          metadata?: Json
          org_id?: string
          profile_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_invoices: {
        Row: {
          created_at: string
          currency_code: string
          employee_id: string
          external_id: string | null
          id: string
          invoice_number: string
          issued_at: string | null
          metadata: Json
          org_id: string
          paid_at: string | null
          period_end: string
          period_start: string
          status: string
          total_cents: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency_code?: string
          employee_id: string
          external_id?: string | null
          id?: string
          invoice_number: string
          issued_at?: string | null
          metadata?: Json
          org_id?: string
          paid_at?: string | null
          period_end: string
          period_start: string
          status?: string
          total_cents?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency_code?: string
          employee_id?: string
          external_id?: string | null
          id?: string
          invoice_number?: string
          issued_at?: string | null
          metadata?: Json
          org_id?: string
          paid_at?: string | null
          period_end?: string
          period_start?: string
          status?: string
          total_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_invoices_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_invoices_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_rate_rules: {
        Row: {
          applies_from: string
          applies_until: string | null
          created_at: string
          day_type: string
          id: string
          metadata: Json
          multiplier: number
          name: string
          org_id: string
          updated_at: string
        }
        Insert: {
          applies_from: string
          applies_until?: string | null
          created_at?: string
          day_type: string
          id?: string
          metadata?: Json
          multiplier?: number
          name: string
          org_id?: string
          updated_at?: string
        }
        Update: {
          applies_from?: string
          applies_until?: string | null
          created_at?: string
          day_type?: string
          id?: string
          metadata?: Json
          multiplier?: number
          name?: string
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_rate_rules_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          city: string | null
          commission_default: number | null
          completeness: number
          country: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          external_id: string | null
          id: string
          logo_url: string | null
          metadata: Json
          name: string
          notes: string | null
          org_id: string
          partnership_status: string
          prices_valid_until: string | null
          source: string
          updated_at: string
          updated_by: string | null
          website: string | null
        }
        Insert: {
          city?: string | null
          commission_default?: number | null
          completeness?: number
          country?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          external_id?: string | null
          id?: string
          logo_url?: string | null
          metadata?: Json
          name: string
          notes?: string | null
          org_id?: string
          partnership_status?: string
          prices_valid_until?: string | null
          source?: string
          updated_at?: string
          updated_by?: string | null
          website?: string | null
        }
        Update: {
          city?: string | null
          commission_default?: number | null
          completeness?: number
          country?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          external_id?: string | null
          id?: string
          logo_url?: string | null
          metadata?: Json
          name?: string
          notes?: string | null
          org_id?: string
          partnership_status?: string
          prices_valid_until?: string | null
          source?: string
          updated_at?: string
          updated_by?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institutions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institutions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institutions_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      markets: {
        Row: {
          code: string | null
          country_codes: string[]
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          metadata: Json
          name: string
          org_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          code?: string | null
          country_codes?: string[]
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          metadata?: Json
          name: string
          org_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          code?: string | null
          country_codes?: string[]
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          metadata?: Json
          name?: string
          org_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "markets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "markets_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "markets_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          ai_usage: Json
          branding: Json
          created_at: string
          currency_code: string
          id: string
          name: string
          settings: Json
          updated_at: string
        }
        Insert: {
          ai_usage?: Json
          branding?: Json
          created_at?: string
          currency_code?: string
          id?: string
          name: string
          settings?: Json
          updated_at?: string
        }
        Update: {
          ai_usage?: Json
          branding?: Json
          created_at?: string
          currency_code?: string
          id?: string
          name?: string
          settings?: Json
          updated_at?: string
        }
        Relationships: []
      }
      pricing_rules: {
        Row: {
          conditions: Json
          created_at: string
          created_by: string | null
          deleted_at: string | null
          effect: Json
          id: string
          is_active: boolean
          label: string | null
          metadata: Json
          org_id: string
          priority: number
          scope: string
          scope_id: string | null
          updated_at: string
          updated_by: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          conditions?: Json
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          effect: Json
          id?: string
          is_active?: boolean
          label?: string | null
          metadata?: Json
          org_id?: string
          priority?: number
          scope: string
          scope_id?: string | null
          updated_at?: string
          updated_by?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          conditions?: Json
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          effect?: Json
          id?: string
          is_active?: boolean
          label?: string | null
          metadata?: Json
          org_id?: string
          priority?: number
          scope?: string
          scope_id?: string | null
          updated_at?: string
          updated_by?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_rules_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_rules_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          org_id: string
          preferred_locale: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          org_id?: string
          preferred_locale?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          org_id?: string
          preferred_locale?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_events: {
        Row: {
          actor_id: string | null
          contact_id: string | null
          created_at: string
          done_at: string | null
          from_me: boolean
          id: string
          kind: string
          metadata: Json
          org_id: string
          scheduled_at: string | null
          study_plan_id: string
          title: string | null
        }
        Insert: {
          actor_id?: string | null
          contact_id?: string | null
          created_at?: string
          done_at?: string | null
          from_me?: boolean
          id?: string
          kind: string
          metadata?: Json
          org_id?: string
          scheduled_at?: string | null
          study_plan_id: string
          title?: string | null
        }
        Update: {
          actor_id?: string | null
          contact_id?: string | null
          created_at?: string
          done_at?: string | null
          from_me?: boolean
          id?: string
          kind?: string
          metadata?: Json
          org_id?: string
          scheduled_at?: string | null
          study_plan_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_events_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_events_study_plan_id_fkey"
            columns: ["study_plan_id"]
            isOneToOne: false
            referencedRelation: "study_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_templates: {
        Row: {
          applicant_type: string | null
          created_at: string
          created_by: string | null
          data: Json
          deleted_at: string | null
          description: string | null
          external_id: string | null
          id: string
          is_active: boolean
          metadata: Json
          name: string
          org_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          applicant_type?: string | null
          created_at?: string
          created_by?: string | null
          data?: Json
          deleted_at?: string | null
          description?: string | null
          external_id?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          name: string
          org_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          applicant_type?: string | null
          created_at?: string
          created_by?: string | null
          data?: Json
          deleted_at?: string | null
          description?: string | null
          external_id?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          name?: string
          org_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_templates_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_versions: {
        Row: {
          computed: Json | null
          created_at: string
          created_by: string | null
          data: Json
          id: string
          label: string | null
          org_id: string
          reason: string
          status: string | null
          study_plan_id: string
          version_number: number
        }
        Insert: {
          computed?: Json | null
          created_at?: string
          created_by?: string | null
          data: Json
          id?: string
          label?: string | null
          org_id?: string
          reason?: string
          status?: string | null
          study_plan_id: string
          version_number: number
        }
        Update: {
          computed?: Json | null
          created_at?: string
          created_by?: string | null
          data?: Json
          id?: string
          label?: string | null
          org_id?: string
          reason?: string
          status?: string | null
          study_plan_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "proposal_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_versions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_versions_study_plan_id_fkey"
            columns: ["study_plan_id"]
            isOneToOne: false
            referencedRelation: "study_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      school_admission_credentials: {
        Row: {
          admission_id: string
          created_at: string
          created_by: string | null
          id: string
          label: string | null
          login: string | null
          org_id: string
          password: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          admission_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          label?: string | null
          login?: string | null
          org_id?: string
          password?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          admission_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          label?: string | null
          login?: string | null
          org_id?: string
          password?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_admission_credentials_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "school_admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_admission_credentials_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_admission_credentials_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_admission_credentials_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      school_admissions: {
        Row: {
          contacts: Json
          created_at: string
          created_by: string | null
          deleted_at: string | null
          documents: Json
          enrolment_type: string | null
          id: string
          institution_id: string
          metadata: Json
          notes: string | null
          org_id: string
          portal_url: string | null
          streams: string[]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          contacts?: Json
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          documents?: Json
          enrolment_type?: string | null
          id?: string
          institution_id: string
          metadata?: Json
          notes?: string | null
          org_id?: string
          portal_url?: string | null
          streams?: string[]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          contacts?: Json
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          documents?: Json
          enrolment_type?: string | null
          id?: string
          institution_id?: string
          metadata?: Json
          notes?: string | null
          org_id?: string
          portal_url?: string | null
          streams?: string[]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_admissions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_admissions_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_admissions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_admissions_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      study_plans: {
        Row: {
          accepted_at: string | null
          applicant_type: string
          contact_id: string | null
          created_at: string
          created_by: string | null
          currency_code: string
          data: Json
          deal_id: string | null
          deleted_at: string | null
          expires_at: string | null
          external_id: string | null
          id: string
          idempotency_key: string | null
          metadata: Json
          org_id: string
          share_token: string
          share_token_expires_at: string | null
          status: Database["public"]["Enums"]["study_plan_status"]
          student_name: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          accepted_at?: string | null
          applicant_type?: string
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          currency_code?: string
          data?: Json
          deal_id?: string | null
          deleted_at?: string | null
          expires_at?: string | null
          external_id?: string | null
          id?: string
          idempotency_key?: string | null
          metadata?: Json
          org_id?: string
          share_token?: string
          share_token_expires_at?: string | null
          status?: Database["public"]["Enums"]["study_plan_status"]
          student_name?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          accepted_at?: string | null
          applicant_type?: string
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          currency_code?: string
          data?: Json
          deal_id?: string | null
          deleted_at?: string | null
          expires_at?: string | null
          external_id?: string | null
          id?: string
          idempotency_key?: string | null
          metadata?: Json
          org_id?: string
          share_token?: string
          share_token_expires_at?: string | null
          status?: Database["public"]["Enums"]["study_plan_status"]
          student_name?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_plans_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_plans_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_plans_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          approved_by: string | null
          clock_in: string
          clock_out: string | null
          created_at: string
          day_type: string
          deleted_at: string | null
          description: string | null
          employee_id: string
          id: string
          invoice_id: string | null
          metadata: Json
          org_id: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          clock_in: string
          clock_out?: string | null
          created_at?: string
          day_type?: string
          deleted_at?: string | null
          description?: string | null
          employee_id: string
          id?: string
          invoice_id?: string | null
          metadata?: Json
          org_id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          clock_in?: string
          clock_out?: string | null
          created_at?: string
          day_type?: string
          deleted_at?: string | null
          description?: string | null
          employee_id?: string
          id?: string
          invoice_id?: string | null
          metadata?: Json
          org_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "hr_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_course_price: {
        Args: { p_course: string; p_nationality?: string; p_on?: string }
        Returns: {
          course_id: string
          created_at: string
          created_by: string | null
          currency_code: string
          deposit_weeks: number
          enrolment_fee_in_cents: number
          has_material: boolean
          id: string
          market_id: string | null
          material_fee_in_cents: number
          metadata: Json
          nationality: string | null
          org_id: string
          payment_frequency: string
          payment_parts: number
          rate_per_week_in_cents: number
          scholarship_in_cents: number
          source_document_id: string | null
          tuition_in_cents: number
          updated_at: string
          valid_from: string
          valid_until: string | null
        }
        SetofOptions: {
          from: "*"
          to: "course_price_versions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      current_org_id: { Args: never; Returns: string }
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      is_active_user: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "reader" | "editor" | "admin" | "super_admin"
      content_status: "draft" | "published" | "archived"
      study_plan_status:
        | "draft"
        | "sent"
        | "accepted"
        | "archived"
        | "ready_review"
        | "approved_internal"
        | "viewed"
        | "negotiating"
        | "rejected"
        | "expired"
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
      app_role: ["reader", "editor", "admin", "super_admin"],
      content_status: ["draft", "published", "archived"],
      study_plan_status: [
        "draft",
        "sent",
        "accepted",
        "archived",
        "ready_review",
        "approved_internal",
        "viewed",
        "negotiating",
        "rejected",
        "expired",
      ],
    },
  },
} as const
