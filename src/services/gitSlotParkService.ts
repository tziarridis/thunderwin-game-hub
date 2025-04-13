
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { Transaction } from './transactionService';
import * as transactionService from './transactionService';

// Player balance stored in localStorage
const BALANCE_KEY = 'gsp_player_balance';

interface GitSlotParkPlayer {
  id: string;
  balance: number;
  currency: string;
}

interface TransactionResult {
  success: boolean;
  message?: string;
  transaction?: Transaction;
}

interface LaunchOptions {
  playerId: string;
  gameCode: string;
  mode: 'demo' | 'real';
  returnUrl?: string;
  language?: string;
}

// Get player balance from local storage
const getPlayerBalance = (playerId: string): number => {
  const storedBalances = localStorage.getItem(BALANCE_KEY);
  if (storedBalances) {
    const balances = JSON.parse(storedBalances) as Record<string, number>;
    return balances[playerId] || 1000; // Default balance is 1000
  }
  
  // Initialize with default balance
  const defaultBalance = 1000;
  const newBalances = { [playerId]: defaultBalance };
  localStorage.setItem(BALANCE_KEY, JSON.stringify(newBalances));
  return defaultBalance;
};

// Set player balance in local storage
const setPlayerBalance = (playerId: string, balance: number): void => {
  const storedBalances = localStorage.getItem(BALANCE_KEY);
  const balances = storedBalances ? JSON.parse(storedBalances) as Record<string, number> : {};
  balances[playerId] = balance;
  localStorage.setItem(BALANCE_KEY, JSON.stringify(balances));
};

