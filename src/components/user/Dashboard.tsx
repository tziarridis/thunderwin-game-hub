
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TransactionsList from "@/components/user/TransactionsList";
import { useAuth } from "@/contexts/AuthContext";
import { walletService } from "@/services/walletService";

const Dashboard = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchWallet = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const walletData = await walletService.getWalletByUserId(user.id);
        setWallet(walletData);
      } catch (error) {
        console.error("Error fetching wallet:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWallet();
  }, [user]);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Wallet</CardTitle>
            <CardDescription>Your current balance</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-16 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
              </div>
            ) : (
              <div className="text-3xl font-bold">
                {wallet?.symbol || '$'}{wallet?.balance.toFixed(2) || '0.00'}
                <div className="text-sm font-normal text-gray-400 mt-1">
                  {wallet?.currency || 'USD'}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>VIP Level</CardTitle>
            <CardDescription>Your current status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {user?.vipLevel || 0}
              <div className="text-sm font-normal text-gray-400 mt-1">
                {wallet?.vip_points || 0} points
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Username:</span>
                <span>{user?.username || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span>{user?.email || 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Transactions</h2>
        {user?.id ? (
          <TransactionsList userId={user.id} limit={5} />
        ) : (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-400">Please log in to view your transactions</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
