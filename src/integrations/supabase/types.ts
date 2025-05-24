export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ab_test_participants: {
        Row: {
          conversion_value: number | null
          converted: boolean | null
          enrolled_at: string | null
          id: string
          test_id: string | null
          user_id: string
          variant: string
        }
        Insert: {
          conversion_value?: number | null
          converted?: boolean | null
          enrolled_at?: string | null
          id?: string
          test_id?: string | null
          user_id: string
          variant: string
        }
        Update: {
          conversion_value?: number | null
          converted?: boolean | null
          enrolled_at?: string | null
          id?: string
          test_id?: string | null
          user_id?: string
          variant?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_participants_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "ab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_tests: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          start_date: string
          status: string
          success_metrics: Json
          target_segments: Json | null
          test_config: Json
          test_name: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          start_date: string
          status?: string
          success_metrics: Json
          target_segments?: Json | null
          test_config: Json
          test_name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string
          status?: string
          success_metrics?: Json
          target_segments?: Json | null
          test_config?: Json
          test_name?: string
        }
        Relationships: []
      }
      admin_activity_logs: {
        Row: {
          action: string
          admin_user_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          target_id: string | null
          target_type: string
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_roles: {
        Row: {
          created_at: string | null
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          permissions: Json | null
          role: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          last_activity: string | null
          session_token: string
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          session_token: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          session_token?: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      affiliate_histories: {
        Row: {
          commission: number
          commission_paid: number | null
          commission_type: string | null
          created_at: string | null
          deposited: boolean | null
          deposited_amount: number | null
          id: string
          inviter: string
          losses: number | null
          losses_amount: number | null
          receita: number | null
          status: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          commission?: number
          commission_paid?: number | null
          commission_type?: string | null
          created_at?: string | null
          deposited?: boolean | null
          deposited_amount?: number | null
          id?: string
          inviter: string
          losses?: number | null
          losses_amount?: number | null
          receita?: number | null
          status?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          commission?: number
          commission_paid?: number | null
          commission_type?: string | null
          created_at?: string | null
          deposited?: boolean | null
          deposited_amount?: number | null
          id?: string
          inviter?: string
          losses?: number | null
          losses_amount?: number | null
          receita?: number | null
          status?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_histories_inviter_fkey"
            columns: ["inviter"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_histories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bonus_templates: {
        Row: {
          abuse_prevention_rules: Json | null
          applicable_games: string[] | null
          applicable_providers: string[] | null
          country_restrictions: string[] | null
          created_at: string | null
          description: string | null
          expiry_days: number
          game_restrictions: string[] | null
          id: string
          is_active: boolean | null
          max_bonus: number | null
          min_deposit: number | null
          name: string
          percentage: number | null
          type: string
          updated_at: string | null
          value: number
          vip_levels: number[] | null
          wagering_requirement: number
        }
        Insert: {
          abuse_prevention_rules?: Json | null
          applicable_games?: string[] | null
          applicable_providers?: string[] | null
          country_restrictions?: string[] | null
          created_at?: string | null
          description?: string | null
          expiry_days?: number
          game_restrictions?: string[] | null
          id?: string
          is_active?: boolean | null
          max_bonus?: number | null
          min_deposit?: number | null
          name: string
          percentage?: number | null
          type: string
          updated_at?: string | null
          value: number
          vip_levels?: number[] | null
          wagering_requirement?: number
        }
        Update: {
          abuse_prevention_rules?: Json | null
          applicable_games?: string[] | null
          applicable_providers?: string[] | null
          country_restrictions?: string[] | null
          created_at?: string | null
          description?: string | null
          expiry_days?: number
          game_restrictions?: string[] | null
          id?: string
          is_active?: boolean | null
          max_bonus?: number | null
          min_deposit?: number | null
          name?: string
          percentage?: number | null
          type?: string
          updated_at?: string | null
          value?: number
          vip_levels?: number[] | null
          wagering_requirement?: number
        }
        Relationships: []
      }
      capacity_metrics: {
        Row: {
          alert_threshold: number | null
          capacity_limit: number
          critical_threshold: number | null
          current_usage: number
          id: string
          projected_usage: number | null
          resource_type: string
          timestamp: string | null
          utilization_percentage: number
        }
        Insert: {
          alert_threshold?: number | null
          capacity_limit: number
          critical_threshold?: number | null
          current_usage: number
          id?: string
          projected_usage?: number | null
          resource_type: string
          timestamp?: string | null
          utilization_percentage: number
        }
        Update: {
          alert_threshold?: number | null
          capacity_limit?: number
          critical_threshold?: number | null
          current_usage?: number
          id?: string
          projected_usage?: number | null
          resource_type?: string
          timestamp?: string | null
          utilization_percentage?: number
        }
        Relationships: []
      }
      churn_predictions: {
        Row: {
          churn_probability: number
          churn_risk_level: string
          expires_at: string | null
          id: string
          model_version: string
          predicted_at: string | null
          prediction_factors: Json
          recommended_actions: Json | null
          user_id: string
        }
        Insert: {
          churn_probability: number
          churn_risk_level: string
          expires_at?: string | null
          id?: string
          model_version: string
          predicted_at?: string | null
          prediction_factors: Json
          recommended_actions?: Json | null
          user_id: string
        }
        Update: {
          churn_probability?: number
          churn_risk_level?: string
          expires_at?: string | null
          id?: string
          model_version?: string
          predicted_at?: string | null
          prediction_factors?: Json
          recommended_actions?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      device_fingerprints: {
        Row: {
          created_at: string | null
          device_info: Json
          fingerprint_hash: string
          first_seen: string | null
          geolocation: Json | null
          id: string
          ip_address: unknown
          is_suspicious: boolean | null
          last_seen: string | null
          risk_score: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_info: Json
          fingerprint_hash: string
          first_seen?: string | null
          geolocation?: Json | null
          id?: string
          ip_address: unknown
          is_suspicious?: boolean | null
          last_seen?: string | null
          risk_score?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_info?: Json
          fingerprint_hash?: string
          first_seen?: string | null
          geolocation?: Json | null
          id?: string
          ip_address?: unknown
          is_suspicious?: boolean | null
          last_seen?: string | null
          risk_score?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          additional_context: Json | null
          created_at: string | null
          error_message: string
          error_type: string
          id: string
          ip_address: unknown | null
          request_url: string | null
          resolved: boolean | null
          session_id: string | null
          stack_trace: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          additional_context?: Json | null
          created_at?: string | null
          error_message: string
          error_type: string
          id?: string
          ip_address?: unknown | null
          request_url?: string | null
          resolved?: boolean | null
          session_id?: string | null
          stack_trace?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          additional_context?: Json | null
          created_at?: string | null
          error_message?: string
          error_type?: string
          id?: string
          ip_address?: unknown | null
          request_url?: string | null
          resolved?: boolean | null
          session_id?: string | null
          stack_trace?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      favorite_games: {
        Row: {
          created_at: string | null
          game_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          game_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          game_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_games_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_audit: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_amount: number | null
          new_status: string | null
          performed_by: string | null
          previous_amount: number | null
          previous_status: string | null
          reason: string | null
          transaction_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_amount?: number | null
          new_status?: string | null
          performed_by?: string | null
          previous_amount?: number | null
          previous_status?: string | null
          reason?: string | null
          transaction_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_amount?: number | null
          new_status?: string | null
          performed_by?: string | null
          previous_amount?: number | null
          previous_status?: string | null
          reason?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_audit_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_investigations: {
        Row: {
          assigned_to: string | null
          automated_flags: Json
          created_at: string | null
          evidence: Json
          id: string
          investigation_type: string
          priority: string
          resolution: string | null
          resolution_notes: string | null
          resolved_at: string | null
          risk_factors: Json
          status: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          automated_flags?: Json
          created_at?: string | null
          evidence?: Json
          id?: string
          investigation_type: string
          priority?: string
          resolution?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          risk_factors?: Json
          status?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          automated_flags?: Json
          created_at?: string | null
          evidence?: Json
          id?: string
          investigation_type?: string
          priority?: string
          resolution?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          risk_factors?: Json
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      game_categories: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          image: string | null
          name: string
          show_home: boolean | null
          slug: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          image?: string | null
          name: string
          show_home?: boolean | null
          slug: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          image?: string | null
          name?: string
          show_home?: boolean | null
          slug?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      game_launch_sessions: {
        Row: {
          ended_at: string | null
          game_id: string | null
          id: string
          last_activity: string | null
          launch_url: string | null
          provider_session_id: string | null
          session_token: string
          started_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          ended_at?: string | null
          game_id?: string | null
          id?: string
          last_activity?: string | null
          launch_url?: string | null
          provider_session_id?: string | null
          session_token: string
          started_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          ended_at?: string | null
          game_id?: string | null
          id?: string
          last_activity?: string | null
          launch_url?: string | null
          provider_session_id?: string | null
          session_token?: string
          started_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_launch_sessions_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      game_sessions: {
        Row: {
          created_at: string | null
          duration_minutes: number | null
          ended_at: string | null
          game_id: string
          id: string
          started_at: string | null
          total_bets: number | null
          total_wins: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          game_id: string
          id?: string
          started_at?: string | null
          total_bets?: number | null
          total_wins?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          game_id?: string
          id?: string
          started_at?: string | null
          total_bets?: number | null
          total_wins?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          category_id: string | null
          cover: string | null
          created_at: string | null
          description: string | null
          distribution: string
          game_code: string
          game_id: string
          game_name: string
          game_server_url: string | null
          game_type: string | null
          has_freespins: boolean | null
          has_lobby: boolean | null
          has_tables: boolean | null
          id: string
          is_featured: boolean | null
          is_mobile: boolean | null
          only_demo: boolean | null
          provider_id: string | null
          rtp: number
          show_home: boolean | null
          status: string
          technology: string | null
          updated_at: string | null
          views: number | null
        }
        Insert: {
          category_id?: string | null
          cover?: string | null
          created_at?: string | null
          description?: string | null
          distribution: string
          game_code: string
          game_id: string
          game_name: string
          game_server_url?: string | null
          game_type?: string | null
          has_freespins?: boolean | null
          has_lobby?: boolean | null
          has_tables?: boolean | null
          id?: string
          is_featured?: boolean | null
          is_mobile?: boolean | null
          only_demo?: boolean | null
          provider_id?: string | null
          rtp: number
          show_home?: boolean | null
          status?: string
          technology?: string | null
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          category_id?: string | null
          cover?: string | null
          created_at?: string | null
          description?: string | null
          distribution?: string
          game_code?: string
          game_id?: string
          game_name?: string
          game_server_url?: string | null
          game_type?: string | null
          has_freespins?: boolean | null
          has_lobby?: boolean | null
          has_tables?: boolean | null
          id?: string
          is_featured?: boolean | null
          is_mobile?: boolean | null
          only_demo?: boolean | null
          provider_id?: string | null
          rtp?: number
          show_home?: boolean | null
          status?: string
          technology?: string | null
          updated_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "games_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "game_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          code: string
          config: Json | null
          created_at: string | null
          fees: Json | null
          id: string
          is_active: boolean | null
          max_amount: number | null
          min_amount: number | null
          name: string
          processing_time_minutes: number | null
          provider: string
          supported_currencies: string[] | null
          type: string
          updated_at: string | null
        }
        Insert: {
          code: string
          config?: Json | null
          created_at?: string | null
          fees?: Json | null
          id?: string
          is_active?: boolean | null
          max_amount?: number | null
          min_amount?: number | null
          name: string
          processing_time_minutes?: number | null
          provider: string
          supported_currencies?: string[] | null
          type: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          config?: Json | null
          created_at?: string | null
          fees?: Json | null
          id?: string
          is_active?: boolean | null
          max_amount?: number | null
          min_amount?: number | null
          name?: string
          processing_time_minutes?: number | null
          provider?: string
          supported_currencies?: string[] | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          id: string
          metric_name: string
          metric_type: string
          source: string
          tags: Json | null
          timestamp: string | null
          value: number
        }
        Insert: {
          id?: string
          metric_name: string
          metric_type: string
          source: string
          tags?: Json | null
          timestamp?: string | null
          value: number
        }
        Update: {
          id?: string
          metric_name?: string
          metric_type?: string
          source?: string
          tags?: Json | null
          timestamp?: string | null
          value?: number
        }
        Relationships: []
      }
      player_ltv: {
        Row: {
          calculated_at: string | null
          calculation_method: string
          confidence_interval: Json | null
          current_value: number
          expires_at: string | null
          factors: Json
          id: string
          ltv_segment: string
          predicted_ltv: number
          user_id: string
        }
        Insert: {
          calculated_at?: string | null
          calculation_method: string
          confidence_interval?: Json | null
          current_value?: number
          expires_at?: string | null
          factors: Json
          id?: string
          ltv_segment: string
          predicted_ltv: number
          user_id: string
        }
        Update: {
          calculated_at?: string | null
          calculation_method?: string
          confidence_interval?: Json | null
          current_value?: number
          expires_at?: string | null
          factors?: Json
          id?: string
          ltv_segment?: string
          predicted_ltv?: number
          user_id?: string
        }
        Relationships: []
      }
      player_segments: {
        Row: {
          calculated_at: string | null
          confidence_score: number
          created_at: string | null
          id: string
          segment_type: string
          segment_value: string
          user_id: string
          valid_until: string | null
        }
        Insert: {
          calculated_at?: string | null
          confidence_score: number
          created_at?: string | null
          id?: string
          segment_type: string
          segment_value: string
          user_id: string
          valid_until?: string | null
        }
        Update: {
          calculated_at?: string | null
          confidence_score?: number
          created_at?: string | null
          id?: string
          segment_type?: string
          segment_value?: string
          user_id?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_callback_logs: {
        Row: {
          callback_type: string
          created_at: string | null
          error_message: string | null
          id: string
          processing_time_ms: number | null
          provider_id: string | null
          request_data: Json | null
          response_data: Json | null
          status_code: number | null
        }
        Insert: {
          callback_type: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          processing_time_ms?: number | null
          provider_id?: string | null
          request_data?: Json | null
          response_data?: Json | null
          status_code?: number | null
        }
        Update: {
          callback_type?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          processing_time_ms?: number | null
          provider_id?: string | null
          request_data?: Json | null
          response_data?: Json | null
          status_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_callback_logs_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      providers: {
        Row: {
          api_endpoint: string | null
          api_key: string | null
          api_secret: string | null
          created_at: string | null
          description: string | null
          id: string
          logo: string | null
          name: string
          status: string
          updated_at: string | null
        }
        Insert: {
          api_endpoint?: string | null
          api_key?: string | null
          api_secret?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo?: string | null
          name: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          api_endpoint?: string | null
          api_key?: string | null
          api_secret?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo?: string | null
          name?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      rate_limit_logs: {
        Row: {
          blocked_requests: number | null
          created_at: string | null
          endpoint: string
          id: string
          identifier: string
          request_count: number
          window_start: string
        }
        Insert: {
          blocked_requests?: number | null
          created_at?: string | null
          endpoint: string
          id?: string
          identifier: string
          request_count?: number
          window_start: string
        }
        Update: {
          blocked_requests?: number | null
          created_at?: string | null
          endpoint?: string
          id?: string
          identifier?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      reality_checks: {
        Row: {
          acknowledged: boolean | null
          check_time: string | null
          created_at: string | null
          id: string
          message: string | null
          session_id: string | null
          user_id: string
        }
        Insert: {
          acknowledged?: boolean | null
          check_time?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          session_id?: string | null
          user_id: string
        }
        Update: {
          acknowledged?: boolean | null
          check_time?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reality_checks_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reality_checks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      security_incidents: {
        Row: {
          created_at: string | null
          details: Json
          id: string
          incident_type: string
          resolved_at: string | null
          response_actions: Json | null
          severity: string
          source_ip: unknown | null
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details: Json
          id?: string
          incident_type: string
          resolved_at?: string | null
          response_actions?: Json | null
          severity: string
          source_ip?: unknown | null
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json
          id?: string
          incident_type?: string
          resolved_at?: string | null
          response_actions?: Json | null
          severity?: string
          source_ip?: unknown | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      system_config: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          updated_at: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          balance_after: number | null
          balance_before: number | null
          created_at: string | null
          currency: string
          game_id: string | null
          id: string
          player_id: string
          provider: string
          round_id: string | null
          session_id: string | null
          status: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          balance_after?: number | null
          balance_before?: number | null
          created_at?: string | null
          currency: string
          game_id?: string | null
          id?: string
          player_id: string
          provider: string
          round_id?: string | null
          session_id?: string | null
          status?: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          balance_after?: number | null
          balance_before?: number | null
          created_at?: string | null
          currency?: string
          game_id?: string | null
          id?: string
          player_id?: string
          provider?: string
          round_id?: string | null
          session_id?: string | null
          status?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_behavior_patterns: {
        Row: {
          anomaly_score: number | null
          confidence_score: number
          created_at: string | null
          expires_at: string | null
          id: string
          pattern_data: Json
          pattern_type: string
          user_id: string
        }
        Insert: {
          anomaly_score?: number | null
          confidence_score: number
          created_at?: string | null
          expires_at?: string | null
          id?: string
          pattern_data: Json
          pattern_type: string
          user_id: string
        }
        Update: {
          anomaly_score?: number | null
          confidence_score?: number
          created_at?: string | null
          expires_at?: string | null
          id?: string
          pattern_data?: Json
          pattern_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_bonuses: {
        Row: {
          amount: number
          bonus_template_id: string | null
          created_at: string | null
          expires_at: string
          id: string
          status: string
          updated_at: string | null
          user_id: string | null
          wagering_completed: number
          wagering_required: number
        }
        Insert: {
          amount: number
          bonus_template_id?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
          wagering_completed?: number
          wagering_required?: number
        }
        Update: {
          amount?: number
          bonus_template_id?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
          wagering_completed?: number
          wagering_required?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_bonuses_bonus_template_id_fkey"
            columns: ["bonus_template_id"]
            isOneToOne: false
            referencedRelation: "bonus_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          affiliate_baseline: number
          affiliate_cpa: number
          affiliate_revenue_share: number
          affiliate_revenue_share_fake: number | null
          avatar: string | null
          banned: boolean
          cpf: string | null
          created_at: string | null
          email: string
          id: string
          inviter_code: string | null
          inviter_id: string | null
          is_demo_agent: boolean
          language: string
          last_name: string | null
          oauth_id: string | null
          oauth_type: string | null
          phone: string | null
          role_id: number
          status: string
          updated_at: string | null
          username: string
        }
        Insert: {
          affiliate_baseline?: number
          affiliate_cpa?: number
          affiliate_revenue_share?: number
          affiliate_revenue_share_fake?: number | null
          avatar?: string | null
          banned?: boolean
          cpf?: string | null
          created_at?: string | null
          email: string
          id?: string
          inviter_code?: string | null
          inviter_id?: string | null
          is_demo_agent?: boolean
          language?: string
          last_name?: string | null
          oauth_id?: string | null
          oauth_type?: string | null
          phone?: string | null
          role_id?: number
          status?: string
          updated_at?: string | null
          username: string
        }
        Update: {
          affiliate_baseline?: number
          affiliate_cpa?: number
          affiliate_revenue_share?: number
          affiliate_revenue_share_fake?: number | null
          avatar?: string | null
          banned?: boolean
          cpf?: string | null
          created_at?: string | null
          email?: string
          id?: string
          inviter_code?: string | null
          inviter_id?: string | null
          is_demo_agent?: boolean
          language?: string
          last_name?: string | null
          oauth_id?: string | null
          oauth_type?: string | null
          phone?: string | null
          role_id?: number
          status?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          active: boolean
          balance: number
          balance_bonus: number
          balance_bonus_rollover: number | null
          balance_cryptocurrency: number
          balance_demo: number | null
          balance_deposit_rollover: number | null
          balance_withdrawal: number | null
          created_at: string | null
          currency: string
          deposit_limit_daily: number | null
          deposit_limit_monthly: number | null
          deposit_limit_weekly: number | null
          exclusion_period: string | null
          exclusion_until: string | null
          hide_balance: boolean
          id: string
          last_lose: number
          last_won: number
          refer_rewards: number
          reminder_interval_minutes: number | null
          symbol: string
          time_reminder_enabled: boolean | null
          total_bet: number
          total_lose: number
          total_won: number
          updated_at: string | null
          user_id: string
          vip_level: number | null
          vip_points: number | null
        }
        Insert: {
          active?: boolean
          balance?: number
          balance_bonus?: number
          balance_bonus_rollover?: number | null
          balance_cryptocurrency?: number
          balance_demo?: number | null
          balance_deposit_rollover?: number | null
          balance_withdrawal?: number | null
          created_at?: string | null
          currency: string
          deposit_limit_daily?: number | null
          deposit_limit_monthly?: number | null
          deposit_limit_weekly?: number | null
          exclusion_period?: string | null
          exclusion_until?: string | null
          hide_balance?: boolean
          id?: string
          last_lose?: number
          last_won?: number
          refer_rewards?: number
          reminder_interval_minutes?: number | null
          symbol: string
          time_reminder_enabled?: boolean | null
          total_bet?: number
          total_lose?: number
          total_won?: number
          updated_at?: string | null
          user_id: string
          vip_level?: number | null
          vip_points?: number | null
        }
        Update: {
          active?: boolean
          balance?: number
          balance_bonus?: number
          balance_bonus_rollover?: number | null
          balance_cryptocurrency?: number
          balance_demo?: number | null
          balance_deposit_rollover?: number | null
          balance_withdrawal?: number | null
          created_at?: string | null
          currency?: string
          deposit_limit_daily?: number | null
          deposit_limit_monthly?: number | null
          deposit_limit_weekly?: number | null
          exclusion_period?: string | null
          exclusion_until?: string | null
          hide_balance?: boolean
          id?: string
          last_lose?: number
          last_won?: number
          refer_rewards?: number
          reminder_interval_minutes?: number | null
          symbol?: string
          time_reminder_enabled?: boolean | null
          total_bet?: number
          total_lose?: number
          total_won?: number
          updated_at?: string | null
          user_id?: string
          vip_level?: number | null
          vip_points?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_admin_role: {
        Args: { user_uuid: string; required_role: string }
        Returns: boolean
      }
      increment_game_view: {
        Args: { game_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      rollback_transaction: {
        Args: {
          transaction_uuid: string
          admin_user_id: string
          rollback_reason: string
        }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
