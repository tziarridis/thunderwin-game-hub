
import React from 'react';
import { Wallet } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Landmark } from 'lucide-react'; // Added more icons
import { Button } from '../ui/button'; // Assuming Button is in ui folder
import { useNavigate } from 'react-router-dom'; // For navigation
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

interface WalletBalanceProps {
  // Wallet prop might not be needed if using useAuth
}

const WalletBalance: React.FC<WalletBalanceProps> = () => {
  const { wallet, isAuthenticated, user } = useAuth(); // Get wallet from useAuth
  const navigate = useNavigate();

  if (!isAuthenticated || !user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please log in to view your wallet.</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!wallet) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="h-10 bg-muted rounded w-3/4 mb-4"></div>
          <div className="flex gap-2">
            <div className="h-10 bg-muted rounded flex-1"></div>
            <div className="h-10 bg-muted rounded flex-1"></div>
          </div>
        </CardContent>
      </Card>
    );
  }


  // Use wallet from useAuth
  const balance = wallet.balance || 0;
  const currency = wallet.currency || 'USD'; // Default currency if not set

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Account Balance</span>
          <DollarSign className="h-6 w-6 text-muted-foreground" />
        </CardTitle>
        <CardDescription>Your current available funds.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold mb-1">
          {balance.toLocaleString(undefined, { style: 'currency', currency: currency, minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          {/* Placeholder for bonus balance or other details */}
          {/* Bonus Balance: 0.00 {currency} */}
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => navigate('/wallet/deposit')} className="flex-1">
                <CreditCard className="mr-2 h-4 w-4" /> Deposit
            </Button>
            <Button variant="outline" onClick={() => navigate('/wallet/withdraw')} className="flex-1">
                <Landmark className="mr-2 h-4 w-4" /> Withdraw
            </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletBalance;
