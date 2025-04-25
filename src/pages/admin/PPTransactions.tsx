
import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPragmaticPlayTransactions } from "@/services/transactionService";
import { Transaction } from "@/services/transactionService";
import { format } from "date-fns";

const PPTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await getPragmaticPlayTransactions(100);
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching Pragmatic Play transactions:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, []);
  
  const columns = [
    {
      header: "Transaction ID",
      accessorKey: "id",
      cell: (row: Transaction) => (
        <div className="font-mono text-xs">{row.id.substring(0, 8)}...</div>
      ),
    },
    {
      header: "Player",
      accessorKey: "userName",
      cell: (row: Transaction) => (
        <div>{row.userName || row.player_id}</div>
      ),
    },
    {
      header: "Type",
      accessorKey: "type",
      cell: (row: Transaction) => (
        <Badge className={
          row.type === 'bet' ? 'bg-amber-600' : 
          row.type === 'win' ? 'bg-green-600' : 
          row.type === 'deposit' ? 'bg-blue-600' : 
          'bg-red-600'
        }>
          {row.type}
        </Badge>
      ),
    },
    {
      header: "Amount",
      accessorKey: "amount",
      cell: (row: Transaction) => (
        <div className={
          row.type === 'win' || row.type === 'deposit' ? 'text-green-400' : 'text-red-400'
        }>
          {row.type === 'win' || row.type === 'deposit' ? '+' : '-'}
          {row.currency} {row.amount.toFixed(2)}
        </div>
      ),
    },
    {
      header: "Game",
      accessorKey: "game_id",
      cell: (row: Transaction) => (
        <div className="text-sm">{row.game_id || 'N/A'}</div>
      ),
    },
    {
      header: "Round ID",
      accessorKey: "round_id",
      cell: (row: Transaction) => (
        <div className="font-mono text-xs">{row.round_id || 'N/A'}</div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: Transaction) => (
        <Badge className={
          row.status === 'completed' ? 'bg-green-600' : 
          row.status === 'pending' ? 'bg-amber-600' : 
          'bg-red-600'
        }>
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Date & Time",
      accessorKey: "created_at",
      cell: (row: Transaction) => (
        <div className="text-xs">
          {row.created_at ? format(new Date(row.created_at), "yyyy-MM-dd HH:mm:ss") : 'N/A'}
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold text-white mb-6">Pragmatic Play Transactions</h1>
      
      <Card className="bg-slate-800 text-white border-slate-700">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription className="text-slate-300">
            View all transactions processed through Pragmatic Play
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : (
            <DataTable
              data={transactions}
              columns={columns}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PPTransactions;
