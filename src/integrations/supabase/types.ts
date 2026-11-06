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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      audit_events: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: number
          metadata: Json
          resource_id: string | null
          resource_type: string
          workspace_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: never
          metadata?: Json
          resource_id?: string | null
          resource_type: string
          workspace_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: never
          metadata?: Json
          resource_id?: string | null
          resource_type?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      filaments: {
        Row: {
          brand: string
          color_name: string
          created_at: string
          diameter_mm: number
          id: string
          material: string
          purchase_price_cents: number
          remaining_grams: number
          spool_weight_grams: number
          updated_at: string
          workspace_id: string
        }
        Insert: {
          brand: string
          color_name: string
          created_at?: string
          diameter_mm?: number
          id?: string
          material: string
          purchase_price_cents: number
          remaining_grams: number
          spool_weight_grams: number
          updated_at?: string
          workspace_id: string
        }
        Update: {
          brand?: string
          color_name?: string
          created_at?: string
          diameter_mm?: number
          id?: string
          material?: string
          purchase_price_cents?: number
          remaining_grams?: number
          spool_weight_grams?: number
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "filaments_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      license_keys: {
        Row: {
          activation_limit: number
          created_at: string
          expires_at: string | null
          id: string
          key_hash: string
          key_prefix: string
          status: string
          subscription_id: string | null
          workspace_id: string
        }
        Insert: {
          activation_limit?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          key_hash: string
          key_prefix: string
          status: string
          subscription_id?: string | null
          workspace_id: string
        }
        Update: {
          activation_limit?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          key_hash?: string
          key_prefix?: string
          status?: string
          subscription_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "license_keys_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "license_keys_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_admins: {
        Row: {
          granted_at: string
          granted_by: string | null
          note: string | null
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          note?: string | null
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      print_jobs: {
        Row: {
          actual_duration_seconds: number | null
          actual_filament_grams: number | null
          completed_at: string | null
          created_at: string
          energy_kwh: number | null
          energy_source: string | null
          estimated_duration_seconds: number | null
          estimated_filament_grams: number | null
          id: string
          printer_id: string
          project_id: string | null
          source: string
          started_at: string | null
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          actual_duration_seconds?: number | null
          actual_filament_grams?: number | null
          completed_at?: string | null
          created_at?: string
          energy_kwh?: number | null
          energy_source?: string | null
          estimated_duration_seconds?: number | null
          estimated_filament_grams?: number | null
          id?: string
          printer_id: string
          project_id?: string | null
          source?: string
          started_at?: string | null
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          actual_duration_seconds?: number | null
          actual_filament_grams?: number | null
          completed_at?: string | null
          created_at?: string
          energy_kwh?: number | null
          energy_source?: string | null
          estimated_duration_seconds?: number | null
          estimated_filament_grams?: number | null
          id?: string
          printer_id?: string
          project_id?: string | null
          source?: string
          started_at?: string | null
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "print_jobs_printer_id_fkey"
            columns: ["printer_id"]
            isOneToOne: false
            referencedRelation: "printers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "print_jobs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "print_jobs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      printer_telemetry: {
        Row: {
          created_at: string
          id: number
          observed_at: string
          payload: Json
          printer_id: string
          source: string
          status: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: never
          observed_at: string
          payload?: Json
          printer_id: string
          source: string
          status: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: never
          observed_at?: string
          payload?: Json
          printer_id?: string
          source?: string
          status?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "printer_telemetry_printer_id_fkey"
            columns: ["printer_id"]
            isOneToOne: false
            referencedRelation: "printers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "printer_telemetry_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      printers: {
        Row: {
          capabilities: Json
          connection_kind: string
          created_at: string
          credential_reference: string | null
          firmware_version: string | null
          id: string
          last_seen_at: string | null
          manufacturer: string
          model_code: string | null
          model_name: string | null
          name: string
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          capabilities?: Json
          connection_kind?: string
          created_at?: string
          credential_reference?: string | null
          firmware_version?: string | null
          id?: string
          last_seen_at?: string | null
          manufacturer?: string
          model_code?: string | null
          model_name?: string | null
          name: string
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          capabilities?: Json
          connection_kind?: string
          created_at?: string
          credential_reference?: string | null
          firmware_version?: string | null
          id?: string
          last_seen_at?: string | null
          manufacturer?: string
          model_code?: string | null
          model_name?: string | null
          name?: string
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "printers_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address_line: string | null
          avatar_url: string | null
          city: string | null
          company: string | null
          created_at: string
          display_name: string | null
          id: string
          notify_email: boolean
          notify_in_app: boolean
          phone: string | null
          postal_code: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address_line?: string | null
          avatar_url?: string | null
          city?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          notify_email?: boolean
          notify_in_app?: boolean
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address_line?: string | null
          avatar_url?: string | null
          city?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          notify_email?: boolean
          notify_in_app?: boolean
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_files: {
        Row: {
          created_at: string
          extension: string
          id: string
          media_type: string | null
          object_path: string
          original_name: string
          project_id: string
          sha256: string | null
          size_bytes: number
          workspace_id: string
        }
        Insert: {
          created_at?: string
          extension: string
          id?: string
          media_type?: string | null
          object_path: string
          original_name: string
          project_id: string
          sha256?: string | null
          size_bytes: number
          workspace_id: string
        }
        Update: {
          created_at?: string
          extension?: string
          id?: string
          media_type?: string | null
          object_path?: string
          original_name?: string
          project_id?: string
          sha256?: string | null
          size_bytes?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_files_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          created_by: string | null
          creator_name: string | null
          description: string | null
          id: string
          license_label: string | null
          name: string
          source_url: string | null
          tags: string[]
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          creator_name?: string | null
          description?: string | null
          id?: string
          license_label?: string | null
          name: string
          source_url?: string | null
          tags?: string[]
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          creator_name?: string | null
          description?: string | null
          id?: string
          license_label?: string | null
          name?: string
          source_url?: string | null
          tags?: string[]
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          plan_code: string
          provider: string | null
          provider_subscription_id: string | null
          starts_at: string | null
          status: string
          term_months: number
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_code: string
          provider?: string | null
          provider_subscription_id?: string | null
          starts_at?: string | null
          status: string
          term_months: number
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_code?: string
          provider?: string | null
          provider_subscription_id?: string | null
          starts_at?: string | null
          status?: string
          term_months?: number
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          created_at: string
          role: string
          suspended_at: string | null
          suspended_reason: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          role: string
          suspended_at?: string | null
          suspended_reason?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          role?: string
          suspended_at?: string | null
          suspended_reason?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          accepts_customers: boolean
          created_at: string
          id: string
          name: string
          owner_id: string
          protocol_prefix: string
          updated_at: string
        }
        Insert: {
          accepts_customers?: boolean
          created_at?: string
          id?: string
          name: string
          owner_id: string
          protocol_prefix?: string
          updated_at?: string
        }
        Update: {
          accepts_customers?: boolean
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          protocol_prefix?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_my_workspace: { Args: { workspace_name: string }; Returns: string }
      has_workspace_role: {
        Args: { allowed_roles: string[]; target_workspace: string }
        Returns: boolean
      }
      is_platform_admin: { Args: never; Returns: boolean }
      is_workspace_customer: {
        Args: { target_workspace: string }
        Returns: boolean
      }
      is_workspace_member: {
        Args: { target_workspace: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
