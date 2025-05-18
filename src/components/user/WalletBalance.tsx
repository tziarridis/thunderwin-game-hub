import { Wallet, User } from '@/types';
import { walletService, mapDbWalletToWallet } from '@/services/walletService';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface WalletBalanceProps {
  user: User | null; // Accept user prop
}

const WalletBalance = ({ user }: WalletBalanceProps) => {
  // const { user } = useAuth(); // User can be passed as prop or from context
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWallet = async () => {
      if (user?.id) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await walletService.getWalletByUserId(user.id);
          if (response.success && response.data) {
            setWallet(mapDbWalletToWallet(response.data));
          } else {
            setError(response.error || 'Failed to load wallet');
            // toast.error(response.error || 'Failed to load wallet');
             setWallet(null); // Ensure wallet is null on error
          }
        } catch (err: any) {
          setError(err.message || 'An unexpected error occurred');
          // toast.error(err.message || 'An unexpected error occurred');
           setWallet(null); // Ensure wallet is null on error
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false); // No user, so not loading
        // setWallet(null); // Explicitly set wallet to null if no user
      }
    };

    fetchWallet();
  }, [user]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 flex items-center"><AlertTriangle className="mr-2 h-4 w-4" /> {error}</div>;
  }

  if (!wallet) {
    return <div className="text-muted-foreground">No wallet information available.</div>;
  }

  return (
    <div className="space-y-1">
      <div className="text-2xl font-bold text-casino-neon-green">
        {wallet.symbol}{wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        <span className="text-xs text-gray-400 ml-1">{wallet.currency}</span>
      </div>
      {wallet.bonusBalance !== undefined && wallet.bonusBalance > 0 && (
        <div className="text-sm text-blue-400">
          Bonus: {wallet.symbol}{wallet.bonusBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Last updated: {new Date(wallet.updatedAt).toLocaleTimeString()}
      </p>
    </div>
  );
};

export default WalletBalance;
