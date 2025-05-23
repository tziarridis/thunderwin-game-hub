
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export interface MobileWalletSummaryProps {
  wallet: any;
  showRefresh?: boolean;
  onRefresh?: () => Promise<void>;
  user?: any;
}

const MobileWalletSummary: React.FC<MobileWalletSummaryProps> = ({
  wallet,
  showRefresh = false,
  onRefresh,
  user
}) => {
  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
    }
  };

  if (!wallet) {
    return (
      <div className="bg-card p-4 rounded-lg shadow animate-pulse">
        <div className="h-6 bg-muted rounded mb-2 w-1/3"></div>
        <div className="h-8 bg-muted rounded mb-4 w-2/3"></div>
      </div>
    );
  }

  return (
    <div className="bg-card p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-1">
        <span className="text-muted-foreground">Balance</span>
        {showRefresh && onRefresh && (
          <Button variant="ghost" size="icon" onClick={handleRefresh} className="h-6 w-6">
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="flex items-baseline">
        <span className="text-2xl font-bold">
          {wallet.symbol || '$'}{wallet.balance?.toFixed(2) || '0.00'}
        </span>
      </div>

      {wallet.bonusBalance > 0 && (
        <div className="mt-1 text-sm">
          <span className="text-muted-foreground">Bonus: </span>
          <span className="font-medium">{wallet.symbol || '$'}{wallet.bonusBalance.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
};

export default MobileWalletSummary;
