
import axios from 'axios';
import { toast } from 'sonner';
import { getProviderConfig } from '@/config/gameProviders';
import { v4 as uuidv4 } from 'uuid';
import { Transaction } from '@/services/transactionService';
import { supabase } from "@/integrations/supabase/client";

// Get GitSlotPark EUR configuration
const gspConfig = getProviderConfig('gspeur');

// GSP API Constants based on the documentation
const GSP_API_BASE = `https://${gspConfig?.credentials.apiEndpoint || 'apiv2.gitslotpark.com'}`;
const GSP_AGENT_ID = gspConfig?.credentials.agentId || 'Partner01';
const GSP_API_TOKEN = gspConfig?.credentials.apiToken || 'e5h2c84215935ebfc8371df59e679c773ea081f8edd273358c83ff9f16e024ce';
const GSP_SECRET_KEY = gspConfig?.credentials.secretKey || '1234567890';
const GSP_CURRENCY = gspConfig?.currency || 'EUR';

// Store processed transactions to prevent duplicates
const processedTransactions = new Map();

// Interface for game launch options
export interface GSPGameLaunchOptions {
  playerId: string;
  gameCode: string;
  language?: string;
  mode?: 'real' | 'demo';
  returnUrl?: string;
  currency?: string;
  platform?: 'web' | 'mobile'; // Added platform property to match with documentation
}

// Interface for wallet callback request based on documentation
export interface GSPWalletCallback {
  partner_id: string;
  player_id: string;
  amount: number;
  currency: string;
  transaction_type: 'bet' | 'win';
  transaction_id: string;
  game_id: string;
  round_id: string;
  timestamp: number;
}

// Interface for balance request
export interface GSPBalanceRequest {
  partner_id: string;
  player_id: string;
  currency: string;
}

