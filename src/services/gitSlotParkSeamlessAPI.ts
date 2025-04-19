import { createTransaction, updateTransaction, getTransactionById, transactionExists } from './transactionService';
import { toast } from "sonner";

// Interface for GitSlotPark transaction request
interface WithdrawRequest {
  agentID: string;
  sign: string;
  userID: string;
  amount: number;
  transactionID: string;
  roundID: string;
  gameID: number;
  freeSpinID?: string;
  isBonusBuy?: number;
}

interface DepositRequest {
  agentID: string;
  sign: string;
  userID: string;
  amount: number;
  refTransactionID: string;
  transactionID: string;
  roundID: string;
  gameID: number;
  freeSpinID?: string;
}

interface RollbackRequest {
  agentID: string;
  sign: string;
  userID: string;
  refTransactionID: string;
  gameID: number;
}

interface SeamlessResponse {
  code: number;
  message: string;
  platformTransactionID?: string;
  balance?: number;
}

// Result codes according to documentation
const RESULT_CODES = {
  SUCCESS: 0,
  GENERAL_ERROR: 1,
  INVALID_PARAMETER: 2,
  USER_NOT_FOUND: 3,
  INSUFFICIENT_FUNDS: 4,
  TRANSACTION_NOT_FOUND: 5,
  INVALID_SIGN: 6,
  TRANSACTION_COMPLETED: 8,
  TRANSACTION_ROLLED_BACK: 9,
  DUPLICATE_TRANSACTION: 11,
  SYSTEM_ERROR: 12
};

// Mock user balances - in a real implementation, this would be in a database
const userBalances: Record<string, number> = {
  'guest': 1000,
  'demo_player': 5000,
  'player1': 2500,
  'Player01': 1000,
  'admin': 10000
};

// Verify signature - in a real implementation, this would check cryptographic signatures
const verifySignature = (sign: string, params: any): boolean => {
  // This is a mock verification - in production, you would implement actual signature verification
  console.log("Verifying signature:", sign, "for params:", params);
  return true; // Always return true for demonstration
};

// Get user balance
const getUserBalance = (userID: string): number => {
  // Return user balance if it exists, or create a new one with 1000 credits
  if (!userBalances[userID]) {
    userBalances[userID] = 1000;
  }
  return userBalances[userID];
};

// Update user balance
const updateUserBalance = (userID: string, amount: number): number => {
  if (!userBalances[userID]) {
    userBalances[userID] = 1000;
  }
  
  userBalances[userID] += amount;
  return userBalances[userID];
};

