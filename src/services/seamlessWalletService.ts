
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

// Constants for wallet operations
const INITIAL_BALANCE = 1000.00;

// Transaction storage (would be a database in production)
let playerBalances: Record<string, number> = {};
let transactions: Transaction[] = [];

// Transaction types based on documentation
export type TransactionType = 'bet' | 'win' | 'rollback' | 'refund';

// Transaction model
export interface Transaction {
  id: string;
  playerId: string;
  gameId?: string;
  roundId?: string;
  providerId?: string;
  type: TransactionType;
  amount: number;
  currency: string;
  balanceBefore: number;
  balanceAfter: number;
  status: 'pending' | 'completed' | 'failed';
  errorCode?: string;
  errorMessage?: string;
  timestamp: string;
  externalId?: string;
}

// Callback request interface
export interface WalletCallbackRequest {
  playerId: string;
  gameId?: string;
  roundId?: string;
  providerId?: string;
  transactionId: string;
  type: TransactionType;
  amount: number;
  currency: string;
}

// Callback response interface
export interface WalletCallbackResponse {
  status: 'success' | 'error';
  balance: number;
  currency: string;
  errorCode?: string;
  errorMessage?: string;
  transactionId?: string;
}

/**
 * Seamless Wallet Service
 * Handles wallet operations for the game aggregator integration
 */
