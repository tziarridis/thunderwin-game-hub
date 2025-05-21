import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ethers } from 'ethers';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Transaction, TransactionStatus, TransactionType } from '@/types/transaction'; // Ensure types are correctly imported

const MetaMaskDeposit: React.FC = () => {
  const { user } = useAuth();
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum as any);
      setProvider(web3Provider);
    } else {
      setError("MetaMask is not installed. Please install MetaMask to use this feature.");
    }
  }, []);

  const connectWallet = async () => {
    if (!provider) {
      setError("MetaMask provider not available.");
      return;
    }
    try {
      await provider.send("eth_requestAccounts", []);
      const web3Signer = provider.getSigner();
      setSigner(web3Signer);
      const address = await web3Signer.getAddress();
      setUserAddress(address);
      setError(null);
    } catch (err: any) {
      console.error("Error connecting to MetaMask:", err);
      setError(err.message || "Failed to connect to MetaMask.");
      toast.error(err.message || "Failed to connect to MetaMask.");
    }
  };

  const handleDeposit = async () => {
    if (!user || !signer || !userAddress) {
      setError("Please connect your wallet and ensure you are logged in.");
      toast.error("Please connect your wallet and ensure you are logged in.");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid deposit amount.");
      toast.error("Please enter a valid deposit amount.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const depositAmountWei = ethers.utils.parseEther(amount);
      // Replace with your actual casino's deposit address
      const casinoDepositAddress = "YOUR_CASINO_DEPOSIT_ADDRESS"; // IMPORTANT: Replace this
      
      if (casinoDepositAddress === "YOUR_CASINO_DEPOSIT_ADDRESS") {
        // Using toast.info instead of toast.warn
        toast.info("Developer Note: Casino deposit address is not configured.");
        setError("Deposit address not configured. Please contact support.");
        setLoading(false);
        return;
      }

      const tx = await signer.sendTransaction({
        to: casinoDepositAddress,
        value: depositAmountWei,
      });

      toast.info("Deposit transaction sent. Waiting for confirmation...");

      // Create a pending transaction record in Supabase
      const { data: transactionData, error: dbError } = await supabase
        .from('transactions')
        .insert({
          player_id: user.id,
          amount: parseFloat(amount),
          currency: 'ETH', // Or the appropriate cryptocurrency
          type: 'deposit' as TransactionType,
          status: 'pending' as TransactionStatus,
          provider: 'MetaMask',
          provider_transaction_id: tx.hash,
          metadata: { userAddress }
        })
        .select()
        .single();

      if (dbError) throw dbError;

      await tx.wait(); // Wait for transaction confirmation

      // Update transaction status to completed
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ status: 'completed' as TransactionStatus })
        .eq('id', transactionData.id);
      
      if (updateError) throw updateError;

      // TODO: Update user's wallet balance in your database.
      // This requires a backend function or careful RLS to prevent unauthorized balance updates.
      // For now, we just show a success message.
      // Example: await supabase.rpc('credit_wallet_balance', { user_id: user.id, amount_credited: parseFloat(amount), currency_code: 'ETH' });

      setSuccess(`Successfully deposited ${amount} ETH. Transaction hash: ${tx.hash}`);
      toast.success(`Successfully deposited ${amount} ETH.`);
      setAmount('');

    } catch (err: any) {
      console.error("Deposit error:", err);
      setError(err.message || "An error occurred during the deposit.");
      toast.error(err.message || "An error occurred during the deposit.");
      // If transaction was created but failed to confirm, update its status to 'failed'
      // This part needs robust error handling for partial failures.
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6 p-4 md:p-6 bg-card shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-foreground">Deposit with MetaMask</h2>
      
      {!provider && (
        <div className="text-destructive-foreground bg-destructive p-3 rounded-md">
          MetaMask is not installed or not detected. Please install MetaMask extension.
        </div>
      )}

      {provider && !userAddress && (
        <Button onClick={connectWallet} className="w-full">
          Connect MetaMask Wallet
        </Button>
      )}

      {userAddress && (
        <div className="p-3 bg-muted rounded-md text-sm">
          Connected as: <span className="font-mono">{userAddress}</span>
        </div>
      )}

      {userAddress && (
        <div className="space-y-4">
          <div>
            <label htmlFor="depositAmount" className="block text-sm font-medium text-muted-foreground mb-1">
              Amount (ETH)
            </label>
            <Input
              id="depositAmount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g., 0.1"
              className="bg-input border-border"
              disabled={loading}
            />
          </div>
          <Button onClick={handleDeposit} disabled={loading || !amount} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Depositing...
              </>
            ) : (
              'Deposit Now'
            )}
          </Button>
        </div>
      )}

      {error && (
        <div className="flex items-start p-3 text-sm bg-destructive/20 text-destructive-foreground border border-destructive rounded-md">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Deposit Failed</p>
            <p>{error}</p>
          </div>
        </div>
      )}
      {success && (
         <div className="flex items-start p-3 text-sm bg-green-600/20 text-green-400 border border-green-600 rounded-md">
          <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Deposit Successful</p>
            <p className="break-all">{success}</p>
          </div>
        </div>
      )}
      <p className="text-xs text-muted-foreground text-center">
        Ensure you are on the correct network and have sufficient funds for transaction fees.
      </p>
    </div>
  );
};

export default MetaMaskDeposit;
