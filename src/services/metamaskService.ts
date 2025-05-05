
import { toast } from "sonner";
import { WalletTransaction } from "@/types/wallet";
import transactionService from "./transactionService";
import { creditWallet } from "./walletService";

interface EthereumWindow extends Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (request: { method: string; params?: any[] }) => Promise<any>;
    on: (event: string, callback: (...args: any[]) => void) => void;
    removeListener: (event: string, callback: (...args: any[]) => void) => void;
    selectedAddress?: string;
    chainId?: string;
  };
}

declare const window: EthereumWindow;

const isMetaMaskInstalled = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof window.ethereum !== 'undefined' && 
         window.ethereum.isMetaMask === true;
};

const requestAccounts = async (): Promise<string[]> => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed. Please install MetaMask to continue.");
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts;
  } catch (error: any) {
    console.error("Error requesting accounts:", error);
    throw new Error(error?.message || "Failed to connect to MetaMask");
  }
};

const getChainId = async (): Promise<string> => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed");
  }

  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return chainId;
  } catch (error) {
    console.error("Error getting chain ID:", error);
    throw error;
  }
};

const switchToEthereumMainnet = async (): Promise<void> => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x1' }], // 0x1 is Ethereum Mainnet
    });
  } catch (error: any) {
    // This error code means the chain has not been added to MetaMask
    if (error.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x1',
            chainName: 'Ethereum Mainnet',
            nativeCurrency: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: ['https://mainnet.infura.io/v3/'],
            blockExplorerUrls: ['https://etherscan.io/'],
          },
        ],
      });
    } else {
      throw error;
    }
  }
};

/**
 * Gets the connected wallet's ETH balance
 * @returns Balance in ETH
 */
const getBalance = async (): Promise<number> => {
  try {
    // Ensure account is connected
    const accounts = await requestAccounts();
    
    if (accounts.length === 0) {
      throw new Error("No connected accounts found");
    }
    
    // Get balance in wei
    const balanceInWei = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [accounts[0], 'latest'],
    });
    
    // Convert from wei to ETH (1 ETH = 10^18 wei)
    const balanceInEth = parseInt(balanceInWei) / 1e18;
    return balanceInEth;
  } catch (error: any) {
    console.error("Error getting ETH balance:", error);
    throw error;
  }
};

/**
 * Send ETH from user's MetaMask wallet to the casino's address
 * @param amount Amount in ETH to deposit
 * @param toAddress Casino's ETH address
 * @param userId User ID in the casino system
 * @returns Transaction hash
 */
const sendTransaction = async (amount: number, toAddress: string, userId: string): Promise<string> => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed");
  }

  try {
    // Ensure user is connected
    const accounts = await requestAccounts();
    if (accounts.length === 0) {
      throw new Error("No accounts found. Please connect to MetaMask.");
    }

    // Convert amount to wei (1 ETH = 10^18 wei)
    const amountInWei = `0x${(amount * 10**18).toString(16)}`;

    const transactionParameters = {
      to: toAddress,
      from: accounts[0],
      value: amountInWei,
    };

    // Send the transaction
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    });

    return txHash;
  } catch (error: any) {
    console.error("Error sending transaction:", error);
    throw new Error(error?.message || "Failed to send transaction");
  }
};

/**
 * Process an ETH deposit to the user's casino wallet
 * @param userId User ID
 * @param ethAmount Amount in ETH
 * @param ethUsdRate Current ETH to USD exchange rate
 * @returns Success status
 */
const processDeposit = async (userId: string, ethAmount: number, ethUsdRate: number = 2000): Promise<boolean> => {
  try {
    // Casino's ETH wallet address - this should be stored securely in production
    const casinoWalletAddress = "0x1234567890123456789012345678901234567890";
    
    // Send ETH transaction via MetaMask
    const txHash = await sendTransaction(ethAmount, casinoWalletAddress, userId);
    
    // Convert ETH to USD for casino wallet
    const usdAmount = ethAmount * ethUsdRate;
    
    // Credit user's wallet with USD equivalent
    const credited = await creditWallet(userId, usdAmount, 'deposit', 'MetaMask');
    
    if (credited) {
      // Add transaction record
      await transactionService.addTransaction({
        userId: userId,
        type: 'deposit',
        amount: usdAmount,
        currency: 'USD',
        status: 'completed',
        description: `MetaMask deposit of ${ethAmount} ETH (${usdAmount} USD)`,
        paymentMethod: 'MetaMask',
        referenceId: txHash
      });
      
      toast.success(`Successfully deposited ${ethAmount} ETH (${usdAmount.toFixed(2)} USD)`);
      return true;
    } else {
      throw new Error("Failed to credit wallet");
    }
  } catch (error: any) {
    console.error("Error processing deposit:", error);
    toast.error(error?.message || "Failed to process deposit");
    return false;
  }
};

// Add event listeners for MetaMask events
const setupMetaMaskListeners = () => {
  if (!isMetaMaskInstalled()) return;

  const handleAccountsChanged = (accounts: string[]) => {
    console.log("MetaMask accounts changed:", accounts);
    if (accounts.length === 0) {
      // User disconnected their wallet
      toast.info("MetaMask wallet disconnected");
    }
  };

  const handleChainChanged = (chainId: string) => {
    console.log("MetaMask chain changed:", chainId);
    // Reload the page when chain changes
    window.location.reload();
  };

  const handleConnect = (connectInfo: { chainId: string }) => {
    console.log("MetaMask connected:", connectInfo);
    toast.success("MetaMask connected successfully");
  };

  const handleDisconnect = (error: { code: number; message: string }) => {
    console.log("MetaMask disconnected:", error);
    toast.error("MetaMask disconnected");
  };

  // Add event listeners
  window.ethereum.on('accountsChanged', handleAccountsChanged);
  window.ethereum.on('chainChanged', handleChainChanged);
  window.ethereum.on('connect', handleConnect);
  window.ethereum.on('disconnect', handleDisconnect);

  // Return a cleanup function
  return () => {
    window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    window.ethereum.removeListener('chainChanged', handleChainChanged);
    window.ethereum.removeListener('connect', handleConnect);
    window.ethereum.removeListener('disconnect', handleDisconnect);
  };
};

const getConnectedAccount = async (): Promise<string | null> => {
  try {
    if (!isMetaMaskInstalled()) return null;
    
    const accounts = await requestAccounts();
    return accounts.length > 0 ? accounts[0] : null;
  } catch {
    return null;
  }
};

export const metamaskService = {
  isMetaMaskInstalled,
  requestAccounts,
  getChainId,
  switchToEthereumMainnet,
  sendTransaction,
  processDeposit,
  setupMetaMaskListeners,
  getBalance,
  getConnectedAccount
};

export default metamaskService;
