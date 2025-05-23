
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, RefreshCw } from 'lucide-react';
import { WalletType } from '@/types/wallet';

export interface MobileWalletSummaryProps {
  wallet?: WalletType | null;
  showRefresh?: boolean;
  onRefresh?: () => void;
}

const MobileWalletSummary: React.FC<MobileWalletSummaryProps> = ({
  wallet,
  showRefresh = false,
  onRefresh
}) => {
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Wallet className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="text-lg font-semibold">
                {wallet?.symbol || '$'}{wallet?.balance?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
          {showRefresh && onRefresh && (
            <Button variant="ghost" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileWalletSummary;
