import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { Transaction, TransactionFilter } from '@/types/transaction';
import { getTransactions } from '@/services/transactions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TransactionsLayoutProps {
  children: React.ReactNode;
}

const TransactionsLayout: React.FC<TransactionsLayoutProps> = ({ children }) => {
  return <>{children}</>;
};

const Transactions = () => {
  const [transactions, useState<Transaction[]>([]);
  const [loading, useState<boolean>(true);
  const [error, useState<string | null>(null);
  const [filters, useState<TransactionFilter>({});
  const { user } = useAuth();

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        if (user?.id) {
          const transactionFilters: TransactionFilter = {
            player_id: user.id,
            ...filters,
          };
          const transactionsData = await getTransactions(transactionFilters);
          setTransactions(transactionsData);
        } else {
          setError('User ID not available');
          setTransactions([]);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to fetch transactions');
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user?.id, filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <TransactionsLayout>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-semibold mb-5">Transaction History</h1>

        <div className="mb-5">
          <Input
            type="text"
            name="type"
            placeholder="Filter by type"
            onChange={handleFilterChange}
          />
          <Input
            type="text"
            name="provider"
            placeholder="Filter by provider"
            onChange={handleFilterChange}
          />
          {/* Add more filters as needed */}
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
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.id}</TableCell>
                    <TableCell>{transaction.type}</TableCell>
                    <TableCell>{transaction.amount}</TableCell>
                    <TableCell>{transaction.currency}</TableCell>
                    <TableCell>{transaction.provider}</TableCell>
                    <TableCell>
                      <Badge variant={transaction.status === 'completed' ? 'secondary' : 'default'}>
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.created_at}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </TransactionsLayout>
  );
};

export default Transactions;
