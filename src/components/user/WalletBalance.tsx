
import React from 'react';
import { User, Wallet } from '@/types'; // Ensure Wallet type is imported
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext'; // To get user and wallet directly

export interface WalletBalanceProps {
  user: User | null; // User object, might contain wallet or be used to fetch it
  // Wallet info can also be passed directly
  balance?: number;
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

  const isLoading = authLoading; // Use auth loading state for skeleton
  const currentWallet = contextWallet; // Prioritize context wallet

  const displayBalance = currentWallet?.balance ?? propBalance ?? 0;
  const displayCurrency = currentWallet?.currency ?? propCurrency ?? 'N/A';
  const displaySymbol = currentWallet?.symbol ?? propSymbol ?? '$';

  if (isLoading) {
    return <Skeleton className={`h-8 w-24 ${className}`} />;
  }

  if (!user || !currentWallet) { // If no user or no wallet data (even after loading)
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

