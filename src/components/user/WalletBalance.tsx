
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet } from '@/types'; // Changed from WalletType to Wallet
import { useTheme } from 'next-themes';
import { Skeleton } from '@/components/ui/skeleton';

interface WalletBalanceProps {
  wallet: Wallet | null; // Use the Wallet type
  isLoading?: boolean;
  className?: string;
  title?: string; // Added title prop
}

const WalletBalance: React.FC<WalletBalanceProps> = ({ wallet, isLoading, className, title = "My Balance" }) => {
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <Card className={cn("shadow-lg", className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-1/2 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </CardContent>
      </Card>
    );
  }

  if (!wallet) {
    return (
      <Card className={cn("shadow-lg", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Wallet data not available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("shadow-lg", className, theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white')}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-primary">
          {(wallet.balance ?? 0).toLocaleString(undefined, { style: 'currency', currency: wallet.currency || 'USD' })}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {wallet.currency || 'USD'} {wallet.symbol && `(${wallet.symbol})`}
        </div>
      </CardContent>
    </Card>
  );
};

// cn utility function (often in @/lib/utils)
// If not already present, add this utility or import it.
// For brevity, assuming it's available.
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default WalletBalance;
