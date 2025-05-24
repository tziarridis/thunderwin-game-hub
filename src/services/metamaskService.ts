
import { ethers } from "ethers";
import { toast } from "sonner";
import { addTransaction } from "./transactionService";
import { creditWallet } from "./walletService";

// Extend Window interface to include ethereum property
declare global {
  interface Window {
    ethereum?: any;
  }
}

/**
 * Service for MetaMask integration and Ethereum transactions
 */
export class MetaMaskService {
  /**
   * Check if MetaMask is available in the browser
   */
  isMetaMaskAvailable = (): boolean => {
    return typeof window !== 'undefined' && 
           typeof window.ethereum !== 'undefined' && 
           window.ethereum.isMetaMask === true;
  };

  /**
   * Alias for isMetaMaskAvailable for compatibility with existing components
   */
  isMetaMaskInstalled = (): boolean => {
    return this.isMetaMaskAvailable();
  };

  /**
   * Connect to MetaMask and get user accounts
   */
  connectToMetaMask = async (): Promise<string[]> => {
    try {
      if (!this.isMetaMaskAvailable()) {
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
  };

  /**
   * Alias for connectToMetaMask for compatibility with existing components
   */
  requestAccounts = async (): Promise<string[]> => {
    return this.connectToMetaMask();
  };

  /**
   * Get currently connected account (if any)
   */
  getConnectedAccount = async (): Promise<string | null> => {
    try {
      if (!this.isMetaMaskAvailable()) {
        return null;
      }
      
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      return accounts.length > 0 ? accounts[0] : null;
    } catch (error) {
      console.error("Error getting connected account:", error);
      return null;
    }
  };

  /**
   * Get current Ethereum balance for an account
   */
  getBalance = async (address?: string): Promise<number> => {
    try {
      if (!address) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length === 0) {
          throw new Error("No account connected");
        }
        address = accounts[0];
      }
      
      const balanceHex = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      
      const balanceInWei = ethers.BigNumber.from(balanceHex);
      const balanceInEth = parseFloat(ethers.utils.formatEther(balanceInWei));
      
      return balanceInEth;
    } catch (error: any) {
      console.error("Error getting balance:", error);
      toast.error(`Failed to get balance: ${error.message || "Unknown error"}`);
      throw error;
    }
  };

  /**
   * Switch to Ethereum Mainnet
   */
  switchToEthereumMainnet = async (): Promise<void> => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }], // '0x1' is the chainId for Ethereum Mainnet
      });
    } catch (error: any) {
      console.error("Error switching to Ethereum Mainnet:", error);
      toast.error(`Failed to switch network: ${error.message || "Unknown error"}`);
      throw error;
    }
  };

  /**
   * Process a deposit from MetaMask to user's wallet
   */
  processDeposit = async (
    userId: string, 
    ethAmount: number
  ): Promise<boolean> => {
    try {
      // Example recipient address - this should be your platform's wallet
      const toAddress = '0xRecipientAddress';
      
      // Send the transaction
      const txHash = await this.sendTransaction(toAddress, ethAmount, userId);
      
      // If we got here, the transaction was sent successfully
      return !!txHash;
    } catch (error) {
      console.error("Error processing deposit:", error);
      return false;
    }
  };

  /**
   * Send ETH from user's MetaMask wallet to a recipient address
   */
  sendTransaction = async (
    toAddress: string, 
    amountInEth: number,
    userId: string
  ): Promise<string> => {
    try {
      if (!this.isMetaMaskAvailable()) {
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
        user_id: userId,
        player_id: userId,
        type: "deposit",
        amount: amountInEth,
        currency: 'ETH',
        status: 'completed',
        description: `Metamask deposit: ${amountInEth} ETH`,
        reference_id: txHash,
        provider: 'Metamask'
      });
      
      // Credit the user's wallet
      await creditWallet(userId, amountInEth, 'deposit', 'metamask');

      toast.success(`Transaction sent successfully! Amount: ${amountInEth} ETH`);
      
      return txHash;
    } catch (error: any) {
      console.error("Error sending transaction:", error);
      toast.error(`Transaction failed: ${error.message || "Unknown error"}`);
      throw error;
    }
  };

  /**
   * Listen for MetaMask account changes
   */
  listenForAccountChanges = (callback: (accounts: string[]) => void): void => {
    if (this.isMetaMaskAvailable()) {
      window.ethereum.on('accountsChanged', callback);
    }
  };

  /**
   * Listen for MetaMask chain changes
   */
  listenForChainChanges = (callback: (chainId: string) => void): void => {
    if (this.isMetaMaskAvailable()) {
      window.ethereum.on('chainChanged', callback);
    }
  };

  /**
   * Set up all MetaMask event listeners
   */
  setupMetaMaskListeners = (): (() => void) | undefined => {
    if (!this.isMetaMaskAvailable()) {
      return undefined;
    }

    const accountsHandler = (accounts: string[]) => {
      console.log("MetaMask accounts changed:", accounts);
    };

    const chainHandler = (chainId: string) => {
      console.log("MetaMask chain changed:", chainId);
    };

    window.ethereum.on('accountsChanged', accountsHandler);
    window.ethereum.on('chainChanged', chainHandler);

    // Return cleanup function
    return () => {
      window.ethereum.removeListener('accountsChanged', accountsHandler);
      window.ethereum.removeListener('chainChanged', chainHandler);
    };
  };
}

export const metamaskService = new MetaMaskService();
export default metamaskService;
