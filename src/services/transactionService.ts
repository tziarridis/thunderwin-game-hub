
import { Transaction, User, OxaPayWallet } from "@/types";
import { toast } from "sonner";
import { oxapayService } from "./oxapayService";

// Helper to simulate API delay
const simulateApiDelay = () => new Promise(resolve => setTimeout(resolve, 300));

export const transactionService = {
  getTransactions: async (): Promise<Transaction[]> => {
    await simulateApiDelay();
    try {
      return JSON.parse(localStorage.getItem('transactions') || '[]');
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transactions");
      return [];
    }
  },
  
  getUserTransactions: async (userId: string): Promise<Transaction[]> => {
    await simulateApiDelay();
    try {
      const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      return transactions.filter((t: Transaction) => t.userId === userId);
    } catch (error) {
      console.error("Error fetching user transactions:", error);
      toast.error("Failed to load transactions");
      return [];
    }
  },
  
  addTransaction: async (transaction: Omit<Transaction, 'id' | 'date'>): Promise<Transaction> => {
    await simulateApiDelay();
    try {
      const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      const newId = `TRX-${10000 + transactions.length + 1}`;
      
      const newTransaction = {
        ...transaction,
        id: newId,
        date: new Date().toISOString()
      };
      
      localStorage.setItem('transactions', JSON.stringify([...transactions, newTransaction]));
      
      // Update user balance
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: User) => u.id === transaction.userId);
      
      if (userIndex !== -1) {
        const user = users[userIndex];
        
        if (transaction.type === 'deposit' && transaction.status === 'completed') {
          user.balance += transaction.amount;
        } else if (transaction.type === 'withdraw' && transaction.status === 'completed') {
          user.balance -= transaction.amount;
        } else if (transaction.type === 'bet') {
          user.balance -= transaction.amount;
        } else if (transaction.type === 'win') {
          user.balance += transaction.amount;
        }
        
        users[userIndex] = user;
        localStorage.setItem('users', JSON.stringify(users));
      }
      
      toast.success("Transaction completed successfully");
      
      return newTransaction;
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Failed to process transaction");
      throw error;
    }
  },
  
  // Create a cryptocurrency deposit with OxaPay
  createCryptoDeposit: async (
    userId: string, 
    userName: string,
    amount: number, 
    currency: string = "USDT",
    email?: string
  ): Promise<OxaPayWallet | null> => {
    try {
      const orderId = `ORD-${Date.now()}`;
      
      // Create wallet using OxaPay service
      const wallet = await oxapayService.createWallet(
        amount,
        currency,
        orderId,
        email,
        `Deposit ${amount} ${currency} for user ${userName}`
      );
      
      if (!wallet) {
        throw new Error("Failed to create cryptocurrency wallet");
      }
      
      // Create a pending transaction
      const transaction: Omit<Transaction, 'id' | 'date'> = {
        userId,
        userName,
        type: 'deposit',
        amount,
        currency,
        status: 'pending',
        method: `Cryptocurrency (${currency})`,
      };
      
      await transactionService.addTransaction(transaction);
      
      // Store the wallet information for tracking
      const oxaWallets = JSON.parse(localStorage.getItem('oxapay_wallets') || '[]');
      oxaWallets.push({
        ...wallet,
        userId,
        orderId
      });
      localStorage.setItem('oxapay_wallets', JSON.stringify(oxaWallets));
      
      return wallet;
    } catch (error) {
      console.error("Error creating crypto deposit:", error);
      toast.error("Failed to initiate cryptocurrency deposit");
      return null;
    }
  },
  
  // Process a completed cryptocurrency deposit
  processCryptoDeposit: async (walletId: string): Promise<boolean> => {
    try {
      // Get the wallet
      const oxaWallets = JSON.parse(localStorage.getItem('oxapay_wallets') || '[]');
      const walletIndex = oxaWallets.findIndex((w: any) => w.id === walletId);
      
      if (walletIndex === -1) {
        throw new Error("Wallet not found");
      }
      
      const wallet = oxaWallets[walletIndex];
      
      // Check wallet status with OxaPay
      const status = await oxapayService.checkWalletStatus(walletId);
      
      if (status === 'completed') {
        // Update wallet status
        oxaWallets[walletIndex].status = 'completed';
        localStorage.setItem('oxapay_wallets', JSON.stringify(oxaWallets));
        
        // Update transaction status
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const pendingTransactions = transactions.filter((t: Transaction) => 
          t.userId === wallet.userId && 
          t.amount === wallet.amount &&
          t.status === 'pending' &&
          t.type === 'deposit'
        );
        
        if (pendingTransactions.length > 0) {
          const transactionIndex = transactions.findIndex((t: Transaction) => t.id === pendingTransactions[0].id);
          transactions[transactionIndex].status = 'completed';
          localStorage.setItem('transactions', JSON.stringify(transactions));
          
          // Update user balance
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const userIndex = users.findIndex((u: User) => u.id === wallet.userId);
          
          if (userIndex !== -1) {
            users[userIndex].balance += wallet.amount;
            localStorage.setItem('users', JSON.stringify(users));
          }
          
          toast.success(`Deposit of ${wallet.amount} ${wallet.currency} completed successfully`);
        }
        
        return true;
      } else if (status === 'expired') {
        // Update wallet status
        oxaWallets[walletIndex].status = 'expired';
        localStorage.setItem('oxapay_wallets', JSON.stringify(oxaWallets));
        
        // Update transaction status
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const pendingTransactions = transactions.filter((t: Transaction) => 
          t.userId === wallet.userId && 
          t.amount === wallet.amount &&
          t.status === 'pending' &&
          t.type === 'deposit'
        );
        
        if (pendingTransactions.length > 0) {
          const transactionIndex = transactions.findIndex((t: Transaction) => t.id === pendingTransactions[0].id);
          transactions[transactionIndex].status = 'failed';
          localStorage.setItem('transactions', JSON.stringify(transactions));
          
          toast.error(`Deposit of ${wallet.amount} ${wallet.currency} has expired`);
        }
        
        return false;
      }
      
      return false;
    } catch (error) {
      console.error("Error processing crypto deposit:", error);
      toast.error("Failed to process cryptocurrency deposit");
      return false;
    }
  }
};

export default transactionService;
