
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, CreditCard, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WalletType } from '@/types/wallet';

interface WalletBalanceProps {
  wallet: WalletType | null;
  isLoading: boolean;
  onRefresh: () => void;
}

const WalletBalance: React.FC<WalletBalanceProps> = ({ wallet, isLoading, onRefresh }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 animate-pulse">
          <div className="h-6 bg-muted rounded mb-2 w-1/3"></div>
          <div className="h-8 bg-muted rounded mb-4 w-2/3"></div>
          <div className="flex space-x-2">
            <div className="h-10 bg-muted rounded w-24"></div>
            <div className="h-10 bg-muted rounded w-24"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!wallet) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Wallet information not available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-muted-foreground">Your Balance</span>
          <Button variant="ghost" size="sm" onClick={onRefresh} className="h-8">
            <RefreshCw className="mr-1 h-4 w-4" />
            Refresh
          </Button>
        </div>
        
        <div className="mb-4">
          <span className="text-3xl font-bold">
            {wallet.symbol}{wallet.balance.toFixed(2)}
          </span>
        </div>
        
        {wallet.bonusBalance && wallet.bonusBalance > 0 && (
          <div className="mb-4">
            <span className="text-sm font-medium text-muted-foreground">Bonus Balance</span>
            <p className="text-xl font-semibold">
              {wallet.symbol}{wallet.bonusBalance.toFixed(2)}
            </p>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate('/payment/deposit')} className="gap-2">
            <CreditCard className="h-4 w-4" />
            Deposit
          </Button>
          <Button 
            onClick={() => navigate('/payment/withdrawal')} 
            variant="outline" 
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Withdraw
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletBalance;
