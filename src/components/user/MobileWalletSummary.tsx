
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { RefreshCw } from 'lucide-react';
import { walletService } from '@/services/walletService';
import { Wallet } from '@/types/wallet';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface MobileWalletSummaryProps {
  showRefresh?: boolean;
}

const MobileWalletSummary = ({ showRefresh = false }: MobileWalletSummaryProps) => {
  const { user, refreshWalletBalance } = useAuth();
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    fetchWalletData();
  }, [user?.id]);

  const fetchWalletData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const walletResponse = await walletService.getWalletByUserId(user.id);
      
      if (walletResponse.data) {
        const walletData = walletService.mapDatabaseWalletToWallet(walletResponse.data);
        setWallet(walletData);
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await refreshWalletBalance();
    await fetchWalletData();
    setLoading(false);
  };

  if (!isMobile) return null;

  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg p-3 mb-4 flex items-center justify-between">
      <div>
        <span className="text-xs text-white/60 block">Your Balance</span>
        <span className="text-lg font-bold text-white">
          {user?.balance?.toLocaleString() || wallet?.balance?.toLocaleString() || '0'} {wallet?.currency || 'USD'}
        </span>
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
        >
          Deposit
        </Button>
      </div>
    </div>
  );
};

export default MobileWalletSummary;
