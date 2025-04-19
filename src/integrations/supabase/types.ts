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
        }
        Relationships: []
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
          hide_balance: boolean
          id: string
          last_lose: number
          last_won: number
          refer_rewards: number
          symbol: string
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
          hide_balance?: boolean
          id?: string
          last_lose?: number
          last_won?: number
          refer_rewards?: number
          symbol: string
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
          hide_balance?: boolean
          id?: string
          last_lose?: number
          last_won?: number
          refer_rewards?: number
          symbol?: string
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
      [_ in never]: never
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
