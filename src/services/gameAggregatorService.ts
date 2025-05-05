import axios from 'axios';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { addTransaction } from '@/services/transactionService';
import { getProviderConfig, GameProviderConfig } from '@/config/gameProviders';

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
        agentId: providerConfig.credentials.agentId,
        token: providerConfig.credentials.token || providerConfig.credentials.secretKey,
        currency: currency,
        playerName: playerId,
        gameId: isInfinGame ? gameId.replace('infin_', '') : 
                isGSP ? gameId.replace('gsp_', '') : gameId,
        platform: platform,
        callbackUrl: providerConfig.credentials.callbackUrl
      };
      
      // Make API request to create session
      let apiEndpoint;
      if (isInfinGame) {
        apiEndpoint = `https://${providerConfig.credentials.apiEndpoint}/api/games/launch`;
      } else if (isGSP) {
        apiEndpoint = `https://${providerConfig.credentials.apiEndpoint}/api/v1/games/launch`;
      } else {
        apiEndpoint = `https://${providerConfig.credentials.apiEndpoint}/api/casino/create-session`;
      }
      
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
      } else if (isGSP) {
        // Handle GitSlotPark API response format
        success = response.data && response.data.status === 'success';
        gameUrl = success ? response.data.game_url : '';
        sessionId = success ? response.data.session_id : '';
        errorMessage = !success ? (response.data.message || 'Unknown error') : '';
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
          provider: isInfinGame ? 'infingame' : isGSP ? 'gitslotpark' : 'aggregator',
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
   * Process a callback from the game provider
   * @param provider The provider identifier
   * @param callbackData The callback data
   */
  processCallback: async (provider: string, callbackData: any) => {
    try {
      console.log(`Processing callback for provider ${provider}:`, callbackData);
      
      // Normalize provider identifier
      const providerCode = provider.toLowerCase();
      
      // Determine which provider to use based on the callback URL or data
      const isInfinGame = providerCode.includes('infin');
      const isGSP = providerCode.includes('gsp');
      const isPP = providerCode.includes('pp');
      const isEvolution = providerCode.includes('evo');
      
      let providerId;
      if (isInfinGame) {
        providerId = 'infineur';
      } else if (isGSP) {
        providerId = 'gspeur';
      } else if (isPP) {
        providerId = 'ppeur';
      } else if (isEvolution) {
        providerId = 'evolution';
      } else {
        // Default to pragmatic play
        providerId = 'ppeur';
      }
      
      const providerConfig = getProviderConfig(providerId);
      
      if (!providerConfig) {
        console.error(`Provider configuration not found for ${providerId}`);
        return { 
          success: false, 
          errorCode: 'INVALID_PROVIDER',
          errorMessage: `Provider configuration not found for ${providerId}`
        };
      }
      
      console.log(`Using provider config: ${providerConfig.id}`);
      
      // Verify the request based on provider-specific validation logic
      // Each provider has different ways to validate incoming callbacks
      if (isInfinGame) {
        // InfinGame validation
        if (!callbackData.agent || callbackData.agent !== providerConfig.credentials.agentId) {
          console.warn('Invalid agent ID in InfinGame callback');
          return { success: false, errorCode: 'INVALID_AGENT' };
        }
      } else if (isGSP) {
        // GitSlotPark validation
        if (!callbackData.agent_id || callbackData.agent_id !== providerConfig.credentials.agentId) {
          console.warn('Invalid agent ID in GitSlotPark callback');
          return { success: false, errorCode: 'INVALID_AGENT' };
        }
      } else {
        // Default validation for Pragmatic Play and others
        if (callbackData.agentId && callbackData.agentId !== providerConfig.credentials.agentId) {
          console.warn('Invalid agent ID in callback');
          return { success: false, errorCode: 'INVALID_AGENT' };
        }
      }
      
      // Normalize data from different providers into a common format
      const normalizedData = normalizeCallbackData(providerCode, callbackData);
      
      console.log('Normalized callback data:', normalizedData);
      
      // Process the transaction based on the transaction type
      switch (normalizedData.transactionType) {
        case 'bet':
          return await processBetTransaction(normalizedData, providerConfig);
        case 'win':
          return await processWinTransaction(normalizedData, providerConfig);
        case 'refund':
          return await processRefundTransaction(normalizedData, providerConfig);
        case 'balance':
          return await getPlayerBalance(normalizedData.playerId);
        default:
          console.warn(`Unknown transaction type: ${normalizedData.transactionType}`);
          return { 
            success: false, 
            errorCode: 'INVALID_TRANSACTION_TYPE',
            errorMessage: `Unknown transaction type: ${normalizedData.transactionType}`
          };
      }
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
   * Get available games from the aggregator
   */
  getAvailableGames: async () => {
    try {
      const API_CONFIG = {
        endpoint: 'https://apipg.slotgamesapi.com',
        agentId: 'captaingambleEUR',
        token: '275c535c8c014b59bedb2a2d6fe7d37b',
        secretKey: 'bbd0551e144c46d19975f985e037c9b0',
        callbackUrl: 'https://your-domain/casino/seamless'
      };
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
      const INFIN_API_CONFIG = {
        endpoint: 'https://infinapi-docs.axis-stage.infingame.com',
        agentId: 'casinothunder',
        token: 'api-token-here',
        secretKey: 'secret-key-here',
        callbackUrl: 'https://your-api.com/infin/callback'
      };
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
  },
  
  /**
   * Get available GitSlotPark games
   */
  getGitSlotParkGames: async () => {
    try {
      const GSP_API_CONFIG = {
        endpoint: 'https://api.gitslotpark.com',
        agentId: 'partner123',
        token: 'gsp-api-token',
        secretKey: 'gsp-secret-key',
        callbackUrl: 'https://your-domain/casino/seamless/gsp'
      };
      const response = await axios.get(
        `${GSP_API_CONFIG.endpoint}/api/v1/games`,
        {
          params: {
            agent_id: GSP_API_CONFIG.agentId,
            token: GSP_API_CONFIG.token
          },
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      if (response.data && response.data.status === 'success') {
        // Map the games to match our expected format
        const mappedGames = (response.data.games || []).map((game: any) => ({
          id: `gsp_${game.game_id}`,
          name: game.name,
          provider: 'GitSlotPark',
          category: game.type || 'slots',
          imageUrl: game.image_url || '',
          isPopular: game.is_featured || false,
          isNew: game.is_new || false,
          rtp: game.rtp || 96
        }));
        
        return {
          success: true,
          games: mappedGames
        };
      } else {
        throw new Error(response.data?.message || 'Failed to fetch GitSlotPark games');
      }
    } catch (error: any) {
      console.error('Error fetching GitSlotPark games:', error);
      return {
        success: false,
        errorMessage: error.message || 'Failed to get GitSlotPark games list',
        games: []
      };
    }
  }
};

/**
 * Normalize callback data from different providers into a common format
 */
function normalizeCallbackData(providerCode: string, callbackData: any) {
  // Default values
  const normalized = {
    playerId: '',
    gameId: '',
    roundId: '',
    transactionId: '',
    amount: 0,
    currency: 'EUR',
    transactionType: 'bet',
    provider: providerCode
  };
  
  if (providerCode.includes('infin')) {
    // InfinGame format
    normalized.playerId = callbackData.player_id || callbackData.playerId || '';
    normalized.gameId = callbackData.game_id || callbackData.gameId || '';
    normalized.roundId = callbackData.round_id || callbackData.roundId || '';
    normalized.transactionId = callbackData.transaction_id || callbackData.transactionId || '';
    normalized.amount = parseFloat(callbackData.amount || '0');
    normalized.currency = callbackData.currency || 'EUR';
    normalized.transactionType = callbackData.type === 'credit' ? 'win' : 
                                callbackData.type === 'debit' ? 'bet' : 
                                callbackData.type === 'refund' ? 'refund' : 'bet';
  } else if (providerCode.includes('gsp')) {
    // GitSlotPark format
    normalized.playerId = callbackData.player_id || '';
    normalized.gameId = callbackData.game_id || '';
    normalized.roundId = callbackData.round_id || '';
    normalized.transactionId = callbackData.tx_id || '';
    normalized.amount = parseFloat(callbackData.amount || '0');
    normalized.currency = callbackData.currency || 'EUR';
    normalized.transactionType = callbackData.operation === 'win' ? 'win' : 
                                callbackData.operation === 'bet' ? 'bet' : 
                                callbackData.operation === 'refund' ? 'refund' :
                                callbackData.operation === 'balance' ? 'balance' : 'bet';
  } else {
    // Default format (Pragmatic Play, etc)
    normalized.playerId = callbackData.playerid || callbackData.playerId || '';
    normalized.gameId = callbackData.gameref || callbackData.gameId || '';
    normalized.roundId = callbackData.roundid || callbackData.roundId || '';
    normalized.transactionId = callbackData.trxid || callbackData.transactionId || '';
    normalized.amount = parseFloat(callbackData.amount || '0');
    normalized.currency = callbackData.currency || 'EUR';
    normalized.transactionType = !callbackData.type ? 'balance' :
                                callbackData.type === 'credit' ? 'win' :
                                callbackData.type === 'debit' ? 'bet' : 
                                callbackData.type === 'rollback' ? 'refund' : 'bet';
  }
  
  return normalized;
}

/**
 * Process a bet transaction
 */
async function processBetTransaction(data: any, providerConfig: GameProviderConfig) {
  // In a real implementation, this would interact with a database
  // For now, we'll just log it and return a mock response
  console.log(`Processing bet transaction for player ${data.playerId}:`, data);
  
  // Mock successful transaction
  return {
    success: true,
    balance: 100.00, // Mock balance
    transactionId: data.transactionId
  };
}

/**
 * Process a win transaction
 */
async function processWinTransaction(data: any, providerConfig: GameProviderConfig) {
  // In a real implementation, this would interact with a database
  console.log(`Processing win transaction for player ${data.playerId}:`, data);
  
  // Mock successful transaction
  return {
    success: true,
    balance: 100.00 + data.amount, // Mock balance
    transactionId: data.transactionId
  };
}

/**
 * Process a refund transaction
 */
async function processRefundTransaction(data: any, providerConfig: GameProviderConfig) {
  // In a real implementation, this would interact with a database
  console.log(`Processing refund transaction for player ${data.playerId}:`, data);
  
  // Mock successful transaction
  return {
    success: true,
    balance: 100.00, // Mock balance
    transactionId: data.transactionId
  };
}

/**
 * Get player balance
 */
async function getPlayerBalance(playerId: string) {
  // In a real implementation, this would fetch the balance from a database
  console.log(`Getting balance for player ${playerId}`);
  
  // Mock balance response
  return {
    success: true,
    balance: 100.00 // Mock balance
  };
}

export default gameAggregatorService;
