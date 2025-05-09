
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { RefreshCw } from 'lucide-react';
import { walletService } from '@/services/walletService';
import { Wallet } from '@/types/wallet';
import { toast } from 'sonner';

interface WalletBalanceProps {
  showRefresh?: boolean;
  variant?: string;
  className?: string;
}

const WalletBalance = ({ showRefresh = false, variant = 'default', className = '' }: WalletBalanceProps) => {
  const { user, refreshWalletBalance } = useAuth();
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchWalletData();
    }
  }, [user?.id]);

  const fetchWalletData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const walletResponse = await walletService.getWalletByUserId(user.id);
      
      if (walletResponse.data) {
        const walletData = walletService.mapDatabaseWalletToWallet(walletResponse.data);
        setWallet(walletData);
        console.log("Wallet data loaded:", walletData);
      } else {
        console.log("No wallet data returned:", walletResponse.error);
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      if (refreshWalletBalance) {
        await refreshWalletBalance();
      }
      await fetchWalletData();
      toast.success("Wallet balance refreshed");
    } catch (error) {
      console.error("Error refreshing wallet:", error);
      toast.error("Failed to refresh wallet balance");
    } finally {
      setLoading(false);
    }
  };

  // Apply different styles based on variant
  const containerClasses = `${className} text-right flex items-center`;

  return (
    <div className={containerClasses}>
      <div className="mr-1">
        <span className="text-xs text-white/60 block">Balance</span>
        <span className="text-lg font-bold text-white">
          {loading ? (
            <span className="opacity-50">Loading...</span>
          ) : (
            <>
              {wallet?.symbol || '$'}{(wallet?.balance || user?.balance || 0).toLocaleString()} {wallet?.currency || user?.currency || 'USD'}
            </>
          )}
        </span>
      </div>
      
      {showRefresh && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="ml-1.5 text-white/70 hover:text-white"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      )}
    </div>
  );
};

export default WalletBalance;
