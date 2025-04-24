
import { pragmaticPlayService, PPWalletCallback } from './pragmaticPlayService';
import { createTransaction, updateTransactionStatus } from '../transactionService';
import { getWalletByUserId, updateWalletBalance } from '../walletService';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

// Store processed transactions to prevent duplicates
const processedTransactions = new Map();

/**
 * Transaction Handler for Pragmatic Play
 */
export const pragmaticPlayTransactionHandler = {
  /**
   * Process a transaction from Pragmatic Play
   * @param config Provider configuration
   * @param data Wallet callback data
   */
  processTransaction: async (config: any, data: PPWalletCallback) => {
    // Check for duplicate transaction
    if (processedTransactions.has(data.trxid)) {
      console.log(`Duplicate PP transaction detected: ${data.trxid}`);
      return processedTransactions.get(data.trxid);
    }
    
    console.log(`Processing PP transaction: ${data.type} ${data.amount} for player ${data.playerid}`);
    
    try {
      // Get player wallet
      const wallet = await getWalletByUserId(data.playerid);
      
      if (!wallet) {
        console.error(`Wallet not found for player: ${data.playerid}`);
        return { errorcode: "1", balance: 0 };
      }
      
      // Calculate new balance based on transaction type
      const currentBalance = wallet.balance || 0;
      let newBalance = currentBalance;
      let transactionType: 'bet' | 'win' | 'deposit' | 'withdraw';
      
      if (data.type === 'debit') {
        // Check if player has sufficient funds
        if (currentBalance < data.amount) {
          console.error(`Insufficient funds: ${currentBalance} < ${data.amount}`);
          return { errorcode: "3", balance: currentBalance }; // Insufficient funds
        }
        
        newBalance = currentBalance - data.amount;
        transactionType = 'bet';
      } else if (data.type === 'credit') {
        newBalance = currentBalance + data.amount;
        transactionType = 'win';
      } else {
        console.error(`Invalid transaction type: ${data.type}`);
        return { errorcode: "1", balance: currentBalance };
      }
      
      // Create transaction record
      const transaction = await createTransaction(
        data.playerid,
        transactionType,
        data.amount,
        data.currency || 'EUR',
        'Pragmatic Play',
        {
          session_id: uuidv4(),
          game_id: data.gameref,
          round_id: data.roundid,
          balance_before: currentBalance,
          balance_after: newBalance
        }
      );
      
      // Update wallet balance
      await updateWalletBalance(data.playerid, newBalance);
      
      // Mark transaction as completed
      if (transaction) {
        await updateTransactionStatus(transaction.id, 'completed', newBalance);
      }
      
      // Store response for idempotency
      const response = { errorcode: "0", balance: newBalance };
      processedTransactions.set(data.trxid, response);
      
      console.log(`PP transaction processed successfully: New balance = ${newBalance}`);
      return response;
    } catch (error: any) {
      console.error(`Error processing PP transaction:`, error);
      toast.error(`Failed to process game transaction: ${error.message || 'Unknown error'}`);
      
      return { 
        errorcode: "1", // General error
        balance: 0 
      };
    }
  }
};

export default pragmaticPlayTransactionHandler;
