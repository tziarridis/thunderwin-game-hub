import axios from 'axios';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { addTransaction } from '@/services/transactionService';

// Game Aggregator API configuration
const API_CONFIG = {
  endpoint: 'https://apipg.slotgamesapi.com',
  agentId: 'captaingambleEUR',
  token: '275c535c8c014b59bedb2a2d6fe7d37b',
  secretKey: 'bbd0551e144c46d19975f985e037c9b0',
  callbackUrl: 'https://your-domain/casino/seamless'
};

// InfinGame API configuration
const INFIN_API_CONFIG = {
  endpoint: 'https://infinapi-docs.axis-stage.infingame.com',
  agentId: 'casinothunder',
  token: 'api-token-here',
  secretKey: 'secret-key-here',
  callbackUrl: 'https://your-api.com/infin/callback'
};

// Interface for session creation request
interface SessionCreationRequest {
  agentId: string;
  token: string;
  currency: string;
  playerName: string;
  gameId: string;
  platform: 'web' | 'mobile';
  callbackUrl: string;
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
      
      // Determine which API configuration to use based on the game ID
      const isInfinGame = gameId.startsWith('infin_');
      const apiConfig = isInfinGame ? INFIN_API_CONFIG : API_CONFIG;
      
      const requestBody: SessionCreationRequest = {
        agentId: apiConfig.agentId,
        token: apiConfig.token,
        currency: currency,
        playerName: playerId,
        gameId: isInfinGame ? gameId.replace('infin_', '') : gameId,
        platform: platform,
        callbackUrl: apiConfig.callbackUrl
      };
      
      // Make API request to create session
      const apiEndpoint = isInfinGame 
        ? `${apiConfig.endpoint}/api/games/launch` 
        : `${apiConfig.endpoint}/api/casino/create-session`;
      
      console.log(`API Endpoint: ${apiEndpoint}`);
      console.log('Request body:', requestBody);
      
      const response = await axios.post(
        apiEndpoint,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Game session response:', response.data);
      
      // Structure for response data differs between providers
      let success = false;
      let gameUrl = '';
      let sessionId = '';
      let errorMessage = '';
      
      if (isInfinGame) {
        // Handle InfinGame API response format
        success = response.data && response.data.success;
        gameUrl = success ? response.data.url : '';
        sessionId = success ? response.data.session_id : '';
        errorMessage = !success ? (response.data.error || 'Unknown error') : '';
      } else {
        // Handle default aggregator API response format
        success = response.data && response.data.success;
        gameUrl = success ? response.data.gameUrl : '';
        sessionId = success ? response.data.sessionId : '';
        errorMessage = !success ? (response.data.errorMessage || 'Unknown error') : '';
      }
      
      if (success) {
        // Log successful game launch in transactions
        await addTransaction({
          user_id: playerId,
          player_id: playerId,
          type: 'bet',
          amount: 0, // Initial amount is 0, actual bet will be recorded later
          currency: currency,
          status: 'completed',
          provider: isInfinGame ? 'infingame' : 'aggregator',
          game_id: gameId,
          description: `Game session created: ${gameId}`,
          reference_id: sessionId
        });
        
        return {
          success: true,
          gameUrl: gameUrl,
          sessionId: sessionId
        };
      } else {
        throw new Error(errorMessage || 'Unknown error creating game session');
      }
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
   * Store a game transaction in the database
   */
  storeGameTransaction: async (transaction: GameTransaction) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          player_id: transaction.player_id,
          game_id: transaction.game_id,
          provider: transaction.provider,
          type: transaction.type,
          amount: transaction.amount,
          currency: transaction.currency,
          status: 'completed',
          round_id: transaction.round_id,
          session_id: transaction.session_id
        });
        
      if (error) {
        throw error;
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Error storing game transaction:', error);
      return { success: false, error };
    }
  },
  
  /**
   * Process a wallet callback from the game provider
   */
  processCallback: async (callbackData: any) => {
    try {
      console.log('Processing game callback:', callbackData);
      
      // Determine the provider from the callback data
      const isInfinGame = callbackData.provider === 'infingame';
      const apiConfig = isInfinGame ? INFIN_API_CONFIG : API_CONFIG;
      
      // Verify that this is a valid callback with our agent ID
      if (callbackData.agentId !== apiConfig.agentId) {
        return { success: false, errorCode: 'INVALID_AGENT' };
      }
      
      // Extract data from callback
      const { 
        playerId, 
        gameId, 
        roundId, 
        transactionId, 
        amount, 
        currency, 
        transactionType 
      } = callbackData;
      
      // Map transaction type to our internal type
      let type: 'bet' | 'win' = transactionType === 'debit' ? 'bet' : 'win';
      
      // Record the transaction in our system
      await addTransaction({
        user_id: playerId,
        player_id: playerId,
        type,
        amount: Math.abs(amount),
        currency,
        status: 'completed',
        provider: isInfinGame ? 'infingame' : 'aggregator',
        game_id: gameId,
        round_id: roundId,
        reference_id: transactionId,
        description: `Game ${type}: ${gameId}, Round: ${roundId}`
      });
      
      // Return success response
      return { 
        success: true,
        balance: 100.00 // In a real implementation, return actual user balance
      };
    } catch (error: any) {
      console.error('Error processing game callback:', error);
      
      // Return error response
      return {
        success: false,
        errorCode: 'INTERNAL_ERROR',
        errorMessage: error.message
      };
    }
  },
  
  /**
   * Get available games from the aggregator
   */
  getAvailableGames: async () => {
    try {
      const response = await axios.get(
        `${API_CONFIG.endpoint}/api/casino/games`,
        {
          params: {
            agentId: API_CONFIG.agentId,
            token: API_CONFIG.token
          }
        }
      );
      
      if (response.data && response.data.success) {
        return {
          success: true,
          games: response.data.games || []
        };
      } else {
        throw new Error(response.data?.errorMessage || 'Failed to fetch games');
      }
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
   * Fetch games from provider for sync operations
   */
  fetchGamesFromProvider: async () => {
    try {
      const games = await gameAggregatorService.getAvailableGames();
      return games.success ? games.games : [];
    } catch (error) {
      console.error('Error fetching games from provider:', error);
      return [];
    }
  },
  
  /**
   * Get available InfinGame games
   */
  getInfinGames: async () => {
    try {
      const response = await axios.get(
        `${INFIN_API_CONFIG.endpoint}/api/games/list`,
        {
          params: {
            agent: INFIN_API_CONFIG.agentId,
            token: INFIN_API_CONFIG.token
          }
        }
      );
      
      if (response.data && response.data.success) {
        // Map the games to match our expected format
        const mappedGames = (response.data.games || []).map((game: any) => ({
          id: `infin_${game.id}`,
          name: game.name,
          provider: 'InfinGame',
          category: game.category || 'slots',
          imageUrl: game.image_url || '',
          isPopular: !!game.is_popular,
          isNew: !!game.is_new
        }));
        
        return {
          success: true,
          games: mappedGames
        };
      } else {
        throw new Error(response.data?.error || 'Failed to fetch InfinGame games');
      }
    } catch (error: any) {
      console.error('Error fetching InfinGame games:', error);
      return {
        success: false,
        errorMessage: error.message || 'Failed to get InfinGame games list',
        games: []
      };
    }
  }
};

export default gameAggregatorService;
