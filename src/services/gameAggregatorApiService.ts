
import axios, { AxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

// API Configuration
const API_BASE_URL = 'https://api.gameaggregator.com'; // Replace with actual base URL from docs
const API_KEY = 'demo_api_key'; // Replace with your actual API key
const API_SECRET = 'demo_api_secret'; // Replace with your actual API secret

// Interface definitions based on API documentation
export interface GameLaunchParams {
  gameId: string;
  playerId: string;
  operatorId?: string;
  currency?: string;
  language?: string;
  returnUrl?: string;
  mode?: 'real' | 'demo';
  device?: 'desktop' | 'mobile' | 'tablet';
  ip?: string;
  country?: string;
}

export interface WalletRequest {
  operatorId: string;
  playerId: string;
  transactionId: string;
  roundId?: string;
  gameId?: string;
  amount: number;
  currency: string;
  type: 'bet' | 'win' | 'rollback' | 'refund';
  timestamp: number;
  hash?: string;
}

export interface WalletResponse {
  status: 'success' | 'error';
  balance: number;
  currency: string;
  errorCode?: string;
  errorMessage?: string;
  transactionId?: string;
}

export interface GameInfo {
  id: string;
  name: string;
  provider: string;
  category: string;
  rtp?: number;
  volatility?: 'low' | 'medium' | 'high';
  hasJackpot?: boolean;
  minBet?: number;
  maxBet?: number;
  isMobile?: boolean;
  isDesktop?: boolean;
  thumbnailUrl?: string;
  backgroundUrl?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Service for integrating with Game Aggregator API
 * Based on: https://documenter.getpostman.com/view/25695248/2sA3Qy7VR4
 */
export const gameAggregatorApiService = {
  /**
   * Generate authentication signature for API requests
   */
  generateSignature: (params: Record<string, any>): string => {
    // Sort all parameters alphabetically
    const sortedParams = Object.keys(params).sort().reduce(
      (acc, key) => ({...acc, [key]: params[key]}),
      {}
    );
    
    // Create a string of all params in format key=value
    const paramString = Object.entries(sortedParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    // In a real implementation, you would use a crypto library to create an HMAC-SHA256 hash
    // For this demo, we'll just return a mock signature
    return `mockSignature_${Date.now()}_${uuidv4().slice(0, 8)}`;
  },
  
  /**
   * Make an authenticated request to the API
   */
  apiRequest: async <T>(
    endpoint: string, 
    method: 'GET' | 'POST' = 'POST',
    params: Record<string, any> = {}
  ): Promise<ApiResponse<T>> => {
    try {
      // Add required authentication parameters
      const authParams = {
        ...params,
        api_key: API_KEY,
        timestamp: Math.floor(Date.now() / 1000)
      };
      
      // Generate signature
      const signature = gameAggregatorApiService.generateSignature(authParams);
      
      const config: AxiosRequestConfig = {
        method,
        url: `${API_BASE_URL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': signature
        }
      };
      
      if (method === 'GET') {
        config.params = authParams;
      } else {
        config.data = authParams;
      }
      
      // For demo purposes, log the request
      console.log(`API Request to ${endpoint}:`, config);
      
      // In a real implementation, this would make an actual API call
      // For demo, we'll simulate API responses
      const mockResponse = await gameAggregatorApiService.simulateApiResponse<T>(endpoint, authParams);
      
      return mockResponse;
    } catch (error: any) {
      console.error(`API Request Error (${endpoint}):`, error);
      return {
        success: false,
        error: {
          code: error.code || 'unknown_error',
          message: error.message || 'An unknown error occurred'
        }
      };
    }
  },
  
  /**
   * Simulate API responses for demonstration
   */
  simulateApiResponse: async <T>(endpoint: string, params: any): Promise<ApiResponse<T>> => {
    // Add a small delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate different responses based on endpoint
    if (endpoint.includes('/games/list')) {
      return {
        success: true,
        data: {
          games: [
            {
              id: 'game1',
              name: 'Fortune Tiger',
              provider: 'PG Soft',
              category: 'slots',
              rtp: 96.5,
              volatility: 'medium',
              hasJackpot: false,
              thumbnailUrl: '/games/fortune-tiger.jpg'
            },
            {
              id: 'game2',
              name: 'Sweet Bonanza',
              provider: 'Pragmatic Play',
              category: 'slots',
              rtp: 96.8,
              volatility: 'high',
              hasJackpot: false,
              thumbnailUrl: '/games/sweet-bonanza.jpg'
            }
          ] as any
        }
      } as ApiResponse<T>;
    }
    
    if (endpoint.includes('/games/launch')) {
      return {
        success: true,
        data: {
          gameUrl: `https://launch.demo-games.com/play?game=${params.gameId}&token=demo-${Date.now()}&mode=${params.mode || 'demo'}`
        } as any
      } as ApiResponse<T>;
    }
    
    if (endpoint.includes('/wallet')) {
      // Simulate wallet response
      const walletType = params.type || 'unknown';
      
      if (walletType === 'bet') {
        return {
          success: true,
          data: {
            status: 'success',
            balance: 990.00,
            currency: params.currency || 'USD',
            transactionId: params.transactionId
          } as any
        } as ApiResponse<T>;
      }
      
      if (walletType === 'win') {
        return {
          success: true,
          data: {
            status: 'success',
            balance: 1100.00,
            currency: params.currency || 'USD',
            transactionId: params.transactionId
          } as any
        } as ApiResponse<T>;
      }
      
      return {
        success: true,
        data: {
          status: 'success',
          balance: 1000.00,
          currency: params.currency || 'USD',
          transactionId: params.transactionId
        } as any
      } as ApiResponse<T>;
    }
    
    // Default mock response
    return {
      success: true,
      data: {} as T
    };
  },
  
  /**
   * Get list of available games
   */
  getGamesList: async (params: {
    provider?: string;
    category?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<ApiResponse<{games: GameInfo[]}>> => {
    return gameAggregatorApiService.apiRequest<{games: GameInfo[]}>('/games/list', 'GET', params);
  },
  
  /**
   * Launch a game
   */
  launchGame: async (params: GameLaunchParams): Promise<string> => {
    const response = await gameAggregatorApiService.apiRequest<{gameUrl: string}>('/games/launch', 'POST', {
      game_id: params.gameId,
      player_id: params.playerId,
      operator_id: params.operatorId || 'demo_operator',
      currency: params.currency || 'USD',
      language: params.language || 'en',
      return_url: params.returnUrl || window.location.origin,
      mode: params.mode || 'demo',
      device: params.device || 'desktop',
      ip: params.ip || '127.0.0.1',
      country: params.country || 'US'
    });
    
    if (!response.success || !response.data?.gameUrl) {
      throw new Error(response.error?.message || 'Failed to launch game');
    }
    
    return response.data.gameUrl;
  },
  
  /**
   * Process a wallet request
   */
  processWalletRequest: async (request: WalletRequest): Promise<WalletResponse> => {
    const response = await gameAggregatorApiService.apiRequest<WalletResponse>('/wallet', 'POST', {
      operator_id: request.operatorId,
      player_id: request.playerId,
      transaction_id: request.transactionId,
      round_id: request.roundId,
      game_id: request.gameId,
      amount: request.amount,
      currency: request.currency,
      type: request.type,
      timestamp: request.timestamp
    });
    
    if (!response.success) {
      return {
        status: 'error',
        balance: 0,
        currency: request.currency,
        errorCode: response.error?.code || 'unknown_error',
        errorMessage: response.error?.message || 'An unknown error occurred'
      };
    }
    
    return response.data as WalletResponse;
  },
  
  /**
   * Verify the signature of a callback request
   */
  verifyCallbackSignature: (params: Record<string, any>, signature: string): boolean => {
    // In a real implementation, you would verify the HMAC-SHA256 signature
    // For this demo, we'll always return true
    return true;
  },
  
  /**
   * Handle a wallet callback from the game provider
   */
  handleWalletCallback: async (
    callbackData: any,
    signature: string
  ): Promise<WalletResponse> => {
    // Log the callback data
    console.log('Received wallet callback:', callbackData);
    
    // Verify the signature
    const isValid = gameAggregatorApiService.verifyCallbackSignature(callbackData, signature);
    
    if (!isValid) {
      return {
        status: 'error',
        balance: 0,
        currency: callbackData.currency || 'USD',
        errorCode: 'invalid_signature',
        errorMessage: 'Invalid signature'
      };
    }
    
    // Process the callback based on type
    switch (callbackData.type) {
      case 'bet':
        return {
          status: 'success',
          balance: 990.00, // Simulated remaining balance after bet
          currency: callbackData.currency || 'USD',
          transactionId: callbackData.transaction_id
        };
        
      case 'win':
        return {
          status: 'success',
          balance: 1100.00, // Simulated remaining balance after win
          currency: callbackData.currency || 'USD',
          transactionId: callbackData.transaction_id
        };
        
      case 'rollback':
      case 'refund':
        return {
          status: 'success',
          balance: 1000.00, // Simulated balance after rollback/refund
          currency: callbackData.currency || 'USD',
          transactionId: callbackData.transaction_id
        };
        
      default:
        return {
          status: 'error',
          balance: 1000.00,
          currency: callbackData.currency || 'USD',
          errorCode: 'invalid_type',
          errorMessage: 'Invalid transaction type'
        };
    }
  },
  
  /**
   * Get player balance
   */
  getPlayerBalance: async (
    playerId: string,
    currency: string = 'USD'
  ): Promise<{balance: number, currency: string}> => {
    // In a real implementation, this would fetch the balance from the API
    // For demo, we'll return a mock balance
    return {
      balance: 1000.00,
      currency
    };
  },
  
  /**
   * Get player transaction history
   */
  getPlayerTransactions: async (
    playerId: string,
    params: {
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<any[]> => {
    // In a real implementation, this would fetch transactions from the API
    // For demo, we'll return mock transactions
    return [
      {
        transactionId: `tx_${Date.now()}_1`,
        playerId,
        gameId: 'game1',
        roundId: `round_${Date.now()}_1`,
        type: 'bet',
        amount: 10.00,
        currency: 'USD',
        balance: 990.00,
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        transactionId: `tx_${Date.now()}_2`,
        playerId,
        gameId: 'game1',
        roundId: `round_${Date.now()}_1`,
        type: 'win',
        amount: 20.00,
        currency: 'USD',
        balance: 1010.00,
        timestamp: new Date(Date.now() - 3500000).toISOString()
      }
    ];
  }
};

export default gameAggregatorApiService;
