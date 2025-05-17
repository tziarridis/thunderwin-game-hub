import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { RefreshCw } from 'lucide-react';
import { walletService, mapDbWalletToWallet } from '@/services/walletService';
import { Wallet, DbWallet } from '@/types'; 
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface MobileWalletSummaryProps {
  showRefresh?: boolean;
}

const MobileWalletSummary = ({ showRefresh = false }: MobileWalletSummaryProps) => {
  const { user, refreshWalletBalance } = useAuth();
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    if (user?.id) {
      fetchWalletData();
    }
  }, [user?.id, user?.balance, user?.currency]);

  const fetchWalletData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const walletResponse = await walletService.getWalletByUserId(user.id);
      
      if (walletResponse.success && walletResponse.data) {
        const singleDbWallet = walletResponse.data as DbWallet; // Assuming getWalletByUserId returns single
        const walletData = mapDbWalletToWallet(singleDbWallet);
        setWallet(walletData);
        console.log("Mobile wallet data loaded:", walletData);
      } else {
         if (user.balance !== undefined && user.currency) {
          setWallet({
            id: user.id, 
            userId: user.id,
            balance: user.balance,
            currency: user.currency,
            symbol: user.currency === 'USD' ? '$' : user.currency === 'EUR' ? '€' : user.currency,
            vipLevel: user.vipLevel || 0,
            bonusBalance: 0,
            cryptoBalance: 0,
            demoBalance: 0,
            isActive: true,
          });
        }
        console.log("No mobile wallet data returned from service:", walletResponse.error);
      }
    } catch (error) {
      console.error("Error fetching mobile wallet data:", error);
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

  if (!isMobile) return null;

  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg p-3 mb-4 flex items-center justify-between">
      <div>
        <span className="text-xs text-white/60 block">Your Balance</span>
        {loading ? (
          <span className="text-lg font-bold text-white opacity-50">Loading...</span>
        ) : (
          <span className="text-lg font-bold text-white">
            {wallet?.symbol || (user?.currency === 'USD' ? '$' : user?.currency === 'EUR' ? '€' : user?.currency) || '$'}
            {(wallet?.balance ?? user?.balance ?? 0).toLocaleString()}
            {' '}{wallet?.currency || user?.currency || 'USD'}
          </span>
        )}
      </div>
      
      <div className="flex gap-2">
        {showRefresh && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white/70 hover:text-white"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
        
        <Button 
          size="sm" 
          className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
          asChild
        >
          <Link to="/payment/deposit">
            Deposit
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default MobileWalletSummary;
