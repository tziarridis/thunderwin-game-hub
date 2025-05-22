// Fix the DateRangePicker usage in PPTransactions.tsx
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
// Changed DateRangePicker to DatePickerWithRange
import { DatePickerWithRange, DateRange } from "@/components/ui/date-range-picker"; 
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Search, Download } from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  id: string;
  date: string; // This should ideally be Date object or string that can be parsed to Date
  player_id: string;
  round_id: string;
  type: string;
  amount: number;
  status: string;
}

// Mock data for demonstration
const mockTransactions: Transaction[] = [
  {
    id: "pp-tx-1234",
    date: "2023-06-01T14:23:45",
    player_id: "player123",
    round_id: "round-5678",
    type: "bet",
    amount: -10,
    status: "completed"
  },
  {
    id: "pp-tx-1235",
    date: "2023-06-01T14:25:12",
    player_id: "player123",
    round_id: "round-5678",
    type: "win",
    amount: 15,
    status: "completed"
  },
  {
    id: "pp-tx-1236",
    date: "2023-06-02T09:12:33",
    player_id: "player456",
    round_id: "round-9012",
    type: "bet",
    amount: -25,
    status: "completed"
  }
];


const PPTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({ // Changed to DateRange | undefined to match DatePickerWithRange
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date()
  });
  const [transactionType, setTransactionType] = useState<string>("all");

  // Filter transactions based on search query, date range, and type
  const filteredTransactions = transactions.filter(tx => {
    const searchMatch = searchQuery === "" || 
      tx.player_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.round_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    let dateMatch = true;
    if (dateRange?.from && dateRange?.to) { // Added optional chaining for dateRange
      const txDate = new Date(tx.date);
      dateMatch = txDate >= dateRange.from && txDate <= dateRange.to;
    } else if (dateRange?.from) { // Handle case where only from date is selected
        const txDate = new Date(tx.date);
        dateMatch = txDate >= dateRange.from;
    }
    
    const typeMatch = transactionType === "all" || tx.type === transactionType;
    
    return searchMatch && dateMatch && typeMatch;
  });

  // Ensure handleDateChange matches DatePickerWithRange's onDateChange prop type
  const handleDateChange = (newRange: DateRange | undefined) => { 
    setDateRange(newRange);
  };

  const handleExport = () => {
    console.log("Exporting transactions:", filteredTransactions);
    alert("Export functionality will be implemented here");
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Pragmatic Play Transactions</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Transaction Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative mt-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Player ID, Round ID, or Transaction ID"
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="date-range">Date Range</Label>
              <div className="mt-1">
                {/* Changed DateRangePicker to DatePickerWithRange and updated props */}
                <DatePickerWithRange
                  date={dateRange}
                  onDateChange={handleDateChange}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="type">Transaction Type</Label>
              <Select
                value={transactionType}
                onValueChange={setTransactionType}
              >
                <SelectTrigger id="type" className="mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="bet">Bet</SelectItem>
                  <SelectItem value="win">Win</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Transaction List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Player ID</TableHead>
                <TableHead>Round ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{format(new Date(tx.date), "MMM dd, yyyy HH:mm")}</TableCell>
                    <TableCell className="font-mono text-xs">{tx.id}</TableCell>
                    <TableCell>{tx.player_id}</TableCell>
                    <TableCell className="font-mono text-xs">{tx.round_id}</TableCell>
                    <TableCell>
                      <Badge variant={tx.type === "win" ? "success" : tx.type === "bet" ? "destructive" : "outline"}>
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-medium ${tx.amount >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {tx.amount >= 0 ? "+" : ""}{tx.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={tx.status === "completed" ? "outline" : "secondary"}>
                        {tx.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PPTransactions;
