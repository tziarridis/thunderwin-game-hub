
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RotateCw, Download, Database, ArrowDownUp, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getPragmaticPlayTransactions, Transaction } from "@/services/transactionService";

interface PPTransactionLoggerProps {
  limit?: number;
}

const PPTransactionLogger: React.FC<PPTransactionLoggerProps> = ({ limit = 100 }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState("24h");

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, filter, searchQuery, timeRange]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const result = await getPragmaticPlayTransactions(limit);
      
      setTransactions(result);
      toast.success(`Loaded ${result.length} transactions`);
    } catch (error) {
      toast.error("Failed to load transactions");
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];
    
    // Apply type filter
    if (filter !== "all") {
      filtered = filtered.filter(tx => tx.type === filter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.userId?.toLowerCase().includes(query) ||
        tx.transactionId?.toLowerCase().includes(query) ||
        (tx.gameId && tx.gameId.toLowerCase().includes(query))
      );
    }
    
    // Apply time filter
    const now = new Date();
    let timeLimit: Date;
    
    switch (timeRange) {
      case "1h":
        timeLimit = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case "6h":
        timeLimit = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case "24h":
        timeLimit = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        timeLimit = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        timeLimit = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        timeLimit = new Date(0); // All time
    }
    
    if (timeRange !== "all") {
      filtered = filtered.filter(tx => tx.timestamp && new Date(tx.timestamp) >= timeLimit);
    }
    
    setFilteredTransactions(filtered);
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
      tx.transactionId || tx.id,
      tx.type,
      tx.userId || tx.player_id,
      tx.amount,
      tx.currency,
      tx.gameId || tx.game_id || "",
      tx.status,
      tx.provider,
      tx.timestamp || tx.created_at
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `pp-transactions-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Transactions exported to CSV");
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle>Transaction Logger</CardTitle>
        <CardDescription>
          Monitor and analyze Pragmatic Play transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <Label htmlFor="search" className="mb-1 block">Search</Label>
            <Input
              id="search"
              placeholder="Search by player ID, transaction ID or game ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-700 border-slate-600"
            />
          </div>
          <div className="w-full md:w-auto flex flex-col md:flex-row gap-2">
            <div>
              <Label htmlFor="type-filter" className="mb-1 block">Type</Label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger id="type-filter" className="w-full md:w-32 bg-slate-700 border-slate-600">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="bet">Bets</SelectItem>
                  <SelectItem value="win">Wins</SelectItem>
                  <SelectItem value="deposit">Deposits</SelectItem>
                  <SelectItem value="withdraw">Withdrawals</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="time-filter" className="mb-1 block">Time Range</Label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger id="time-filter" className="w-full md:w-32 bg-slate-700 border-slate-600">
                  <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="6h">Last 6 Hours</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-sm text-slate-400">
              {filteredTransactions.length} transactions
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchTransactions}>
              <RotateCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCsv}>
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
          </div>
        </div>
        
        <div className="rounded-md border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900">
                  <th className="text-left p-2 font-medium">Transaction ID</th>
                  <th className="text-left p-2 font-medium">Type</th>
                  <th className="text-left p-2 font-medium">Player</th>
                  <th className="text-left p-2 font-medium">Amount</th>
                  <th className="text-left p-2 font-medium">Game</th>
                  <th className="text-left p-2 font-medium">Status</th>
                  <th className="text-left p-2 font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center">
                      <div className="flex justify-center items-center">
                        <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                        Loading transactions...
                      </div>
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-slate-400">
                      No transactions found matching the current filters
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.transactionId || tx.id} className="border-b border-slate-700 hover:bg-slate-900">
                      <td className="p-2 font-mono text-xs">{(tx.transactionId || tx.id).slice(0, 12)}...</td>
                      <td className="p-2">
                        <Badge className={
                          tx.type === 'bet' 
                            ? 'bg-red-500/20 text-red-400' 
                            : tx.type === 'win'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                        }>
                          {tx.type === 'bet' && <ArrowDown className="h-3 w-3 mr-1" />}
                          {tx.type === 'win' && <ArrowUp className="h-3 w-3 mr-1" />}
                          {tx.type === 'deposit' && <ArrowDown className="h-3 w-3 mr-1" />}
                          {tx.type === 'withdraw' && <ArrowUp className="h-3 w-3 mr-1" />}
                          {tx.type}
                        </Badge>
                      </td>
                      <td className="p-2">{tx.userId || tx.player_id}</td>
                      <td className="p-2">
                        <span className={tx.type === 'win' || tx.type === 'deposit' ? 'text-green-400' : tx.type === 'bet' || tx.type === 'withdraw' ? 'text-red-400' : ''}>
                          {tx.amount.toFixed(2)} {tx.currency}
                        </span>
                      </td>
                      <td className="p-2">{tx.gameId || tx.game_id || 'N/A'}</td>
                      <td className="p-2">
                        <Badge className={
                          tx.status === 'completed' 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : tx.status === 'failed'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                        }>
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="p-2 text-slate-400">
                        {new Date(tx.timestamp || tx.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PPTransactionLogger;
