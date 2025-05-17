
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { metamaskService } from "@/services";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface MetaMaskDepositProps {
  amount: string;
  setAmount: (value: string) => void;
  onSuccess?: () => void;
  onProcessing?: (isProcessing: boolean) => void;
}

const MetaMaskDeposit = ({ amount, setAmount, onSuccess, onProcessing }: MetaMaskDepositProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, refreshWalletBalance } = useAuth();

  const handleDeposit = async () => {
    if (!user?.id) {
      toast.error("User ID not found");
      return;
    }
    
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsProcessing(true);
    if (onProcessing) onProcessing(true);
    
    try {
      // Check if MetaMask is installed
      if (!metamaskService.isMetaMaskAvailable()) {
        throw new Error("MetaMask is not installed. Please install MetaMask extension and try again.");
      }
      
      // Request account access
      const accounts = await metamaskService.connectToMetaMask();
      if (!accounts) {
        throw new Error("Please connect to MetaMask.");
      }
      
      // Switch to Ethereum Mainnet if needed
      await metamaskService.switchToEthereumMainnet();
      
      // Current ETH price in USD (in production, this should come from an API)
      const ethPriceInUsd = 2500; 
      
      // Convert USD to ETH
      const ethAmount = depositAmount / ethPriceInUsd;
      
      const confirmed = window.confirm(
        `You are about to deposit ${ethAmount.toFixed(6)} ETH (approximately $${depositAmount.toFixed(2)} USD). Do you want to continue?`
      );
      
      if (!confirmed) {
        setIsProcessing(false);
        if (onProcessing) onProcessing(false);
        return;
      }
      
      const toAddress = '0xRecipientAddress'; // Should be your platform's wallet address
      const txHash = await metamaskService.sendTransaction(toAddress, ethAmount.toString(), { from: accounts });
      
      if (txHash) {
        // Refresh user's wallet balance after successful transaction
        await refreshWalletBalance();
        
        if (onSuccess) {
          onSuccess();
        }
        
        toast.success(`Successfully deposited ${ethAmount.toFixed(6)} ETH`);
      }
    } catch (error: any) {
      console.error("MetaMask deposit error:", error);
      toast.error(error.message || "Failed to process MetaMask deposit");
    } finally {
      setIsProcessing(false);
      if (onProcessing) onProcessing(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col space-y-1">
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70">$</span>
          <Input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            min="10"
            step="5"
            placeholder="Enter amount"
            className="pl-8 bg-casino-thunder-gray/30 border-white/10 focus:border-casino-thunder-green"
          />
        </div>
        <p className="text-xs text-white/50">
          Minimum deposit: $10
        </p>
      </div>
      
      <Button 
        onClick={handleDeposit}
        disabled={isProcessing}
        className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          `Deposit with MetaMask`
        )}
      </Button>
      
      <p className="text-xs text-white/60 text-center">
        {metamaskService.isMetaMaskAvailable() ? 
          "Connect to your MetaMask wallet to deposit ETH" : 
          "MetaMask extension is not installed. Please install MetaMask to continue."
        }
      </p>
    </div>
  );
};

export default MetaMaskDeposit;
