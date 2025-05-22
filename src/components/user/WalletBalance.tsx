import React from 'react';
import { WalletType } from '@/types/wallet'; // Corrected: Ensure WalletType is from wallet.ts
import { Button } from '@/components/ui/button';
import { Wallet, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface WalletBalanceProps {
  wallet: WalletType | null;
  isLoading?: boolean;
  onRefresh?: () => void;
  className?: string;
}

const WalletBalance: React.FC<WalletBalanceProps> = ({ wallet, isLoading, onRefresh, className }) => {
  const [isVisible, setIsVisible] = React.useState(true);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const formatCurrency = (amount: number, currencySymbol: string) => {
    return `${currencySymbol}${amount.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className={`bg-card p-4 rounded-lg shadow flex items-center justify-between ${className}`}>
        <div>
          <Skeleton className="h-5 w-24 mb-1" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className={`bg-card p-4 rounded-lg shadow text-muted-foreground ${className}`}>
        Wallet not available.
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4 rounded-lg shadow-lg flex items-center justify-between ${className}`}>
      <div>
        <p className="text-sm opacity-80">Main Balance ({wallet.currency})</p>
        <p className="text-2xl font-bold">
          {isVisible ? formatCurrency(wallet.balance, wallet.symbol) : `${wallet.symbol}••••••`}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" onClick={toggleVisibility} className="text-primary-foreground hover:bg-white/20">
          {isVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </Button>
        {onRefresh && (
          <Button variant="ghost" size="icon" onClick={onRefresh} className="text-primary-foreground hover:bg-white/20">
            <RefreshCw className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default WalletBalance;
