
import { toast } from "sonner";

interface CreateWalletRequest {
  merchant_id: string;
  amount: number;
  currency: string;
  callback_url: string;
  order_id: string;
  customer_email?: string;
  description?: string;
  expiration_time?: number;
}

interface OxaPayWallet {
  id: string;
  address: string;
  created_at: string;
  status: string;
  amount: number;
  currency: string;
  paid_amount: number;
  expiration_time: string;
}

interface OxaPayResponse {
  result: string;
  message: string;
  data?: any;
}

export const oxapayService = {
  // API base URL
  baseUrl: "https://api.oxapay.com/",
  
  // Sample merchant ID for development
  merchantId: "your-merchant-id", // Replace with your actual merchant ID in production
  
  // Create a cryptocurrency wallet for a deposit
  createWallet: async (
    amount: number, 
    currency: string,
    orderId: string,
    customerEmail?: string,
    description?: string
  ): Promise<OxaPayWallet | null> => {
    try {
      const callbackUrl = `${window.location.origin}/payment/callback`;
      
      const requestData: CreateWalletRequest = {
        merchant_id: oxapayService.merchantId,
        amount,
        currency,
        callback_url: callbackUrl,
        order_id: orderId,
        customer_email: customerEmail,
        description: description || `Deposit ${amount} ${currency}`,
        expiration_time: 3600 // 1 hour expiration
      };
      
      // In development mode, mock the API call
      if (process.env.NODE_ENV === 'development') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock response
        const mockWallet: OxaPayWallet = {
          id: `wallet_${Date.now()}`,
          address: `${currency.toLowerCase()}_mock_address_${Math.random().toString(36).substring(7)}`,
          created_at: new Date().toISOString(),
          status: "waiting",
          amount: amount,
          currency: currency,
          paid_amount: 0,
          expiration_time: new Date(Date.now() + 3600 * 1000).toISOString()
        };
        
        // Store in localStorage for development
        const wallets = JSON.parse(localStorage.getItem('oxapay_wallets') || '[]');
        wallets.push(mockWallet);
        localStorage.setItem('oxapay_wallets', JSON.stringify(wallets));
        
        return mockWallet;
      }
      
      // In production, make the actual API call
      const response = await fetch(`${oxapayService.baseUrl}/create-static-wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      const responseData: OxaPayResponse = await response.json();
      
      if (responseData.result === 'success' && responseData.data) {
        return responseData.data as OxaPayWallet;
      } else {
        throw new Error(responseData.message || 'Failed to create wallet');
      }
    } catch (error) {
      console.error('Error creating OxaPay wallet:', error);
      toast.error('Failed to create cryptocurrency wallet');
      return null;
    }
  },
  
  // Check the status of a wallet
  checkWalletStatus: async (walletId: string): Promise<string | null> => {
    try {
      // In development mode, mock the API call
      if (process.env.NODE_ENV === 'development') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get mock wallets from localStorage
        const wallets = JSON.parse(localStorage.getItem('oxapay_wallets') || '[]');
        const wallet = wallets.find((w: OxaPayWallet) => w.id === walletId);
        
        if (!wallet) {
          return 'not_found';
        }
        
        return wallet.status;
      }
      
      // In production, make the actual API call
      const response = await fetch(`${oxapayService.baseUrl}/check-static-wallet-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          merchant_id: oxapayService.merchantId,
          wallet_id: walletId
        })
      });
      
      const responseData: OxaPayResponse = await response.json();
      
      if (responseData.result === 'success' && responseData.data) {
        return responseData.data.status;
      } else {
        throw new Error(responseData.message || 'Failed to check wallet status');
      }
    } catch (error) {
      console.error('Error checking OxaPay wallet status:', error);
      toast.error('Failed to check payment status');
      return null;
    }
  },
  
  // Process a completed payment
  processCompletedPayment: async (walletId: string, userId: string, userName: string) => {
    try {
      // In development mode, simulate payment processing
      if (process.env.NODE_ENV === 'development') {
        // Get mock wallets from localStorage
        const wallets = JSON.parse(localStorage.getItem('oxapay_wallets') || '[]');
        const walletIndex = wallets.findIndex((w: OxaPayWallet) => w.id === walletId);
        
        if (walletIndex === -1) {
          throw new Error('Wallet not found');
        }
        
        // Update wallet status
        wallets[walletIndex].status = 'completed';
        wallets[walletIndex].paid_amount = wallets[walletIndex].amount;
        localStorage.setItem('oxapay_wallets', JSON.stringify(wallets));
        
        // Add transaction to transaction history
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const newTransaction = {
          id: `TRX-${10000 + transactions.length + 1}`,
          userId: userId,
          userName: userName,
          type: 'deposit',
          amount: wallets[walletIndex].amount,
          currency: wallets[walletIndex].currency,
          status: 'completed',
          method: `Cryptocurrency (${wallets[walletIndex].currency})`,
          date: new Date().toISOString()
        };
        
        transactions.push(newTransaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        // Update user balance
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex((u: any) => u.id === userId);
        
        if (userIndex !== -1) {
          users[userIndex].balance += wallets[walletIndex].amount;
          localStorage.setItem('users', JSON.stringify(users));
        }
        
        return true;
      }
      
      // In production, you would verify the payment with OxaPay's API
      // and then update your own database accordingly
      
      return true;
    } catch (error) {
      console.error('Error processing OxaPay payment:', error);
      toast.error('Failed to process payment');
      return false;
    }
  },
  
  // Get supported currencies
  getSupportedCurrencies: async (): Promise<string[]> => {
    // For now, return commonly supported cryptocurrencies
    return ['BTC', 'ETH', 'USDT', 'LTC', 'DOGE'];
  }
};

export default oxapayService;
