
import { toast } from "sonner";
import { User } from "@/types";
import { oxapayService } from "./oxapayService";

interface DepositOptions {
  userId: string;
  amount: number;
  method: string;
  currency?: string;
  redirectUrl?: string;
}

interface WithdrawalOptions {
  userId: string;
  amount: number;
  method: string;
  address?: string;
  currency?: string;
}

export const paymentService = {
  /**
   * Process a deposit to a user's account
   */
  processDeposit: async (options: DepositOptions): Promise<boolean> => {
    try {
      console.log("Processing deposit:", options);
      
      const { userId, amount, method, currency = "EUR", redirectUrl } = options;
      
      // Retrieve user data
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const userIndex = users.findIndex((u: User) => u.id === userId);
      
      if (userIndex === -1) {
        throw new Error("User not found");
      }
      
      // Create transaction record
      const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
      const transactionId = `TX-${Date.now()}`;
      
      let paymentUrl = "";
      
      // Handle different payment methods
      switch (method) {
        case "card":
          // For demo, we automatically approve card payments
          users[userIndex].balance += amount;
          localStorage.setItem("users", JSON.stringify(users));
          
          transactions.push({
            id: transactionId,
            userId,
            type: "deposit",
            method: "Credit Card",
            amount,
            currency,
            status: "completed",
            timestamp: new Date().toISOString()
          });
          
          localStorage.setItem("transactions", JSON.stringify(transactions));
          return true;
          
        case "crypto":
          // Use OxaPay for crypto payments
          const wallet = await oxapayService.createWallet(
            amount,
            currency,
            transactionId,
            users[userIndex].email
          );
          
          if (!wallet) {
            throw new Error("Failed to create crypto wallet");
          }
          
          // Save pending transaction
          transactions.push({
            id: transactionId,
            userId,
            type: "deposit",
            method: `Cryptocurrency (${currency})`,
            amount,
            currency,
            status: "pending",
            walletId: wallet.id,
            address: wallet.address,
            timestamp: new Date().toISOString()
          });
          
          localStorage.setItem("transactions", JSON.stringify(transactions));
          
          // Return crypto payment URL if needed
          paymentUrl = `/payment/crypto?wallet=${wallet.id}`;
          
          if (redirectUrl) {
            window.location.href = paymentUrl;
          }
          
          return true;
          
        default:
          throw new Error(`Unsupported payment method: ${method}`);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(`Payment failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      return false;
    }
  },
  
  /**
   * Process a withdrawal from a user's account
   */
  processWithdrawal: async (options: WithdrawalOptions): Promise<boolean> => {
    try {
      console.log("Processing withdrawal:", options);
      
      const { userId, amount, method, address, currency = "EUR" } = options;
      
      // Retrieve user data
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const userIndex = users.findIndex((u: User) => u.id === userId);
      
      if (userIndex === -1) {
        throw new Error("User not found");
      }
      
      // Check sufficient balance
      if (users[userIndex].balance < amount) {
        throw new Error("Insufficient balance");
      }
      
      // Create transaction record
      const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
      const transactionId = `TX-${Date.now()}`;
      
      // Update user balance
      users[userIndex].balance -= amount;
      localStorage.setItem("users", JSON.stringify(users));
      
      // Save transaction
      transactions.push({
        id: transactionId,
        userId,
        type: "withdrawal",
        method,
        amount,
        currency,
        address: address || "N/A",
        status: "pending", // Withdrawals typically need manual approval
        timestamp: new Date().toISOString()
      });
      
      localStorage.setItem("transactions", JSON.stringify(transactions));
      
      toast.success("Withdrawal request submitted successfully");
      return true;
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast.error(`Withdrawal failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      return false;
    }
  },
  
  /**
   * Get transaction history for a user
   */
  getTransactionHistory: (userId: string) => {
    const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
    return transactions.filter((t: any) => t.userId === userId)
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
};

export default paymentService;