// Service for GitSlotPark integration
export const gitSlotParkService = {
  /**
   * Launch a GitSlotPark game
   * @param options Game launch options
   * @returns Promise with game URL
   */
  launchGame: async (options: GSPGameLaunchOptions): Promise<string> => {
    const { 
      playerId, 
      gameCode, 
      language = 'en', 
      mode = 'demo',
      returnUrl = window.location.origin + '/casino',
      platform = 'web' // Default to web if not specified
    } = options;

    try {
      // Prepare parameters according to documentation
      const params = {
        partner_id: GSP_AGENT_ID,
        player_id: playerId,
        game_id: gameCode,
        mode: mode,
        language: language,
        currency: GSP_CURRENCY,
        return_url: returnUrl,
        platform: platform, // Include platform in params
        token: GSP_API_TOKEN,
      };
      
      // Log launch attempt to database
      await supabase.from('transactions').insert({
        player_id: playerId,
        provider: 'GitSlotPark',
        type: 'session_start',
        amount: 0,
        currency: GSP_CURRENCY,
        game_id: gameCode,
        status: 'pending'
      });
      
      console.log('Launching GSP game with params:', params);
      
      // Build a mock URL structure based on documentation
      const gameUrl = `${GSP_API_BASE}/games/launch?${new URLSearchParams({
        partner_id: params.partner_id,
        player_id: params.player_id,
        game_id: params.game_id,
        mode: params.mode,
        language: params.language,
        currency: params.currency,
        platform: params.platform, // Include platform in URL
        return_url: encodeURIComponent(params.return_url),
        token: params.token
      }).toString()}`;
      
      return gameUrl;
    } catch (error: any) {
      console.error('Error launching GSP game:', error);
      throw new Error(`Failed to launch game: ${error.message || 'Unknown error'}`);
    }
  },
  
  /**
   * Get player balance from GitSlotPark
   * @param playerId The player ID
   * @returns Promise with balance data
   */
  getBalance: async (playerId: string): Promise<{ balance: number, currency: string }> => {
    try {
      // Get balance from Supabase database
      const { data, error } = await supabase
        .from('wallets')
        .select('balance, currency')
        .eq('user_id', playerId)
        .single();
      
      if (error) {
        console.error('Error getting wallet data:', error);
        // Fallback to default
        return {
          balance: 1000.00,
          currency: GSP_CURRENCY
        };
      }
      
      return {
        balance: data.balance,
        currency: data.currency
      };
    } catch (error: any) {
      console.error('Error getting player balance:', error);
      throw new Error(`Failed to get balance: ${error.message || 'Unknown error'}`);
    }
  },
  
  /**
   * Process callback from GitSlotPark based on documentation
   * @param data Callback data
   * @returns Promise with response
   */
  processCallback: async (data: GSPWalletCallback): Promise<any> => {
    try {
      console.log('Processing GitSlotPark callback:', data);
      
      // Validate the partner ID
      if (data.partner_id !== GSP_AGENT_ID) {
        return {
          status: "error",
          error_code: "INVALID_PARTNER",
          message: "Invalid partner ID"
        };
      }
      
      // Check for duplicate transaction
      if (processedTransactions.has(data.transaction_id)) {
        console.log('Duplicate transaction detected:', data.transaction_id);
        // Return the same response as before for idempotency
        return processedTransactions.get(data.transaction_id) || {
          status: "success",
          balance: 1000.00,
          currency: GSP_CURRENCY
        };
      }
      
      // Get current balance from database
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('balance, currency')
        .eq('user_id', data.player_id)
        .single();
      
      if (walletError) {
        console.error('Error getting wallet data:', walletError);
        return {
          status: "error",
          error_code: "WALLET_NOT_FOUND",
          message: "Player wallet not found"
        };
      }
      
      let currentBalance = walletData.balance;
      const currency = walletData.currency;
      
      // Process based on transaction type according to documentation
      let newBalance = currentBalance;
      
      if (data.transaction_type === 'bet') {
        // Debit the amount (bet)
        if (data.amount > newBalance) {
          return {
            status: "error",
            error_code: "INSUFFICIENT_FUNDS",
            message: "Insufficient funds for this transaction"
          };
        }
        
        newBalance -= data.amount;
        
        // Update wallet balance in database
        const { error: updateError } = await supabase
          .from('wallets')
          .update({ balance: newBalance })
          .eq('user_id', data.player_id);
        
        if (updateError) {
          console.error('Error updating wallet balance:', updateError);
          return {
            status: "error",
            error_code: "DATABASE_ERROR",
            message: "Failed to update player balance"
          };
        }
        
        // Record transaction in database
        await supabase.from('transactions').insert({
          player_id: data.player_id,
          provider: 'GitSlotPark',
          type: 'bet',
          amount: data.amount,
          currency: currency,
          game_id: data.game_id,
          round_id: data.round_id,
          balance_before: currentBalance,
          balance_after: newBalance,
          status: 'completed'
        });
      } else if (data.transaction_type === 'win') {
        // Credit the amount (win)
        newBalance += data.amount;
        
        // Update wallet balance in database
        const { error: updateError } = await supabase
          .from('wallets')
          .update({ balance: newBalance })
          .eq('user_id', data.player_id);
        
        if (updateError) {
          console.error('Error updating wallet balance:', updateError);
          return {
            status: "error",
            error_code: "DATABASE_ERROR",
            message: "Failed to update player balance"
          };
        }
        
        // Record transaction in database
        await supabase.from('transactions').insert({
          player_id: data.player_id,
          provider: 'GitSlotPark',
          type: 'win',
          amount: data.amount,
          currency: currency,
          game_id: data.game_id,
          round_id: data.round_id,
          balance_before: currentBalance,
          balance_after: newBalance,
          status: 'completed'
        });
      }
      
      // Store the response for idempotency
      const response = {
        status: "success",
        balance: newBalance,
        currency: currency
      };
      
      processedTransactions.set(data.transaction_id, response);
      return response;
    } catch (error: any) {
      console.error('Error processing GitSlotPark callback:', error);
      return {
        status: "error",
        error_code: "INTERNAL_ERROR",
        message: error.message || "Unknown error"
      };
    }
  },
  
  /**
   * Get available GitSlotPark games
   * @returns Array of game codes and names
   */
  getAvailableGames: async () => {
    try {
      // Get games from Supabase database
      const { data, error } = await supabase
        .from('providers')
        .select(`
          id,
          name,
          status,
          games:game_categories(id, name, slug, status)
        `)
        .eq('name', 'GitSlotPark')
        .single();
      
      if (error) {
        console.error('Error getting provider data:', error);
        // Fallback to default games
        return [
          { code: 'gsp_slots_1', name: 'GSP Mega Fortune' },
          { code: 'gsp_slots_2', name: 'GSP Treasure Hunt' },
          { code: 'gsp_slots_3', name: 'GSP Lucky Sevens' },
          { code: 'gsp_slots_4', name: 'GSP Diamond Blast' },
          { code: 'gsp_slots_5', name: 'GSP Gold Rush' },
          { code: 'gsp_blackjack', name: 'GSP Blackjack' },
          { code: 'gsp_roulette', name: 'GSP Roulette' },
          { code: 'gsp_baccarat', name: 'GSP Baccarat' }
        ];
      }
      
      // Map games to expected format
      return data.games.map((game: any) => ({
        code: `gsp_${game.slug}`,
        name: game.name
      }));
    } catch (error: any) {
      console.error('Error getting available games:', error);
      // Fallback to default games
      return [
        { code: 'gsp_slots_1', name: 'GSP Mega Fortune' },
        { code: 'gsp_slots_2', name: 'GSP Treasure Hunt' },
        { code: 'gsp_slots_3', name: 'GSP Lucky Sevens' },
        { code: 'gsp_slots_4', name: 'GSP Diamond Blast' },
        { code: 'gsp_slots_5', name: 'GSP Gold Rush' },
        { code: 'gsp_blackjack', name: 'GSP Blackjack' },
        { code: 'gsp_roulette', name: 'GSP Roulette' },
        { code: 'gsp_baccarat', name: 'GSP Baccarat' }
      ];
    }
  },

  /**
   * Get player transactions from GitSlotPark
   * @param playerId The player ID
   * @returns Promise with transaction data
   */
  getTransactions: async (playerId: string): Promise<Transaction[]> => {
    try {
      // Get transactions from Supabase database
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('player_id', playerId)
        .eq('provider', 'GitSlotPark')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) {
        console.error('Error getting transactions:', error);
        throw error;
      }
      
      // Map transactions to expected format
      return data.map((tx: any) => ({
        id: tx.id,
        player_id: tx.player_id,
        session_id: tx.session_id,
        game_id: tx.game_id,
        round_id: tx.round_id,
        provider: tx.provider,
        type: tx.type,
        amount: tx.amount,
        currency: tx.currency,
        status: tx.status,
        balance_before: tx.balance_before,
        balance_after: tx.balance_after,
        created_at: tx.created_at,
        updated_at: tx.updated_at,
        
        // UI-friendly properties
        transactionId: tx.id,
        userId: tx.player_id,
        gameId: tx.game_id,
        roundId: tx.round_id,
        timestamp: tx.created_at,
        date: tx.created_at,
        method: tx.provider
      }));
    } catch (error: any) {
      console.error('Error getting player transactions:', error);
      throw new Error(`Failed to get transactions: ${error.message || 'Unknown error'}`);
    }
  },

  /**
   * Credit funds to player wallet
   * @param playerId The player ID
   * @param amount The amount to credit
   * @returns Promise with result
   */
  credit: async (playerId: string, amount: number): Promise<{success: boolean, message?: string, balance?: number}> => {
    try {
      if (amount <= 0) {
        return {
          success: false,
          message: "Amount must be greater than zero"
        };
      }
      
      // Get current balance
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('balance, currency')
        .eq('user_id', playerId)
        .single();
      
      if (walletError) {
        console.error('Error getting wallet data:', walletError);
        return {
          success: false,
          message: "Player wallet not found"
        };
      }
      
      const currentBalance = walletData.balance;
      const newBalance = currentBalance + amount;
      
      // Update wallet balance
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('user_id', playerId);
      
      if (updateError) {
        console.error('Error updating wallet balance:', updateError);
        return {
          success: false,
          message: "Failed to update player balance"
        };
      }
      
      // Record transaction
      await supabase.from('transactions').insert({
        player_id: playerId,
        provider: 'GitSlotPark',
        type: 'deposit',
        amount: amount,
        currency: walletData.currency,
        balance_before: currentBalance,
        balance_after: newBalance,
        status: 'completed'
      });
      
      return {
        success: true,
        message: "Deposit successful",
        balance: newBalance
      };
    } catch (error: any) {
      console.error('Error crediting funds:', error);
      return {
        success: false,
        message: error.message || "Unknown error occurred"
      };
    }
  },

  /**
   * Debit funds from player wallet
   * @param playerId The player ID
   * @param amount The amount to debit
   * @returns Promise with result
   */
  debit: async (playerId: string, amount: number): Promise<{success: boolean, message?: string, balance?: number}> => {
    try {
      if (amount <= 0) {
        return {
          success: false,
          message: "Amount must be greater than zero"
        };
      }
      
      // Get current balance
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('balance, currency')
        .eq('user_id', playerId)
        .single();
      
      if (walletError) {
        console.error('Error getting wallet data:', walletError);
        return {
          success: false,
          message: "Player wallet not found"
        };
      }
      
      const currentBalance = walletData.balance;
      
      // Check if player has sufficient balance
      if (amount > currentBalance) {
        return {
          success: false,
          message: "Insufficient funds for this transaction"
        };
      }
      
      const newBalance = currentBalance - amount;
      
      // Update wallet balance
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('user_id', playerId);
      
      if (updateError) {
        console.error('Error updating wallet balance:', updateError);
        return {
          success: false,
          message: "Failed to update player balance"
        };
      }
      
      // Record transaction
      await supabase.from('transactions').insert({
        player_id: playerId,
        provider: 'GitSlotPark',
        type: 'withdraw',
        amount: amount,
        currency: walletData.currency,
        balance_before: currentBalance,
        balance_after: newBalance,
        status: 'completed'
      });
      
      return {
        success: true,
        message: "Withdrawal successful",
        balance: newBalance
      };
    } catch (error: any) {
      console.error('Error debiting funds:', error);
      return {
        success: false,
        message: error.message || "Unknown error occurred"
      };
    }
  }
};

export default gitSlotParkService;
