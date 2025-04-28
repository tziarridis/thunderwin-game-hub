
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GitSlotParkTester from '@/components/games/GitSlotParkTester';
import { Transaction } from '@/types';
import { getTransactions } from '@/services/transactionService';
import { useAuth } from '@/contexts/AuthContext';

const GitSlotParkSeamless = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (user?.id) {
        const data = await getTransactions(user.id);
        // Filter only GitSlotPark transactions if needed
        const gitSlotParkTransactions = data.filter(
          tx => tx.gameId?.startsWith('gsp-') || tx.description?.includes('GitSlotPark')
        );
        setTransactions(gitSlotParkTransactions);
      }
    };

    if (user) {
      fetchTransactions();
    }
  }, [user]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">GitSlotPark Integration Tester</h1>
      <p className="text-gray-400 mb-6">
        This page allows you to test and debug the GitSlotPark seamless wallet integration.
      </p>

      <Tabs defaultValue="tester" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="tester">Integration Tester</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="tester">
          <GitSlotParkTester />
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>GitSlotPark Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Type</th>
                        <th className="text-left py-3 px-4">Game ID</th>
                        <th className="text-right py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-gray-800">
                          <td className="py-3 px-4">{new Date(transaction.date).toLocaleString()}</td>
                          <td className="py-3 px-4 capitalize">{transaction.type}</td>
                          <td className="py-3 px-4">{transaction.gameId || '-'}</td>
                          <td className={`py-3 px-4 text-right ${transaction.type === 'win' ? 'text-green-500' : 'text-red-500'}`}>
                            {transaction.type === 'win' ? '+' : '-'}
                            {transaction.amount.toFixed(2)} {transaction.currency}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              transaction.status === 'completed' ? 'bg-green-900/30 text-green-500' : 
                              transaction.status === 'pending' ? 'bg-yellow-900/30 text-yellow-500' : 
                              'bg-red-900/30 text-red-500'
                            }`}>
                              {transaction.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-400">No GitSlotPark transactions found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>GitSlotPark API Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="apiUrl">API URL</label>
                  <Input id="apiUrl" value="https://api.gitslotpark.com/v1" readOnly className="bg-gray-800" />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="apiKey">API Key</label>
                  <Input id="apiKey" value="••••••••••••••••••••••" type="password" readOnly className="bg-gray-800" />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="webhook">Webhook URL</label>
                  <Input id="webhook" value="https://yoursite.com/api/gitslotpark-webhook" readOnly className="bg-gray-800" />
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Testing Environment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="font-medium mb-1">Test Mode</div>
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <span>Enabled</span>
                    </div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="font-medium mb-1">Demo Balance</div>
                    <div>1,000.00 USD</div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-800 pt-6 flex flex-col gap-4 sm:flex-row sm:justify-between">
              <div className="text-sm text-gray-400">
                <p>Configure the GitSlotPark integration in the admin panel to update these settings.</p>
              </div>
              <Button variant="outline" className="shrink-0">
                Go to Admin Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GitSlotParkSeamless;
