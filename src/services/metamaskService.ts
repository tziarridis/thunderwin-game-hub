
import { ethers } from "ethers";
import { toast } from "sonner";
import { WalletTransaction } from "@/types/wallet";
import { addTransaction } from "./transactionService";
import { creditWallet } from "./walletService";

export interface MetaMaskTransaction {
  from: string;
  to: string;
  value: string;
  gas?: string;
  gasPrice?: string;
}

/**
 * Service for MetaMask integration and Ethereum transactions
 */
export const metamaskService = {
  /**
   * Check if MetaMask is available in the browser
   */
  isMetaMaskAvailable: (): boolean => {
    return typeof window !== 'undefined' && 
           typeof window.ethereum !== 'undefined' && 
           window.ethereum.isMetaMask === true;
  },

  /**
   * Connect to MetaMask and get user accounts
   */
  connectToMetaMask: async (): Promise<string[]> => {
    try {
      if (!metamaskService.isMetaMaskAvailable()) {
        throw new Error("MetaMask is not installed. Please install MetaMask to continue.");
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      console.log("Connected to MetaMask accounts:", accounts);
      toast.success("Connected to MetaMask successfully");
      
      return accounts;
    } catch (error: any) {
      console.error("Error connecting to MetaMask:", error);
      toast.error(`Failed to connect to MetaMask: ${error.message || "Unknown error"}`);
      throw error;
    }
  },

  /**
   * Get current Ethereum balance for an account
   */
  getBalance: async (address: string): Promise<string> => {
    try {
      const balanceHex = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      
      const balanceInWei = ethers.BigNumber.from(balanceHex);
      const balanceInEth = ethers.utils.formatEther(balanceInWei);
      
      return balanceInEth;
    } catch (error: any) {
      console.error("Error getting balance:", error);
      toast.error(`Failed to get balance: ${error.message || "Unknown error"}`);
      throw error;
    }
  },

  /**
   * Send ETH from user's MetaMask wallet to a recipient address
   */
  sendTransaction: async (
    toAddress: string, 
    amountInEth: number,
    userId: string
  ): Promise<string> => {
    try {
      if (!metamaskService.isMetaMaskAvailable()) {
        throw new Error("MetaMask is not installed");
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const fromAddress = accounts[0];
      
      const amountInWei = ethers.utils.parseEther(amountInEth.toString()).toHexString();
      
      // Prepare transaction parameters
      const transactionParameters = {
        from: fromAddress,
        to: toAddress,
        value: amountInWei,
        gas: '0x5208', // 21000 gas
      };

      // Send transaction
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      console.log('Transaction sent:', txHash);

      // Record the transaction in our system
      await addTransaction({
        userId: userId,
        type: 'deposit',
        amount: amountInEth,
        currency: 'ETH',
        status: 'completed',
        description: `Metamask deposit: ${amountInEth} ETH`,
        referenceId: txHash,
      });
      
      // Credit the user's wallet
      await creditWallet(userId, amountInEth, 'USD', {
        description: `Crypto deposit via MetaMask (${amountInEth} ETH)`,
        referenceId: txHash
      });

      toast.success(`Transaction sent successfully! Amount: ${amountInEth} ETH`);
      
      return txHash;
    } catch (error: any) {
      console.error("Error sending transaction:", error);
      toast.error(`Transaction failed: ${error.message || "Unknown error"}`);
      throw error;
    }
  },

  /**
   * Listen for MetaMask account changes
   */
  listenForAccountChanges: (callback: (accounts: string[]) => void): void => {
    if (metamaskService.isMetaMaskAvailable()) {
      window.ethereum.on('accountsChanged', callback);
    }
  },

  /**
   * Listen for MetaMask chain changes
   */
  listenForChainChanges: (callback: (chainId: string) => void): void => {
    if (metamaskService.isMetaMaskAvailable()) {
      window.ethereum.on('chainChanged', callback);
    }
  }
};

export default metamaskService;
