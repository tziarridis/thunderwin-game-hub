
import { useState, useEffect } from "react";
import { transactionService } from "@/services/transactionService";
import { WalletTransaction } from "@/types/wallet";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TransactionsListProps {
  userId: string;
  limit?: number;
  showFilters?: boolean;
}

const TransactionsList = ({ userId, limit = 10, showFilters = false }: TransactionsListProps) => {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const result = await transactionService.getUserTransactions(userId, limit);
        setTransactions(result.data);
      } catch (error) {
        console.error("Failed to load transactions:", error);
        toast({
          title: "Error",
          description: "Failed to load transaction history",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchTransactions();
    }
  }, [userId, limit, toast]);

  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-lg text-gray-400">No transactions yet</p>
            <p className="text-sm text-gray-500 mt-2">Your transaction history will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Type</th>
                <th className="text-right py-3 px-4">Amount</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">{new Date(transaction.created_at).toLocaleString()}</td>
                  <td className="py-3 px-4 capitalize">
                    <Badge variant={
                      transaction.type === 'deposit' || transaction.type === 'win' ? 'success' : 
                      transaction.type === 'withdraw' || transaction.type === 'bet' ? 'destructive' : 
                      'secondary'
                    }>
                      {transaction.type}
                    </Badge>
                  </td>
                  <td className={`py-3 px-4 text-right ${
                    transaction.type === 'deposit' || transaction.type === 'win' || transaction.type === 'bonus' 
                      ? 'text-green-500' 
                      : 'text-red-500'
                  }`}>
                    {transaction.type === 'deposit' || transaction.type === 'win' || transaction.type === 'bonus' ? '+' : '-'}
                    {transaction.amount.toFixed(2)} {transaction.currency}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={
                      transaction.status === 'completed' ? 'outline' : 
                      transaction.status === 'pending' ? 'secondary' : 
                      'destructive'
                    }>
                      {transaction.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    {transaction.description || 
                     (transaction.game_id && `Game: ${transaction.game_id}`) || 
                     (transaction.payment_method && `Method: ${transaction.payment_method}`) || 
                     '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionsList;
