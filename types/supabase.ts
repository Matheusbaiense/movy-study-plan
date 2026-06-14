// Supabase schema types — GENERATED from project xpthmguzcbmndyyexfbt (org "Movy education")
// via the Supabase MCP on 2026-06-15, after applying migration 009 (organizations / tenancy).
// To refresh: regenerate from the live project (do not hand-edit).

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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
      study_plan_status: ["draft", "sent", "accepted", "archived"],
    },
  },
} as const
