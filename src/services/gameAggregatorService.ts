
import axios from 'axios';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { trackEvent } from '@/utils/analytics';
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
   * Based on the documentation:
   * - InfinGame: https://infinapi-docs.axis-stage.infingame.com/launch
   * - GitSlotPark: https://documenter.getpostman.com/view/25695248/2sA3Qy7VR4#75e85269-a159-493d-8a81-900fdebf86cc
   */
  createSession: async (
    gameId: string,
    playerId: string,
    currency = 'EUR',
    platform: 'web' | 'mobile' = 'web'
  ): Promise<SessionCreationResponse> => {
    try {
      console.log(`Creating game session for player ${playerId}, game ${gameId}`);
      
      // Track analytics event
      trackEvent('game_session_create', {
        gameId,
        platform
      });
      
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
      
      // Prepare the request body according to provider specifications
      const gameIdentifier = isInfinGame ? gameId.replace('infin_', '') : 
                              isGSP ? gameId.replace('gsp_', '') : gameId;
      
      // For demo purposes, we'll simulate the API call
      console.log('Creating game session with provider:', providerId);
      
      // Different base URLs based on provider as per documentation
      const demoBaseUrls: Record<string, string> = {
        ppeur: 'https://demogameserver.pragmaticplay.net/gs2c/openGame.do',
        infineur: 'https://demo-games.infingame.com/launcher', // According to infinapi-docs
        gspeur: 'https://demo.gitslotpark.com/game/launch' // According to gitslotpark docs
      };
      
      // Build query parameters based on provider specifications from docs
      const params = new URLSearchParams();
      
      if (providerId === 'ppeur') {
        // Pragmatic Play parameters according to documentation
        params.append('gameSymbol', gameIdentifier);
        params.append('websiteUrl', window.location.origin);
        params.append('lobbyUrl', window.location.origin + '/casino');
        params.append('platform', platform);
        params.append('language', 'en');
        params.append('cur', currency);
        // Add demo mode indicator
        params.append('playMode', 'demo');
      } else if (providerId === 'infineur') {
        // InfinGame parameters according to infinapi-docs
        params.append('game', gameIdentifier);
        params.append('lang', 'en');
        params.append('currency', currency);
        params.append('userId', playerId);
        params.append('partnerCode', providerConfig.credentials?.agentId || '');
        params.append('mode', 'demo'); // For demo purposes
        params.append('returnUrl', window.location.origin + '/casino');
      } else if (providerId === 'gspeur') {
        // GitSlotPark parameters according to their documentation
        params.append('gameCode', gameIdentifier);
        params.append('partnerId', providerConfig.credentials?.agentId || '');
        params.append('language', 'en');
        params.append('currency', currency);
        params.append('userId', playerId);
        params.append('returnUrl', window.location.origin + '/casino');
        params.append('demo', 'true'); // For demo mode
      }
      
      const demoGameUrl = `${demoBaseUrls[providerId] || demoBaseUrls['ppeur']}?${params.toString()}`;
      
      // Log session creation in transactions
      await supabase.from('transactions').insert({
        player_id: playerId,
        game_id: gameId,
        provider: providerId,
        type: 'session',
        amount: 0, // Initial session has 0 amount
        currency: currency,
        status: 'completed',
      });
      
      console.log(`Generated game URL: ${demoGameUrl}`);
      trackEvent('game_session_success', { 
        provider: providerId,
        gameId,
        platform
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
      trackEvent('game_session_error', { 
        error: error.message || 'Unknown error'
      });
      
      return {
        success: false,
        errorMessage: error.message || 'Failed to create game session',
        errorCode: error.response?.data?.errorCode || 'UNKNOWN'
      };
    }
  },
  
  /**
   * Process a callback from the game provider
   * Based on:
   * - InfinGame: https://infinapi-docs.axis-stage.infingame.com/wallet
   * - GitSlotPark: https://documenter.getpostman.com/view/25695248/2sA3Qy7VR4#255da0c0-97a6-411d-a2eb-9f5460515084
   */
  processCallback: async (provider: string, callbackData: any) => {
    try {
      console.log(`Processing callback for provider ${provider}:`, callbackData);
      trackEvent('game_callback', {
        provider,
        type: determineTransactionType(provider.toLowerCase(), callbackData)
      });
      
      // Normalize provider identifier
      const providerCode = provider.toLowerCase();
      
      // Determine transaction type based on provider's callback format
      const transactionType = determineTransactionType(providerCode, callbackData);
      
      // Extract player ID from the callback data
      const playerId = extractPlayerId(providerCode, callbackData);
      
      if (!playerId) {
        trackEvent('game_callback_error', {
          provider,
          error: 'Invalid player ID'
        });
        return { 
          success: false, 
          errorCode: 'INVALID_PLAYER',
          errorMessage: 'Player ID is missing or invalid' 
        };
      }
      
      // Get current wallet balance
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', playerId)
        .single();
        
      if (walletError || !walletData) {
        console.error('Error fetching wallet:', walletError);
        trackEvent('game_callback_error', {
          provider,
          error: 'Wallet not found'
        });
        return { 
          success: false, 
          errorCode: 'WALLET_NOT_FOUND',
          errorMessage: 'Wallet not found for player',
          balance: 0
        };
      }
      
      const currentBalance = walletData.balance || 0;
      
      // Extract amount
      const amount = extractAmount(providerCode, callbackData);
      
      // Process different transaction types
      let newBalance = currentBalance;
      let transactionStatus = 'pending';
      
      if (transactionType === 'bet') {
        // Check if player has enough balance
        if (currentBalance < amount) {
          trackEvent('game_callback_error', {
            provider,
            error: 'Insufficient funds',
            transactionType
          });
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
        trackEvent('game_callback_success', {
          provider,
          transactionType: 'balance'
        });
        return formatBalanceResponse(providerCode, currentBalance, callbackData);
      }
      
      // Update wallet balance
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('user_id', playerId);
        
      if (updateError) {
        console.error('Error updating wallet balance:', updateError);
        trackEvent('game_callback_error', {
          provider,
          error: 'Database error',
          transactionType
        });
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
      
      // Track successful transaction
      trackEvent('game_callback_success', {
        provider,
        transactionType,
        amount
      });
      
      // Return successful response with new balance according to provider specs
      return formatSuccessResponse(providerCode, newBalance, transactionType, callbackData);
    } catch (error: any) {
      console.error('Error processing callback:', error);
      trackEvent('game_callback_error', {
        provider,
        error: error.message || 'Unknown error'
      });
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
        name: game.game_name,
        provider: game.providers?.name || 'Unknown',
        image: game.cover || '/placeholder.svg',
        category: game.game_type || 'slots',
        rtp: game.rtp || 96,
        isPopular: game.is_featured || false,
        isNew: game.show_home || false,
        volatility: 'medium',
        minBet: 1,
        maxBet: 100,
        features: [],
        tags: []
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
      trackEvent('admin_action', {
        action: 'sync_games'
      });
      
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
      trackEvent('admin_action_error', {
        action: 'sync_games',
        error: error.message || 'Unknown error'
      });
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
    // InfinGame format as per docs
    return data.operationType === 'credit' ? 'win' : 
           data.operationType === 'debit' ? 'bet' : 
           data.operationType === 'rollback' ? 'refund' : 
           data.operationType === 'getBalance' ? 'balance' : 'unknown';
  }
  else if (provider.includes('gsp') || provider.includes('gitslot')) {
    // GitSlotPark format as per docs
    return data.operation === 'win' ? 'win' : 
           data.operation === 'bet' ? 'bet' : 
           data.operation === 'refund' ? 'refund' : 
           data.operation === 'balance' ? 'balance' : 'unknown';
  }
  // Default behavior
  return 'unknown';
}

function extractPlayerId(provider: string, data: any): string {
  if (provider.includes('pragmatic') || provider.includes('pp')) {
    return data.playerid || data.playerId || '';
  } 
  else if (provider.includes('infin')) {
    // According to InfinGame docs
    return data.userId || data.player_id || '';
  }
  else if (provider.includes('gsp') || provider.includes('gitslot')) {
    // According to GitSlotPark docs
    return data.userId || data.player_id || '';
  }
  return '';
}

function extractAmount(provider: string, data: any): number {
  if (provider.includes('pragmatic') || provider.includes('pp')) {
    return parseFloat(data.amount || '0');
  } 
  else if (provider.includes('infin')) {
    // According to InfinGame docs
    return parseFloat(data.amount || '0');
  }
  else if (provider.includes('gsp') || provider.includes('gitslot')) {
    // According to GitSlotPark docs
    return parseFloat(data.amount || '0');
  }
  return 0;
}

function extractCurrency(provider: string, data: any): string {
  if (provider.includes('pragmatic') || provider.includes('pp')) {
    return data.currency || 'EUR';
  } 
  else if (provider.includes('infin')) {
    // According to InfinGame docs
    return data.currency || 'EUR';
  }
  else if (provider.includes('gsp') || provider.includes('gitslot')) {
    // According to GitSlotPark docs
    return data.currency || 'EUR';
  }
  return 'EUR';
}

function extractGameId(provider: string, data: any): string {
  if (provider.includes('pragmatic') || provider.includes('pp')) {
    return data.gameref || data.gameId || '';
  } 
  else if (provider.includes('infin')) {
    // According to InfinGame docs
    return data.gameId || data.game_id || '';
  }
  else if (provider.includes('gsp') || provider.includes('gitslot')) {
    // According to GitSlotPark docs
    return data.gameCode || data.game_id || '';
  }
  return '';
}

function extractRoundId(provider: string, data: any): string {
  if (provider.includes('pragmatic') || provider.includes('pp')) {
    return data.roundid || data.roundId || '';
  } 
  else if (provider.includes('infin')) {
    // According to InfinGame docs
    return data.roundId || data.round_id || '';
  }
  else if (provider.includes('gsp') || provider.includes('gitslot')) {
    // According to GitSlotPark docs
    return data.roundId || data.round_id || '';
  }
  return '';
}

function extractSessionId(provider: string, data: any): string {
  if (provider.includes('pragmatic') || provider.includes('pp')) {
    return data.sessionid || data.sessionId || '';
  } 
  else if (provider.includes('infin')) {
    // According to InfinGame docs
    return data.sessionId || data.session_id || '';
  }
  else if (provider.includes('gsp') || provider.includes('gitslot')) {
    // According to GitSlotPark docs
    return data.sessionId || data.session_id || '';
  }
  return '';
}

// Format balance response according to provider specs
function formatBalanceResponse(provider: string, balance: number, data: any): any {
  if (provider.includes('infin')) {
    // InfinGame format as per docs
    return {
      status: "success",
      balance: balance,
      currency: extractCurrency(provider, data)
    };
  } else if (provider.includes('gsp') || provider.includes('gitslot')) {
    // GitSlotPark format as per docs
    return {
      success: true,
      balance: balance,
      currency: extractCurrency(provider, data)
    };
  } else if (provider.includes('pragmatic') || provider.includes('pp')) {
    // Pragmatic Play format
    return {
      errorcode: "0", // 0 means success
      balance: balance
    };
  }
  
  // Default format
  return {
    success: true,
    balance: balance
  };
}

// Format success response according to provider specs
function formatSuccessResponse(provider: string, balance: number, type: string, data: any): any {
  if (provider.includes('infin')) {
    // InfinGame format as per docs
    return {
      status: "success",
      balance: balance,
      currency: extractCurrency(provider, data),
      transactionId: `infin-tx-${Date.now()}`
    };
  } else if (provider.includes('gsp') || provider.includes('gitslot')) {
    // GitSlotPark format as per docs
    return {
      success: true,
      balance: balance,
      currency: extractCurrency(provider, data),
      transactionId: `gsp-tx-${Date.now()}`
    };
  } else if (provider.includes('pragmatic') || provider.includes('pp')) {
    // Pragmatic Play format
    return {
      errorcode: "0", // 0 means success
      balance: balance
    };
  }
  
  // Default format
  return {
    success: true,
    balance: balance,
    transactionId: `tx-${Date.now()}`
  };
}

export default gameAggregatorService;
