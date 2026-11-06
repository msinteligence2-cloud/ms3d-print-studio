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
      customer_notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          read_at: string | null
          request_id: string | null
          title: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          read_at?: string | null
          request_id?: string | null
          title: string
          user_id: string
          workspace_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          read_at?: string | null
          request_id?: string | null
          title?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_notifications_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_notifications_workspace_id_fkey"
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
      internal_notes: {
        Row: {
          author_id: string
          body: string
          created_at: string
          customer_id: string | null
          id: string
          request_id: string | null
          workspace_id: string
        }
        Insert: {
          author_id?: string
          body: string
          created_at?: string
          customer_id?: string | null
          id?: string
          request_id?: string | null
          workspace_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          customer_id?: string | null
          id?: string
          request_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_notes_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_notes_workspace_id_fkey"
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
      service_plans: {
        Row: {
          benefits: string[]
          billing_interval: string
          created_at: string
          description: string | null
          discount_percent: number
          id: string
          is_visible: boolean
          monthly_grams_limit: number | null
          monthly_request_limit: number | null
          name: string
          price_cents: number
          sort_order: number
          updated_at: string
          workspace_id: string
        }
        Insert: {
          benefits?: string[]
          billing_interval: string
          created_at?: string
          description?: string | null
          discount_percent?: number
          id?: string
          is_visible?: boolean
          monthly_grams_limit?: number | null
          monthly_request_limit?: number | null
          name: string
          price_cents: number
          sort_order?: number
          updated_at?: string
          workspace_id: string
        }
        Update: {
          benefits?: string[]
          billing_interval?: string
          created_at?: string
          description?: string | null
          discount_percent?: number
          id?: string
          is_visible?: boolean
          monthly_grams_limit?: number | null
          monthly_request_limit?: number | null
          name?: string
          price_cents?: number
          sort_order?: number
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_plans_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      service_quote_items: {
        Row: {
          description: string
          id: string
          kind: string
          position: number
          quantity: number
          quote_id: string
          total_cents: number
          unit_price_cents: number
          workspace_id: string
        }
        Insert: {
          description: string
          id?: string
          kind: string
          position?: number
          quantity: number
          quote_id: string
          total_cents: number
          unit_price_cents: number
          workspace_id: string
        }
        Update: {
          description?: string
          id?: string
          kind?: string
          position?: number
          quantity?: number
          quote_id?: string
          total_cents?: number
          unit_price_cents?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "service_quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_quote_items_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      service_quotes: {
        Row: {
          created_at: string
          created_by: string
          decided_at: string | null
          decided_by: string | null
          decision_note: string | null
          discount_cents: number
          id: string
          lead_time_days: number | null
          message: string | null
          request_id: string
          snapshot: Json
          status: string
          subtotal_cents: number
          tax_cents: number
          tax_percent: number
          total_cents: number
          valid_until: string | null
          version: number
          workspace_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          decided_at?: string | null
          decided_by?: string | null
          decision_note?: string | null
          discount_cents?: number
          id?: string
          lead_time_days?: number | null
          message?: string | null
          request_id: string
          snapshot: Json
          status?: string
          subtotal_cents: number
          tax_cents?: number
          tax_percent?: number
          total_cents: number
          valid_until?: string | null
          version: number
          workspace_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_note?: string | null
          discount_cents?: number
          id?: string
          lead_time_days?: number | null
          message?: string | null
          request_id?: string
          snapshot?: Json
          status?: string
          subtotal_cents?: number
          tax_cents?: number
          tax_percent?: number
          total_cents?: number
          valid_until?: string | null
          version?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_quotes_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_quotes_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      service_request_events: {
        Row: {
          actor_id: string | null
          created_at: string
          from_status: string | null
          id: number
          kind: string
          note: string | null
          request_id: string
          to_status: string | null
          visible_to_customer: boolean
          workspace_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          from_status?: string | null
          id?: never
          kind: string
          note?: string | null
          request_id: string
          to_status?: string | null
          visible_to_customer?: boolean
          workspace_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          from_status?: string | null
          id?: never
          kind?: string
          note?: string | null
          request_id?: string
          to_status?: string | null
          visible_to_customer?: boolean
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_request_events_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_request_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      service_request_files: {
        Row: {
          created_at: string
          extension: string
          id: string
          mime_type: string
          object_path: string
          original_name: string
          request_id: string
          size_bytes: number
          uploaded_by: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          extension: string
          id?: string
          mime_type: string
          object_path: string
          original_name: string
          request_id: string
          size_bytes: number
          uploaded_by: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          extension?: string
          id?: string
          mime_type?: string
          object_path?: string
          original_name?: string
          request_id?: string
          size_bytes?: number
          uploaded_by?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_request_files_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_request_files_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      service_request_messages: {
        Row: {
          author_id: string
          author_is_staff: boolean
          author_name: string | null
          body: string
          created_at: string
          file_id: string | null
          id: string
          request_id: string
          visibility: string
          workspace_id: string
        }
        Insert: {
          author_id: string
          author_is_staff?: boolean
          author_name?: string | null
          body: string
          created_at?: string
          file_id?: string | null
          id?: string
          request_id: string
          visibility?: string
          workspace_id: string
        }
        Update: {
          author_id?: string
          author_is_staff?: boolean
          author_name?: string | null
          body?: string
          created_at?: string
          file_id?: string | null
          id?: string
          request_id?: string
          visibility?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_request_messages_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "service_request_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_request_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_request_messages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          assignee_id: string | null
          color: string | null
          created_at: string
          customer_id: string
          delivery_address: string | null
          delivery_method: string
          description: string
          desired_date: string | null
          dimensions: string | null
          due_date: string | null
          id: string
          material: string
          notes: string | null
          priority: string
          protocol: string
          purpose: string | null
          quantity: number
          seq: number
          status: string
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          assignee_id?: string | null
          color?: string | null
          created_at?: string
          customer_id: string
          delivery_address?: string | null
          delivery_method?: string
          description: string
          desired_date?: string | null
          dimensions?: string | null
          due_date?: string | null
          id?: string
          material: string
          notes?: string | null
          priority?: string
          protocol: string
          purpose?: string | null
          quantity: number
          seq: number
          status?: string
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          assignee_id?: string | null
          color?: string | null
          created_at?: string
          customer_id?: string
          delivery_address?: string | null
          delivery_method?: string
          description?: string
          desired_date?: string | null
          dimensions?: string | null
          due_date?: string | null
          id?: string
          material?: string
          notes?: string | null
          priority?: string
          protocol?: string
          purpose?: string | null
          quantity?: number
          seq?: number
          status?: string
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      service_subscriptions: {
        Row: {
          billing_interval: string
          cancelled_at: string | null
          created_at: string
          current_period_end: string | null
          customer_id: string
          id: string
          payment_provider: string | null
          payment_reference: string | null
          plan_id: string
          plan_name: string
          price_cents: number
          starts_at: string | null
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          billing_interval: string
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          customer_id: string
          id?: string
          payment_provider?: string | null
          payment_reference?: string | null
          plan_id: string
          plan_name: string
          price_cents: number
          starts_at?: string | null
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          billing_interval?: string
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          customer_id?: string
          id?: string
          payment_provider?: string | null
          payment_reference?: string | null
          plan_id?: string
          plan_name?: string
          price_cents?: number
          starts_at?: string | null
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "service_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_subscriptions_workspace_id_fkey"
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
      _audit: {
        Args: {
          _action: string
          _id: string
          _meta: Json
          _type: string
          _ws: string
        }
        Returns: undefined
      }
      _notify: {
        Args: {
          _body: string
          _req: string
          _title: string
          _user: string
          _ws: string
        }
        Returns: undefined
      }
      can_access_request_object: {
        Args: { _name: string; _write: boolean }
        Returns: boolean
      }
      cancel_my_request: {
        Args: { _reason?: string; _request: string }
        Returns: undefined
      }
      cancel_my_subscription: { Args: { _sub: string }; Returns: undefined }
      create_my_workspace: { Args: { workspace_name: string }; Returns: string }
      create_quote: {
        Args: {
          _discount_cents: number
          _items: Json
          _lead_time_days: number
          _message: string
          _request: string
          _tax_percent: number
          _valid_until: string
        }
        Returns: string
      }
      create_service_request: {
        Args: { _data: Json; _workspace: string }
        Returns: {
          id: string
          protocol: string
        }[]
      }
      decide_quote: {
        Args: { _approve: boolean; _note?: string; _quote: string }
        Returns: undefined
      }
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
      join_workshop: { Args: { _workspace: string }; Returns: undefined }
      list_open_workshops: {
        Args: never
        Returns: {
          id: string
          name: string
        }[]
      }
      owns_request: { Args: { _request: string }; Returns: boolean }
      register_request_file: {
        Args: {
          _mime: string
          _name: string
          _path: string
          _request: string
          _size: number
        }
        Returns: string
      }
      request_plan_subscription: { Args: { _plan: string }; Returns: string }
      request_transition_allowed: {
        Args: { _from: string; _to: string }
        Returns: boolean
      }
      set_customer_suspended: {
        Args: {
          _reason?: string
          _suspend: boolean
          _user: string
          _workspace: string
        }
        Returns: undefined
      }
      set_request_status: {
        Args: { _note?: string; _request: string; _status: string }
        Returns: undefined
      }
      staff_set_subscription_status: {
        Args: { _reference?: string; _status: string; _sub: string }
        Returns: undefined
      }
      staff_update_customer: {
        Args: {
          _company: string
          _display_name: string
          _phone: string
          _user: string
          _workspace: string
        }
        Returns: undefined
      }
      update_request_meta: {
        Args: {
          _assignee: string
          _due: string
          _priority: string
          _request: string
        }
        Returns: undefined
      }
      workshop_customers: {
        Args: {
          _limit?: number
          _offset?: number
          _search?: string
          _sub_status?: string
          _workspace: string
        }
        Returns: {
          company: string
          display_name: string
          email: string
          joined_at: string
          last_request_at: string
          phone: string
          plan_name: string
          subscription_status: string
          suspended_at: string
          total_count: number
          total_requests: number
          user_id: string
        }[]
      }
      workshop_kpis: {
        Args: { _from?: string; _to?: string; _workspace: string }
        Returns: Json
      }
      workshop_staff: {
        Args: { _workspace: string }
        Returns: {
          display_name: string
          role: string
          user_id: string
        }[]
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
