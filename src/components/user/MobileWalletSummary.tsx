
import React from 'react';
import { User, Wallet } from '@/types'; // Assuming Wallet type contains necessary fields
import { Button } from '@/components/ui/button';
import { CreditCard, RefreshCw, Gift } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; // To get user and wallet directly

export interface MobileWalletSummaryProps {
  user: User | null; // Expecting the full user object which might contain wallet info or wallet itself
  // Wallet info can also be passed directly if preferred
  balance?: number; 
  currency?: string;
  symbol?: string;
  bonusBalance?: number;
  showRefresh?: boolean;
  onRefresh?: () => void; // Optional refresh handler
  className?: string;
}

const MobileWalletSummary: React.FC<MobileWalletSummaryProps> = ({ 
  user, 
  balance: propBalance, 
  currency: propCurrency, 
  symbol: propSymbol,
  bonusBalance: propBonusBalance,
  showRefresh = false, 
  onRefresh, 
  className 
}) => {
  const navigate = useNavigate();
  const { wallet: contextWallet, loading: authLoading, refreshWalletBalance } = useAuth(); // Use wallet from AuthContext

  // Determine wallet data source: props or context
  const isLoading = authLoading; // Use auth loading state for skeleton
  const currentWallet = contextWallet; // Prioritize context wallet
  
  const displayBalance = currentWallet?.balance ?? propBalance ?? 0;
  const displayCurrency = currentWallet?.currency ?? propCurrency ?? 'N/A';
  const displaySymbol = currentWallet?.symbol ?? propSymbol ?? '$';
  const displayBonusBalance = currentWallet?.bonusBalance ?? propBonusBalance ?? 0;


  const handleRefresh = async () => {
    if (onRefresh) {
      onRefresh();
    } else if (refreshWalletBalance) {
      await refreshWalletBalance();
    }
  };

  if (isLoading) {
    return (
      <div className={`p-3 bg-muted/50 rounded-lg space-y-2 ${className}`}>
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }
  
  if (!user) { // No user, no summary
    return null;
  }

  return (
    <div className={`p-3 bg-card border rounded-lg shadow-sm ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <div>
          <p className="text-sm text-muted-foreground">Main Balance</p>
          <p className="text-xl font-semibold">
            {displaySymbol}{displayBalance.toFixed(2)} <span className="text-xs">{displayCurrency}</span>
          </p>
        </div>
        {showRefresh && (
          <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>
      
      {typeof displayBonusBalance === 'number' && displayBonusBalance > 0 && (
         <div className="mb-3">
            <p className="text-xs text-muted-foreground">Bonus Balance</p>
            <p className="text-sm font-medium">
              {displaySymbol}{displayBonusBalance.toFixed(2)} <span className="text-xs">{displayCurrency}</span>
            </p>
        </div>
      )}

      <div className="flex gap-2">
        <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => navigate('/payment/deposit')}>
          <CreditCard className="mr-2 h-4 w-4" /> Deposit
        </Button>
        <Button variant="secondary" size="sm" className="flex-1" onClick={() => navigate('/bonuses')}>
            <Gift className="mr-2 h-4 w-4" /> Bonuses
        </Button>
      </div>
    </div>
  );
};

export default MobileWalletSummary;