// GitSlotPark API service
export const gitSlotParkService = {
  // Get player balance
  getBalance: async (playerId: string): Promise<{ balance: number; currency: string }> => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const balance = getPlayerBalance(playerId);
      return { balance, currency: 'EUR' };
    } catch (error) {
      console.error('Error fetching GitSlotPark balance:', error);
      throw new Error('Failed to fetch balance');
    }
  },
  
  // Credit (deposit) to player's wallet
  credit: async (playerId: string, amount: number): Promise<TransactionResult> => {
    try {
      if (amount <= 0) {
        return { success: false, message: 'Amount must be greater than zero' };
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get current balance
      const currentBalance = getPlayerBalance(playerId);
      
      // Update balance
      const newBalance = currentBalance + amount;
      setPlayerBalance(playerId, newBalance);
      
      // Create transaction record
      const transactionId = uuidv4().replace(/-/g, '');
      const transaction = await transactionService.createTransaction(
        playerId,
        playerId,
        'credit',
        amount,
        'EUR',
        'completed',
        'GitSlotPark',
        undefined,
        undefined,
        transactionId
      );
      
      return {
        success: true,
        message: `Successfully credited ${amount} EUR to player ${playerId}`,
        transaction
      };
    } catch (error) {
      console.error('Error processing GitSlotPark credit:', error);
      return { success: false, message: 'Failed to process credit' };
    }
  },
  
  // Debit (withdraw) from player's wallet
  debit: async (playerId: string, amount: number): Promise<TransactionResult> => {
    try {
      if (amount <= 0) {
        return { success: false, message: 'Amount must be greater than zero' };
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get current balance
      const currentBalance = getPlayerBalance(playerId);
      
      // Check if player has sufficient balance
      if (currentBalance < amount) {
        return { success: false, message: 'Insufficient balance' };
      }
      
      // Update balance
      const newBalance = currentBalance - amount;
      setPlayerBalance(playerId, newBalance);
      
      // Create transaction record
      const transactionId = uuidv4().replace(/-/g, '');
      const transaction = await transactionService.createTransaction(
        playerId,
        playerId,
        'debit',
        amount,
        'EUR',
        'completed',
        'GitSlotPark',
        undefined,
        undefined,
        transactionId
      );
      
      return {
        success: true,
        message: `Successfully debited ${amount} EUR from player ${playerId}`,
        transaction
      };
    } catch (error) {
      console.error('Error processing GitSlotPark debit:', error);
      return { success: false, message: 'Failed to process debit' };
    }
  },
  
  // Process bet
  processBet: async (playerId: string, amount: number, gameId: string, roundId: string): Promise<TransactionResult> => {
    try {
      // Get current balance
      const currentBalance = getPlayerBalance(playerId);
      
      // Check if player has sufficient balance
      if (currentBalance < amount) {
        return { success: false, message: 'Insufficient balance' };
      }
      
      // Update balance
      const newBalance = currentBalance - amount;
      setPlayerBalance(playerId, newBalance);
      
      // Create transaction record
      const transactionId = uuidv4().replace(/-/g, '');
      const transaction = await transactionService.createTransaction(
        playerId,
        'casino',
        'bet',
        amount,
        'EUR',
        'completed',
        'GitSlotPark',
        gameId,
        roundId,
        transactionId
      );
      
      return {
        success: true,
        transaction
      };
    } catch (error: any) {
      console.error('Error processing GitSlotPark bet:', error);
      return { success: false, message: 'Failed to process bet' };
    }
  },
  
  // Process win
  processWin: async (playerId: string, amount: number, gameId: string, roundId: string): Promise<TransactionResult> => {
    try {
      // Get current balance
      const currentBalance = getPlayerBalance(playerId);
      
      // Update balance
      const newBalance = currentBalance + amount;
      setPlayerBalance(playerId, newBalance);
      
      // Create transaction record
      const transactionId = uuidv4().replace(/-/g, '');
      const transaction = await transactionService.createTransaction(
        'casino',
        playerId,
        'win',
        amount,
        'EUR',
        'completed',
        'GitSlotPark',
        gameId,
        roundId,
        transactionId
      );
      
      return {
        success: true,
        transaction
      };
    } catch (error) {
      console.error('Error processing GitSlotPark win:', error);
      return { success: false, message: 'Failed to process win' };
    }
  },
  
  // Process wallet callback from GitSlotPark
  processCallback: async (callbackData: any): Promise<{ status: string; balance: number }> => {
    try {
      console.log('Processing GitSlotPark callback:', callbackData);
      
      // Ensure required properties are present
      if (!callbackData || !callbackData.playerId) {
        return {
          status: 'ERROR',
          balance: 0
        };
      }
      
      const playerId = callbackData.playerId;
      const amount = callbackData.amount || 0;
      const type = callbackData.type || '';
      const gameId = callbackData.gameId || '';
      const roundId = callbackData.roundId || '';
      const transactionId = callbackData.transactionId || '';
      
      // Check if transaction already exists (idempotency check)
      if (transactionId) {
        const exists = await transactionService.transactionExists(transactionId);
        if (exists) {
          console.log(`Duplicate transaction detected: ${transactionId}`);
          // Return current balance without processing duplicate transaction
          return {
            status: 'OK',
            balance: getPlayerBalance(playerId)
          };
        }
      }
      
      let result: TransactionResult;
      
      // Process based on transaction type
      if (type === 'bet' || type === 'debit') {
        result = await this.processBet(playerId, amount, gameId, roundId);
      } else if (type === 'win' || type === 'credit') {
        result = await this.processWin(playerId, amount, gameId, roundId);
      } else {
        return {
          status: 'ERROR',
          balance: getPlayerBalance(playerId)
        };
      }
      
      if (result.success) {
        return {
          status: 'OK',
          balance: getPlayerBalance(playerId)
        };
      } else {
        return {
          status: 'ERROR',
          balance: getPlayerBalance(playerId)
        };
      }
    } catch (error) {
      console.error('Error processing GitSlotPark callback:', error);
      return {
        status: 'ERROR',
        balance: 0
      };
    }
  },
  
  // Launch a game
  launchGame: async (options: LaunchOptions): Promise<string> => {
    try {
      const { playerId, gameCode, mode, returnUrl = window.location.href, language = 'en' } = options;
      
      // Demo mode doesn't require a session
      if (mode === 'demo') {
        // Construct demo URL
        const demoUrl = `https://gspgames.slotparkapi.com/demo/${gameCode}?lang=${language}&returnUrl=${encodeURIComponent(returnUrl)}`;
        return demoUrl;
      }
      
      // For real money mode, we need to create a session
      const sessionId = uuidv4();
      const balance = await this.getBalance(playerId);
      
      // In a real implementation, this would call the GitSlotPark API
      // to create a session and get a token
      
      // For demo purposes, construct a URL with query parameters
      const gameUrl = `https://gspgames.slotparkapi.com/game/${gameCode}?` + 
        `playerId=${encodeURIComponent(playerId)}` +
        `&sessionId=${sessionId}` +
        `&currency=EUR` +
        `&balance=${balance.balance}` +
        `&lang=${language}` +
        `&returnUrl=${encodeURIComponent(returnUrl)}`;
      
      return gameUrl;
    } catch (error) {
      console.error('Error launching GitSlotPark game:', error);
      throw new Error('Failed to launch game');
    }
  },
  
  // Get available games
  getAvailableGames: () => {
    // This would typically come from an API call to GitSlotPark
    return [
      { code: 'gsp_slots_1', name: 'GSP Fruit Fiesta' },
      { code: 'gsp_slots_2', name: 'GSP Mega Fortune' },
      { code: 'gsp_slots_3', name: 'GSP Thunder Spin' },
      { code: 'gsp_slots_4', name: 'GSP Diamond Rush' },
      { code: 'gsp_slots_5', name: 'GSP Golden Goddess' }
    ];
  },
  
  // Get transactions for a player
  getTransactions: async (playerId: string): Promise<Transaction[]> => {
    try {
      const transactions = await transactionService.getTransactions({
        userId: playerId,
        provider: 'GitSlotPark',
        limit: 50
      });
      
      return transactions;
    } catch (error) {
      console.error('Error fetching GitSlotPark transactions:', error);
      throw new Error('Failed to fetch transactions');
    }
  }
};

export default gitSlotParkService;
