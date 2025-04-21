
export interface GameInfo {
  game_id: string;
  game_name: string;
  game_code?: string;
  type?: string;
  theme?: string;
  is_mobile?: boolean;
  is_desktop?: boolean;
  thumbnail?: string;
  background?: string;
}

export interface ProviderGameResponse {
  success: boolean;
  games?: GameInfo[];
  errorMessage?: string;
}

export interface SyncResults {
  success: boolean;
  results: Record<string, {
    success: boolean;
    gamesAdded: number;
    gamesUpdated: number;
    error?: string;
  }>;
  timestamp: string;
}

export interface SyncStatus {
  lastSync: string;
  nextScheduledSync: string;
  isRunning: boolean;
  status: string;
}

export interface GameTransactionData {
  player_id: string;
  game_id: string;
  provider: string;
  type: string;
  amount: number;
  currency: string;
}
