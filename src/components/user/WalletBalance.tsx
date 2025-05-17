import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { RefreshCw } from 'lucide-react';
import { walletService, mapDbWalletToWallet } from '@/services/walletService'; // Import mapDbWalletToWallet
import { Wallet } from '@/types'; // Wallet type from consolidated types
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
  }, [user?.id, user?.balance, user?.currency]); // Add user.balance and user.currency as dependencies

  const fetchWalletData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const walletResponse = await walletService.getWalletByUserId(user.id);
      
      if (walletResponse.data) {
        const walletData = mapDbWalletToWallet(walletResponse.data); // Use imported function
        setWallet(walletData);
        console.log("Wallet data loaded:", walletData);
      } else {
        // If no wallet data, attempt to use user context data as fallback
        if (user.balance !== undefined && user.currency) {
          setWallet({
            id: user.id, // Placeholder, as full wallet object isn't available
            userId: user.id,
            balance: user.balance,
            currency: user.currency,
            symbol: user.currency === 'USD' ? '$' : user.currency === 'EUR' ? '€' : user.currency, // Basic symbol mapping
            // Fill other required Wallet fields with defaults or indicate they are partial
            vipLevel: user.vipLevel || 0,
            bonusBalance: 0,
            cryptoBalance: 0,
            demoBalance: 0,
            isActive: true,
          });
        }
        console.log("No wallet data returned from service:", walletResponse.error);
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
        await refreshWalletBalance(); // This should update user context, triggering useEffect
      }
      // Fetching wallet data again to be sure, or rely on context update
      await fetchWalletData(); 
      toast.success("Wallet balance refreshed");
    } catch (error) {
      console.error("Error refreshing wallet:", error);
      toast.error("Failed to refresh wallet balance");
    } finally {
      setLoading(false);
    }
  };

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
              {wallet?.symbol || (user?.currency === 'USD' ? '$' : user?.currency === 'EUR' ? '€' : user?.currency) || '$'}
              {(wallet?.balance ?? user?.balance ?? 0).toLocaleString()} 
              {' '}{wallet?.currency || user?.currency || 'USD'}
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
