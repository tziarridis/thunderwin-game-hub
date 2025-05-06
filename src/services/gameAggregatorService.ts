
import axios from 'axios';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { addTransaction } from '@/services/transactionService';
import { getProviderConfig } from '@/config/gameProviders';

// Interface for session creation request
interface SessionCreationRequest {
  agentId: string;
  token: string;
  currency: string;
  playerName: string;
  gameId: string;
  platform: 'web' | 'mobile';
  callbackUrl: string;
  returnUrl?: string;
}

// Interface for session creation response
interface SessionCreationResponse {
  success: boolean;
  gameUrl?: string;
  sessionId?: string;
  errorMessage?: string;
  errorCode?: string;
}

// Interface for game transaction
interface GameTransaction {
  player_id: string;
  game_id: string;
  provider: string;
  type: string;
  amount: number;
  currency: string;
  round_id?: string;
  session_id?: string;
}

/**
 * Game Aggregator Service for connecting with the game provider API
 */
export const gameAggregatorService = {
  /**
   * Create a gaming session and get a game launch URL
   */
  createSession: async (
    gameId: string,
    playerId: string,
    currency = 'EUR',
    platform: 'web' | 'mobile' = 'web'
  ): Promise<SessionCreationResponse> => {
    try {
      console.log(`Creating game session for player ${playerId}, game ${gameId}`);
      
      // Determine which provider to use based on the game ID
      const isInfinGame = gameId.startsWith('infin_');
      const isGSP = gameId.startsWith('gsp_');
      
      let providerConfig;
      let providerId;
      
      if (isInfinGame) {
        providerId = 'infineur';
        providerConfig = getProviderConfig(providerId);
      } else if (isGSP) {
        providerId = 'gspeur';
        providerConfig = getProviderConfig(providerId);
      } else {
        providerId = 'ppeur';
        providerConfig = getProviderConfig(providerId);
      }
      
      if (!providerConfig) {
        throw new Error(`Provider configuration not found for game ${gameId}`);
      }
      
      const requestBody: SessionCreationRequest = {
        agentId: providerConfig.credentials?.agentId || '',
        token: providerConfig.credentials?.token || providerConfig.credentials?.secretKey || '',
        currency: currency,
        playerName: playerId,
        gameId: isInfinGame ? gameId.replace('infin_', '') : 
                isGSP ? gameId.replace('gsp_', '') : gameId,
        platform: platform,
        callbackUrl: providerConfig.credentials?.callbackUrl || '',
        returnUrl: window.location.origin + '/casino'
      };
      
      // For demo purposes, we'll simulate the API call
      console.log('Creating game session with:', requestBody);

      // Instead of making actual API calls, we'll generate demo URLs for testing
      const demoBaseUrls: Record<string, string> = {
        ppeur: 'https://demogameserver.pragmaticplay.net/gs2c/openGame.do',
        infineur: 'https://demo-games.infingame.com/launcher',
        gspeur: 'https://demo.gitslotpark.com/game/launch'
      };
      
      // Build query parameters based on provider
      const params = new URLSearchParams();
      
      if (providerId === 'ppeur') {
        params.append('gameSymbol', requestBody.gameId);
        params.append('websiteUrl', requestBody.returnUrl || window.location.origin);
        params.append('lobbyUrl', requestBody.returnUrl || window.location.origin);
        params.append('platform', requestBody.platform);
        params.append('language', 'en');
        params.append('cur', requestBody.currency);
      } else if (providerId === 'infineur') {
        params.append('game', requestBody.gameId);
        params.append('lang', 'en');
        params.append('currency', requestBody.currency);
        params.append('userId', requestBody.playerName);
        params.append('mode', 'demo'); // For demo purposes
      } else if (providerId === 'gspeur') {
        params.append('game', requestBody.gameId);
        params.append('partner', requestBody.agentId);
        params.append('lang', 'en');
        params.append('currency', requestBody.currency);
        params.append('userId', requestBody.playerName);
      }
      
      const demoGameUrl = `${demoBaseUrls[providerId] || demoBaseUrls['ppeur']}?${params.toString()}`;
      
      // Log session creation in transactions - using the Supabase client directly
      await supabase.from('transactions').insert({
        player_id: playerId,
        game_id: gameId,
        provider: providerId,
        type: 'session',
        amount: 0, // Initial session has 0 amount
        currency: currency,
        status: 'completed',
      });
      
      return {
        success: true,
        gameUrl: demoGameUrl,
        sessionId: `demo-${Date.now()}`
      };
    } catch (error: any) {
      console.error('Error creating game session:', error);
      
      // Show error to user
      toast.error(`Failed to launch game: ${error.message || 'Unknown error'}`);
      
      return {
        success: false,
        errorMessage: error.message || 'Failed to create game session',
        errorCode: error.response?.data?.errorCode || 'UNKNOWN'
      };
    }
  },
  
  /**
   * Process a callback from the game provider
   * This would typically be called by a serverless function that receives the callback
   */
  processCallback: async (provider: string, callbackData: any) => {
    try {
      console.log(`Processing callback for provider ${provider}:`, callbackData);
      
      // Normalize provider identifier
      const providerCode = provider.toLowerCase();
      
      // Determine transaction type
      const transactionType = determineTransactionType(providerCode, callbackData);
      
      // Extract player ID from the callback data
      const playerId = extractPlayerId(providerCode, callbackData);
      
      if (!playerId) {
        return { 
          success: false, 
          errorCode: 'INVALID_PLAYER',
          errorMessage: 'Player ID is missing or invalid' 
        };
      }
      
      // Get current wallet balance
      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', playerId)
        .single();
      
      const currentBalance = wallet?.balance || 0;
      
      // Extract amount
      const amount = extractAmount(providerCode, callbackData);
      
      // Process different transaction types
      let newBalance = currentBalance;
      let transactionStatus = 'pending';
      
      if (transactionType === 'bet') {
        // Check if player has enough balance
        if (currentBalance < amount) {
          return { 
            success: false, 
            errorCode: 'INSUFFICIENT_FUNDS',
            errorMessage: 'Insufficient funds',
            balance: currentBalance
          };
        }
        
        newBalance = currentBalance - amount;
        transactionStatus = 'completed';
      } 
      else if (transactionType === 'win') {
        newBalance = currentBalance + amount;
        transactionStatus = 'completed';
      }
      else if (transactionType === 'refund') {
        newBalance = currentBalance + amount;
        transactionStatus = 'completed';
      }
      else if (transactionType === 'balance') {
        // Just return current balance
        return {
          success: true,
          balance: currentBalance
        };
      }
      
      // Update wallet balance
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('user_id', playerId);
        
      if (updateError) {
        console.error('Error updating wallet balance:', updateError);
        return { 
          success: false, 
          errorCode: 'DATABASE_ERROR',
          errorMessage: 'Failed to update wallet balance',
          balance: currentBalance
        };
      }
      
      // Record transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          player_id: playerId,
          type: transactionType,
          amount: amount,
          currency: extractCurrency(providerCode, callbackData) || 'EUR',
          game_id: extractGameId(providerCode, callbackData),
          round_id: extractRoundId(providerCode, callbackData),
          session_id: extractSessionId(providerCode, callbackData),
          provider: providerCode,
          balance_before: currentBalance,
          balance_after: newBalance,
          status: transactionStatus
        });
        
      if (transactionError) {
        console.error('Error recording transaction:', transactionError);
        // We succeeded in updating the balance but failed to record the transaction
        // In a production system, this should be handled more gracefully
      }
      
      // Return successful response with new balance
      return {
        success: true,
        balance: newBalance,
        currency: extractCurrency(providerCode, callbackData) || 'EUR',
        transactionId: `tx-${Date.now()}`
      };
    } catch (error: any) {
      console.error('Error processing callback:', error);
      return { 
        success: false, 
        errorCode: 'INTERNAL_ERROR',
        errorMessage: error.message || 'Unknown error'
      };
    }
  },
  
  /**
   * Get available games from all providers
   */
  getAvailableGames: async () => {
    try {
      // Fetch games from database
      const { data: games, error } = await supabase
        .from('games')
        .select('*, providers(name)')
        .order('views', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      
      // Format games
      const formattedGames = games.map(game => ({
        id: game.id,
        title: game.game_name,
        provider: game.providers?.name || 'Unknown',
        image: game.cover || '/placeholder.svg',
        category: game.game_type || 'slots',
        rtp: game.rtp || 96,
        isPopular: game.is_popular || false,
        isNew: game.is_new || false
      }));
      
      return {
        success: true,
        games: formattedGames
      };
    } catch (error: any) {
      console.error('Error fetching available games:', error);
      return {
        success: false,
        errorMessage: error.message || 'Failed to get games list',
        games: []
      };
    }
  },
  
  /**
   * Synchronize games from provider APIs
   */
  syncGamesFromProviders: async () => {
    try {
      console.log('Starting game synchronization from providers...');
      // In a real implementation, this would call provider APIs
      // But for demo purposes, we'll just return success
      
      return {
        success: true,
        message: 'Game synchronization completed',
        newGames: 0,
        updatedGames: 0
      };
    } catch (error: any) {
      console.error('Error syncing games from providers:', error);
      return {
        success: false,
        message: error.message || 'Failed to sync games'
      };
    }
  }
};

