
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { transactionService } from '@/services/transactionService';
import { Transaction, User } from '@/types'; // Ensure User type is imported if needed for something else
import { Loader2, ArrowDownUp, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns'; // For date formatting

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>(''); // e.g., 'deposit', 'withdrawal', 'bet', 'win'
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.id) {
        setIsLoading(false);
        setError("User not authenticated.");
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        // Construct filter object based on state
        const filters: any = { userId: user.id, sortBy: 'created_at', sortOrder };
        if (filterType) {
          filters.type = filterType;
        }
        const data = await transactionService.getTransactions(filters);
        setTransactions(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch transactions.");
        console.error("Transaction fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [user?.id, filterType, sortOrder]);

  const handleSortToggle = () => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
  };

  const getTransactionDescription = (tx: Transaction): string => {
    switch (tx.type?.toLowerCase()) {
      case 'deposit':
        return `Deposit - ${tx.provider || 'System'}`;
      case 'withdrawal':
        return `Withdrawal - ${tx.provider || 'System'}`;
      case 'bet':
        return `Bet - Game: ${tx.game_id || tx.gameName || 'N/A'}${tx.round_id ? ` (Round: ${tx.round_id})` : ''}`;
      case 'win':
        return `Win - Game: ${tx.game_id || tx.gameName || 'N/A'}${tx.round_id ? ` (Round: ${tx.round_id})` : ''}`;
      case 'bonus':
        return `Bonus Awarded - ${tx.details || 'System Bonus'}`;
      case 'adjustment':
        return `Balance Adjustment - ${tx.details || 'System Adjustment'}`;
      default:
        return tx.details || tx.type || 'Transaction';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-destructive py-4">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Transaction History</h1>
      
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-lg shadow">
        <div className="flex-1">
          <label htmlFor="filter-type" className="block text-sm font-medium text-muted-foreground mb-1">Filter by Type</label>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger id="filter-type">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="deposit">Deposit</SelectItem>
              <SelectItem value="withdrawal">Withdrawal</SelectItem>
              <SelectItem value="bet">Bet</SelectItem>
              <SelectItem value="win">Win</SelectItem>
              <SelectItem value="bonus">Bonus</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSortToggle} variant="outline" className="self-end sm:self-center">
          <ArrowDownUp className="mr-2 h-4 w-4" />
          Sort by Date ({sortOrder === 'asc' ? 'Oldest' : 'Newest'})
        </Button>
      </div>

      {transactions.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No transactions found.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                {/* <TableHead>Balance After</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.created_at ? format(new Date(tx.created_at), 'PPpp') : 'N/A'}</TableCell>
                  <TableCell>{getTransactionDescription(tx)}</TableCell>
                  <TableCell className={`text-right font-semibold ${Number(tx.amount) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {Number(tx.amount) >= 0 ? '+' : ''}
                    {Number(tx.amount).toLocaleString(undefined, { style: 'currency', currency: tx.currency || 'USD' })}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      tx.status === 'completed' ? 'bg-green-100 text-green-700' : 
                      tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                      tx.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {tx.status ? tx.status.charAt(0).toUpperCase() + tx.status.slice(1) : 'N/A'}
                    </span>
                  </TableCell>
                  {/* <TableCell>{tx.balance_after?.toLocaleString(undefined, { style: 'currency', currency: tx.currency || 'USD' })}</TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default Transactions;
