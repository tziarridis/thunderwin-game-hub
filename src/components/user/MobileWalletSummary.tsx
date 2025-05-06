
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, ArrowUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Wallet } from '@/types/wallet';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const MobileWalletSummary = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const { user, refreshWalletBalance } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  useEffect(() => {
    if (user && isMobile) {
      fetchWalletInfo();
    }
  }, [user, isMobile]);
  
  const fetchWalletInfo = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setWallet({
          id: data.id,
          userId: data.user_id,
          balance: data.balance || 0,
          currency: data.currency || 'USD',
          symbol: data.symbol || '$',
          vipLevel: data.vip_level || 0,
          bonusBalance: data.balance_bonus || 0,
          cryptoBalance: data.balance_cryptocurrency || 0,
          demoBalance: data.balance_demo || 1000,
          isActive: data.active || false
        });
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshWalletBalance();
    await fetchWalletInfo();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };
  
  if (!isMobile || !wallet) return null;

  return (
    <Card className="bg-gradient-to-r from-slate-800 to-slate-900 m-4 sticky top-[72px] z-10">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-sm text-white/70">Total Balance</span>
            <span className="text-2xl font-bold">{wallet.symbol}{wallet.balance.toFixed(2)}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700">
              <ArrowUp className="mr-1 h-3 w-3" />
              Deposit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileWalletSummary;
