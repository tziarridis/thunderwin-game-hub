
import { ethers } from 'ethers';
import { toast } from 'sonner';

// Declare MetaMask window type
declare global {
  interface Window {
    ethereum?: ethers.providers.ExternalProvider;
  }
}

export const metamaskService = {
  isInstalled: (): boolean => {
    return window.ethereum !== undefined;
  },
  
  // Added aliases for compatibility with existing code
  isMetaMaskAvailable: (): boolean => {
    return window.ethereum !== undefined;
  },
  
  async connectWallet(): Promise<string | null> {
    try {
      if (!this.isInstalled()) {
        toast.error('MetaMask is not installed. Please install MetaMask to continue.');
        window.open('https://metamask.io/download.html', '_blank');
        return null;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum!);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      
      toast.success('MetaMask connected successfully!');
      return address;
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast.error(error.message || 'Failed to connect MetaMask wallet');
      return null;
    }
  },

  // Alias for compatibility
  connectToMetaMask(): Promise<string | null> {
    return this.connectWallet();
  },
  
  // Alias for compatibility
  requestAccounts(): Promise<string | null> {
    return this.connectWallet();
  },
  
  // Added for compatibility with existing code
  async getConnectedAccount(): Promise<string | null> {
    try {
      if (!this.isInstalled()) return null;
      
      const provider = new ethers.providers.Web3Provider(window.ethereum!);
      const accounts = await provider.listAccounts();
      
      if (accounts.length > 0) {
        return accounts[0];
      }
      return null;
    } catch (error) {
      console.error('Error getting connected account:', error);
      return null;
    }
  },

  async getBalance(address: string): Promise<string | null> {
    try {
      if (!address) return null;
      
      const provider = new ethers.providers.Web3Provider(window.ethereum!);
      const balance = await provider.getBalance(address);
      const etherBalance = ethers.utils.formatEther(balance);
      
      return parseFloat(etherBalance).toFixed(4);
    } catch (error) {
      console.error('Error getting balance:', error);
      return null;
    }
  },

  async sendTransaction(toAddress: string, amount: string, options?: any): Promise<boolean> {
    try {
      if (!this.isInstalled()) {
        toast.error('MetaMask is not installed');
        return false;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum!);
      const signer = provider.getSigner();
      
      const tx = await signer.sendTransaction({
        to: toAddress,
        value: ethers.utils.parseEther(amount),
        ...(options || {})
      });
      
      toast.success('Transaction sent! Waiting for confirmation...');
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        toast.success('Transaction confirmed!');
        return true;
      } else {
        toast.error('Transaction failed!');
        return false;
      }
    } catch (error: any) {
      console.error('Transaction error:', error);
      toast.error(error.message || 'Transaction failed');
      return false;
    }
  },
  
  // Added for compatibility with existing code
  setupMetaMaskListeners(callback: () => void): void {
    if (!this.isInstalled()) return;
    
    const ethereum = window.ethereum;
    if (!ethereum) return;
    
    // Add listeners for account changes
    ethereum.on?.('accountsChanged', () => {
      if (callback) callback();
    });
    
    ethereum.on?.('chainChanged', () => {
      if (callback) callback();
    });
  },
  
  // Added for compatibility with existing code
  async switchToEthereumMainnet(): Promise<boolean> {
    try {
      if (!this.isInstalled()) return false;
      
      const provider = new ethers.providers.Web3Provider(window.ethereum!);
      
      await provider.send('wallet_switchEthereumChain', [
        { chainId: '0x1' }, // Ethereum Mainnet
      ]);
      
      return true;
    } catch (error) {
      console.error('Error switching network:', error);
      return false;
    }
  }
};

export default metamaskService;
