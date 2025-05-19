
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRightIcon } from 'lucide-react';

// Define a basic Transaction type for the component
interface Transaction {
  id: string;
  date: string;
  type: string;
  amount: number;
  status: string;
  game?: string;
}

interface TransactionsListProps {
  title?: string;
  transactions: Transaction[];
  showViewAllLink?: string;
}

const TransactionsList: React.FC<TransactionsListProps> = ({ 
  title = "Recent Transactions",
  transactions,
  showViewAllLink
}) => {
  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-6">
          No transactions to display.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>{title}</CardTitle>
        {showViewAllLink && (
          <Link 
            to={showViewAllLink} 
            className="text-sm font-medium text-primary hover:underline inline-flex items-center"
          >
            View All 
            <ArrowRightIcon className="ml-1 h-4 w-4" />
          </Link>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map(transaction => (
            <div key={transaction.id} className="flex justify-between items-center border-b border-border pb-2 last:border-0 last:pb-0">
              <div>
                <div className="font-medium">{transaction.type}</div>
                <div className="text-sm text-muted-foreground flex items-center">
                  <span>{new Date(transaction.date).toLocaleDateString()}</span>
                  {transaction.game && <span className="ml-1">• {transaction.game}</span>}
                </div>
              </div>
              <div className="text-right">
                <div className={transaction.type === 'Deposit' || transaction.type === 'Win' ? 'text-green-500' : 'text-red-500'}>
                  {transaction.type === 'Withdrawal' || transaction.type === 'Bet' ? '-' : '+'}${transaction.amount.toFixed(2)}
                </div>
                <Badge 
                  variant={
                    transaction.status === 'completed' ? 'default' : 
                    transaction.status === 'pending' ? 'secondary' : 
                    transaction.status === 'failed' ? 'destructive' : 'outline'
                  }
                  className="text-xs"
                >
                  {transaction.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionsList;
