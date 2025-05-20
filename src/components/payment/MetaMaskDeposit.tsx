
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertTriangle, ExternalLink, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
// import { paymentService } from '@/services/paymentService'; // Assuming a payment service exists
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface MetaMaskDepositProps {
  onDepositSuccess?: (transactionHash: string, amount: string) => void;
  targetAddress: string; // Casino's wallet address to receive deposits
  minDepositAmount?: number; // Minimum deposit amount in ETH
}

const MetaMaskDeposit: React.FC<MetaMaskDepositProps> = ({
  onDepositSuccess,
  targetAddress,
  minDepositAmount = 0.01,
}) => {
  const { user } = useAuth();
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (window.ethereum && window.ethereum.selectedAddress) {
      setAccount(window.ethereum.selectedAddress);
      fetchBalance(window.ethereum.selectedAddress);
    }

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setAccount(null);
        setBalance(null);
        toast.info('MetaMask account disconnected.');
      } else {
        setAccount(accounts[0]);
        fetchBalance(accounts[0]);
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const fetchBalance = async (address: string) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const weiBalance = await provider.getBalance(address);
      setBalance(ethers.utils.formatEther(weiBalance));
    } catch (err) {
      console.error('Error fetching balance:', err);
      toast.error('Could not fetch MetaMask balance.');
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install MetaMask and try again.');
      toast.error('MetaMask not detected.');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      fetchBalance(accounts[0]);
      toast.success('MetaMask connected successfully!');
    } catch (err: any) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet. Please try again.');
      toast.error(err.message || 'Failed to connect wallet.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!account || !user) {
      setError('Please connect your wallet and ensure you are logged in.');
      toast.error('Wallet not connected or user not logged in.');
      return;
    }
    if (parseFloat(amount) < minDepositAmount) {
      setError(`Minimum deposit amount is ${minDepositAmount} ETH.`);
      toast.error(`Minimum deposit amount is ${minDepositAmount} ETH.`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setTransactionHash(null);

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tx = {
        to: targetAddress,
        value: ethers.utils.parseEther(amount),
      };
      const transactionResponse = await signer.sendTransaction(tx);
      setTransactionHash(transactionResponse.hash);
      toast.info(`Transaction submitted: ${transactionResponse.hash.substring(0,10)}... Awaiting confirmation.`);


      // --- Record transaction in Supabase (pending state) ---
      const newTransaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'| 'balance_before' | 'balance_after'> = {
        user_id: user.id,
        amount: parseFloat(amount),
        currency: 'ETH',
        type: 'deposit',
        status: 'pending',
        provider: 'MetaMask',
        payment_method_details: { transactionHash: transactionResponse.hash, fromAddress: account, toAddress: targetAddress },
        notes: `MetaMask deposit initiated. TxHash: ${transactionResponse.hash}`,
        metadata: { provider_transaction_id: transactionResponse.hash }
      };
      const { error: dbError } = await supabase.from('transactions').insert(newTransaction);
      if (dbError) throw new Error(`DB Error (pending): ${dbError.message}`);
      // --- End record transaction (pending) ---


      await transactionResponse.wait(); // Wait for transaction to be mined

       // --- Update transaction in Supabase (completed state) ---
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ status: 'completed', notes: `MetaMask deposit confirmed. TxHash: ${transactionResponse.hash}` })
        .eq('metadata->>provider_transaction_id', transactionResponse.hash) // Ensure you have a way to identify this tx
        .eq('user_id', user.id);
      
      if (updateError) throw new Error(`DB Error (completed): ${updateError.message}`);
      // --- End update transaction (completed) ---

      // Ideally, call a backend service here to verify the transaction and update user balance securely.
      // For client-side only demo:
      // await paymentService.confirmCryptoDeposit(user.id, transactionResponse.hash, parseFloat(amount), 'ETH');

      toast.success('Deposit successful! Balance will update shortly.');
      if (onDepositSuccess) {
        onDepositSuccess(transactionResponse.hash, amount);
      }
      setAmount(''); // Reset amount
      fetchBalance(account); // Refresh balance
    } catch (err: any) {
      console.error('Deposit error:', err);
      let errorMessage = 'Deposit failed. Please check your MetaMask wallet and try again.';
      if (err.code === 4001) { // User rejected transaction
        errorMessage = 'Transaction rejected in MetaMask.';
      } else if (err.message && err.message.includes('DB Error')) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);

      // --- Update transaction in Supabase (failed state if it exists) ---
      if (transactionHash) { // If transaction was initiated
        const { error: failError } = await supabase
        .from('transactions')
        .update({ status: 'failed', notes: `MetaMask deposit failed. Error: ${errorMessage}` })
        .eq('metadata->>provider_transaction_id', transactionHash)
        .eq('user_id', user.id);
        if (failError) console.error("Failed to update transaction to 'failed' state:", failError);
      }
      // --- End update transaction (failed) ---

    } finally {
      setIsLoading(false);
    }
  };

  if (!window.ethereum) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>MetaMask Not Detected</AlertTitle>
        <AlertDescription>
          Please install the MetaMask browser extension to use this feature.
          <Button variant="link" asChild className="p-0 h-auto ml-1">
            <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">
              Download MetaMask <ExternalLink className="inline h-3 w-3 ml-1" />
            </a>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-card rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold text-center text-foreground">Deposit with MetaMask</h3>
      
      {!account ? (
        <Button onClick={connectWallet} disabled={isLoading} className="w-full flex items-center justify-center">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Wallet className="mr-2 h-5 w-5" /> Connect MetaMask Wallet
        </Button>
      ) : (
        <div className="p-4 border rounded-md bg-background space-y-2">
          <p className="text-sm font-medium text-foreground">Connected Account:</p>
          <p className="text-xs text-muted-foreground break-all">{account}</p>
          <p className="text-sm font-medium text-foreground">Balance:</p>
          <p className="text-lg font-semibold text-primary">{balance ? `${parseFloat(balance).toFixed(4)} ETH` : 'Loading...'}</p>
        </div>
      )}

      {account && (
        <div className="space-y-4">
          <div>
            <label htmlFor="deposit-amount" className="block text-sm font-medium text-muted-foreground mb-1">
              Amount (ETH)
            </label>
            <Input
              id="deposit-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Min. ${minDepositAmount} ETH`}
              disabled={isLoading}
              className="bg-input border-border focus:ring-primary"
            />
          </div>
          <Button onClick={handleDeposit} disabled={isLoading || !amount || parseFloat(amount) < minDepositAmount} className="w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wallet className="mr-2 h-5 w-5" />
            )}
            Deposit {amount || '0'} ETH
          </Button>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Deposit Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {transactionHash && !error && (
        <Alert variant="success">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Transaction Submitted</AlertTitle>
          <AlertDescription>
            Your transaction has been submitted to the Ethereum network.
            <br />
            Hash: <span className="font-mono text-xs break-all">{transactionHash}</span>
            <Button variant="link" size="sm" asChild className="p-0 h-auto ml-1">
              <a href={`https://etherscan.io/tx/${transactionHash}`} target="_blank" rel="noopener noreferrer">
                View on Etherscan <ExternalLink className="inline h-3 w-3 ml-1" />
              </a>
            </Button>
          </AlertDescription>
        </Alert>
      )}
       <p className="text-xs text-center text-muted-foreground mt-4">
        Ensure you are on the correct network (e.g., Ethereum Mainnet). Transactions are irreversible.
      </p>
    </div>
  );
};

export default MetaMaskDeposit;
