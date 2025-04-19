
import { query, transaction } from './databaseService';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { TRANSACTION_STATUSES } from '@/constants/integrationsData';

// Wallet response interface
export interface WalletResponse {
  status: number;
  balance?: number;
  transactionId?: string;
  message?: string;
}

// Interface for wallet operation request
export interface WalletRequest {
  playerId: string;
  amount?: number;
  currency?: string;
  gameId?: string;
  providerId?: number;
  transactionId?: string;
  roundId?: string;
  type: 'balance' | 'bet' | 'win' | 'refund' | 'rollback' | 'bonus';
}

/**
 * Seamless Wallet Service
 * Handles wallet operations for game providers using seamless integration
 */
export const seamlessWalletService = {
  /**
   * Get player wallet
   * @param playerId The player ID
   * @param currency The currency code
   * @returns The wallet or null if not found
   */
  getWallet: async (playerId: string, currency: string = 'USD') => {
    try {
      const walletResult = await query(
        'SELECT * FROM player_wallets WHERE player_id = ? AND currency = ? LIMIT 1',
        [playerId, currency]
      );
      
      // If wallet exists, return it
      if (walletResult && walletResult.length > 0) {
        return walletResult[0];
      }
      
      // Create a new wallet if not found
      return await seamlessWalletService.createWallet(playerId, currency);
    } catch (error: any) {
      console.error('Error getting wallet:', error);
      return null;
    }
  },
  
  /**
   * Create a new wallet for player
   * @param playerId The player ID
   * @param currency The currency
   * @param initialBalance Optional initial balance
   * @returns The created wallet
   */
  createWallet: async (playerId: string, currency: string = 'USD', initialBalance: number = 1000.00) => {
    try {
      const newWallet = {
        player_id: playerId,
        currency,
        balance: initialBalance,
        bonus_balance: 0,
        is_locked: 0,
        created_at: new Date().toISOString()
      };
      
      const result = await query(
        `INSERT INTO player_wallets (player_id, currency, balance, bonus_balance, is_locked, created_at) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [newWallet.player_id, newWallet.currency, newWallet.balance, newWallet.bonus_balance, newWallet.is_locked, newWallet.created_at]
      );
      
      if (result && result.insertId) {
        return { 
          id: result.insertId, 
          ...newWallet 
        };
      }
      
      return null;
    } catch (error: any) {
      console.error('Error creating wallet:', error);
      
      // If wallet already exists (duplicate key), try to get it
      if (error.code === 'ER_DUP_ENTRY') {
        return await seamlessWalletService.getWallet(playerId, currency);
      }
      
      return null;
    }
  },
  
  /**
   * Get player balance
   * @param walletRequest The wallet request
   * @returns Wallet response with balance
   */
  getBalance: async (walletRequest: WalletRequest): Promise<WalletResponse> => {
    try {
      const { playerId, currency = 'USD' } = walletRequest;
      
      const wallet = await seamlessWalletService.getWallet(playerId, currency);
      
      if (!wallet) {
        return { 
          status: 5, // Player not found
          message: 'Player wallet not found'
        };
      }
      
      return {
        status: 0, // Success
        balance: parseFloat(wallet.balance),
        message: 'Success'
      };
    } catch (error: any) {
      console.error('Error getting balance:', error);
      return { 
        status: 1, // Generic error
        message: `Error getting balance: ${error.message}`
      };
    }
  },
  
  /**
   * Process a bet transaction
   * @param walletRequest The bet request
   * @returns Wallet response
   */
  processBet: async (walletRequest: WalletRequest): Promise<WalletResponse> => {
    const { 
      playerId, 
      amount = 0, 
      currency = 'USD', 
      gameId = '', 
      providerId = 0,
      transactionId = uuidv4(), 
      roundId = uuidv4(),
      type = 'bet'
    } = walletRequest;
    
    // Check for valid amount
    if (amount <= 0) {
      return { 
        status: 2, // Invalid request
        message: 'Bet amount must be greater than zero'
      };
    }
    
    try {
      // Get database connection for transaction
      const conn = await query('START TRANSACTION');
      
      try {
        // Check for duplicate transaction
        const existingTx = await query(
          'SELECT * FROM transactions WHERE transaction_id = ? LIMIT 1',
          [transactionId]
        );
        
        if (existingTx && existingTx.length > 0) {
          await query('ROLLBACK');
          return { 
            status: 6, // Duplicate transaction
            transactionId,
            message: 'Transaction already processed'
          };
        }
        
        // Get wallet with row lock for update
        const wallet = await query(
          'SELECT * FROM player_wallets WHERE player_id = ? AND currency = ? FOR UPDATE',
          [playerId, currency]
        );
        
        if (!wallet || wallet.length === 0) {
          await query('ROLLBACK');
          return { 
            status: 5, // Player not found
            message: 'Player wallet not found'
          };
        }
        
        const playerWallet = wallet[0];
        
        // Check if wallet is locked
        if (playerWallet.is_locked) {
          await query('ROLLBACK');
          return { 
            status: 1, // Generic error
            message: 'Wallet is locked'
          };
        }
        
        // Check for sufficient funds
        const walletBalance = parseFloat(playerWallet.balance);
        
        if (walletBalance < amount) {
          await query('ROLLBACK');
          return { 
            status: 3, // Insufficient funds
            balance: walletBalance,
            message: 'Insufficient funds'
          };
        }
        
        // Calculate new balance
        const newBalance = walletBalance - amount;
        
        // Update wallet
        await query(
          'UPDATE player_wallets SET balance = ?, last_transaction_id = ?, updated_at = ? WHERE id = ?',
          [newBalance, transactionId, new Date().toISOString(), playerWallet.id]
        );
        
        // Record transaction
        await query(
          `INSERT INTO transactions 
           (player_id, transaction_id, round_id, game_id, provider_id, type, amount, currency, before_balance, after_balance, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            playerId, 
            transactionId, 
            roundId, 
            gameId, 
            providerId, 
            type, 
            amount, 
            currency, 
            walletBalance, 
            newBalance, 
            0, // Success status
            new Date().toISOString()
          ]
        );
        
        // Commit transaction
        await query('COMMIT');
        
        return {
          status: 0, // Success
          balance: newBalance,
          transactionId,
          message: 'Bet placed successfully'
        };
      } catch (error) {
        // Rollback on error
        await query('ROLLBACK');
        throw error;
      }
    } catch (error: any) {
      console.error('Error processing bet:', error);
      return { 
        status: 1, // Generic error
        message: `Error processing bet: ${error.message}`
      };
    }
  },
  
  /**
   * Process a win transaction
   * @param walletRequest The win request
   * @returns Wallet response
   */
  processWin: async (walletRequest: WalletRequest): Promise<WalletResponse> => {
    const { 
      playerId, 
      amount = 0, 
      currency = 'USD', 
      gameId = '', 
      providerId = 0,
      transactionId = uuidv4(), 
      roundId = uuidv4(),
      type = 'win'
    } = walletRequest;
    
    // Check for valid amount
    if (amount < 0) {
      return { 
        status: 2, // Invalid request
        message: 'Win amount cannot be negative'
      };
    }
    
    try {
      // Get database connection for transaction
      const conn = await query('START TRANSACTION');
      
      try {
        // Check for duplicate transaction
        const existingTx = await query(
          'SELECT * FROM transactions WHERE transaction_id = ? LIMIT 1',
          [transactionId]
        );
        
        if (existingTx && existingTx.length > 0) {
          await query('ROLLBACK');
          return { 
            status: 6, // Duplicate transaction
            transactionId,
            message: 'Transaction already processed'
          };
        }
        
        // Get wallet with row lock for update
        const wallet = await query(
          'SELECT * FROM player_wallets WHERE player_id = ? AND currency = ? FOR UPDATE',
          [playerId, currency]
        );
        
        if (!wallet || wallet.length === 0) {
          await query('ROLLBACK');
          return { 
            status: 5, // Player not found
            message: 'Player wallet not found'
          };
        }
        
        const playerWallet = wallet[0];
        
        // Check if wallet is locked
        if (playerWallet.is_locked) {
          await query('ROLLBACK');
          return { 
            status: 1, // Generic error
            message: 'Wallet is locked'
          };
        }
        
        // Calculate new balance
        const walletBalance = parseFloat(playerWallet.balance);
        const newBalance = walletBalance + amount;
        
        // Update wallet
        await query(
          'UPDATE player_wallets SET balance = ?, last_transaction_id = ?, updated_at = ? WHERE id = ?',
          [newBalance, transactionId, new Date().toISOString(), playerWallet.id]
        );
        
        // Record transaction
        await query(
          `INSERT INTO transactions 
           (player_id, transaction_id, round_id, game_id, provider_id, type, amount, currency, before_balance, after_balance, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            playerId, 
            transactionId, 
            roundId, 
            gameId, 
            providerId, 
            type, 
            amount, 
            currency, 
            walletBalance, 
            newBalance, 
            0, // Success status
            new Date().toISOString()
          ]
        );
        
        // Commit transaction
        await query('COMMIT');
        
        return {
          status: 0, // Success
          balance: newBalance,
          transactionId,
          message: 'Win processed successfully'
        };
      } catch (error) {
        // Rollback on error
        await query('ROLLBACK');
        throw error;
      }
    } catch (error: any) {
      console.error('Error processing win:', error);
      return { 
        status: 1, // Generic error
        message: `Error processing win: ${error.message}`
      };
    }
  },
  
  /**
   * Process a refund transaction
   * @param walletRequest The refund request
   * @returns Wallet response
   */
  processRefund: async (walletRequest: WalletRequest): Promise<WalletResponse> => {
    const { 
      playerId, 
      amount = 0, 
      currency = 'USD', 
      gameId = '', 
      providerId = 0,
      transactionId = uuidv4(), 
      roundId = uuidv4(),
      type = 'refund'
    } = walletRequest;
    
    // Check for valid amount
    if (amount <= 0) {
      return { 
        status: 2, // Invalid request
        message: 'Refund amount must be greater than zero'
      };
    }
    
    try {
      // Get database connection for transaction
      const conn = await query('START TRANSACTION');
      
      try {
        // Check for duplicate transaction
        const existingTx = await query(
          'SELECT * FROM transactions WHERE transaction_id = ? LIMIT 1',
          [transactionId]
        );
        
        if (existingTx && existingTx.length > 0) {
          await query('ROLLBACK');
          return { 
            status: 6, // Duplicate transaction
            transactionId,
            message: 'Transaction already processed'
          };
        }
        
        // Get wallet with row lock for update
        const wallet = await query(
          'SELECT * FROM player_wallets WHERE player_id = ? AND currency = ? FOR UPDATE',
          [playerId, currency]
        );
        
        if (!wallet || wallet.length === 0) {
          await query('ROLLBACK');
          return { 
            status: 5, // Player not found
            message: 'Player wallet not found'
          };
        }
        
        const playerWallet = wallet[0];
        
        // Check if wallet is locked
        if (playerWallet.is_locked) {
          await query('ROLLBACK');
          return { 
            status: 1, // Generic error
            message: 'Wallet is locked'
          };
        }
        
        // Calculate new balance
        const walletBalance = parseFloat(playerWallet.balance);
        const newBalance = walletBalance + amount;
        
        // Update wallet
        await query(
          'UPDATE player_wallets SET balance = ?, last_transaction_id = ?, updated_at = ? WHERE id = ?',
          [newBalance, transactionId, new Date().toISOString(), playerWallet.id]
        );
        
        // Record transaction
        await query(
          `INSERT INTO transactions 
           (player_id, transaction_id, round_id, game_id, provider_id, type, amount, currency, before_balance, after_balance, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            playerId, 
            transactionId, 
            roundId, 
            gameId, 
            providerId, 
            type, 
            amount, 
            currency, 
            walletBalance, 
            newBalance, 
            0, // Success status
            new Date().toISOString()
          ]
        );
        
        // Commit transaction
        await query('COMMIT');
        
        return {
          status: 0, // Success
          balance: newBalance,
          transactionId,
          message: 'Refund processed successfully'
        };
      } catch (error) {
        // Rollback on error
        await query('ROLLBACK');
        throw error;
      }
    } catch (error: any) {
      console.error('Error processing refund:', error);
      return { 
        status: 1, // Generic error
        message: `Error processing refund: ${error.message}`
      };
    }
  },
  
  /**
   * Process a rollback transaction
   * @param walletRequest The rollback request
   * @returns Wallet response
   */
  processRollback: async (walletRequest: WalletRequest): Promise<WalletResponse> => {
    const { 
      playerId, 
      currency = 'USD',
      transactionId = ''
    } = walletRequest;
    
    if (!transactionId) {
      return { 
        status: 2, // Invalid request
        message: 'Original transaction ID is required for rollback'
      };
    }
    
    try {
      // Get database connection for transaction
      const conn = await query('START TRANSACTION');
      
      try {
        // Find the original transaction
        const originalTx = await query(
          'SELECT * FROM transactions WHERE transaction_id = ? LIMIT 1',
          [transactionId]
        );
        
        if (!originalTx || originalTx.length === 0) {
          await query('ROLLBACK');
          return { 
            status: 4, // Transaction not found
            message: 'Original transaction not found'
          };
        }
        
        const txToRollback = originalTx[0];
        
        // Check if already rolled back
        const rollbackCheck = await query(
          `SELECT * FROM transactions 
           WHERE type = 'rollback' AND transaction_id = ? LIMIT 1`,
          [`rollback_${transactionId}`]
        );
        
        if (rollbackCheck && rollbackCheck.length > 0) {
          await query('ROLLBACK');
          return { 
            status: 6, // Duplicate transaction
            message: 'Transaction already rolled back'
          };
        }
        
        // Get wallet with row lock for update
        const wallet = await query(
          'SELECT * FROM player_wallets WHERE player_id = ? AND currency = ? FOR UPDATE',
          [playerId, currency]
        );
        
        if (!wallet || wallet.length === 0) {
          await query('ROLLBACK');
          return { 
            status: 5, // Player not found
            message: 'Player wallet not found'
          };
        }
        
        const playerWallet = wallet[0];
        
        // Check if wallet is locked
        if (playerWallet.is_locked) {
          await query('ROLLBACK');
          return { 
            status: 1, // Generic error
            message: 'Wallet is locked'
          };
        }
        
        // Determine amount to adjust
        // If original was bet, add amount back
        // If original was win, subtract amount
        const walletBalance = parseFloat(playerWallet.balance);
        let newBalance = walletBalance;
        
        if (txToRollback.type === 'bet') {
          // Return the bet amount back to player
          newBalance = walletBalance + parseFloat(txToRollback.amount);
        } else if (txToRollback.type === 'win') {
          // Deduct the win amount
          newBalance = walletBalance - parseFloat(txToRollback.amount);
          
          // Check if balance would go negative
          if (newBalance < 0) {
            await query('ROLLBACK');
            return { 
              status: 3, // Insufficient funds
              balance: walletBalance,
              message: 'Insufficient funds for win rollback'
            };
          }
        }
        
        // Update wallet
        await query(
          'UPDATE player_wallets SET balance = ?, last_transaction_id = ?, updated_at = ? WHERE id = ?',
          [newBalance, `rollback_${transactionId}`, new Date().toISOString(), playerWallet.id]
        );
        
        // Record rollback transaction
        await query(
          `INSERT INTO transactions 
           (player_id, transaction_id, round_id, game_id, provider_id, type, amount, currency, before_balance, after_balance, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            playerId, 
            `rollback_${transactionId}`, 
            txToRollback.round_id, 
            txToRollback.game_id, 
            txToRollback.provider_id, 
            'rollback', 
            txToRollback.amount, 
            currency, 
            walletBalance, 
            newBalance, 
            0, // Success status
            new Date().toISOString()
          ]
        );
        
        // Commit transaction
        await query('COMMIT');
        
        return {
          status: 0, // Success
          balance: newBalance,
          transactionId: `rollback_${transactionId}`,
          message: 'Transaction rolled back successfully'
        };
      } catch (error) {
        // Rollback on error
        await query('ROLLBACK');
        throw error;
      }
    } catch (error: any) {
      console.error('Error processing rollback:', error);
      return { 
        status: 1, // Generic error
        message: `Error processing rollback: ${error.message}`
      };
    }
  },
  
  /**
   * Process a wallet callback from a game provider
   * @param provider The provider code
   * @param requestData The callback request data
   * @returns The callback response
   */
  processCallback: async (provider: string, requestData: any) => {
    try {
      console.log(`Processing ${provider} callback:`, requestData);
      
      // Normalize provider to lowercase
      const providerCode = provider.toLowerCase();
      
      // Handle different providers' callback formats
      switch (providerCode) {
        case 'pp':
        case 'pragmatic':
          return await seamlessWalletService.processPragmaticCallback(requestData);
          
        case 'gsp':
        case 'gitslotpark':
          return await seamlessWalletService.processGitSlotParkCallback(requestData);
          
        case 'aggregator':
          return await seamlessWalletService.processGenericCallback(requestData);
          
        default:
          return {
            status: 1,
            message: `Unsupported provider: ${provider}`
          };
      }
    } catch (error: any) {
      console.error(`Error processing ${provider} callback:`, error);
      return { 
        status: 1, // Generic error
        error: error.message || 'Unknown error'
      };
    }
  },
  
  /**
   * Process Pragmatic Play callback
   * @param requestData The callback request data
   * @returns The callback response
   */
  processPragmaticCallback: async (requestData: any) => {
    try {
      const { 
        agentid, 
        playerid, 
        amount, 
        type, 
        trxid, 
        roundid, 
        gameref 
      } = requestData;
      
      // Basic validation
      if (!playerid || !trxid) {
        return { errorcode: "2", balance: 0 }; // Invalid request
      }
      
      // Get provider ID from agent ID
      const providerId = 1; // Default to 1 for PP
      
      // Process based on type
      let response: WalletResponse;
      
      if (type === undefined) {
        // If no type, assume balance request
        response = await seamlessWalletService.getBalance({
          playerId: playerid,
          type: 'balance'
        });
      } else if (type === 'debit') {
        // Process as bet
        response = await seamlessWalletService.processBet({
          playerId: playerid,
          amount: parseFloat(amount),
          transactionId: trxid,
          roundId: roundid,
          gameId: gameref || '',
          providerId,
          type: 'bet'
        });
      } else if (type === 'credit') {
        // Process as win
        response = await seamlessWalletService.processWin({
          playerId: playerid,
          amount: parseFloat(amount),
          transactionId: trxid,
          roundId: roundid,
          gameId: gameref || '',
          providerId,
          type: 'win'
        });
      } else {
        return { errorcode: "2", balance: 0 }; // Invalid type
      }
      
      // Map our response to PP response format
      return {
        errorcode: response.status.toString(),
        balance: response.balance || 0
      };
    } catch (error: any) {
      console.error('Error processing Pragmatic Play callback:', error);
      return { errorcode: "1", balance: 0 }; // Generic error
    }
  },
  
  /**
   * Process GitSlotPark callback
   * @param requestData The callback request data
   * @returns The callback response
   */
  processGitSlotParkCallback: async (requestData: any) => {
    try {
      const { 
        user_id, 
        game_id, 
        action, 
        transaction_id, 
        round_id, 
        amount 
      } = requestData;
      
      // Basic validation
      if (!user_id || !transaction_id) {
        return { 
          status: 2, // Invalid request
          message: 'Missing required parameters'
        };
      }
      
      // Get provider ID
      const providerId = 2; // Default to 2 for GSP
      
      // Process based on action
      let response: WalletResponse;
      
      if (action === 'balance') {
        response = await seamlessWalletService.getBalance({
          playerId: user_id,
          type: 'balance'
        });
      } else if (action === 'bet') {
        response = await seamlessWalletService.processBet({
          playerId: user_id,
          amount: parseFloat(amount),
          transactionId: transaction_id,
          roundId: round_id,
          gameId: game_id,
          providerId,
          type: 'bet'
        });
      } else if (action === 'win') {
        response = await seamlessWalletService.processWin({
          playerId: user_id,
          amount: parseFloat(amount),
          transactionId: transaction_id,
          roundId: round_id,
          gameId: game_id,
          providerId,
          type: 'win'
        });
      } else if (action === 'refund') {
        response = await seamlessWalletService.processRefund({
          playerId: user_id,
          amount: parseFloat(amount),
          transactionId: transaction_id,
          roundId: round_id,
          gameId: game_id,
          providerId,
          type: 'refund'
        });
      } else if (action === 'rollback') {
        response = await seamlessWalletService.processRollback({
          playerId: user_id,
          transactionId: transaction_id,
          type: 'rollback'
        });
      } else {
        return { 
          status: 2, // Invalid request
          message: 'Invalid action'
        };
      }
      
      // Map to GSP response format
      return {
        status: response.status,
        balance: response.balance || 0,
        transaction_id: response.transactionId || transaction_id,
        message: response.message || ''
      };
    } catch (error: any) {
      console.error('Error processing GitSlotPark callback:', error);
      return { 
        status: 1, // Generic error
        message: error.message || 'Unknown error'
      };
    }
  },
  
  /**
   * Process generic callback in our standardized format
   * @param requestData The callback request data
   * @returns The callback response
   */
  processGenericCallback: async (requestData: any) => {
    try {
      const { 
        player_id, 
        game_id, 
        provider_id,
        action, 
        transaction_id, 
        round_id, 
        amount,
        currency = 'USD'
      } = requestData;
      
      // Basic validation
      if (!player_id) {
        return { 
          status: 2, // Invalid request
          message: 'Missing player ID'
        };
      }
      
      // Process based on action
      let response: WalletResponse;
      
      if (action === 'balance') {
        response = await seamlessWalletService.getBalance({
          playerId: player_id,
          currency,
          type: 'balance'
        });
      } else if (action === 'bet') {
        if (!transaction_id || !amount) {
          return { 
            status: 2, // Invalid request
            message: 'Missing required parameters for bet'
          };
        }
        
        response = await seamlessWalletService.processBet({
          playerId: player_id,
          amount: parseFloat(amount),
          currency,
          transactionId: transaction_id,
          roundId: round_id || uuidv4(),
          gameId: game_id || '',
          providerId: provider_id || 0,
          type: 'bet'
        });
      } else if (action === 'win') {
        if (!transaction_id || amount === undefined) {
          return { 
            status: 2, // Invalid request
            message: 'Missing required parameters for win'
          };
        }
        
        response = await seamlessWalletService.processWin({
          playerId: player_id,
          amount: parseFloat(amount),
          currency,
          transactionId: transaction_id,
          roundId: round_id || uuidv4(),
          gameId: game_id || '',
          providerId: provider_id || 0,
          type: 'win'
        });
      } else if (action === 'refund') {
        if (!transaction_id || !amount) {
          return { 
            status: 2, // Invalid request
            message: 'Missing required parameters for refund'
          };
        }
        
        response = await seamlessWalletService.processRefund({
          playerId: player_id,
          amount: parseFloat(amount),
          currency,
          transactionId: transaction_id,
          roundId: round_id || uuidv4(),
          gameId: game_id || '',
          providerId: provider_id || 0,
          type: 'refund'
        });
      } else if (action === 'rollback') {
        if (!transaction_id) {
          return { 
            status: 2, // Invalid request
            message: 'Missing transaction ID for rollback'
          };
        }
        
        response = await seamlessWalletService.processRollback({
          playerId: player_id,
          currency,
          transactionId: transaction_id,
          type: 'rollback'
        });
      } else {
        return { 
          status: 2, // Invalid request
          message: 'Invalid or missing action'
        };
      }
      
      // Return standardized response
      return {
        status: response.status,
        balance: response.balance,
        transaction_id: response.transactionId || transaction_id,
        message: response.message || TRANSACTION_STATUSES.find(s => s.code === response.status)?.description || 'Unknown status'
      };
    } catch (error: any) {
      console.error('Error processing generic callback:', error);
      return { 
        status: 1, // Generic error
        message: error.message || 'Unknown error'
      };
    }
  }
};

export default seamlessWalletService;
