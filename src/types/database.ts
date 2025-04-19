
/**
 * Database types and interfaces
 */

// Game database model based on provided SQL schema
export interface GameDBModel {
  id: bigint;
  provider_id: number;
  game_server_url: string | null;
  game_id: string;
  game_name: string;
  game_code: string;
  game_type: string | null;
  description: string | null;
  cover: string | null;
  status: string;
  technology: string | null;
  has_lobby: boolean;
  is_mobile: boolean;
  has_freespins: boolean;
  has_tables: boolean;
  only_demo: boolean;
  rtp: number;
  distribution: string;
  views: number;
  is_featured: boolean;
  show_home: boolean;
  created_at: string | null;
  updated_at: string | null;
}

// Provider database model
export interface ProviderDBModel {
  id: number;
  name: string;
  code: string;
  description: string | null;
  status: 'active' | 'inactive' | 'maintenance';
  api_url: string | null;
  api_key: string | null;
  api_secret: string | null;
  callback_url: string | null;
  supports_seamless: boolean;
  created_at: string | null;
  updated_at: string | null;
}

// Transaction database model
export interface TransactionDBModel {
  id: bigint;
  player_id: string;
  transaction_id: string;
  round_id: string;
  game_id: string;
  provider_id: number;
  type: 'bet' | 'win' | 'refund' | 'rollback' | 'bonus';
  amount: number;
  currency: string;
  before_balance: number;
  after_balance: number;
  status: number; // 0=success, others are error codes
  created_at: string;
  updated_at: string | null;
}

// Player wallet model
export interface PlayerWalletDBModel {
  id: bigint;
  player_id: string;
  currency: string;
  balance: number;
  bonus_balance: number;
  is_locked: boolean;
  last_transaction_id: string | null;
  created_at: string;
  updated_at: string | null;
}

// Supported connections enum
export enum DBConnectionType {
  MySQL = 'mysql',
  PostgreSQL = 'postgres',
  SQLite = 'sqlite',
  Mock = 'mock'
}
