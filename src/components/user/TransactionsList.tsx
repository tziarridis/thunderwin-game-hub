
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { getUserTransactions } from "@/services/transactionService";
import { Transaction } from "@/types/transaction";
import { Loader2 } from "lucide-react";

interface TransactionsListProps {
  userId: string;
  limit?: number;
}

const TransactionsList = ({ userId, limit = 20 }: TransactionsListProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userId) {
        setError("User ID is required to fetch transactions");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const result = await getUserTransactions(userId, { limit });
        setTransactions(result.data);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
        setError("Failed to load transactions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userId, limit]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-casino-thunder-green mr-2" />
        <span>Loading transactions...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-2">{error}</div>;
  }

  return (
    <div>
      {transactions && transactions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 font-medium text-gray-900">
                    {transaction.id?.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                    {transaction.type}
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                    {transaction.amount} {transaction.currency}
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                    <Badge variant={transaction.status === 'completed' ? 'success' : transaction.status === 'pending' ? 'secondary' : 'destructive'}>
                      {transaction.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                    {new Date(transaction.date).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-4 text-center text-gray-500">No transactions found.</div>
      )}
    </div>
  );
};

export default TransactionsList;
