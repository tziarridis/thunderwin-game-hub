
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { AppUser } from '@/types';

export interface MobileWalletSummaryProps {
  user: AppUser | null;
  wallet?: {
    balance: number;
    currency: string;
    symbol: string;
  };
  showRefresh?: boolean;
  onRefresh?: () => Promise<void>;
}

const MobileWalletSummary: React.FC<MobileWalletSummaryProps> = ({
  user,
  wallet,
  showRefresh = true,
  onRefresh
}) => {
  const [isBalanceVisible, setIsBalanceVisible] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

  const displayWallet = wallet || user?.wallet || { balance: 0, currency: 'USD', symbol: '$' };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Wallet className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm font-medium">Balance</p>
              <p className="text-lg font-bold">
                {isBalanceVisible 
                  ? `${displayWallet.symbol}${displayWallet.balance.toFixed(2)}`
                  : '••••••'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsBalanceVisible(!isBalanceVisible)}
            >
              {isBalanceVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            {showRefresh && onRefresh && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileWalletSummary;
