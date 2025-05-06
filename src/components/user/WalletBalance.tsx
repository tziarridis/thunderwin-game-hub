
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, CreditCard, Wallet, ArrowUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Wallet as WalletType } from '@/types';

const WalletBalance = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const { user, refreshWalletBalance } = useAuth();
  
  useEffect(() => {
    if (user) {
      fetchWalletInfo();
    }
  }, [user]);
  
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
  
  if (!wallet) {
    return (
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900">
        <CardContent className="pt-6 pb-4">
          <div className="flex justify-center items-center h-24">
            <RefreshCw className="animate-spin h-6 w-6 text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-slate-800 to-slate-900">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-medium text-white">Your Balance</CardTitle>
          <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription>Main wallet balance</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-col items-center">
          <div className="text-4xl font-bold text-white mb-2">
            {wallet.symbol}{wallet.balance.toFixed(2)}
          </div>
          <div className="text-sm text-white/50">
            {wallet.currency}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white/5 p-3 rounded">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-white/70">Bonus</span>
            </div>
            <div className="text-lg font-semibold mt-1">
              {wallet.symbol}{wallet.bonusBalance.toFixed(2)}
            </div>
          </div>
          <div className="bg-white/5 p-3 rounded">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-green-400" />
              <span className="text-sm text-white/70">Demo</span>
            </div>
            <div className="text-lg font-semibold mt-1">
              {wallet.symbol}{wallet.demoBalance.toFixed(2)}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-green-600 hover:bg-green-700">
          <ArrowUp className="mr-2 h-4 w-4" />
          Deposit Funds
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WalletBalance;
