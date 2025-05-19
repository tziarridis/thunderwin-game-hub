
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const MetaMaskWallet = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { user } = useAuth(); // Remove refreshWalletBalance since it's not defined
  
  const connectMetaMask = async () => {
    setIsConnecting(true);
    
    try {
      if (!(window as any).ethereum) {
        toast.error("MetaMask is not installed. Please install it to continue.");
        return;
      }
      
      try {
        // Request account access
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        
        if (accounts.length > 0) {
          toast.success(`Connected to MetaMask: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
          
          // In a real app, you'd store the account address in your user profile
          // and perhaps check the user's ETH balance
        } else {
          toast.error("No accounts found. Please create an account in MetaMask.");
        }
      } catch (error: any) {
        console.error('MetaMask connection error:', error);
        if (error.code === 4001) {
          toast.error("Connection rejected by user.");
        } else {
          toast.error("Failed to connect to MetaMask.");
        }
      }
    } finally {
      setIsConnecting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>MetaMask</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Connect your MetaMask wallet to deposit or withdraw using Ethereum and other cryptocurrencies.
        </p>
        
        <Button 
          onClick={connectMetaMask}
          disabled={isConnecting}
          className="w-full bg-[#F6851B] hover:bg-[#E2761B] text-white"
        >
          {isConnecting ? "Connecting..." : "Connect MetaMask"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MetaMaskWallet;
