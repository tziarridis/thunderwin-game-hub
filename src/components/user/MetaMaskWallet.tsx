
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { metamaskService } from "@/services/metamaskService";
import { Wallet as WalletIcon, AlertTriangle, Check } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface MetaMaskWalletProps {
  onConnected?: (address: string) => void;
  onDisconnected?: () => void;
}

const MetaMaskWallet = ({ onConnected, onDisconnected }: MetaMaskWalletProps) => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [ethBalance, setEthBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkMetaMaskStatus = async () => {
      const installed = metamaskService.isMetaMaskInstalled();
      setIsInstalled(installed);
      
      if (installed) {
        try {
          // Check if already connected
          const account = await metamaskService.getConnectedAccount();
          if (account) {
            setIsConnected(true);
            setAccountAddress(account);
            fetchEthBalance(account);
          }
        } catch (error) {
          console.error("Error checking MetaMask connection:", error);
        }
      }
    };
    
    checkMetaMaskStatus();
    
    // Setup MetaMask event listeners
    const cleanup = metamaskService.setupMetaMaskListeners();
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  const fetchEthBalance = async (address: string) => {
    try {
      const balance = await metamaskService.getBalance();
      setEthBalance(balance);
    } catch (error) {
      console.error("Error fetching ETH balance:", error);
    }
  };

  const handleConnect = async () => {
    if (!isInstalled) {
      window.open('https://metamask.io/download/', '_blank');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const accounts = await metamaskService.requestAccounts();
      if (accounts.length > 0) {
        setIsConnected(true);
        setAccountAddress(accounts[0]);
        fetchEthBalance(accounts[0]);
        
        if (onConnected) {
          onConnected(accounts[0]);
        }
        
        toast.success("MetaMask wallet connected successfully!");
      }
    } catch (error: any) {
      console.error("MetaMask connection error:", error);
      toast.error(error.message || "Failed to connect to MetaMask");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeposit = () => {
    if (!user?.id) {
      toast.error("User ID not found");
      return;
    }
    
    // Open deposit dialog
    document.getElementById('deposit-dialog-trigger')?.click();
  };

  const getShortAddress = (address: string) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <Card className="bg-casino-thunder-dark border-casino-thunder-gray/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <WalletIcon className="mr-2 h-5 w-5 text-casino-thunder-green" />
          MetaMask Wallet
        </CardTitle>
        <CardDescription>Connect your ETH wallet</CardDescription>
      </CardHeader>
      <CardContent>
        {!isInstalled ? (
          <div className="space-y-4">
            <div className="flex items-center text-amber-400 bg-amber-400/10 p-3 rounded-md">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <p className="text-sm">MetaMask extension not detected</p>
            </div>
            <Button 
              className="w-full bg-[#F6851B] hover:bg-[#E2761B] text-white"
              onClick={handleConnect}
            >
              Install MetaMask
            </Button>
          </div>
        ) : !isConnected ? (
          <Button 
            className="w-full bg-[#F6851B] hover:bg-[#E2761B] text-white"
            onClick={handleConnect}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Connecting...
              </>
            ) : (
              "Connect MetaMask"
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center text-green-400 bg-green-400/10 p-3 rounded-md">
              <Check className="h-5 w-5 mr-2" />
              <p className="text-sm">Wallet connected</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/60">Address:</span>
                <span className="font-mono">{getShortAddress(accountAddress || "")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">ETH Balance:</span>
                <span>{ethBalance !== null ? `${ethBalance.toFixed(5)} ETH` : "Loading..."}</span>
              </div>
            </div>
            
            <Button 
              className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
              onClick={handleDeposit}
            >
              Deposit with MetaMask
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MetaMaskWallet;
