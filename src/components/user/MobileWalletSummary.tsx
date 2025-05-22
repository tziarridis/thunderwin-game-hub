
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, ArrowDownCircle } from 'lucide-react';
import { Wallet as UserWalletType } from '@/types'; 

interface MobileWalletSummaryProps {
  wallet: UserWalletType | null;
  onDepositClick?: () => void; // Made optional if not always used
  onWithdrawClick?: () => void; // Made optional
}

const MobileWalletSummary: React.FC<MobileWalletSummaryProps> = ({ wallet, onDepositClick, onWithdrawClick }) => {
  if (!wallet) {
    return (
      <div className="p-4 bg-card border rounded-lg shadow animate-pulse">
        <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">My Wallet</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="text-3xl font-bold text-primary">
          {(wallet.balance ?? 0).toLocaleString(undefined, { style: 'currency', currency: wallet.currency || 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
           {wallet.currency || 'USD'} {wallet.symbol && `(${wallet.symbol})`}
        </div>
      </CardContent>
      {(onDepositClick || onWithdrawClick) && (
        <CardFooter className="grid grid-cols-2 gap-2 pt-0">
          {onDepositClick && (
            <Button onClick={onDepositClick} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Deposit
            </Button>
          )}
          {onWithdrawClick && (
            <Button variant="outline" onClick={onWithdrawClick} className="w-full">
              <ArrowDownCircle className="mr-2 h-4 w-4" /> Withdraw
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default MobileWalletSummary;
