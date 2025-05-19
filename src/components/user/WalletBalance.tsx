
import React, { useState, useEffect } from 'react'; // Added useState, useEffect
import { WalletType } from '@/types'; // Use WalletType
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, CreditCard, Landmark } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client'; // Import supabase

interface WalletBalanceProps {
  // Wallet prop might not be needed if using useAuth and local fetch
}

const WalletBalance: React.FC<WalletBalanceProps> = () => {
  const { isAuthenticated, user } = useAuth(); // Removed wallet from context
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<WalletType | null>(null); // Local state for wallet
  const [loadingWallet, setLoadingWallet] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      setLoadingWallet(true);
      const fetchWallet = async () => {
        const { data, error } = await supabase
          .from('wallets')
          .select('balance, currency, vip_level, vip_points') // Fetch vip_level and vip_points
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching wallet in WalletBalance:", error);
          setWallet(null);
        } else if (data) {
          setWallet({
            balance: data.balance,
            currency: data.currency,
            vipLevel: data.vip_level,
            vipPoints: data.vip_points,
          });
        } else {
          setWallet(null); // No wallet data found
        }
        setLoadingWallet(false);
      };
      fetchWallet();
    } else {
      setWallet(null);
      setLoadingWallet(false);
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please log in to view your wallet.</p>
        </CardContent>
      </Card>
    );
  }
  
  if (loadingWallet) { // Changed from !wallet to loadingWallet
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="h-10 bg-muted rounded w-3/4 mb-4"></div>
          <div className="flex gap-2">
            <div className="h-10 bg-muted rounded flex-1"></div>
            <div className="h-10 bg-muted rounded flex-1"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!wallet) {
     return (
      <Card>
        <CardHeader>
          <CardTitle>Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Could not load wallet information.</p>
           <Button onClick={() => navigate('/profile/deposit')} className="mt-2"> {/* Changed path */}
                Try Reload or Deposit
            </Button>
        </CardContent>
      </Card>
    );
  }

  const balance = wallet.balance ?? 0; // Use nullish coalescing
  const currency = wallet.currency || 'USD';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Account Balance</span>
          <DollarSign className="h-6 w-6 text-muted-foreground" />
        </CardTitle>
        <CardDescription>Your current available funds.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold mb-1">
          {balance.toLocaleString(user.user_metadata.language || undefined, { style: 'currency', currency: currency, minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          {/* Bonus Balance: 0.00 {currency} */}
          {wallet.vipLevel !== undefined && `VIP Level: ${wallet.vipLevel}`}
          {wallet.vipPoints !== undefined && ` | VIP Points: ${wallet.vipPoints}`}
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => navigate('/profile/deposit')} className="flex-1"> {/* Changed path */}
                <CreditCard className="mr-2 h-4 w-4" /> Deposit
            </Button>
            <Button variant="outline" onClick={() => navigate('/profile/withdraw')} className="flex-1"> {/* Changed path */}
                <Landmark className="mr-2 h-4 w-4" /> Withdraw
            </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletBalance;
