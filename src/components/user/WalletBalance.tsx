
import React from 'react';
import { User, Wallet } from '@/types'; 
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext'; 

export interface WalletBalanceProps {
  user: User | null; 
  balance?: number; // Prop balance can be a fallback or for specific display cases
  currency?: string;
  symbol?: string;
  className?: string;
}

const WalletBalance: React.FC<WalletBalanceProps> = ({ 
  user, 
  balance: propBalance, 
  currency: propCurrency,
  symbol: propSymbol, 
  className 
}) => {
  const { wallet: contextWallet, loading: authLoading } = useAuth();

  const isLoading = authLoading; 
  const currentWallet = contextWallet; 

  // Determine display values, prioritizing context wallet, then props, then defaults
  const displayBalance = currentWallet?.balance ?? propBalance ?? 0;
  const displayCurrency = currentWallet?.currency ?? propCurrency ?? 'N/A'; // Default currency
  const displaySymbol = currentWallet?.symbol ?? propSymbol ?? '$'; // Default symbol

  if (isLoading && !currentWallet) { // Show skeleton if loading and no wallet data yet
    return <Skeleton className={`h-8 w-24 ${className}`} />;
  }

  // If not loading, but still no user or no wallet data (context or props)
  if (!user || (!currentWallet && propBalance === undefined)) { 
    return <span className={`text-sm text-muted-foreground ${className}`}>N/A</span>;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-lg font-semibold">
        {displaySymbol}{displayBalance.toFixed(2)}
      </span>
      <span className="text-xs text-muted-foreground">{displayCurrency}</span>
    </div>
  );
};

export default WalletBalance;