export const gitSlotParkSeamlessAPI = {
  /**
   * Process a withdraw request (bet/debit)
   * @param request The withdraw request data
   * @returns Response with status code and balance
   */
  withdraw: async (request: WithdrawRequest): Promise<SeamlessResponse> => {
    console.log("GitSlotPark Withdraw request:", request);
    
    try {
      // Verify the signature
      if (!verifySignature(request.sign, request)) {
        return {
          code: RESULT_CODES.INVALID_SIGN,
          message: "Invalid signature"
        };
      }
      
      // Check if user exists
      if (!request.userID) {
        return {
          code: RESULT_CODES.USER_NOT_FOUND,
          message: "User not found"
        };
      }
      
      // Check if transaction already exists
      const existingTransaction = await transactionExists(request.transactionID);
      if (existingTransaction) {
        return {
          code: RESULT_CODES.DUPLICATE_TRANSACTION,
          message: "Transaction already processed",
          platformTransactionID: request.transactionID,
          balance: getUserBalance(request.userID)
        };
      }
      
      // Check if user has sufficient funds
      const currentBalance = getUserBalance(request.userID);
      if (currentBalance < request.amount) {
        return {
          code: RESULT_CODES.INSUFFICIENT_FUNDS,
          message: "Insufficient funds"
        };
      }
      
      // Process the transaction
      const newBalance = updateUserBalance(request.userID, -request.amount);
      
      // Record the transaction
      await createTransaction(
        request.userID,
        request.userID,
        'bet',
        request.amount,
        'EUR',
        'completed',
        'GitSlotPark',
        request.gameID.toString(),
        request.roundID,
        request.transactionID
      );
      
      // Return success response
      return {
        code: RESULT_CODES.SUCCESS,
        message: "",
        platformTransactionID: request.transactionID,
        balance: newBalance
      };
    } catch (error: any) {
      console.error("Error processing withdraw:", error);
      return {
        code: RESULT_CODES.SYSTEM_ERROR,
        message: error.message || "System error"
      };
    }
  },
  
  /**
   * Process a deposit request (win/credit)
   * @param request The deposit request data
   * @returns Response with status code and balance
   */
  deposit: async (request: DepositRequest): Promise<SeamlessResponse> => {
    console.log("GitSlotPark Deposit request:", request);
    
    try {
      // Verify the signature
      if (!verifySignature(request.sign, request)) {
        return {
          code: RESULT_CODES.INVALID_SIGN,
          message: "Invalid signature"
        };
      }
      
      // Check if user exists
      if (!request.userID) {
        return {
          code: RESULT_CODES.USER_NOT_FOUND,
          message: "User not found"
        };
      }
      
      // Check if transaction already exists
      const existingTransaction = await transactionExists(request.transactionID);
      if (existingTransaction) {
        // Return the duplicate transaction response with original balance
        return {
          code: RESULT_CODES.DUPLICATE_TRANSACTION,
          message: "Transaction already processed",
          platformTransactionID: request.transactionID,
          balance: getUserBalance(request.userID)
        };
      }
      
      // Check if reference transaction exists (the original bet)
      if (request.refTransactionID) {
        const refTransaction = await getTransactionById(request.refTransactionID);
        if (!refTransaction) {
          // This is a special case - we still process the win, even if bet isn't found
          console.warn(`Reference transaction ${request.refTransactionID} not found, but continuing`);
        }
      }
      
      // Process the transaction
      const newBalance = updateUserBalance(request.userID, request.amount);
      
      // Record the transaction
      await createTransaction(
        request.userID,
        request.userID,
        'win',
        request.amount,
        'EUR',
        'completed',
        'GitSlotPark',
        request.gameID.toString(),
        request.roundID,
        request.transactionID
      );
      
      // Return success response
      return {
        code: RESULT_CODES.SUCCESS,
        message: "",
        platformTransactionID: request.transactionID,
        balance: newBalance
      };
    } catch (error: any) {
      console.error("Error processing deposit:", error);
      return {
        code: RESULT_CODES.SYSTEM_ERROR,
        message: error.message || "System error"
      };
    }
  },
  
  /**
   * Process a rollback request
   * @param request The rollback request data
   * @returns Response with status code and balance
   */
  rollback: async (request: RollbackRequest): Promise<SeamlessResponse> => {
    console.log("GitSlotPark Rollback request:", request);
    
    try {
      // Verify the signature
      if (!verifySignature(request.sign, request)) {
        return {
          code: RESULT_CODES.INVALID_SIGN,
          message: "Invalid signature"
        };
      }
      
      // Check if user exists
      if (!request.userID) {
        return {
          code: RESULT_CODES.USER_NOT_FOUND,
          message: "User not found"
        };
      }
      
      // Check if the reference transaction exists
      const refTransaction = await getTransactionById(request.refTransactionID);
      if (!refTransaction) {
        return {
          code: RESULT_CODES.TRANSACTION_NOT_FOUND,
          message: "Transaction not found"
        };
      }
      
      // Check if the transaction is already rolled back
      if (refTransaction.status === 'rollback') {
        return {
          code: RESULT_CODES.TRANSACTION_ROLLED_BACK,
          message: "Transaction is already rolled back"
        };
      }
      
      // Process the rollback
      let newBalance;
      
      // If it was a bet, credit the amount back to the user
      if (refTransaction.type === 'bet') {
        newBalance = updateUserBalance(request.userID, refTransaction.amount);
      } 
      // If it was a win, debit the amount from the user
      else if (refTransaction.type === 'win') {
        // Check if user has sufficient funds for the rollback
        const currentBalance = getUserBalance(request.userID);
        if (currentBalance < refTransaction.amount) {
          return {
            code: RESULT_CODES.INSUFFICIENT_FUNDS,
            message: "Insufficient funds for rollback"
          };
        }
        
        newBalance = updateUserBalance(request.userID, -refTransaction.amount);
      } else {
        return {
          code: RESULT_CODES.GENERAL_ERROR,
          message: "Cannot rollback this transaction type"
        };
      }
      
      // Mark original transaction as rolled back
      await updateTransaction(request.refTransactionID, {
        status: 'rollback'
      });
      
      // Create a rollback transaction record
      await createTransaction(
        request.userID,
        request.userID,
        'rollback',
        refTransaction.amount,
        'EUR',
        'completed',
        'GitSlotPark',
        request.gameID.toString(),
        refTransaction.roundId || '',
        `rollback_${request.refTransactionID}`
      );
      
      // Return success response
      return {
        code: RESULT_CODES.SUCCESS,
        message: "",
        platformTransactionID: `rollback_${request.refTransactionID}`,
        balance: newBalance
      };
    } catch (error: any) {
      console.error("Error processing rollback:", error);
      return {
        code: RESULT_CODES.SYSTEM_ERROR,
        message: error.message || "System error"
      };
    }
  },
  
  /**
   * Get user balance
   * @param userID The user ID
   * @returns The user's balance
   */
  getBalance: (userID: string): number => {
    return getUserBalance(userID);
  }
};

export default gitSlotParkSeamlessAPI;
