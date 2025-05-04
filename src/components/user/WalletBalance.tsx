
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { walletService } from "@/services";
import { Wallet } from "@/services/walletService";
import { CircleDollarSign, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface WalletBalanceProps {
  className?: string;
  showRefresh?: boolean;
  variant?: "default" | "compact" | "dropdown";
}

const WalletBalance = ({ className = "", showRefresh = false, variant = "default" }: WalletBalanceProps) => {
  const { user, isAuthenticated } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchWallet();
    }
  }, [isAuthenticated, user?.id]);

  const fetchWallet = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const walletData = await walletService.getWalletByUserId(user.id);
      setWallet(walletData);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (refreshing || !user?.id) return;
    
    try {
      setRefreshing(true);
      const walletData = await walletService.getWalletByUserId(user.id);
      setWallet(walletData);
      toast.success("Wallet balance updated");
    } catch (error) {
      console.error("Error refreshing wallet data:", error);
      toast.error("Failed to refresh wallet balance");
    } finally {
      setRefreshing(false);
    }
  };

  if (!isAuthenticated) return null;
  
  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <CircleDollarSign className="h-4 w-4 text-casino-thunder-green" />
        <span className="font-medium">
          {loading ? 
            <span className="inline-block w-12 h-4 bg-white/10 animate-pulse rounded"></span> : 
            `${wallet?.symbol || '$'}${wallet?.balance?.toFixed(2) || user?.balance?.toFixed(2) || '0.00'}`
          }
        </span>
      </div>
    );
  }
  
  if (variant === "dropdown") {
    return (
      <div className={`p-3 flex flex-col ${className}`}>
        <span className="text-sm text-white/70 mb-1">Your Balance</span>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">
            {loading ? 
              <span className="inline-block w-16 h-6 bg-white/10 animate-pulse rounded"></span> : 
              `${wallet?.symbol || '$'}${wallet?.balance?.toFixed(2) || user?.balance?.toFixed(2) || '0.00'}`
            }
          </span>
          {showRefresh && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh} 
              disabled={refreshing}
              className="p-1 h-auto"
            >
              <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center bg-white/5 rounded-lg px-3 py-2">
        <CircleDollarSign className="h-5 w-5 text-casino-thunder-green mr-2" />
        {loading ? (
          <span className="inline-block w-16 h-6 bg-white/10 animate-pulse rounded"></span>
        ) : (
          <span className="font-medium">
            {wallet?.symbol || '$'}{wallet?.balance?.toFixed(2) || user?.balance?.toFixed(2) || '0.00'}
          </span>
        )}
      </div>
      {showRefresh && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={refreshing}
          className="h-full aspect-square p-0"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      )}
    </div>
  );
};

export default WalletBalance;
