
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface GameOption {
  code: string;
  name: string;
  image?: string;
  provider?: string;
}

export interface GameLaunchOptions {
  playerId: string;
  gameCode: string;
  language?: string;
  mode?: 'real' | 'demo';
  returnUrl?: string;
  platform?: 'web' | 'mobile';
  currency?: string;
}

export interface WalletResponse {
  success: boolean;
  balance: number;
  currency: string;
  message?: string;
}

export interface TransactionResponse {
  success: boolean;
  message: string;
  transaction_id?: string;
}

const gitSlotParkService = {
  /**
   * Get available games from GitSlotPark
   * @returns Array of available games
   */
  getAvailableGames: (): GameOption[] => {
    // In a real implementation, this might fetch from an API
    // For now, we'll return a set of mock games
    return [
      { code: "book-of-rise", name: "Book of Rise", image: "/games/book-of-rise.webp", provider: "GitSlotPark" },
      { code: "fortune-tiger", name: "Fortune Tiger", image: "/games/fortune-tiger.webp", provider: "GitSlotPark" },
      { code: "lucky-fortune", name: "Lucky Fortune", image: "/games/lucky-fortune.webp", provider: "GitSlotPark" },
      { code: "zeus-fortune", name: "Zeus Fortune", image: "/games/zeus-fortune.webp", provider: "GitSlotPark" },
      { code: "mayan-temple", name: "Mayan Temple", image: "/games/mayan-temple.webp", provider: "GitSlotPark" },
      { code: "golden-lotus", name: "Golden Lotus", image: "/games/golden-lotus.webp", provider: "GitSlotPark" },
    ];
  },
  
  /**
   * Launch a game from GitSlotPark
   * @param options Game launch options
   * @returns URL to launch the game
   */
  launchGame: async (options: GameLaunchOptions): Promise<string> => {
    try {
      console.log(`Launching GitSlotPark game: ${options.gameCode} for player: ${options.playerId}`);
      
      // Record the game launch in the transactions table
      await supabase.from('transactions').insert({
        player_id: options.playerId,
        type: 'game_launch',
        amount: 0,
        currency: options.currency || 'EUR',
        provider: 'GitSlotPark',
        game_id: options.gameCode,
        status: 'completed'
      });
      
      // Generate a mock game URL (in production, this would call the actual API)
      const gameUrl = `https://games.gitslotpark.com/launch?` + new URLSearchParams({
        gameId: options.gameCode,
        playerId: options.playerId,
        mode: options.mode || 'demo',
        lang: options.language || 'en',
        returnUrl: options.returnUrl || window.location.href,
        platform: options.platform || 'web',
        currency: options.currency || 'EUR'
      }).toString();
      
      console.log(`Generated game URL: ${gameUrl}`);
      return gameUrl;
    } catch (error) {
      console.error("Error launching GitSlotPark game:", error);
      throw new Error(`Failed to launch game: ${(error as Error).message}`);
    }
  },
  
  /**
   * Get balance for a player
   * @param playerId Player ID
   * @returns Balance information
   */
  getBalance: async (playerId: string): Promise<WalletResponse> => {
    try {
      // Try to get the wallet from the database
      const { data, error } = await supabase
        .from('wallets')
        .select('balance, currency')
        .eq('user_id', playerId)
        .single();
      
      if (error) {
        console.error("Error getting wallet data:", error);
        
        // If no wallet exists, create one with a default balance
        if (error.code === 'PGRST116') {
          const newWallet = {
            user_id: playerId,
            balance: 1000.00, // Default starting balance
            currency: 'EUR',
            symbol: '€',
            active: true
          };
          
          const { data: insertData, error: insertError } = await supabase
            .from('wallets')
            .insert(newWallet)
            .select('balance, currency')
            .single();
          
          if (insertError) {
            throw insertError;
          }
          
          return {
            success: true,
            balance: insertData.balance,
            currency: insertData.currency,
            message: "New wallet created successfully"
          };
        }
        
        throw error;
      }
      
      return {
        success: true,
        balance: data.balance,
        currency: data.currency
      };
    } catch (error) {
      console.error("Error getting balance:", error);
      
      // Return a mock balance for development/testing
      return {
        success: false,
        balance: 1000.00,
        currency: 'EUR',
        message: `Error getting balance: ${(error as Error).message}`
      };
    }
  },
  
  /**
   * Credit (deposit) funds to a player wallet
   * @param playerId Player ID
   * @param amount Amount to credit
   * @returns Transaction result
   */
  credit: async (playerId: string, amount: number): Promise<TransactionResponse> => {
    try {
      // Get current wallet data
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('balance, currency')
        .eq('user_id', playerId)
        .single();
      
      if (walletError) {
        throw walletError;
      }
      
      // Calculate new balance
      const newBalance = wallet.balance + amount;
      
      // Update wallet with new balance
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('user_id', playerId);
      
      if (updateError) {
        throw updateError;
      }
      
      // Record transaction
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .insert({
          player_id: playerId,
          type: 'deposit',
          amount: amount,
          currency: wallet.currency,
          provider: 'GitSlotPark',
          balance_before: wallet.balance,
          balance_after: newBalance,
          status: 'completed'
        })
        .select('id')
        .single();
      
      if (txError) {
        throw txError;
      }
      
      return {
        success: true,
        message: `Successfully credited ${amount} to player wallet`,
        transaction_id: txData.id
      };
    } catch (error) {
      console.error("Error crediting funds:", error);
      return {
        success: false,
        message: `Failed to credit funds: ${(error as Error).message}`
      };
    }
  },
  
  /**
   * Debit (withdraw) funds from a player wallet
   * @param playerId Player ID
   * @param amount Amount to debit
   * @returns Transaction result
   */
  debit: async (playerId: string, amount: number): Promise<TransactionResponse> => {
    try {
      // Get current wallet data
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('balance, currency')
        .eq('user_id', playerId)
        .single();
      
      if (walletError) {
        throw walletError;
      }
      
      // Check if wallet has sufficient funds
      if (wallet.balance < amount) {
        return {
          success: false,
          message: "Insufficient funds"
        };
      }
      
      // Calculate new balance
      const newBalance = wallet.balance - amount;
      
      // Update wallet with new balance
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('user_id', playerId);
      
      if (updateError) {
        throw updateError;
      }
      
      // Record transaction
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .insert({
          player_id: playerId,
          type: 'withdraw',
          amount: amount,
          currency: wallet.currency,
          provider: 'GitSlotPark',
          balance_before: wallet.balance,
          balance_after: newBalance,
          status: 'completed'
        })
        .select('id')
        .single();
      
      if (txError) {
        throw txError;
      }
      
      return {
        success: true,
        message: `Successfully debited ${amount} from player wallet`,
        transaction_id: txData.id
      };
    } catch (error) {
      console.error("Error debiting funds:", error);
      return {
        success: false,
        message: `Failed to debit funds: ${(error as Error).message}`
      };
    }
  },
  
  /**
   * Get player transactions
   * @param playerId Player ID
   * @returns Array of transactions
   */
  getTransactions: async (playerId: string): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('player_id', playerId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error("Error getting transactions:", error);
      
      // Return empty array on error
      return [];
    }
  },
  
  /**
   * Process callback from game provider
   * @param data Callback data
   * @returns Response to send back to provider
   */
  processCallback: async (data: any): Promise<any> => {
    // In a real implementation, this would process game events
    // For now, we'll log the callback and return a success response
    console.log("Processing GitSlotPark callback:", data);
    
    try {
      // Record the callback in the database
      await supabase.from('transactions').insert({
        player_id: data.playerId || 'unknown',
        type: data.action || 'callback',
        amount: data.amount || 0,
        currency: data.currency || 'EUR',
        provider: 'GitSlotPark',
        game_id: data.gameId,
        status: 'completed'
      });
      
      return {
        success: true,
        balance: 1000,
        errorCode: 0
      };
    } catch (error) {
      console.error("Error processing callback:", error);
      return {
        success: false,
        balance: 0,
        errorCode: 1,
        message: `Error: ${(error as Error).message}`
      };
    }
  }
};

export { gitSlotParkService };
export default gitSlotParkService;
