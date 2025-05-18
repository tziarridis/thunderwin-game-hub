
import React from 'react';
import { User, Wallet } from '@/types';
import { Button } from '@/components/ui/button';
import { RefreshCw, WalletCards } from 'lucide-react'; // Using WalletCards from lucide
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

export interface MobileWalletSummaryProps {
  user: User | null;
  showRefresh?: boolean;
  onRefresh?: () => Promise<void>;
  className?: string;
}

const MobileWalletSummary: React.FC<MobileWalletSummaryProps> = ({ 
  user, 
  showRefresh = false, 
  onRefresh,
  className 
}) => {
  const { wallet: contextWallet, loading: authLoading, refreshWalletBalance } = useAuth();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const wallet = contextWallet; // Prioritize wallet from context

  const handleRefresh = async () => {
    if (onRefresh) { // If a specific onRefresh is passed, use it
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    } else if (refreshWalletBalance) { // Otherwise, use the context's refresh
      setIsRefreshing(true);
      await refreshWalletBalance();
      setIsRefreshing(false);
    }
  };

  const isLoading = authLoading || isRefreshing;

  if (isLoading && !wallet) { // Show skeleton only if no wallet data yet and loading
    return (
      <div className={`p-3 bg-card border rounded-lg shadow flex items-center justify-between ${className}`}>
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    );
  }

  if (!user || !wallet) {
    return (
      <div className={`p-3 bg-card border rounded-lg shadow flex items-center justify-between ${className}`}>
        <span className="text-sm text-muted-foreground">N/A</span>
        {showRefresh && onRefresh && (
          <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`p-3 bg-card border rounded-lg shadow flex items-center justify-between ${className}`}>
      <div className="flex items-center space-x-2">
        <WalletCards className="h-5 w-5 text-primary" />
        <div>
          <span className="block text-sm font-semibold">
            {wallet.symbol}{wallet.balance.toFixed(2)}
          </span>
          <span className="block text-xs text-muted-foreground">{wallet.currency}</span>
        </div>
      </div>
      {showRefresh && (onRefresh || refreshWalletBalance) && (
        <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      )}
    </div>
  );
};

export default MobileWalletSummary;
