
export type Database = {
  public: {
    Tables: {
      affiliate_histories: {
        Row: {
          id: string
          user_id: string
          inviter: string
          commission: number
          commission_type: string | null
          deposited: boolean | null
          deposited_amount: number | null
          losses: number | null
          losses_amount: number | null
          commission_paid: number | null
          status: boolean | null
          created_at: string | null
          updated_at: string | null
          receita: number | null
        }
        Insert: {
          id?: string
          user_id: string
          inviter: string
          commission?: number
          commission_type?: string | null
          deposited?: boolean | null
          deposited_amount?: number | null
          losses?: number | null
          losses_amount?: number | null
          commission_paid?: number | null
          status?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          receita?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          inviter?: string
          commission?: number
          commission_type?: string | null
          deposited?: boolean | null
          deposited_amount?: number | null
          losses?: number | null
          losses_amount?: number | null
          commission_paid?: number | null
          status?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          receita?: number | null
        }
      }
      favorite_games: {
        Row: {
          id: string
          user_id: string
          game_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          game_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          game_id?: string
          created_at?: string | null
        }
      }
      game_categories: {
        Row: {
          id: string
          name: string
          slug: string
          icon: string | null
          image: string | null
          status: string
          show_home: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          icon?: string | null
          image?: string | null
          status?: string
          show_home?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          icon?: string | null
          image?: string | null
          status?: string
          show_home?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      games: {
        Row: {
          id: string
          provider_id: string | null
          game_server_url: string | null
          game_id: string
          game_name: string
          game_code: string
          game_type: string | null
          description: string | null
          cover: string | null
          status: string
          technology: string | null
          has_lobby: boolean | null
          is_mobile: boolean | null
          has_freespins: boolean | null
          has_tables: boolean | null
          only_demo: boolean | null
          rtp: number
          distribution: string
          views: number | null
          is_featured: boolean | null
          show_home: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          provider_id?: string | null
          game_server_url?: string | null
          game_id: string
          game_name: string
          game_code: string
          game_type?: string | null
          description?: string | null
          cover?: string | null
          status?: string
          technology?: string | null
          has_lobby?: boolean | null
          is_mobile?: boolean | null
          has_freespins?: boolean | null
          has_tables?: boolean | null
          only_demo?: boolean | null
          rtp: number
          distribution: string
          views?: number | null
          is_featured?: boolean | null
          show_home?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          provider_id?: string | null
          game_server_url?: string | null
          game_id?: string
          game_name?: string
          game_code?: string
          game_type?: string | null
          description?: string | null
          cover?: string | null
          status?: string
          technology?: string | null
          has_lobby?: boolean | null
          is_mobile?: boolean | null
          has_freespins?: boolean | null
          has_tables?: boolean | null
          only_demo?: boolean | null
          rtp?: number
          distribution?: string
          views?: number | null
          is_featured?: boolean | null
          show_home?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      game_sessions: {
        Row: {
          id: string
          user_id: string
          game_id: string
          started_at: string | null
          ended_at: string | null
          duration_minutes: number | null
          total_bets: number | null
          total_wins: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          game_id: string
          started_at?: string | null
          ended_at?: string | null
          duration_minutes?: number | null
          total_bets?: number | null
          total_wins?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          game_id?: string
          started_at?: string | null
          ended_at?: string | null
          duration_minutes?: number | null
          total_bets?: number | null
          total_wins?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      providers: {
        Row: {
          id: string
          name: string
          logo: string | null
          description: string | null
          status: string
          api_endpoint: string | null
          api_key: string | null
          api_secret: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          logo?: string | null
          description?: string | null
          status?: string
          api_endpoint?: string | null
          api_key?: string | null
          api_secret?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          logo?: string | null
          description?: string | null
          status?: string
          api_endpoint?: string | null
          api_key?: string | null
          api_secret?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string | null
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          user_id?: string | null
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      reality_checks: {
        Row: {
          id: string
          user_id: string
          session_id: string | null
          check_time: string | null
          acknowledged: boolean | null
          message: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          session_id?: string | null
          check_time?: string | null
          acknowledged?: boolean | null
          message?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string | null
          check_time?: string | null
          acknowledged?: boolean | null
          message?: string | null
          created_at?: string | null
        }
      }
      transactions: {
        Row: {
          id: string
          player_id: string
          type: string
          amount: number
          currency: string
          status: string
          game_id: string | null
          round_id: string | null
          session_id: string | null
          provider: string
          balance_before: number | null
          balance_after: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          player_id: string
          type: string
          amount: number
          currency: string
          status?: string
          game_id?: string | null
          round_id?: string | null
          session_id?: string | null
          provider: string
          balance_before?: number | null
          balance_after?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          player_id?: string
          type?: string
          amount?: number
          currency?: string
          status?: string
          game_id?: string | null
          round_id?: string | null
          session_id?: string | null
          provider?: string
          balance_before?: number | null
          balance_after?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      users: {
        Row: {
          id: string
          username: string
          email: string
          status: string
          language: string
          role_id: number
          banned: boolean
          avatar: string | null
          last_name: string | null
          oauth_id: string | null
          oauth_type: string | null
          cpf: string | null
          phone: string | null
          inviter_id: string | null
          inviter_code: string | null
          affiliate_revenue_share: number
          affiliate_revenue_share_fake: number | null
          affiliate_cpa: number
          affiliate_baseline: number
          is_demo_agent: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          username: string
          email: string
          status?: string
          language?: string
          role_id?: number
          banned?: boolean
          avatar?: string | null
          last_name?: string | null
          oauth_id?: string | null
          oauth_type?: string | null
          cpf?: string | null
          phone?: string | null
          inviter_id?: string | null
          inviter_code?: string | null
          affiliate_revenue_share?: number
          affiliate_revenue_share_fake?: number | null
          affiliate_cpa?: number
          affiliate_baseline?: number
          is_demo_agent?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          username?: string
          email?: string
          status?: string
          language?: string
          role_id?: number
          banned?: boolean
          avatar?: string | null
          last_name?: string | null
          oauth_id?: string | null
          oauth_type?: string | null
          cpf?: string | null
          phone?: string | null
          inviter_id?: string | null
          inviter_code?: string | null
          affiliate_revenue_share?: number
          affiliate_revenue_share_fake?: number | null
          affiliate_cpa?: number
          affiliate_baseline?: number
          is_demo_agent?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
      }
      wallets: {
        Row: {
          id: string
          user_id: string
          currency: string
          balance: number
          active: boolean
          vip_level: number | null
          vip_points: number | null
          created_at: string | null
          updated_at: string | null
          symbol: string | null
          balance_bonus_rollover: number | null
          balance_deposit_rollover: number | null
          balance_withdrawal: number | null
          balance_bonus: number | null
          balance_cryptocurrency: number | null
          balance_demo: number | null
          refer_rewards: number | null
          hide_balance: boolean | null
          total_bet: number | null
          total_won: number | null
          total_lose: number | null
          last_won: number | null
          last_lose: number | null
          deposit_limit_daily: number | null
          deposit_limit_weekly: number | null
          deposit_limit_monthly: number | null
          exclusion_period: string | null
          exclusion_until: string | null
          time_reminder_enabled: boolean | null
          reminder_interval_minutes: number | null
        }
        Insert: {
          id?: string
          user_id: string
          currency: string
          balance?: number
          active?: boolean
          vip_level?: number | null
          vip_points?: number | null
          created_at?: string | null
          updated_at?: string | null
          symbol?: string | null
          balance_bonus_rollover?: number | null
          balance_deposit_rollover?: number | null
          balance_withdrawal?: number | null
          balance_bonus?: number | null
          balance_cryptocurrency?: number | null
          balance_demo?: number | null
          refer_rewards?: number | null
          hide_balance?: boolean | null
          total_bet?: number | null
          total_won?: number | null
          total_lose?: number | null
          last_won?: number | null
          last_lose?: number | null
          deposit_limit_daily?: number | null
          deposit_limit_weekly?: number | null
          deposit_limit_monthly?: number | null
          exclusion_period?: string | null
          exclusion_until?: string | null
          time_reminder_enabled?: boolean | null
          reminder_interval_minutes?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          currency?: string
          balance?: number
          active?: boolean
          vip_level?: number | null
          vip_points?: number | null
          created_at?: string | null
          updated_at?: string | null
          symbol?: string | null
          balance_bonus_rollover?: number | null
          balance_deposit_rollover?: number | null
          balance_withdrawal?: number | null
          balance_bonus?: number | null
          balance_cryptocurrency?: number | null
          balance_demo?: number | null
          refer_rewards?: number | null
          hide_balance?: boolean | null
          total_bet?: number | null
          total_won?: number | null
          total_lose?: number | null
          last_won?: number | null
          last_lose?: number | null
          deposit_limit_daily?: number | null
          deposit_limit_weekly?: number | null
          deposit_limit_monthly?: number | null
          exclusion_period?: string | null
          exclusion_until?: string | null
          time_reminder_enabled?: boolean | null
          reminder_interval_minutes?: number | null
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
