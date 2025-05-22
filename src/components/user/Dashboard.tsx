
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Transaction } from "@/types/transaction";  // Fixed import
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownLeft, Eye, EyeOff } from "lucide-react";

const UserDashboard = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [hideBalance, setHideBalance] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (user) {
      const fetchWallet = async () => {
        const { data, error } = await supabase
          .from('wallets')
          .select('balance, hide_balance')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching wallet:', error);
        } else if (data) {
          setBalance(data.balance);
          setHideBalance(data.hide_balance || false);
        }
      };

      const fetchTransactions = async () => {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('player_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (error) {
          console.error('Error fetching transactions:', error);
        } else {
          setTransactions(data as Transaction[]);
        }
      };

      fetchWallet();
      fetchTransactions();
    }
  }, [user]);

  const toggleHideBalance = async () => {
    if (!user) return;
    
    const newHideBalance = !hideBalance;
    
    const { error } = await supabase
      .from('wallets')
      .update({ hide_balance: newHideBalance })
      .eq('user_id', user.id);
    
    if (!error) {
      setHideBalance(newHideBalance);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Balance</CardTitle>
            <Button variant="ghost" size="icon" onClick={toggleHideBalance}>
              {hideBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {hideBalance ? '****' : formatCurrency(balance)}
            </div>
            <p className="text-muted-foreground mt-2">Available funds</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Betting Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Bets</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Winnings</span>
                <span className="text-green-600">$0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Net P/L</span>
                <span>$0.00</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Active Bonuses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">No active bonuses</p>
            <Button className="w-full mt-4" variant="outline">View Promotions</Button>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="games">Favorite Games</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your most recent account activity</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex justify-between items-center border-b pb-2">
                      <div className="flex items-center">
                        {tx.type === 'deposit' || tx.type === 'win' ? (
                          <ArrowUpRight className="h-5 w-5 mr-2 text-green-500" />
                        ) : (
                          <ArrowDownLeft className="h-5 w-5 mr-2 text-red-500" />
                        )}
                        <div>
                          <div className="font-medium capitalize">{tx.type}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(tx.created_at), 'PPpp')}
                          </div>
                        </div>
                      </div>
                      <div className={`font-semibold ${tx.type === 'deposit' || tx.type === 'win' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'deposit' || tx.type === 'win' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No recent transactions</p>
              )}
              
              <Button variant="outline" className="w-full mt-4">View All Transactions</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="games" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Favorite Games</CardTitle>
              <CardDescription>Your saved games for quick access</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                You haven't added any favorite games yet.
              </p>
              <Button variant="outline" className="w-full mt-4">Browse Games</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Responsible Gaming</h3>
                <div className="mt-2 space-y-2">
                  <Button variant="outline" size="sm">Set Deposit Limits</Button>
                  <Button variant="outline" size="sm" className="ml-2">Self-Exclusion</Button>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium">Security</h3>
                <div className="mt-2 space-y-2">
                  <Button variant="outline" size="sm">Change Password</Button>
                  <Button variant="outline" size="sm" className="ml-2">Two-Factor Authentication</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboard;
