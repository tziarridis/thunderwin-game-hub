
import { toast } from "@/components/ui/use-toast";

// API base URL from the documentation
const BASE_URL = "https://api.example.com/v1"; // Replace with the actual base URL from the documentation

// Types for the API
export interface GameProvider {
  id: string;
  name: string;
  code: string;
  status: "active" | "inactive";
  games_count: number;
  icon?: string;
}

export interface Game {
  id: string;
  provider_id: string;
  name: string;
  thumbnail: string;
  category: string;
  status: "active" | "inactive";
  is_featured: boolean;
  is_new: boolean;
  popularity: number;
}

export interface LaunchOptions {
  provider_id: string;
  game_id: string;
  player_id: string;
  mode: "demo" | "real";
  currency?: string;
  language?: string;
  return_url?: string;
}

// Game Aggregator Service
export const gameAggregatorService = {
  // Get all game providers
  getProviders: async (): Promise<GameProvider[]> => {
    try {
      const response = await fetch(`${BASE_URL}/providers`);
      if (!response.ok) {
        throw new Error(`Failed to fetch providers: ${response.statusText}`);
      }
      const data = await response.json();
      return data.providers;
    } catch (error) {
      console.error("Error fetching providers:", error);
      toast.error("Failed to fetch game providers");
      return [];
    }
  },

  // Get games by provider
  getGamesByProvider: async (providerId: string): Promise<Game[]> => {
    try {
      const response = await fetch(`${BASE_URL}/providers/${providerId}/games`);
      if (!response.ok) {
        throw new Error(`Failed to fetch games: ${response.statusText}`);
      }
      const data = await response.json();
      return data.games;
    } catch (error) {
      console.error(`Error fetching games for provider ${providerId}:`, error);
      toast.error("Failed to fetch games");
      return [];
    }
  },

  // Get all games
  getAllGames: async (limit: number = 100, offset: number = 0): Promise<Game[]> => {
    try {
      const response = await fetch(`${BASE_URL}/games?limit=${limit}&offset=${offset}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch games: ${response.statusText}`);
      }
      const data = await response.json();
      return data.games;
    } catch (error) {
      console.error("Error fetching all games:", error);
      toast.error("Failed to fetch games");
      return [];
    }
  },

  // Launch a game
  launchGame: async (options: LaunchOptions): Promise<string> => {
    try {
      const response = await fetch(`${BASE_URL}/games/launch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error(`Failed to launch game: ${response.statusText}`);
      }

      const data = await response.json();
      return data.game_url;
    } catch (error) {
      console.error("Error launching game:", error);
      toast.error("Failed to launch game");
      throw error;
    }
  },

  // Get player balance
  getPlayerBalance: async (playerId: string, currency: string = "USD"): Promise<number> => {
    try {
      const response = await fetch(`${BASE_URL}/players/${playerId}/balance?currency=${currency}`);
      if (!response.ok) {
        throw new Error(`Failed to get balance: ${response.statusText}`);
      }
      const data = await response.json();
      return data.balance;
    } catch (error) {
      console.error("Error fetching player balance:", error);
      toast.error("Failed to get balance");
      return 0;
    }
  },

  // Update player balance (deposit or withdraw)
  updatePlayerBalance: async (
    playerId: string,
    amount: number,
    transactionType: "deposit" | "withdraw",
    currency: string = "USD"
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${BASE_URL}/players/${playerId}/balance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          transaction_type: transactionType,
          currency,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update balance: ${response.statusText}`);
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error("Error updating player balance:", error);
      toast.error("Failed to update balance");
      return false;
    }
  },

  // Process game transaction (bet, win, rollback)
  processTransaction: async (
    playerId: string,
    gameId: string,
    providerId: string,
    amount: number,
    transactionType: "bet" | "win" | "rollback",
    currency: string = "USD",
    roundId?: string,
    transactionId?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${BASE_URL}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player_id: playerId,
          game_id: gameId,
          provider_id: providerId,
          amount,
          transaction_type: transactionType,
          currency,
          round_id: roundId,
          transaction_id: transactionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to process transaction: ${response.statusText}`);
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error("Error processing transaction:", error);
      toast.error("Failed to process transaction");
      return false;
    }
  },
};
