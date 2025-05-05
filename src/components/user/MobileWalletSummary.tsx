
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { walletService } from "@/services";
import { Wallet } from "@/types/wallet";
import { CircleDollarSign, RefreshCw, ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MobileWalletSummaryProps {
  className?: string;
}

const MobileWalletSummary = ({ className }: MobileWalletSummaryProps) => {
  const { user, isAuthenticated } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchWallet();
      fetchRecentTransactions();
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
  
  const fetchRecentTransactions = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/transactions?userId=${user.id}&limit=3`);
      if (response.ok) {
        const data = await response.json();
        setRecentTransactions(data || []);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const handleRefresh = async () => {
    if (refreshing || !user?.id) return;
    
    try {
      setRefreshing(true);
      await fetchWallet();
      await fetchRecentTransactions();
      toast.success("Wallet updated");
    } catch (error) {
      console.error("Error refreshing wallet data:", error);
      toast.error("Failed to refresh wallet");
    } finally {
      setRefreshing(false);
    }
  };

  if (!isAuthenticated) return null;
  
  return (
    <div className={cn("space-y-3 p-3 bg-casino-thunder-dark/50 rounded-lg", className)}>
      {/* Balance Card */}
      <div className="flex items-center justify-between bg-casino-thunder-dark border border-casino-thunder-gray/20 rounded-lg p-3">
        <div className="flex items-center">
          <CircleDollarSign className="h-6 w-6 text-casino-thunder-green mr-2" />
          <div>
            <p className="text-xs text-white/60">Your Balance</p>
            <p className="text-xl font-bold">
              {loading ? (
                <span className="inline-block w-16 h-6 bg-white/10 animate-pulse rounded"></span>
              ) : (
                `${wallet?.symbol || '$'}${wallet?.balance?.toFixed(2) || '0.00'}`
              )}
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleRefresh} 
          disabled={refreshing}
          className="h-8 w-8"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      {/* Recent Transactions */}
      <div>
        <h3 className="text-sm font-medium mb-2 px-1">Recent Activity</h3>
        <div className="space-y-2">
          {recentTransactions.length > 0 ? recentTransactions.map((tx, index) => (
            <div key={index} className="flex items-center justify-between bg-casino-thunder-darker p-2 rounded-md">
              <div className="flex items-center">
                {tx.type === 'deposit' || tx.type === 'win' ? (
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mr-2">
                    <ArrowDown className="h-4 w-4 text-green-500" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center mr-2">
                    <ArrowUp className="h-4 w-4 text-red-500" />
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium">{tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</p>
                  <p className="text-xs text-white/60">{new Date(tx.date).toLocaleDateString()}</p>
                </div>
              </div>
              <p className={cn("font-medium", tx.type === 'deposit' || tx.type === 'win' ? "text-green-500" : "text-red-500")}>
                {tx.type === 'deposit' || tx.type === 'win' ? '+' : '-'}
                {tx.amount} {tx.currency}
              </p>
            </div>
          )) : (
            <div className="text-center py-3 text-sm text-white/60">
              No recent transactions
            </div>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="border-casino-thunder-green text-casino-thunder-green">
          Deposit
        </Button>
        <Button className="bg-casino-thunder-green text-black hover:bg-casino-thunder-green/90">
          Withdraw
        </Button>
      </div>
    </div>
  );
};

export default MobileWalletSummary;
