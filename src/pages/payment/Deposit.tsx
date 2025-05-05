
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import MetaMaskDeposit from '@/components/payment/MetaMaskDeposit';
import { useAuth } from '@/contexts/AuthContext';

const Deposit = () => {
  const [activeTab, setActiveTab] = useState('crypto');
  const [amount, setAmount] = useState('100');
  const { refreshWalletBalance } = useAuth();
  
  const handleSuccess = async () => {
    console.log('Deposit successful');
    // Refresh the wallet balance after a successful deposit
    await refreshWalletBalance();
  };
  
  const handleProcessing = (isProcessing: boolean) => {
    console.log('Processing: ', isProcessing);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Deposit</h1>
      
      <Card className="w-full max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Add Funds to Your Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="crypto">Cryptocurrency</TabsTrigger>
              <TabsTrigger value="card">Credit Card</TabsTrigger>
              <TabsTrigger value="bank">Bank Transfer</TabsTrigger>
            </TabsList>
            
            <TabsContent value="crypto" className="mt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="crypto-method">Select Method</Label>
                  <div className="flex space-x-2 mt-2">
                    <button 
                      className="flex flex-col items-center justify-center bg-casino-thunder-gray/30 border border-white/10 hover:border-casino-thunder-green p-4 rounded-lg flex-1 transition-colors"
                      onClick={() => setActiveTab('crypto')}
                    >
                      <img src="/placeholder.svg" alt="MetaMask" className="w-12 h-12 mb-2" />
                      <span className="text-sm">MetaMask</span>
                    </button>
                    <button 
                      className="flex flex-col items-center justify-center bg-casino-thunder-gray/30 border border-white/10 hover:border-casino-thunder-green p-4 rounded-lg flex-1 transition-colors"
                      onClick={() => console.log('Coming soon')}
                    >
                      <img src="/placeholder.svg" alt="Bitcoin" className="w-12 h-12 mb-2" />
                      <span className="text-sm">Bitcoin</span>
                    </button>
                  </div>
                </div>
                
                <div className="mt-6">
                  <MetaMaskDeposit 
                    amount={amount} 
                    setAmount={setAmount} 
                    onSuccess={handleSuccess}
                    onProcessing={handleProcessing}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="card" className="mt-4">
              <div className="text-center p-8">
                <p>Credit Card payments coming soon!</p>
              </div>
            </TabsContent>
            
            <TabsContent value="bank" className="mt-4">
              <div className="text-center p-8">
                <p>Bank Transfer options coming soon!</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Deposit;
