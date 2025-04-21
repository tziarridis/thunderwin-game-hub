// Update imports to use the new transaction index file
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/layout/AdminLayout';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Transaction, 
  TransactionFilter,
  getTransactions 
} from '@/services/transactions'; // Updated import

interface TransactionRow extends Transaction {
  transactionId: string;
  userId: string;
  userName: string;
  gameId: string;
  roundId: string;
  timestamp: string;
  date: string;
  method: string;
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionFilter>({});

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const transactionsData = await getTransactions(filters);
        setTransactions(transactionsData as TransactionRow[]);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [filters]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const applySearch = () => {
    setFilters(prev => ({ ...prev, search }));
  };

  const clearSearch = () => {
    setSearch('');
    setFilters(prev => {
      const { search, ...rest } = prev;
      return rest;
    });
  };

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={handleSearch}
              />
              <Button onClick={applySearch} size="sm">
                Search
              </Button>
              <Button onClick={clearSearch} variant="outline" size="sm">
                Clear
              </Button>
            </div>
            {loading ? (
              <div>Loading transactions...</div>
            ) : error ? (
              <div className="text-red-500">Error: {error}</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableCaption>A list of your recent transactions.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Game ID</TableHead>
                      <TableHead>Round ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.transactionId}</TableCell>
                        <TableCell>{transaction.userId}</TableCell>
                        <TableCell>{transaction.userName}</TableCell>
                        <TableCell>{transaction.gameId}</TableCell>
                        <TableCell>{transaction.roundId}</TableCell>
                        <TableCell>{transaction.type}</TableCell>
                        <TableCell>{transaction.amount}</TableCell>
                        <TableCell>{transaction.currency}</TableCell>
                        <TableCell>{transaction.method}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.status === 'completed' ? 'success' : 'default'}>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.timestamp}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default Transactions;
