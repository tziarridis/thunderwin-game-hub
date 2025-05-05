
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import { metamaskService } from "@/services/metamaskService";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext"; // Adjust import to your auth context

const RECIPIENT_ADDRESS = "0xRecipientAddress"; // Replace with your actual wallet address

interface MetaMaskDepositProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const MetaMaskDeposit = ({ onSuccess, onError }: MetaMaskDepositProps) => {
  const [amount, setAmount] = useState<number>(0.1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const { user } = useAuth();
  
  const handleConnectWallet = async () => {
    try {
      setIsConnecting(true);
      const accounts = await metamaskService.connectToMetaMask();
      
      if (accounts && accounts.length > 0) {
        setConnectedAccount(accounts[0]);
        
        // Get and display balance
        const balance = await metamaskService.getBalance(accounts[0]);
        setBalance(balance);
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      if (onError) onError(error.message);
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleDeposit = async () => {
    if (!user) {
      toast.error("You must be logged in to make a deposit");
      return;
    }
    
    if (!connectedAccount) {
      toast.error("Please connect your MetaMask wallet first");
      return;
    }
    
    if (amount <= 0) {
      toast.error("Please enter a valid amount to deposit");
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Send transaction using metamaskService
      const txHash = await metamaskService.sendTransaction(
        RECIPIENT_ADDRESS,
        amount,
        user.id
      );
      
      toast.success(`Deposit successful! Transaction hash: ${txHash.substring(0, 10)}...`);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error processing deposit:", error);
      toast.error(`Deposit failed: ${error.message || "Unknown error"}`);
      
      if (onError) {
        onError(error.message || "Failed to process deposit");
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Check if MetaMask is available
  const isMetaMaskAvailable = metamaskService.isMetaMaskAvailable();
  
  if (!isMetaMaskAvailable) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>MetaMask Deposit</CardTitle>
          <CardDescription>Deposit ETH to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              MetaMask is not installed. Please install MetaMask browser extension to continue.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button 
              onClick={() => window.open("https://metamask.io/download.html", "_blank")}
              variant="outline"
            >
              Install MetaMask
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>MetaMask Deposit</CardTitle>
        <CardDescription>Deposit ETH to your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!connectedAccount ? (
          <Button 
            onClick={handleConnectWallet} 
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect MetaMask"
            )}
          </Button>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Connected Account:</p>
                <p className="text-sm font-mono">{connectedAccount.substring(0, 6)}...{connectedAccount.substring(connectedAccount.length - 4)}</p>
              </div>
              
              {balance && (
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Balance:</p>
                  <p className="text-sm">{parseFloat(balance).toFixed(4)} ETH</p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (ETH)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value))}
                min={0.01}
                step={0.01}
                placeholder="0.1"
              />
              <p className="text-xs text-muted-foreground">
                Minimum deposit: 0.01 ETH
              </p>
            </div>
            
            <Button 
              onClick={handleDeposit} 
              disabled={isProcessing || !connectedAccount || amount <= 0}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Deposit ${amount} ETH`
              )}
            </Button>
          </>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start">
        <p className="text-xs text-muted-foreground mt-2">
          Note: The deposit will be converted to USD based on the current exchange rate.
        </p>
      </CardFooter>
    </Card>
  );
};

export default MetaMaskDeposit;