// Helper functions to extract data from different provider callback formats

function determineTransactionType(provider: string, data: any): string {
  if (provider.includes('pragmatic') || provider.includes('pp')) {
    // Pragmatic Play format
    if (!data.type) return 'balance';
    return data.type === 'credit' ? 'win' : 
           data.type === 'debit' ? 'bet' : 
           data.type === 'rollback' ? 'refund' : 'unknown';
  } 
  else if (provider.includes('infin')) {
    // InfinGame format
    return data.type === 'credit' ? 'win' : 
           data.type === 'debit' ? 'bet' : 
           data.type === 'refund' ? 'refund' : 'balance';
  }
  else if (provider.includes('gsp') || provider.includes('gitslot')) {
    // GitSlotPark format
    return data.operation === 'win' ? 'win' : 
           data.operation === 'bet' ? 'bet' : 
           data.operation === 'refund' ? 'refund' : 
           data.operation === 'balance' ? 'balance' : 'bet';
  }
  // Default behavior
  return 'unknown';
}

function extractPlayerId(provider: string, data: any): string {
  if (provider.includes('pragmatic') || provider.includes('pp')) {
    return data.playerid || data.playerId || '';
  } 
  else if (provider.includes('infin')) {
    return data.player_id || data.playerId || '';
  }
  else if (provider.includes('gsp') || provider.includes('gitslot')) {
    return data.player_id || '';
  }
  return '';
}

