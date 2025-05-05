
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import MetaMaskDeposit from "@/components/payment/MetaMaskDeposit";

const DepositPage = () => {
  const [activeTab, setActiveTab] = useState("crypto");
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Deposit Funds</h1>
      
      <Tabs defaultValue="crypto" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 mb-6">
          <TabsTrigger value="crypto">Cryptocurrency</TabsTrigger>
          <TabsTrigger value="card">Credit Card</TabsTrigger>
          <TabsTrigger value="bank">Bank Transfer</TabsTrigger>
        </TabsList>
        
        <TabsContent value="crypto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MetaMaskDeposit />
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">About Cryptocurrency Deposits</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Fast and secure way to deposit funds</li>
                  <li>• Transactions are processed instantly</li>
                  <li>• No processing fees from our side</li>
                  <li>• Currently supporting ETH via MetaMask</li>
                  <li>• Funds are converted to USD in your account</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="card">
          <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-lg text-center">
            <p>Credit Card deposit option is coming soon.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="bank">
          <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-lg text-center">
            <p>Bank Transfer deposit option is coming soon.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DepositPage;
