
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Gift,
  Wallet,
  Search
} from "lucide-react";

// Mock transaction data
const mockTransactions = [
  {
    id: "tx-1001",
    type: "deposit",
    amount: 200.00,
    balance: 200.00,
    status: "completed",
    method: "Credit Card",
    date: "2025-04-08T14:32:21Z",
    description: "Deposit via Credit Card"
  },
  {
    id: "tx-1002",
    type: "bonus",
    amount: 100.00,
    balance: 300.00,
    status: "completed",
    method: "Welcome Bonus",
    date: "2025-04-08T14:35:10Z",
    description: "Welcome Bonus Credit"
  },
  {
    id: "tx-1003",
    type: "bet",
    amount: -25.00,
    balance: 275.00,
    status: "completed",
    method: "Book of Dead",
    date: "2025-04-08T15:12:33Z",
    description: "Game: Book of Dead"
  },
  {
    id: "tx-1004",
    type: "win",
    amount: 76.50,
    balance: 351.50,
    status: "completed",
    method: "Lightning Roulette",
    date: "2025-04-08T15:45:22Z",
    description: "Game: Lightning Roulette"
  },
  {
    id: "tx-1005",
    type: "bet",
    amount: -50.00,
    balance: 301.50,
    status: "completed",
    method: "Sweet Bonanza",
    date: "2025-04-09T10:10:15Z",
    description: "Game: Sweet Bonanza"
  },
  {
    id: "tx-1006",
    type: "win",
    amount: 125.75,
    balance: 427.25,
    status: "completed",
    method: "Sweet Bonanza",
    date: "2025-04-09T10:14:30Z",
    description: "Game: Sweet Bonanza"
  },
  {
    id: "tx-1007",
    type: "withdrawal",
    amount: -100.00,
    balance: 327.25,
    status: "pending",
    method: "Bank Transfer",
    date: "2025-04-09T11:30:45Z",
    description: "Withdrawal via Bank Transfer"
  }
];

const Transactions = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  
  const itemsPerPage = 5;
  
  const filterTransactions = () => {
    let filtered = [...mockTransactions];
    
    // Apply type filter
    if (activeFilter !== "all") {
      filtered = filtered.filter(tx => tx.type === activeFilter);
    }
    
    // Apply search filter if any
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(tx => 
        tx.description.toLowerCase().includes(query) || 
        tx.method.toLowerCase().includes(query) || 
        tx.id.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };
  
  const filteredTransactions = filterTransactions();
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDown className="h-4 w-4 text-green-500" />;
      case "withdrawal":
        return <ArrowUp className="h-4 w-4 text-yellow-500" />;
      case "bet":
        return <ArrowUp className="h-4 w-4 text-red-500" />;
      case "win":
        return <ArrowDown className="h-4 w-4 text-green-500" />;
      case "bonus":
        return <Gift className="h-4 w-4 text-purple-500" />;
      default:
        return <Wallet className="h-4 w-4 text-blue-500" />;
    }
  };
  
  const getAmountColor = (amount: number) => {
    if (amount > 0) return "text-green-500";
    if (amount < 0) return "text-red-500";
    return "text-white/70";
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-casino-thunder-darker">
        <div className="container mx-auto px-4">
          <div className="thunder-card p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Authentication Required</h1>
            <p className="text-white/70 mb-6">Please sign in to view your transactions.</p>
            <Button 
              onClick={() => window.location.href = "/login"}
              className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-casino-thunder-darker">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-4 md:mb-0">Transaction History</h1>
          
          <div className="flex gap-3">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Date Range
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
        
        {/* Filters and Search */}
        <div className="thunder-card p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="search"
                  className="thunder-input w-full pl-10"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                  }}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <FilterButton 
                label="All"
                isActive={activeFilter === "all"}
                onClick={() => {
                  setActiveFilter("all");
                  setCurrentPage(1);
                }}
              />
              <FilterButton 
                label="Deposits"
                isActive={activeFilter === "deposit"}
                onClick={() => {
                  setActiveFilter("deposit");
                  setCurrentPage(1);
                }}
              />
              <FilterButton 
                label="Withdrawals"
                isActive={activeFilter === "withdrawal"}
                onClick={() => {
                  setActiveFilter("withdrawal");
                  setCurrentPage(1);
                }}
              />
              <FilterButton 
                label="Wins"
                isActive={activeFilter === "win"}
                onClick={() => {
                  setActiveFilter("win");
                  setCurrentPage(1);
                }}
              />
              <FilterButton 
                label="Bets"
                isActive={activeFilter === "bet"}
                onClick={() => {
                  setActiveFilter("bet");
                  setCurrentPage(1);
                }}
              />
              <FilterButton 
                label="Bonuses"
                isActive={activeFilter === "bonus"}
                onClick={() => {
                  setActiveFilter("bonus");
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Transaction Table */}
        <div className="thunder-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-white/5">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-white/70">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                            {getTypeIcon(transaction.type)}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-white/90">
                              {transaction.description}
                            </div>
                            <div className="text-xs text-white/50">
                              ID: {transaction.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-white/70">
                        {transaction.method}
                      </td>
                      <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${getAmountColor(transaction.amount)}`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-white/90">
                        ${transaction.balance.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-white/50">
                      No transactions found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
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
                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, filteredTransactions.length)}
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
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <Button 
                        key={i}
                        variant="outline" 
                        className={currentPage === i + 1 ? "bg-white/10" : ""}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                    
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
    </div>
  );
};

const FilterButton = ({ 
  label, 
  isActive, 
  onClick 
}: { 
  label: string; 
  isActive: boolean; 
  onClick: () => void;
}) => (
  <Button
    variant={isActive ? "default" : "outline"}
    size="sm"
    className={isActive ? "bg-casino-thunder-green text-black hover:bg-casino-thunder-highlight" : ""}
    onClick={onClick}
  >
    <Filter className={`mr-1 h-3 w-3 ${isActive ? "" : "text-white/70"}`} />
    {label}
  </Button>
);

export default Transactions;
