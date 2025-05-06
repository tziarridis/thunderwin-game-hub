
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { RefreshCw } from 'lucide-react';
import { walletService } from '@/services/walletService';
import { Wallet as WalletType } from '@/types/wallet';

interface WalletBalanceProps {
  showRefresh?: boolean;
}

const WalletBalance = ({ showRefresh = false }: WalletBalanceProps) => {
  const { user, refreshWalletBalance } = useAuth();
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState<WalletType | null>(null);

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

  return (
    <div className="text-right flex items-center">
      <div className="mr-1">
        <span className="text-xs text-white/60 block">Balance</span>
        <span className="text-lg font-bold text-white">
          {user?.balance?.toLocaleString() || wallet?.balance?.toLocaleString() || '0'} {wallet?.currency || 'USD'}
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
