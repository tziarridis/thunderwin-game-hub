
import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  getTransactions, 
  Transaction, 
  TransactionFilter 
} from "@/services/transactionService";

const AdminTransactions = () => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const transactionsPerPage = 8;
  
  // Fetch transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, []);
  
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const filter: TransactionFilter = {
        limit: 100 // Get a reasonable amount of transactions
      };
      const data = await getTransactions(filter);
      
      // Add UI-friendly properties to the transactions
      const formattedTransactions = data.map(tx => ({
        ...tx,
        id: tx.id, // Use the actual ID
        userName: tx.player_id,
        userId: tx.player_id,
        date: tx.created_at,
        method: tx.provider
      }));
      
      setTransactions(formattedTransactions);
      setFilteredTransactions(formattedTransactions);
      toast.success(`Loaded ${formattedTransactions.length} transactions`);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate pagination
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  
  const handleSelectRow = (transactionId: string) => {
    if (selectedRows.includes(transactionId)) {
      setSelectedRows(selectedRows.filter(id => id !== transactionId));
    } else {
      setSelectedRows([...selectedRows, transactionId]);
    }
  };
  
  const handleSelectAll = () => {
    if (selectedRows.length === currentTransactions.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(currentTransactions.map(transaction => transaction.id));
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    filterTransactions(query, statusFilter, typeFilter);
  };
  
  const toggleStatusFilter = (status: string) => {
    const newStatusFilter = statusFilter.includes(status)
      ? statusFilter.filter(s => s !== status)
      : [...statusFilter, status];
      
    setStatusFilter(newStatusFilter);
    filterTransactions(searchQuery, newStatusFilter, typeFilter);
  };
  
  const toggleTypeFilter = (type: string) => {
    const newTypeFilter = typeFilter.includes(type)
      ? typeFilter.filter(t => t !== type)
      : [...typeFilter, type];
      
    setTypeFilter(newTypeFilter);
    filterTransactions(searchQuery, statusFilter, newTypeFilter);
  };
  
  const filterTransactions = (query: string, statuses: string[], types: string[]) => {
    let results = transactions;
    
    // Apply search query
    if (query) {
      results = results.filter(transaction => 
        transaction.id.toLowerCase().includes(query) || 
        (transaction.userName && transaction.userName.toLowerCase().includes(query)) ||
        (transaction.userId && transaction.userId.toLowerCase().includes(query))
      );
    }
    
    // Apply status filters
    if (statuses.length > 0) {
      results = results.filter(transaction => statuses.includes(transaction.status));
    }
    
    // Apply type filters
    if (types.length > 0) {
      results = results.filter(transaction => types.includes(transaction.type));
    }
    
    setFilteredTransactions(results);
    setCurrentPage(1); // Reset to first page on filter change
  };
  
  const clearFilters = () => {
    setStatusFilter([]);
    setTypeFilter([]);
    setSearchQuery("");
    setFilteredTransactions(transactions);
  };
  
  const exportToCsv = () => {
    const headers = [
      "Transaction ID",
      "Type",
      "User ID",
      "Amount",
      "Currency",
      "Game ID",
      "Status",
      "Provider",
      "Timestamp"
    ];
    
    const rows = filteredTransactions.map(tx => [
      tx.id,
      tx.type,
      tx.player_id,
      tx.amount,
      tx.currency,
      tx.game_id || "",
      tx.status,
      tx.provider,
      tx.created_at
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `casino-transactions-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Transactions exported to CSV");
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case "pending":
        return <Clock className="h-4 w-4 mr-1" />;
      case "failed":
        return <XCircle className="h-4 w-4 mr-1" />;
      case "cancelled":
        return <AlertCircle className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Calculate totals for deposits and withdrawals
  const totalDeposits = transactions
    .filter(t => t.type === "deposit" && t.status === "completed")
    .reduce((sum, t) => sum + Number(t.amount), 0);
    
  const totalWithdrawals = transactions
    .filter(t => t.type === "withdraw" && t.status === "completed")
    .reduce((sum, t) => sum + Number(t.amount), 0);
    
  const pendingTransactions = transactions
    .filter(t => t.status === "pending")
    .length;

  // Helper function to safely get first letter or fallback
  const getUserInitial = (name?: string) => {
    if (!name || name.length === 0) return 'U';
    return name.charAt(0);
  };

  return (
    <div className="py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Transaction Management</h1>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className={`flex items-center ${showFilters ? 'text-casino-thunder-green border-casino-thunder-green' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          <Button variant="outline" className="flex items-center" onClick={exportToCsv}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" className="flex items-center" onClick={fetchTransactions}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Transaction Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="thunder-card p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/60 text-sm">Total Transactions</p>
              <h3 className="text-2xl font-bold">{transactions.length}</h3>
            </div>
            <div className="bg-white/10 p-3 rounded-full">
              <Clock className="h-6 w-6 text-casino-thunder-green" />
            </div>
          </div>
        </div>
        
        <div className="thunder-card p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/60 text-sm">Total Deposits</p>
              <h3 className="text-2xl font-bold">
                ${totalDeposits.toLocaleString()}
              </h3>
            </div>
            <div className="bg-white/10 p-3 rounded-full">
              <ArrowDownLeft className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>
        
        <div className="thunder-card p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/60 text-sm">Total Withdrawals</p>
              <h3 className="text-2xl font-bold">
                ${totalWithdrawals.toLocaleString()}
              </h3>
            </div>
            <div className="bg-white/10 p-3 rounded-full">
              <ArrowUpRight className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </div>
        
        <div className="thunder-card p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/60 text-sm">Pending Transactions</p>
              <h3 className="text-2xl font-bold">
                {pendingTransactions}
              </h3>
            </div>
            <div className="bg-white/10 p-3 rounded-full">
              <AlertCircle className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className="thunder-card p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Filters</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-white/70 hover:text-casino-thunder-green"
            >
              Clear All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white/80 mb-2 text-sm font-medium">Transaction Status</h4>
              <div className="flex flex-wrap gap-2">
                {["completed", "pending", "failed", "cancelled"].map(status => (
                  <Button 
                    key={status}
                    variant="outline"
                    size="sm"
                    className={`capitalize ${
                      statusFilter.includes(status) ? "border-casino-thunder-green text-casino-thunder-green" : ""
                    }`}
                    onClick={() => toggleStatusFilter(status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-white/80 mb-2 text-sm font-medium">Transaction Type</h4>
              <div className="flex flex-wrap gap-2">
                {["deposit", "withdraw", "bet", "win"].map(type => (
                  <Button 
                    key={type}
                    variant="outline"
                    size="sm"
                    className={`capitalize ${
                      typeFilter.includes(type) ? "border-casino-thunder-green text-casino-thunder-green" : ""
                    }`}
                    onClick={() => toggleTypeFilter(type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="search"
            className="thunder-input w-full pl-10"
            placeholder="Search transactions by ID, user name, or user ID..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>
      
      {/* Transactions Table */}
      <div className="thunder-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-casino-thunder-green" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-20 text-white/60">
            <p>No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-casino-thunder-green rounded"
                        checked={selectedRows.length === currentTransactions.length && currentTransactions.length > 0}
                        onChange={handleSelectAll}
                      />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {currentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-white/5">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-casino-thunder-green rounded"
                        checked={selectedRows.includes(transaction.id)}
                        onChange={() => handleSelectRow(transaction.id)}
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      {transaction.id.substring(0, 8)}...
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white font-medium">
                          {getUserInitial(transaction.userName)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium">{transaction.userName || 'Unknown User'}</div>
                          <div className="text-xs text-white/60">ID: {transaction.userId || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className={`flex items-center text-sm ${
                        transaction.type === "deposit" || transaction.type === "win" 
                          ? "text-green-500" 
                          : "text-red-500"
                      }`}>
                        {transaction.type === "deposit" || transaction.type === "win" ? (
                          <ArrowDownLeft className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                        )}
                        <span className="capitalize">{transaction.type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        transaction.type === "deposit" || transaction.type === "win"
                          ? "text-green-500" 
                          : "text-red-500"
                      }`}>
                        {transaction.type === "deposit" || transaction.type === "win" ? "+" : "-"}${Number(transaction.amount).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {transaction.provider}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {transaction.created_at ? formatDate(transaction.created_at) : 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(transaction.status)}`}>
                        {getStatusIcon(transaction.status)}
                        <span className="capitalize">{transaction.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {filteredTransactions.length > 0 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-white/10">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-white/60">
                  Showing <span className="font-medium">{indexOfFirstTransaction + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastTransaction, filteredTransactions.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredTransactions.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-l-md"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button 
                        key={pageNum}
                        variant="outline" 
                        className={currentPage === pageNum ? "bg-white/10" : ""}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-r-md"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTransactions;