function extractAmount(provider: string, data: any): number {
  if (provider.includes('pragmatic') || provider.includes('pp')) {
    return parseFloat(data.amount || '0');
  } 
  else if (provider.includes('infin')) {
    return parseFloat(data.amount || '0');
  }
  else if (provider.includes('gsp') || provider.includes('gitslot')) {
    return parseFloat(data.amount || '0');
  }
  return 0;
}

function extractCurrency(provider: string, data: any): string {
  if (provider.includes('pragmatic') || provider.includes('pp')) {
    return data.currency || 'EUR';
  } 
  else if (provider.includes('infin')) {
    return data.currency || 'EUR';
  }
  else if (provider.includes('gsp') || provider.includes('gitslot')) {
    return data.currency || 'EUR';
  }
  return 'EUR';
}

function extractGameId(provider: string, data: any): string {
  if (provider.includes('pragmatic') || provider.includes('pp')) {
    return data.gameref || data.gameId || '';
  } 
  else if (provider.includes('infin')) {
    return data.game_id || data.gameId || '';
  }
  else if (provider.includes('gsp') || provider.includes('gitslot')) {
    return data.game_id || '';
  }
  return '';
}

function extractRoundId(provider: string, data: any): string {
  if (provider.includes('pragmatic') || provider.includes('pp')) {
    return data.roundid || data.roundId || '';
  } 
  else if (provider.includes('infin')) {
    return data.round_id || data.roundId || '';
  }
  else if (provider.includes('gsp') || provider.includes('gitslot')) {
    return data.round_id || '';
  }
  return '';
}

function extractSessionId(provider: string, data: any): string {
  if (provider.includes('pragmatic') || provider.includes('pp')) {
    return data.sessionid || data.sessionId || '';
  } 
  else if (provider.includes('infin')) {
    return data.session_id || data.sessionId || '';
  }
  else if (provider.includes('gsp') || provider.includes('gitslot')) {
    return data.session_id || '';
  }
  return '';
}

export default gameAggregatorService;
