import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from 'lucide-react';

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  status: string;
  date: string;
  [key: string]: any;
}

interface PPTransactionLoggerProps { }

const PPTransactionLogger: React.FC<PPTransactionLoggerProps> = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [searchTerm, page, itemsPerPage, sortBy, sortOrder, statusFilter]);

  const fetchTransactions = async () => {
    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .ilike('user_id', `%${searchTerm}%`)
      .range((page - 1) * itemsPerPage, page * itemsPerPage - 1)
      .order(sortBy, { ascending: sortOrder === 'asc' });

    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching transactions:', error);
    } else {
      setTransactions(data as Transaction[]);
      setTotalItems(count || 0);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setPage(1);
  };

  const handleSort = (field: string) => {
    if (field === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  const renderSortArrow = (field: string) => {
    if (sortBy === field) {
      return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />;
    }
    return null;
  };

  const renderTransactionRow = (transaction: Transaction) => (
    <TableRow key={transaction.id}>
      <TableCell className="font-medium">{transaction.id}</TableCell>
      <TableCell>{transaction.user_id}</TableCell>
      <TableCell>${transaction.amount.toFixed(2)}</TableCell>
      <TableCell className="capitalize">{transaction.type}</TableCell>
      <TableCell>
        <Badge
          variant={
            transaction.status === 'approved'
              ? 'success'
              : transaction.status === 'processing'
                ? 'secondary'
                : transaction.status === 'rejected'
                  ? 'destructive'
                  : ['failed', 'cancelled', 'expired'].includes(transaction.status)
                    ? 'destructive'
                    : transaction.status === 'pending'
                      ? 'outline'
                      : 'default'
          }
          className="capitalize"
        >
          {transaction.status}
        </Badge>
      </TableCell>
      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
    </TableRow>
  );

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5">Transactions</h1>

      <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 mb-5">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search by User ID..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>

        <Select onValueChange={handleItemsPerPageChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Items per page" />
          </SelectTrigger>
          <SelectContent>
            {[10, 20, 30, 50].map((num) => (
              <SelectItem key={num} value={num.toString()}>
                {num}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Filter by Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {['pending', 'approved', 'processing', 'rejected', 'failed', 'cancelled', 'expired', 'refunded'].map((status) => (
              <DropdownMenuItem key={status} onClick={() => handleStatusFilterChange(status)} className="capitalize">
                {status}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleStatusFilterChange('')}>Clear Filter</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead
                onClick={() => handleSort('date')}
                className="cursor-pointer"
              >
                Date {renderSortArrow('date')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map(renderTransactionRow)}
          </TableBody>
        </Table>
      </div>

      <Pagination className="mt-5">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            />
          </PaginationItem>
          {/* Display page numbers - this is a simplified version */}
          {Array.from({ length: Math.min(5, Math.ceil(totalItems / itemsPerPage)) }, (_, i) => page <= 3 ? i + 1 : page - 2 + i).map(pageNumber => (
            <PaginationItem key={pageNumber}>
              {pageNumber === page ? (
                <PaginationLink href="#" className="font-semibold">
                  {pageNumber}
                </PaginationLink>
              ) : (
                <PaginationLink href="#" onClick={() => setPage(pageNumber)}>
                  {pageNumber}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={() => setPage((prev) => Math.min(prev + 1, Math.ceil(totalItems / itemsPerPage)))}
              disabled={page >= Math.ceil(totalItems / itemsPerPage)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default PPTransactionLogger;
