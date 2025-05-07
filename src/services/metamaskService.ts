// metamaskService.ts
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import { toast } from 'sonner';
import { walletService } from './walletService';

interface TransactionParams {
  from: string;
  to: string;
  gas: string;
  gasPrice: string;
  value: string;
  data: string;
}

const contractABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "tokenAddress",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transferAnyERC20Token",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "tokenAddress",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transferERC20TokenFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "tokenAddress",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transferERC20Token",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const metamaskService = {
  async isMetamaskInstalled(): Promise<boolean> {
    const provider = await detectEthereumProvider();
    return !!provider;
  },

  async connectMetamask(): Promise<string[]> {
    try {
      const provider = await detectEthereumProvider();

      if (!provider) {
        toast.error('Metamask not detected. Please install Metamask.');
        return [];
      }

      const web3 = new Web3(provider as any);
      const accounts = await web3.eth.requestAccounts();

      if (accounts.length === 0) {
        toast.error('No accounts found. Please create or import an account.');
        return [];
      }

      return accounts;
    } catch (error: any) {
      console.error("Error connecting to Metamask:", error);
      toast.error(error.message || 'Failed to connect to Metamask.');
      return [];
    }
  },

  async getAccountBalance(account: string): Promise<string> {
    try {
      const provider = await detectEthereumProvider();

      if (!provider) {
        toast.error('Metamask not detected. Please install Metamask.');
        return '0';
      }

      const web3 = new Web3(provider as any);
      const balance = await web3.eth.getBalance(account);
      return web3.utils.fromWei(balance, 'ether');
    } catch (error: any) {
      console.error("Error getting account balance:", error);
      toast.error(error.message || 'Failed to get account balance.');
      return '0';
    }
  },

  async depositFromMetamask(userId: string, amount: number): Promise<boolean> {
    try {
      const provider = await detectEthereumProvider();

      if (!provider) {
        toast.error('Metamask not detected. Please install Metamask.');
        return false;
      }

      const web3 = new Web3(provider as any);
      const accounts = await web3.eth.getAccounts();

      if (accounts.length === 0) {
        toast.error('No accounts found. Please connect to Metamask.');
        return false;
      }

      const account = accounts[0];
      const amountWei = web3.utils.toWei(amount.toString(), 'ether');

      const transactionParams: TransactionParams = {
        from: account,
        to: account, // Replace with your deposit address
        gas: '21000',
        gasPrice: '8000000000',
        value: amountWei,
        data: '0x'
      };

      const transactionHash = await web3.eth.sendTransaction(transactionParams);
      console.log('Deposit transaction successful with hash:', transactionHash);

      toast.success(`Deposit transaction sent! Hash: ${transactionHash}`);

      // Update user's balance in your database
      await walletService.updateWalletBalance(userId, amount, 'deposit');

      return true;
    } catch (error: any) {
      console.error("Error depositing from Metamask:", error);
      toast.error(error.message || 'Failed to deposit from Metamask.');
      return false;
    }
  },

  async transferERC20(tokenAddress: string, toAddress: string, amount: number): Promise<string | null> {
    try {
      const provider = await detectEthereumProvider();
      if (!provider) {
        toast.error('Metamask not detected. Please install Metamask.');
        return null;
      }

      const web3 = new Web3(provider as any);
      const accounts = await web3.eth.getAccounts();
      if (accounts.length === 0) {
        toast.error('No accounts found. Please connect to Metamask.');
        return null;
      }

      const fromAddress = accounts[0];
      const tokenContract = new web3.eth.Contract(contractABI as any, tokenAddress);

      // Convert the amount to the smallest unit of the token (e.g., Wei for Ether)
      const amountInSmallestUnit = web3.utils.toWei(amount.toString(), 'ether');

      // Call the transfer function on the contract
      const transaction = await tokenContract.methods.transfer(toAddress, amountInSmallestUnit).send({ from: fromAddress });

      toast.success(`Transaction successful! Hash: ${transaction.transactionHash}`);
      return transaction.transactionHash;
    } catch (error: any) {
      console.error("Error transferring ERC20 token:", error);
      toast.error(error.message || 'Failed to transfer ERC20 token.');
      return null;
    }
  },

  async transferAnyERC20Token(tokenAddress: string, to: string, amount: number): Promise<boolean> {
    try {
      const provider = await detectEthereumProvider();
      if (!provider) {
        toast.error('Metamask not detected. Please install Metamask.');
        return false;
      }

      const web3 = new Web3(provider as any);
      const accounts = await web3.eth.getAccounts();
      if (accounts.length === 0) {
        toast.error('No accounts found. Please connect to Metamask.');
        return false;
      }

      const from = accounts[0];
      if (!contractAddress) {
        toast.error('Contract address is not set.');
        return false;
      }
      const contract = new web3.eth.Contract(contractABI as any, contractAddress);
      const amountInWei = web3.utils.toWei(amount.toString(), 'ether');

      // Call the transferAnyERC20Token function on the contract
      await contract.methods.transferAnyERC20Token(tokenAddress, to, amountInWei).send({ from: from });

      toast.success('Token transfer transaction submitted successfully!');
      return true;
    } catch (error: any) {
      console.error("Error transferring ERC20 token:", error);
      toast.error(error.message || 'Failed to transfer ERC20 token.');
      return false;
    }
  },

  async transferERC20TokenFrom(tokenAddress: string, from: string, to: string, amount: number): Promise<boolean> {
    try {
      const provider = await detectEthereumProvider();
      if (!provider) {
        toast.error('Metamask not detected. Please install Metamask.');
        return false;
      }

      const web3 = new Web3(provider as any);
      const accounts = await web3.eth.getAccounts();
      if (accounts.length === 0) {
        toast.error('No accounts found. Please connect to Metamask.');
        return false;
      }

      const sender = accounts[0];
      if (!contractAddress) {
        toast.error('Contract address is not set.');
        return false;
      }
      const contract = new web3.eth.Contract(contractABI as any, contractAddress);
      const amountInWei = web3.utils.toWei(amount.toString(), 'ether');

      // Call the transferERC20TokenFrom function on the contract
      await contract.methods.transferERC20TokenFrom(tokenAddress, from, to, amountInWei).send({ from: sender });

      toast.success('Token transfer transaction submitted successfully!');
      return true;
    } catch (error: any) {
      console.error("Error transferring ERC20 token:", error);
      toast.error(error.message || 'Failed to transfer ERC20 token.');
      return false;
    }
  },

  async transferERC20Token(tokenAddress: string, from: string, to: string, amount: number): Promise<boolean> {
    try {
      const provider = await detectEthereumProvider();
      if (!provider) {
        toast.error('Metamask not detected. Please install Metamask.');
        return false;
      }

      const web3 = new Web3(provider as any);
      const accounts = await web3.eth.getAccounts();
      if (accounts.length === 0) {
        toast.error('No accounts found. Please connect to Metamask.');
        return false;
      }

      const sender = accounts[0];
      if (!contractAddress) {
        toast.error('Contract address is not set.');
        return false;
      }
      const contract = new web3.eth.Contract(contractABI as any, contractAddress);
      const amountInWei = web3.utils.toWei(amount.toString(), 'ether');

      // Call the transferERC20Token function on the contract
      await contract.methods.transferERC20Token(tokenAddress, from, to, amountInWei).send({ from: sender });

      toast.success('Token transfer transaction submitted successfully!');
      return true;
    } catch (error: any) {
      console.error("Error transferring ERC20 token:", error);
      toast.error(error.message || 'Failed to transfer ERC20 token.');
      return false;
    }
  },
};

export default metamaskService;
