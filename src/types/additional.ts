import { Game } from "."; 

// GameLaunchOptions is already defined in src/types/index.d.ts
// export interface GameLaunchOptions {
//   providerId?: string;
//   mode: 'real' | 'demo'; 
//   playerId?: string;
//   language?: string;
//   currency?: string;
//   platform?: "web" | "mobile";
//   returnUrl?: string;
// }

// WalletTransaction is already defined in src/types/index.d.ts
// export interface WalletTransaction {
//   id: string;
//   userId: string;
//   type: 'deposit' | 'withdraw' | 'bet' | 'win' | string; 
//   amount: number;
//   currency: string;
//   status: 'completed' | 'pending' | 'failed' | string;
//   date: string; 
//   gameId?: string;
//   gameName?: string;
//   provider?: string;
//   description?: string;
//   balance_before?: number;
//   balance_after?: number;
//   round_id?: string;
//   session_id?: string;
// }

// GameCategory is already defined in src/types/index.d.ts
// export interface GameCategory {
//   id: string;
//   name: string;
//   slug: string;
//   icon?: string;
//   image?: string;
//   show_home?: boolean;
//   status: 'active' | 'inactive';
//   created_at?: string;
//   updated_at?: string;
//   games?: Game[];
// }

// GameProvider is already defined in src/types/index.d.ts
// export interface GameProvider {
//     id: string;
//     name: string;
//     logo?: string;
//     description?: string;
//     status: 'active' | 'inactive';
//     api_endpoint?: string;
//     api_key?: string; 
//     api_secret?: string; 
//     created_at?: string;
//     updated_at?: string;
// }

// Extend existing Game type if isLive is a valid property - this is okay to keep
// as module augmentation.
declare module "." {
  interface Game {
    isLive?: boolean;
  }
}
