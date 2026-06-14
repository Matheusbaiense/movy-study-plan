// types/supabase.ts — Schema types for Supabase project xpthmguzcbmndyyexfbt.
// HAND-MAINTAINED (not freshly generated). Aligned to the repo migrations under
// supabase/migrations/* as the source of truth (001 core, 008 presets, 009 tenancy).
// When the canonical project is reachable, regenerate with:
//   npx supabase gen types typescript --project-id xpthmguzcbmndyyexfbt > types/supabase.ts
// NOTE: org_id / organizations / current_org_id below reflect migration 009, which is
// DRAFTED in-repo but must still be applied to the live project (see docs/AI-HANDOVER.md).

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
        }
        Insert: {
          created_at?: string | null
          domain: string
          id?: string
          is_active?: boolean
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: string
          is_active?: boolean
        }
        Relationships: []
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
        ]
      }
      checklist_progress: {
        Row: {
          id: string
          user_id: string
          content_id: string
          checked_items: string[]
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          content_id: string
          checked_items?: string[]
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          content_id?: string
          checked_items?: string[]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_progress_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "contents"
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
          content_type: string
          created_at: string | null
          created_by: string | null
          department_id: string | null
          id: string
          is_featured: boolean | null
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
          visibility: string
        }
        Insert: {
          blocks?: Json | null
          body_en?: string | null
          body_es?: string | null
          body_pt?: string | null
          category?: string | null
          content_type?: string
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          id?: string
          is_featured?: boolean | null
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
          visibility?: string
        }
        Update: {
          blocks?: Json | null
          body_en?: string | null
          body_es?: string | null
          body_pt?: string | null
          category?: string | null
          content_type?: string
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          id?: string
          is_featured?: boolean | null
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
          visibility?: string
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
            foreignKeyName: "contents_updated_by_fkey"
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
          slug?: string
        }
        Relationships: []
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
        Relationships: []
      }
      allowed_emails: {
        Row: {
          created_at: string
          email: string
          org_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          email: string
          org_id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          email?: string
          org_id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
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
        Relationships: []
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
      study_plans: {
        Row: {
          applicant_type: string
          created_at: string
          created_by: string | null
          data: Json
          id: string
          org_id: string
          status: Database["public"]["Enums"]["study_plan_status"]
          student_name: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          applicant_type?: string
          created_at?: string
          created_by?: string | null
          data?: Json
          id?: string
          org_id?: string
          status?: Database["public"]["Enums"]["study_plan_status"]
          student_name?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          applicant_type?: string
          created_at?: string
          created_by?: string | null
          data?: Json
          id?: string
          org_id?: string
          status?: Database["public"]["Enums"]["study_plan_status"]
          student_name?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_plans_updated_by_fkey"
            columns: ["updated_by"]
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
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      current_org_id: { Args: never; Returns: string }
      is_active_user: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "reader" | "editor" | "admin" | "super_admin"
      content_status: "draft" | "published" | "archived"
      study_plan_status: "draft" | "sent" | "accepted" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  T extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
> = (DefaultSchema["Tables"] & DefaultSchema["Views"])[T] extends { Row: infer R } ? R : never

export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T] extends { Insert: infer I } ? I : never

export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T] extends { Update: infer U } ? U : never

export type Enums<T extends keyof DefaultSchema["Enums"]> = DefaultSchema["Enums"][T]

export const Constants = {
  public: {
    Enums: {
      app_role: ["reader", "editor", "admin", "super_admin"] as const,
      content_status: ["draft", "published", "archived"] as const,
      study_plan_status: ["draft", "sent", "accepted", "archived"] as const,
    },
  },
} as const
