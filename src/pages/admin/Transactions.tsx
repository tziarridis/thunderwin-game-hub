// ... keep existing code (imports)
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Transaction, TransactionStatus, TransactionType } from '@/types/transaction'; // Keep this
import { WalletTransaction } from '@/types/wallet'; // For specific wallet transaction types, ensure 'adjustment' is included if needed
import { User } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { Search, FileDown, Edit2, Loader2 } from 'lucide-react';
import CMSPageHeader from '@/components/admin/cms/CMSPageHeader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

// Use WalletTransaction if it's more comprehensive and includes 'adjustment'
// Otherwise, ensure TransactionType includes 'adjustment'
interface ExtendedTransaction extends WalletTransaction { // Using WalletTransaction
  user_id: string; // This might be player_id in your DB
  notes?: string;
  // Add any other fields from 'transactions' table not in WalletTransaction
  player_id?: string; // if your DB table uses this for user linking
  game_id?: string;
  provider?: string; // Ensure this is part of the type if used
}

const ITEMS_PER_PAGE = 15;

const AdminTransactions: React.FC = () => {
// ... keep existing code (state variables)
  const [transactions, setTransactions] = useState<ExtendedTransaction[]>([]);
  const [users, setUsers] = useState<Record<string, Pick<User, 'id' | 'username' | 'email'>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<WalletTransaction['type'] | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<WalletTransaction['status'] | 'all'>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);

  const [editingTransaction, setEditingTransaction] = useState<ExtendedTransaction | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchTransactions = useCallback(async (page: number) => {
// ... keep existing code (fetchTransactions logic)
    setIsLoading(true);
    try {
      let query = supabase
        .from('transactions') // ensure this table matches ExtendedTransaction fields
        .select('*, user:users!inner(id, username, email)', { count: 'exact' }); // Use !inner if user must exist

      if (searchTerm) {
        query = query.or(`id.ilike.%${searchTerm}%,player_id.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%,provider.ilike.%${searchTerm}%,game_id.ilike.%${searchTerm}%`);
      }
      if (filterType !== 'all') {
        query = query.eq('type', filterType);
      }
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }
      if (dateRange?.from) {
        query = query.gte('created_at', format(dateRange.from, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"));
      }
      if (dateRange?.to) {
        query = query.lte('created_at', format(dateRange.to, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"));
      }

      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.order('created_at', { ascending: false }).range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;
      
      const fetchedTransactions = (data || []).map(txAny => {
        const tx = txAny as any; 
        const userIdKey = tx.player_id || tx.user_id; // Use player_id if present
        if (tx.user && typeof tx.user === 'object' && userIdKey) {
          setUsers(prevUsers => ({
            ...prevUsers,
            [userIdKey]: { id: tx.user.id, username: tx.user.username, email: tx.user.email }
          }));
        }
        return {
          ...tx,
          user_id: userIdKey, // Standardize to user_id in the frontend type
          // Ensure all fields of ExtendedTransaction are mapped
        } as ExtendedTransaction;
      });

      setTransactions(fetchedTransactions);
      setTotalTransactions(count || 0);

    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, filterType, filterStatus, dateRange]);

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [fetchTransactions, currentPage]);

  const handleSearchFilter = () => {
    setCurrentPage(1);
  };
  
  const handleEditTransaction = (tx: ExtendedTransaction) => {
    setEditingTransaction(tx);
    setShowEditModal(true);
  };

  const handleSaveTransaction = async (event: React.FormEvent<HTMLFormElement>) => {
// ... keep existing code (handleSaveTransaction logic)
    event.preventDefault();
    if (!editingTransaction) return;

    const formData = new FormData(event.currentTarget);
    const newStatus = formData.get('status') as WalletTransaction['status'];
    const newNotes = formData.get('notes') as string;

    setIsLoading(true);
    try {
        const { error } = await supabase
            .from('transactions')
            .update({ status: newStatus, notes: newNotes, updated_at: new Date().toISOString() })
            .eq('id', editingTransaction.id);
        if (error) throw error;
        toast.success('Transaction updated successfully!');
        setShowEditModal(false);
        setEditingTransaction(null);
        fetchTransactions(currentPage);
    } catch (error: any) {
        toast.error(`Failed to update transaction: ${error.message}`);
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleExport = () => {
// ... keep existing code (handleExport logic)
    if(transactions.length === 0) {
      toast.info("No transactions to export.");
      return;
    }
    const dataToExport = transactions.map(tx => ({
        ...tx,
        username: users[tx.user_id]?.username || 'N/A',
        user_email: users[tx.user_id]?.email || 'N/A',
        created_at: format(parseISO(tx.created_at), 'yyyy-MM-dd HH:mm:ss'),
        updated_at: format(parseISO(tx.updated_at), 'yyyy-MM-dd HH:mm:ss'),
    }));

    const headers = Object.keys(dataToExport[0]).join(',');
    const csvContent = "data:text/csv;charset=utf-8," 
        + headers + "\n"
        + dataToExport.map(e => Object.values(e).map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',')).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Transactions exported successfully.");
  };

  const totalPages = Math.ceil(totalTransactions / ITEMS_PER_PAGE);
  const transactionTypes: Array<WalletTransaction['type']> = ['deposit', 'withdrawal', 'bet', 'win', 'bonus', 'adjustment', 'refund'];
  const transactionStatuses: Array<WalletTransaction['status']> = ['pending', 'completed', 'failed', 'cancelled', 'approved', 'rejected'];

  return (
    <div className="container mx-auto p-4">
      <CMSPageHeader title="Transaction Management" description="View and manage all user transactions." />

      <div className="mb-6 p-4 border rounded-lg bg-card shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <Input
            placeholder="Search by Tx ID, User ID, Notes, Game ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="lg:col-span-2"
          />
          <Select value={filterType} onValueChange={(value) => setFilterType(value as WalletTransaction['type'] | 'all')}>
            <SelectTrigger><SelectValue placeholder="Filter by Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {transactionTypes.map(type => (
                <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as WalletTransaction['status'] | 'all')}>
            <SelectTrigger><SelectValue placeholder="Filter by Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {transactionStatuses.map(status => (
                <SelectItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="lg:col-span-2">
             {/* Corrected DateRangePicker props */}
            <DateRangePicker 
                initialDateRange={dateRange} 
                onUpdate={({range}) => setDateRange(range)} 
                align="start" 
                locale="en-GB"
                showCompare={false}
            />
          </div>
          <Button onClick={handleSearchFilter} className="w-full md:w-auto flex items-center gap-2">
            <Search className="h-4 w-4" /> Apply Filters
          </Button>
           <Button onClick={handleExport} variant="outline" className="w-full md:w-auto flex items-center gap-2">
            <FileDown className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>
      
      {isLoading && transactions.length === 0 && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}

      {transactions.length > 0 && (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tx ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => {
                const user = users[tx.user_id];
                return (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium truncate max-w-[100px]" title={tx.id}>{tx.id}</TableCell>
                    <TableCell className="truncate max-w-[150px]" title={user?.username || user?.email || tx.user_id}>
                      {user?.username || user?.email || tx.user_id.substring(0,8)+'...'}
                    </TableCell>
                    <TableCell>{tx.type}</TableCell>
                    <TableCell>{tx.amount.toFixed(2)} {tx.currency}</TableCell>
                    <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                            tx.status === 'completed' || tx.status === 'approved' ? 'bg-green-100 text-green-700' :
                            tx.status === 'failed' || tx.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                            {tx.status}
                        </span>
                    </TableCell>
                    <TableCell className="truncate max-w-[100px]" title={tx.provider || undefined}>{tx.provider || 'N/A'}</TableCell>
                    <TableCell>{format(parseISO(tx.created_at), 'yyyy-MM-dd HH:mm')}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleEditTransaction(tx)} title="Edit/View Transaction">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
       {!isLoading && transactions.length === 0 && (
         <p className="text-center text-muted-foreground py-6">No transactions found matching your criteria.</p>
       )}

      {totalPages > 1 && (
         <div className="flex justify-between items-center mt-4">
            <Button 
                onClick={() => setCurrentPage(p => Math.max(1, p-1))} 
                disabled={currentPage === 1 || isLoading}
                variant="outline"
            >
                Previous
            </Button>
            <span>Page {currentPage} of {totalPages}</span>
            <Button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} 
                disabled={currentPage === totalPages || isLoading}
                variant="outline"
            >
                Next
            </Button>
        </div>
      )}

      {editingTransaction && (
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Transaction: {editingTransaction.id.substring(0,8)}...</DialogTitle>
                    <DialogDescription>
                        Update status or add notes for this transaction. User: {users[editingTransaction.user_id]?.username || editingTransaction.user_id.substring(0,8)}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSaveTransaction} className="space-y-4 py-2">
                    <div>
                        <Label htmlFor="tx-status">Status</Label>
                        <Select name="status" defaultValue={editingTransaction.status}>
                            <SelectTrigger id="tx-status" className="mt-1">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {transactionStatuses.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="tx-notes">Admin Notes</Label>
                        <Textarea id="tx-notes" name="notes" defaultValue={editingTransaction.notes || ''} rows={3} className="mt-1"/>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminTransactions;
