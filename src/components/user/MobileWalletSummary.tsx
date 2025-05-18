
import React, { useEffect, useState } from 'react';
import { Wallet, User } from '@/types'; // Ensure User type is imported
import { walletService, mapDbWalletToWallet } from '@/services/walletService';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Wallet2, AlertTriangle, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface MobileWalletSummaryProps {
  user: User | null; // Accept user prop
}

const MobileWalletSummary = ({ user }: MobileWalletSummaryProps) => {
  // const { user } = useAuth(); // User can be passed as prop or from context
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWalletData = async () => {
      if (user?.id) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await walletService.getWalletByUserId(user.id);
          if (response.success && response.data) {
            setWallet(mapDbWalletToWallet(response.data));
          } else {
            setError(response.error || 'Failed to load wallet summary');
            // toast.error(response.error || 'Failed to load wallet summary');
             setWallet(null);
          }
        } catch (err: any) {
          setError(err.message || 'An unexpected error occurred');
          // toast.error(err.message || 'An unexpected error occurred');
           setWallet(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
        // setWallet(null); 
      }
    };
    fetchWalletData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-between p-3 bg-card rounded-lg shadow">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-8 w-24" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-3 bg-card rounded-lg shadow flex items-center">
        <AlertTriangle className="mr-2 h-4 w-4" /> Error
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="p-3 bg-card rounded-lg shadow text-muted-foreground">
        No wallet data.
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-card rounded-lg shadow text-white">
      <div className="flex items-center">
        <Wallet2 className="h-5 w-5 mr-2 text-casino-neon-green" />
        <span className="font-semibold">
          {wallet.symbol}{wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
         {wallet.bonusBalance !== undefined && wallet.bonusBalance > 0 && (
            <span className="text-xs text-blue-400 ml-1">(+{wallet.symbol}{wallet.bonusBalance.toFixed(2)} bonus)</span>
        )}
      </div>
      <Button size="sm" variant="ghost" className="text-casino-neon-green hover:bg-casino-neon-green/10" onClick={() => navigate('/payment/deposit')}>
        <PlusCircle className="h-4 w-4 mr-1" />
        Deposit
      </Button>
    </div>
  );
};

export default MobileWalletSummary;
