import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { transactionService } from '@/services/transactionService'; // Assuming this exists and is typed
import { Transaction, TransactionStatus, TransactionType } from '@/types/transaction'; // Correctly import
import { walletService } from '@/services/walletService'; // Assuming this exists
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
// IMPORTANT: Replace these placeholder values with your actual contract and wallet addresses
const YOUR_TOKEN_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS || 'YOUR_TOKEN_CONTRACT_ADDRESS_HERE'; 
const YOUR_RECEIVING_WALLET_ADDRESS = process.env.NEXT_PUBLIC_RECEIVING_WALLET_ADDRESS || 'YOUR_CASINO_RECEIVING_WALLET_ADDRESS_HERE';


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
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum as any); // Added 'as any' for type compatibility
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

      if (YOUR_TOKEN_CONTRACT_ADDRESS && YOUR_TOKEN_CONTRACT_ADDRESS !== 'YOUR_TOKEN_CONTRACT_ADDRESS_HERE') {
        const tokenContract = new ethers.Contract(YOUR_TOKEN_CONTRACT_ADDRESS, ERC20_ABI, provider);
        const symbol = await tokenContract.symbol();
        setTokenSymbol(symbol);
        const userBalance = await tokenContract.balanceOf(currentAccount);
        const decimals = await tokenContract.decimals();
        setBalance(ethers.utils.formatUnits(userBalance, decimals));
      } else {
        // Fallback to native currency if token address is not set
        const nativeBalance = await provider.getBalance(currentAccount);
        setBalance(ethers.utils.formatEther(nativeBalance));
        setTokenSymbol('ETH'); // Or the native currency symbol of the network (e.g., MATIC)
        if (YOUR_TOKEN_CONTRACT_ADDRESS === 'YOUR_TOKEN_CONTRACT_ADDRESS_HERE') {
             toast.warn('Token contract address not configured. Using native currency (e.g. ETH) balance.');
        }
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
      toast.error('Deposit system not fully configured by admin. Please contact support.');
      setError('Deposit functionality is not configured. This is a placeholder setup.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTransactionHash(null);

    try {
      const tokenContract = new ethers.Contract(YOUR_TOKEN_CONTRACT_ADDRESS, ERC20_ABI, signer);
      const decimals = await tokenContract.decimals();
      const amountToSend = ethers.utils.parseUnits(amount, decimals);
      
      const tx = await tokenContract.transfer(YOUR_RECEIVING_WALLET_ADDRESS, amountToSend);
      
      toast.info('Processing transaction... Please wait for confirmation.');
      setTransactionHash(tx.hash);
      
      const receipt = await tx.wait();
      if (receipt.status === 0) {
        throw new Error("Transaction failed on-chain.");
      }


      const transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'balance_after' | 'balance_before'> = {
        player_id: user.id, // Corrected: player_id instead of user_id for Transaction type
        amount: parseFloat(amount),
        currency: tokenSymbol,
        type: 'deposit' as TransactionType,
        status: 'completed' as TransactionStatus,
        provider: 'metamask_erc20',
        provider_transaction_id: tx.hash,
        metadata: { 
          from_address: account, 
          to_address: YOUR_RECEIVING_WALLET_ADDRESS,
          token_contract: YOUR_TOKEN_CONTRACT_ADDRESS
        },
        // game_id, round_id, session_id are optional and might not apply here
      };
      // Assuming transactionService.createTransaction expects data matching Transaction type (excluding id etc.)
      await transactionService.createTransaction(transactionData as any); // Using 'as any' if exact type match is complex here
      
      // Wallet service update
      if (walletService.updateWalletBalance) { // Ensure updateWalletBalance exists
        await walletService.updateWalletBalance(user.id, parseFloat(amount), tokenSymbol); // Pass tokenSymbol as currency
      } else {
        console.warn("walletService.updateWalletBalance is not available. User balance may not be updated in UI immediately.");
      }


      toast.success(`Deposit of ${amount} ${tokenSymbol} successful! Transaction: ${tx.hash.substring(0,10)}...`);
      setAmount('');
      // Refresh balance
      const userBalance = await tokenContract.balanceOf(account);
      setBalance(ethers.utils.formatUnits(userBalance, decimals));

    } catch (err: any) {
      console.error('Deposit failed:', err);
      const errorMessage = err.reason || err.data?.message || err.message || 'Deposit failed.';
      setError(errorMessage);
      toast.error(errorMessage);
      // Log failed transaction if hash is available
      if (transactionHash && user) {
        try {
            const failedTxData: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'balance_after' | 'balance_before'> = {
                player_id: user.id,
                amount: parseFloat(amount),
                currency: tokenSymbol,
                type: 'deposit' as TransactionType,
                status: 'failed' as TransactionStatus,
                provider: 'metamask_erc20',
                provider_transaction_id: transactionHash,
                metadata: { 
                    error: errorMessage,
                    from_address: account, 
                    to_address: YOUR_RECEIVING_WALLET_ADDRESS,
                    token_contract: YOUR_TOKEN_CONTRACT_ADDRESS
                },
            };
            await transactionService.createTransaction(failedTxData as any);
        } catch (logError: any) {
            console.error("Failed to log failed transaction:", logError);
        }
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
          {(YOUR_TOKEN_CONTRACT_ADDRESS === 'YOUR_TOKEN_CONTRACT_ADDRESS_HERE' || YOUR_RECEIVING_WALLET_ADDRESS === 'YOUR_CASINO_RECEIVING_WALLET_ADDRESS_HERE') && (
            <p className="text-yellow-500 text-xs mt-1">Note: Deposit system not fully configured. This is a placeholder.</p>
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
                min="0" // Basic validation
                step="any" // Allow decimals
              />
            </div>
          </div>
        )}
      </CardContent>
      {account && (
        <CardFooter className="flex flex-col items-stretch space-y-2">
            <Button 
              onClick={handleDeposit} 
              disabled={
                isLoading || 
                !amount || 
                parseFloat(amount) <= 0 || 
                YOUR_TOKEN_CONTRACT_ADDRESS === 'YOUR_TOKEN_CONTRACT_ADDRESS_HERE' || 
                YOUR_RECEIVING_WALLET_ADDRESS === 'YOUR_CASINO_RECEIVING_WALLET_ADDRESS_HERE'
              }
            >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Deposit {amount || 0} {tokenSymbol}
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
                // TODO: Make this link dynamic based on the network (e.g., Etherscan, Polygonscan)
                href={`https://etherscan.io/tx/${transactionHash}`} 
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
