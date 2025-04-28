
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getPragmaticPlayTransactions } from "@/services/transactionService";
import { Transaction } from "@/types";

const PPTransactionLogger = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchLogs();
  }, []);
  
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await getPragmaticPlayTransactions();
      setTransactions(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch PP transaction logs:", err);
      setError("Failed to load transaction logs. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Transaction Log</h3>
        <Button variant="outline" onClick={fetchLogs} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-900/20 border border-red-900 p-4 rounded-md text-red-400">
          {error}
        </div>
      )}
      
      <Card className="border border-slate-800">
        <CardContent className="p-0">
          <ScrollArea className="h-96 p-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="mb-4 pb-4 border-b border-slate-800 last:border-0">
                <div className="flex justify-between items-start">
                  <div className="font-mono text-xs">{new Date(transaction.date).toISOString()}</div>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    transaction.type === 'win' ? 'bg-green-500/20 text-green-400' : 
                    transaction.type === 'bet' ? 'bg-blue-500/20 text-blue-400' : 
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {transaction.type}
                  </div>
                </div>
                <div className="mt-2 font-semibold">
                  {transaction.amount} {transaction.currency} | 
                  Game: {transaction.gameId || 'Unknown'} | 
                  User: {transaction.userId.substring(0, 8)}...
                </div>
                <div className="mt-1 text-sm text-gray-400">
                  ID: {transaction.id} | Reference: {transaction.referenceId || 'None'}
                </div>
                <div className="mt-2 bg-slate-800 p-2 rounded text-xs font-mono whitespace-pre-wrap">
                  {JSON.stringify({
                    id: transaction.id,
                    player_id: transaction.userId,
                    game_id: transaction.gameId,
                    type: transaction.type,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    status: transaction.status,
                    reference_id: transaction.referenceId,
                    timestamp: transaction.date
                  }, null, 2)}
                </div>
              </div>
            ))}
            
            {transactions.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p>No logs found</p>
              </div>
            )}
            
            {loading && (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default PPTransactionLogger;
