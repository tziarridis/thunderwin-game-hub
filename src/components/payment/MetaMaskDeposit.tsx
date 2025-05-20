
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { transactionService } from '@/services/transactionService';
import { Transaction, TransactionStatus, TransactionType } from '@/types/transaction';
import { walletService } from '@/services/walletService'; // Assuming walletService exists
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Replace with your actual contract ABI and address
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];
const YOUR_TOKEN_CONTRACT_ADDRESS = 'YOUR_TOKEN_CONTRACT_ADDRESS_HERE'; // e.g., USDT, USDC on chosen network
const YOUR_RECEIVING_WALLET_ADDRESS = 'YOUR_CASINO_RECEIVING_WALLET_ADDRESS_HERE';

const MetaMaskDeposit: React.FC = () => {
  const { user } = useAuth();
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [tokenSymbol, setTokenSymbol] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(web3Provider);
    } else {
      toast.error('MetaMask is not installed. Please install it to use this feature.');
    }
  }, []);

  const connectWallet = async () => {
    if (!provider) {
      toast.error('MetaMask provider not available.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await provider.send('eth_requestAccounts', []);
      const currentSigner = provider.getSigner();
      setSigner(currentSigner);
      const currentAccount = await currentSigner.getAddress();
      setAccount(currentAccount);

      // Get token info (assuming a specific token for deposit)
      if (YOUR_TOKEN_CONTRACT_ADDRESS !== 'YOUR_TOKEN_CONTRACT_ADDRESS_HERE') {
        const tokenContract = new ethers.Contract(YOUR_TOKEN_CONTRACT_ADDRESS, ERC20_ABI, provider);
        const symbol = await tokenContract.symbol();
        setTokenSymbol(symbol);
        const userBalance = await tokenContract.balanceOf(currentAccount);
        const decimals = await tokenContract.decimals();
        setBalance(ethers.utils.formatUnits(userBalance, decimals));
      } else {
        // Fallback to native currency if no token address
        const nativeBalance = await provider.getBalance(currentAccount);
        setBalance(ethers.utils.formatEther(nativeBalance));
        setTokenSymbol('ETH'); // Or the native symbol of the network
      }

      toast.success(`Wallet connected: ${currentAccount.substring(0, 6)}...${currentAccount.substring(currentAccount.length - 4)}`);
    } catch (err: any) {
      console.error('Failed to connect wallet:', err);
      setError(err.message || 'Failed to connect wallet.');
      toast.error(err.message || 'Failed to connect wallet.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!provider || !signer || !account || !user) {
      toast.error('Please connect your wallet and ensure you are logged in.');
      return;
    }
    if (parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }
     if (YOUR_TOKEN_CONTRACT_ADDRESS === 'YOUR_TOKEN_CONTRACT_ADDRESS_HERE' || YOUR_RECEIVING_WALLET_ADDRESS === 'YOUR_CASINO_RECEIVING_WALLET_ADDRESS_HERE') {
      toast.error('Contract or receiving wallet address not configured by admin.');
      setError('Deposit functionality is not fully configured. Please contact support.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTransactionHash(null);

    try {
      const tokenContract = new ethers.Contract(YOUR_TOKEN_CONTRACT_ADDRESS, ERC20_ABI, signer);
      const decimals = await tokenContract.decimals();
      const amountToSend = ethers.utils.parseUnits(amount, decimals);

      // Check allowance
      const allowance = await tokenContract.allowance(account, YOUR_RECEIVING_WALLET_ADDRESS); // Incorrect: allowance should be for casino's spender contract if it's pulling
                                                                                             // For direct transfer, allowance isn't needed FROM user TO casino_wallet
                                                                                             // If casino uses a smart contract to manage deposits, then user approves casino's SC.
                                                                                             // Here, we assume direct transfer user -> casino_wallet
      
      // Direct transfer to casino's wallet
      const tx = await tokenContract.transfer(YOUR_RECEIVING_WALLET_ADDRESS, amountToSend);
      
      toast.info('Processing transaction... Please wait for confirmation.');
      setTransactionHash(tx.hash);
      
      await tx.wait(); // Wait for transaction to be mined

      // Record transaction in your backend
      const transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'balance_after' | 'balance_before'> = {
        user_id: user.id,
        amount: parseFloat(amount),
        currency: tokenSymbol,
        type: 'deposit' as TransactionType,
        status: 'completed' as TransactionStatus, // Or 'pending' until confirmed by your backend listeners
        provider: 'metamask_erc20',
        provider_transaction_id: tx.hash,
        metadata: { 
          from_address: account, 
          to_address: YOUR_RECEIVING_WALLET_ADDRESS,
          token_contract: YOUR_TOKEN_CONTRACT_ADDRESS
        },
      };
      const createdTransaction = await transactionService.createTransaction(transactionData);
      
      // Update user's wallet balance in your system
      await walletService.credit(user.id, parseFloat(amount), tokenSymbol, `Metamask deposit: ${tx.hash}`);

      toast.success(`Deposit of ${amount} ${tokenSymbol} successful! Transaction: ${tx.hash.substring(0,10)}...`);
      setAmount(''); // Reset amount
      // Re-fetch balance
      const userBalance = await tokenContract.balanceOf(account);
      setBalance(ethers.utils.formatUnits(userBalance, decimals));

    } catch (err: any) {
      console.error('Deposit failed:', err);
      setError(err.reason || err.message || 'Deposit failed.');
      toast.error(err.reason || err.message || 'Deposit failed.');
      // Optionally, if transaction was sent but failed confirmation, mark as failed in DB
      if (transactionHash && user) {
         // This part needs careful implementation: Find the pending tx and update its status
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Deposit with MetaMask</CardTitle>
        <CardDescription>
          Connect your MetaMask wallet to deposit {tokenSymbol || 'crypto'}.
          {YOUR_TOKEN_CONTRACT_ADDRESS === 'YOUR_TOKEN_CONTRACT_ADDRESS_HERE' && (
            <p className="text-yellow-500 text-xs mt-1">Note: Token contract address is not configured. Deposits may not work.</p>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!account ? (
          <Button onClick={connectWallet} disabled={isLoading || !provider} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Connect MetaMask
          </Button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm">Connected: <span className="font-mono bg-muted px-1 py-0.5 rounded">{account.substring(0, 6)}...{account.substring(account.length - 4)}</span></p>
            <p className="text-sm">Your Balance: <span className="font-semibold">{parseFloat(balance).toFixed(4)} {tokenSymbol}</span></p>
            <div>
              <Label htmlFor="amount">Amount to Deposit ({tokenSymbol})</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Enter amount in ${tokenSymbol}`}
                disabled={isLoading}
              />
            </div>
          </div>
        )}
      </CardContent>
      {account && (
        <CardFooter className="flex flex-col items-stretch space-y-2">
            <Button onClick={handleDeposit} disabled={isLoading || !amount || parseFloat(amount) <= 0 || YOUR_TOKEN_CONTRACT_ADDRESS === 'YOUR_TOKEN_CONTRACT_ADDRESS_HERE' || YOUR_RECEIVING_WALLET_ADDRESS === 'YOUR_CASINO_RECEIVING_WALLET_ADDRESS_HERE'}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Deposit {amount} {tokenSymbol}
          </Button>
        </CardFooter>
      )}
      {transactionHash && (
        <div className="p-4 mt-4 bg-green-50 dark:bg-green-900/30 rounded-md text-green-700 dark:text-green-300">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <p className="text-sm">
              Transaction Sent! Hash: 
              <a 
                href={`https://etherscan.io/tx/${transactionHash}`} // Replace with relevant block explorer
                target="_blank" 
                rel="noopener noreferrer"
                className="font-mono underline ml-1 hover:text-green-500"
              >
                {transactionHash.substring(0,10)}...
              </a>
            </p>
          </div>
        </div>
      )}
      {error && (
        <div className="p-4 mt-4 bg-red-50 dark:bg-red-900/30 rounded-md text-red-700 dark:text-red-400">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default MetaMaskDeposit;