export const seamlessWalletService = {
  /**
   * Process a wallet callback request from a game provider
   */
  processCallback: async (request: WalletCallbackRequest): Promise<WalletCallbackResponse> => {
    console.log(`Processing wallet callback:`, request);
    
    try {
      // Check for duplicate transaction
      const existingTransaction = transactions.find(t => t.externalId === request.transactionId);
      if (existingTransaction) {
        console.log(`Duplicate transaction detected: ${request.transactionId}`);
        return {
          status: 'success',
          balance: existingTransaction.balanceAfter,
          currency: existingTransaction.currency,
          transactionId: existingTransaction.id
        };
      }
      
      // Get or initialize player balance
      const currentBalance = seamlessWalletService.getPlayerBalance(request.playerId);
      let newBalance = currentBalance;
      
      // Create transaction record
      const transactionId = uuidv4();
      const transaction: Transaction = {
        id: transactionId,
        playerId: request.playerId,
        gameId: request.gameId,
        roundId: request.roundId,
        providerId: request.providerId,
        type: request.type,
        amount: request.amount,
        currency: request.currency,
        balanceBefore: currentBalance,
        balanceAfter: currentBalance, // Will be updated
        status: 'pending',
        timestamp: new Date().toISOString(),
        externalId: request.transactionId
      };
      
      // Process based on transaction type
      switch (request.type) {
        case 'bet':
          // Check if player has sufficient balance
          if (currentBalance < request.amount) {
            transaction.status = 'failed';
            transaction.errorCode = 'INSUFFICIENT_FUNDS';
            transaction.errorMessage = 'Insufficient funds for bet';
            
            transactions.push(transaction);
            
            return {
              status: 'error',
              balance: currentBalance,
              currency: request.currency,
              errorCode: 'INSUFFICIENT_FUNDS',
              errorMessage: 'Insufficient funds for bet'
            };
          }
          
          // Process bet
          newBalance = currentBalance - request.amount;
          break;
          
        case 'win':
          // Process win
          newBalance = currentBalance + request.amount;
          break;
          
        case 'rollback':
        case 'refund':
          // Find the original transaction
          const originalTx = transactions.find(t => 
            t.playerId === request.playerId && 
            t.roundId === request.roundId && 
            t.type === 'bet'
          );
          
          if (!originalTx) {
            transaction.status = 'failed';
            transaction.errorCode = 'ORIGINAL_TX_NOT_FOUND';
            transaction.errorMessage = 'Original transaction not found';
            
            transactions.push(transaction);
            
            return {
              status: 'error',
              balance: currentBalance,
              currency: request.currency,
              errorCode: 'ORIGINAL_TX_NOT_FOUND',
              errorMessage: 'Original transaction not found'
            };
          }
          
          // Process rollback/refund by reversing the original transaction
          newBalance = currentBalance + originalTx.amount;
          break;
          
        default:
          transaction.status = 'failed';
          transaction.errorCode = 'INVALID_TRANSACTION_TYPE';
          transaction.errorMessage = 'Invalid transaction type';
          
          transactions.push(transaction);
          
          return {
            status: 'error',
            balance: currentBalance,
            currency: request.currency,
            errorCode: 'INVALID_TRANSACTION_TYPE',
            errorMessage: 'Invalid transaction type'
          };
      }
      
      // Update player balance
      playerBalances[request.playerId] = newBalance;
      
      // Update and store transaction
      transaction.status = 'completed';
      transaction.balanceAfter = newBalance;
      transactions.push(transaction);
      
      // Return successful response
      return {
        status: 'success',
        balance: newBalance,
        currency: request.currency,
        transactionId
      };
    } catch (error: any) {
      console.error(`Error processing wallet callback:`, error);
      
      // Create failed transaction record
      const transactionId = uuidv4();
      transactions.push({
        id: transactionId,
        playerId: request.playerId,
        gameId: request.gameId,
        roundId: request.roundId,
        providerId: request.providerId,
        type: request.type,
        amount: request.amount,
        currency: request.currency,
        balanceBefore: seamlessWalletService.getPlayerBalance(request.playerId),
        balanceAfter: seamlessWalletService.getPlayerBalance(request.playerId),
        status: 'failed',
        errorCode: 'INTERNAL_ERROR',
        errorMessage: error.message || 'Unknown error',
        timestamp: new Date().toISOString(),
        externalId: request.transactionId
      });
      
      return {
        status: 'error',
        balance: seamlessWalletService.getPlayerBalance(request.playerId),
        currency: request.currency,
        errorCode: 'INTERNAL_ERROR',
        errorMessage: error.message || 'Unknown error'
      };
    }
  },
  
  /**
   * Get player balance
   */
  getPlayerBalance: (playerId: string): number => {
    // Get or initialize player balance
    if (typeof playerBalances[playerId] === 'undefined') {
      playerBalances[playerId] = INITIAL_BALANCE;
    }
    
    return playerBalances[playerId];
  },
  
  /**
   * Get player transactions
   */
  getPlayerTransactions: (playerId: string): Transaction[] => {
    return transactions.filter(t => t.playerId === playerId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },
  
  /**
   * Manually deposit funds to player account
   */
  deposit: (playerId: string, amount: number, currency: string = 'USD'): boolean => {
    if (amount <= 0) {
      toast.error("Deposit amount must be greater than 0");
      return false;
    }
    
    // Get current balance
    const currentBalance = seamlessWalletService.getPlayerBalance(playerId);
    const newBalance = currentBalance + amount;
    
    // Update balance
    playerBalances[playerId] = newBalance;
    
    // Record transaction
    transactions.push({
      id: uuidv4(),
      playerId,
      type: 'win', // Using 'win' type for deposits
      amount,
      currency,
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
      status: 'completed',
      timestamp: new Date().toISOString()
    });
    
    toast.success(`Deposited ${amount} ${currency} successfully`);
    return true;
  },
  
  /**
   * Manually withdraw funds from player account
   */
  withdraw: (playerId: string, amount: number, currency: string = 'USD'): boolean => {
    if (amount <= 0) {
      toast.error("Withdrawal amount must be greater than 0");
      return false;
    }
    
    // Get current balance
    const currentBalance = seamlessWalletService.getPlayerBalance(playerId);
    
    // Check if player has sufficient balance
    if (currentBalance < amount) {
      toast.error("Insufficient funds for withdrawal");
      return false;
    }
    
    const newBalance = currentBalance - amount;
    
    // Update balance
    playerBalances[playerId] = newBalance;
    
    // Record transaction
    transactions.push({
      id: uuidv4(),
      playerId,
      type: 'bet', // Using 'bet' type for withdrawals
      amount,
      currency,
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
      status: 'completed',
      timestamp: new Date().toISOString()
    });
    
    toast.success(`Withdrawn ${amount} ${currency} successfully`);
    return true;
  },
  
  /**
   * Reset a player's wallet (for testing)
   */
  resetWallet: (playerId: string): void => {
    playerBalances[playerId] = INITIAL_BALANCE;
    transactions = transactions.filter(t => t.playerId !== playerId);
    toast.success(`Wallet reset to ${INITIAL_BALANCE}`);
  }
};

export default seamlessWalletService;
