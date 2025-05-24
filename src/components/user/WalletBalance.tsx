
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WalletType } from '@/types/wallet';
import { RefreshCw } from 'lucide-react';

interface WalletBalanceProps {
  wallet: WalletType | null;
  isLoading: boolean;
  onRefresh: () => void;
}

const WalletBalance: React.FC<WalletBalanceProps> = ({ wallet, isLoading, onRefresh }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wallet Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Wallet Balance</CardTitle>
          <CardDescription>Your current balance</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {wallet?.symbol || '$'}{wallet?.balance?.toFixed(2) || '0.00'}
        </div>
        <p className="text-sm text-muted-foreground">
          {wallet?.currency || 'USD'}
        </p>
      </CardContent>
    </Card>
  );
};

export default WalletBalance;
