import { Database } from '@/integrations/supabase/types';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      kyc_requests: {
        Row: {
          admin_id: string | null
          created_at: string
          document_back_url: string | null
          document_front_url: string | null
          document_type: Database["public"]["Enums"]["kyc_document_type_enum"] | null
          id: string
          rejection_reason: string | null
          status: Database["public"]["Enums"]["kyc_status_enum"] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_id: string | null
          created_at?: string
          document_back_url: string | null
          document_front_url: string | null
          document_type?: Database["public"]["Enums"]["kyc_document_type_enum"] | null
          id?: string
          rejection_reason: string | null
          status?: Database["public"]["Enums"]["kyc_status_enum"] | null
          updated_at?: string
          user_id: string | null
        }
        Update: {
          admin_id: string | null
          created_at?: string
          document_back_url: string | null
          document_front_url: string | null
          document_type?: Database["public"]["Enums"]["kyc_document_type_enum"] | null
          id?: string
          rejection_reason: string | null
          status?: Database["public"]["Enums"]["kyc_status_enum"] | null
          updated_at?: string
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kyc_requests_admin_id_fkey"
            columns: ["admin_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kyc_requests_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          billing_address: Json | null
          created_at: string | null
          email: string | null
          email_confirmed_at: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          is_banned: boolean | null
          is_email_confirmed: boolean | null
          is_phone_confirmed: boolean | null
          is_verified: boolean | null
          last_ip: string | null
          last_sign_in_at: string | null
          phone_number: string | null
          phone_number_confirmed_at: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          shipping_address: Json | null
          status: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url: string | null
          billing_address: Json | null
          created_at?: string | null
          email: string | null
          email_confirmed_at: string | null
          full_name: string | null
          id: string
          is_active?: boolean | null
          is_banned?: boolean | null
          is_email_confirmed?: boolean | null
          is_phone_confirmed?: boolean | null
          is_verified?: boolean | null
          last_ip: string | null
          last_sign_in_at: string | null
          phone_number: string | null
          phone_number_confirmed_at: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          shipping_address: Json | null
          status?: string | null
          updated_at?: string | null
          username: string | null
        }
        Update: {
          avatar_url: string | null
          billing_address: Json | null
          created_at?: string | null
          email: string | null
          email_confirmed_at: string | null
          full_name: string | null
          id?: string
          is_active?: boolean | null
          is_banned?: boolean | null
          is_email_confirmed?: boolean | null
          is_phone_confirmed?: boolean | null
          is_verified?: boolean | null
          last_ip: string | null
          last_sign_in_at: string | null
          phone_number: string | null
          phone_number_confirmed_at: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          shipping_address: Json | null
          status?: string | null
          updated_at?: string | null
          username: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      kyc_document_type_enum:
        | "passport"
        | "driver_license"
        | "national_id"
        | "other"
      kyc_status_enum:
        | "not_started"
        | "pending"
        | "approved"
        | "rejected"
        | "resubmit_required"
      user_role: "user" | "admin" | "support" | "manager" | "vip_player" | "affiliate"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  T extends keyof Database["public"]["Tables"]
> = Database["public"]["Tables"][T]["Row"];
export type Enums<
  T extends keyof Database["public"]["Enums"]
> = Database["public"]["Enums"][T];

export type UserRole = Enums<"user_role">;
export type KycStatus = Enums<"kyc_status_enum">;

export interface DateRange {
  from?: Date;
  to?: Date;
}

export type User = {
  id: string;
  email: string;
  username?: string;
  role?: UserRole;
  status?: 'active' | 'inactive' | 'pending_verification' | 'banned' | 'restricted';
  created_at: string;
  updated_at?: string;
  last_sign_in_at?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  date_of_birth?: string;
  is_active?: boolean;
  is_banned?: boolean;
  is_verified?: boolean;
  kyc_status?: KycStatus;
  balance?: number;
  currency?: string;
  user_metadata?: {
    username?: string;
    full_name?: string;
    avatar_url?: string;
    kyc_status?: string;
    currency?: string;
    language?: string;
    vip_level?: number;
  };
};

export type Transaction = {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus' | 'adjustment' | 'refund';
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'approved' | 'rejected';
  description?: string;
  provider?: string;
  provider_transaction_id?: string;
  created_at: string;
  updated_at: string;
};

export interface KycRequest {
  id: string;
  user_id: string;
  document_type: string;
  document_front_url?: string | null;
  document_back_url?: string | null;
  status: KycStatus;
  created_at: string;
  updated_at: string;
}

// Export VIP types
export * from './vip';
