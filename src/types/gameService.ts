export interface GameData {
  id?: number;
  provider_id: string;
  game_id: string;
  game_name: string;
  game_code?: string;
  type?: string;
  theme?: string;
  is_mobile?: boolean;
  is_desktop?: boolean;
  thumbnail?: string;
  background?: string;
  is_featured?: boolean;
  show_home?: boolean;
  popularity?: number;
  [key: string]: any;
}

export interface GameFilterOptions {
  provider_id?: string;
  type?: string;
  theme?: string;
  is_featured?: boolean;
  show_home?: boolean;
  limit?: number;
  search?: string;
}

export interface GameQueryOptions {
  orderBy?: string;
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface GameImportResult {
  success: boolean;
  message: string;
  imported?: number;
  errors?: number;
}

export interface GameExportResult {
  success: boolean;
  message: string;
  count?: number;
}

export interface DatabaseQueryResult {
  success: boolean;
  data?: any[];
  error?: string;
}

// Add compatibility interface to bridge Game and GameData
export interface GameCompatibility {
  id?: number | string;
  provider_id: string | number;
  game_id: string;
  game_name: string;
  game_code?: string;
  type?: string;
  game_type?: string; // Compatibility with Game type
  theme?: string;
  is_mobile?: boolean;
  is_desktop?: boolean;
  thumbnail?: string;
  background?: string;
  cover?: string; // Compatibility with Game type
  status?: string;
  description?: string;
  is_featured?: boolean;
  show_home?: boolean;
  popularity?: number;
  // Additional fields for Game compatibility
  has_lobby?: boolean;
  has_freespins?: boolean;
  has_tables?: boolean;
  technology?: string;
  rtp?: number;
  distribution?: string;
  only_demo?: boolean;
  views?: number;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

// Use the extended type for our game operations
export type GameDataExtended = GameCompatibility;
