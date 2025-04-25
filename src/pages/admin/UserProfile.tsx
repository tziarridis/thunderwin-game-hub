
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types";
import { getUserById, updateUser } from "@/services/userService";
import { walletService } from "@/services/walletService";
import { getTransactions } from "@/services/transactionService";
import { DataTable } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";
import UserInfoForm from "@/components/admin/UserInfoForm";
import { Wallet, Banknote, Calendar, ArrowUpDown, Download, Users } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [affiliateUsers, setAffiliateUsers] = useState<User[]>([]);
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Fetch user data
        const userData = await getUserById(userId);
        if (!userData) {
          toast.error("User not found");
          navigate("/admin/users");
          return;
        }
        setUser(userData);

        // Fetch wallet data
        const wallet = await walletService.getWalletByUserId(userId);
        setWalletData(wallet);

        // Fetch transactions
        const txns = await getTransactions({ player_id: userId, limit: 100 });
        setTransactions(txns);

        // Fetch affiliated users (mock data for now)
        // In production this would come from a proper API call
        setAffiliateUsers([]);

        // Fetch session history (mock data for now)
        // In production this would come from a proper API call
        setSessionHistory([]);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, navigate]);

  const handleUserUpdate = async (updatedUserData: User) => {
    try {
      const updated = await updateUser(updatedUserData);
      if (updated) {
        setUser(updated);
        toast.success("User information updated successfully");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user information");
    }
  };

  const exportUserData = () => {
    if (!user || !walletData) return;

    // Create CSV data
    const userData = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      status: user.status,
      balance: walletData.balance,
      registeredDate: user.joined,
      // Add more fields as needed
    };

    // Convert to CSV
    const headers = Object.keys(userData).join(",");
    const values = Object.values(userData).join(",");
    const csvContent = `${headers}\n${values}`;

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `user_${user.id}_export.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("User data exported successfully");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-casino-thunder-green"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
        <Button onClick={() => navigate("/admin/users")}>Back to Users</Button>
      </div>
    );
  }

  // Calculate stats
  const depositTxns = transactions.filter(t => t.type === 'deposit');
  const withdrawalTxns = transactions.filter(t => t.type === 'withdraw');
  const betTxns = transactions.filter(t => t.type === 'bet');
  const winTxns = transactions.filter(t => t.type === 'win');

  const totalDeposits = depositTxns.reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawals = withdrawalTxns.reduce((sum, t) => sum + t.amount, 0);
  const totalBets = betTxns.reduce((sum, t) => sum + t.amount, 0);
  const totalWins = winTxns.reduce((sum, t) => sum + t.amount, 0);
  const pnl = totalWins - totalBets;

  // Transaction columns for the data table
  const transactionColumns = [
    {
      header: "ID",
      accessorKey: "id",
      cell: (row: any) => (
        <div className="font-mono text-xs">{row.id.substring(0, 8)}...</div>
      ),
    },
    {
      header: "Date & Time",
      accessorKey: "created_at",
      cell: (row: any) => (
        <div className="text-xs">
          {row.created_at ? format(new Date(row.created_at), "yyyy-MM-dd HH:mm:ss") : 'N/A'}
        </div>
      ),
    },
    {
      header: "Type",
      accessorKey: "type",
      cell: (row: any) => (
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
      cell: (row: any) => (
        <div className={
          row.type === 'win' || row.type === 'deposit' ? 'text-green-400' : 'text-red-400'
        }>
          {row.type === 'win' || row.type === 'deposit' ? '+' : '-'}
          {row.currency} {row.amount.toFixed(2)}
        </div>
      ),
    },
    {
      header: "Provider",
      accessorKey: "provider",
      cell: (row: any) => <div>{row.provider || 'System'}</div>,
    },
    {
      header: "Game",
      accessorKey: "game_id",
      cell: (row: any) => <div>{row.game_id || 'N/A'}</div>,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: any) => (
        <Badge className={
          row.status === 'completed' ? 'bg-green-600' : 
          row.status === 'pending' ? 'bg-amber-600' : 
          'bg-red-600'
        }>
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-6 px-4 lg:px-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">User Profile</h1>
          <p className="text-white/60">Manage user information and view statistics</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("/admin/users")}>
            Back to Users
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={exportUserData}
          >
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>
      
      {/* User Header Card */}
      <Card className="bg-slate-800 border-slate-700 mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="h-20 w-20 rounded-full bg-slate-700 flex items-center justify-center text-3xl font-bold">
              {user.name.charAt(0)}
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-white/60 mb-1">{user.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="border-casino-thunder-green text-casino-thunder-green">
                  ID: {user.id.substring(0, 8)}
                </Badge>
                <Badge className={user.isVerified ? "bg-green-600" : "bg-red-600"}>
                  {user.isVerified ? "Verified" : "Not Verified"}
                </Badge>
                <Badge className={
                  user.status === 'Active' ? 'bg-green-600' : 
                  user.status === 'Pending' ? 'bg-amber-600' : 
                  'bg-red-600'
                }>
                  {user.status}
                </Badge>
                <Badge className="bg-purple-600">
                  VIP Level {user.vipLevel || 0}
                </Badge>
                <Badge variant="outline">
                  Joined: {user.joined ? format(new Date(user.joined), "MMM d, yyyy") : 'Unknown'}
                </Badge>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <div className="text-xl font-bold text-casino-thunder-green">
                ${walletData?.balance?.toFixed(2) || "0.00"}
              </div>
              <div className="text-sm text-white/60">
                Current Balance
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-800 border-slate-700 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
          <TabsTrigger value="sessions">Session History</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
            {/* Wallet Stats Card */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-casino-thunder-green" />
                  Wallet Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-white/60">Current Balance:</dt>
                    <dd className="font-bold">${walletData?.balance?.toFixed(2) || "0.00"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/60">Bonus Balance:</dt>
                    <dd className="font-bold">${walletData?.balance_bonus?.toFixed(2) || "0.00"}</dd>
                  </div>
                  <Separator className="my-2 bg-slate-700" />
                  <div className="flex justify-between">
                    <dt className="text-white/60">Total Won:</dt>
                    <dd className="font-bold text-green-400">${walletData?.total_won?.toFixed(2) || "0.00"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/60">Total Lost:</dt>
                    <dd className="font-bold text-red-400">${walletData?.total_lose?.toFixed(2) || "0.00"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/60">VIP Points:</dt>
                    <dd className="font-bold">{walletData?.vip_points || 0}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            {/* Deposit Stats Card */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Banknote className="h-5 w-5 text-blue-500" />
                  Deposit Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-white/60">Total Deposits:</dt>
                    <dd className="font-bold">${totalDeposits.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/60">Deposit Count:</dt>
                    <dd className="font-bold">{depositTxns.length}</dd>
                  </div>
                  <Separator className="my-2 bg-slate-700" />
                  <div className="flex justify-between">
                    <dt className="text-white/60">Total Withdrawals:</dt>
                    <dd className="font-bold">${totalWithdrawals.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/60">Withdrawal Count:</dt>
                    <dd className="font-bold">{withdrawalTxns.length}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/60">Net Deposits:</dt>
                    <dd className="font-bold text-green-400">
                      ${(totalDeposits - totalWithdrawals).toFixed(2)}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            {/* Gaming Stats Card */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ArrowUpDown className="h-5 w-5 text-amber-500" />
                  Gaming Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-white/60">Total Wagered:</dt>
                    <dd className="font-bold">${totalBets.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/60">Total Bets:</dt>
                    <dd className="font-bold">{betTxns.length}</dd>
                  </div>
                  <Separator className="my-2 bg-slate-700" />
                  <div className="flex justify-between">
                    <dt className="text-white/60">Total Wins:</dt>
                    <dd className="font-bold">${totalWins.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/60">Win Count:</dt>
                    <dd className="font-bold">{winTxns.length}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/60">P&L:</dt>
                    <dd className={`font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${pnl.toFixed(2)}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            {/* Account Stats Card */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  Account Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-white/60">Registration Date:</dt>
                    <dd className="font-bold">{user.joined ? format(new Date(user.joined), "MMM d, yyyy") : 'Unknown'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/60">Account Age:</dt>
                    <dd className="font-bold">
                      {user.joined ? 
                        Math.floor((new Date().getTime() - new Date(user.joined).getTime()) / (1000 * 60 * 60 * 24)) + " days" 
                        : 'Unknown'}
                    </dd>
                  </div>
                  <Separator className="my-2 bg-slate-700" />
                  <div className="flex justify-between">
                    <dt className="text-white/60">Session Count:</dt>
                    <dd className="font-bold">{sessionHistory.length || 0}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/60">Last Login:</dt>
                    <dd className="font-bold">
                      {sessionHistory.length > 0 
                        ? format(new Date(sessionHistory[0].login_time), "MMM d, yyyy HH:mm") 
                        : 'Unknown'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/60">Affiliate Count:</dt>
                    <dd className="font-bold">{affiliateUsers.length}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Transactions */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>The user's most recent activity</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <DataTable
                  data={transactions.slice(0, 5)}
                  columns={transactionColumns}
                />
              ) : (
                <div className="text-center py-6 text-white/60">
                  No transaction history found
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" onClick={() => setActiveTab("transactions")}>
                View All Transactions
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>Edit user information and settings</CardDescription>
            </CardHeader>
            <CardContent>
              {user && <UserInfoForm initialValues={user} onSubmit={handleUserUpdate} />}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Complete record of user's financial activities</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <DataTable
                  data={transactions}
                  columns={transactionColumns}
                />
              ) : (
                <div className="text-center py-6 text-white/60">
                  No transaction history found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Affiliates Tab */}
        <TabsContent value="affiliates">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Affiliated Users</CardTitle>
                  <CardDescription>Users referred by this account</CardDescription>
                </div>
                {affiliateUsers.length > 0 && (
                  <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => exportUserData()}>
                    <Download className="h-4 w-4" />
                    Export Affiliates
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {affiliateUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4">User</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Joined</th>
                        <th className="text-left py-3 px-4">Deposits</th>
                        <th className="text-left py-3 px-4">Wagered</th>
                        <th className="text-left py-3 px-4">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {affiliateUsers.map((affiliate) => (
                        <tr key={affiliate.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
                                {affiliate.name.charAt(0)}
                              </div>
                              <div>
                                <div>{affiliate.name}</div>
                                <div className="text-xs text-white/60">{affiliate.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={
                              affiliate.status === 'Active' ? 'bg-green-600' : 
                              affiliate.status === 'Pending' ? 'bg-amber-600' : 
                              'bg-red-600'
                            }>
                              {affiliate.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            {affiliate.joined ? format(new Date(affiliate.joined), "MMM d, yyyy") : 'Unknown'}
                          </td>
                          <td className="py-3 px-4">${affiliate.balance || 0}</td>
                          <td className="py-3 px-4">$0.00</td>
                          <td className="py-3 px-4">$0.00</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 flex flex-col items-center">
                  <Users className="h-12 w-12 text-white/20 mb-4" />
                  <h3 className="font-semibold mb-1">No affiliated users</h3>
                  <p className="text-white/60">This user hasn't referred anyone yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Sessions Tab */}
        <TabsContent value="sessions">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Session History</CardTitle>
              <CardDescription>User login and activity sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {sessionHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4">Login Time</th>
                        <th className="text-left py-3 px-4">Logout Time</th>
                        <th className="text-left py-3 px-4">Duration</th>
                        <th className="text-left py-3 px-4">IP Address</th>
                        <th className="text-left py-3 px-4">Device</th>
                        <th className="text-left py-3 px-4">Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessionHistory.map((session, index) => (
                        <tr key={index} className="border-b border-slate-700 hover:bg-slate-700/50">
                          <td className="py-3 px-4">
                            {format(new Date(session.login_time), "yyyy-MM-dd HH:mm:ss")}
                          </td>
                          <td className="py-3 px-4">
                            {session.logout_time 
                              ? format(new Date(session.logout_time), "yyyy-MM-dd HH:mm:ss")
                              : 'Active Session'}
                          </td>
                          <td className="py-3 px-4">
                            {session.logout_time 
                              ? `${Math.floor((new Date(session.logout_time).getTime() - new Date(session.login_time).getTime()) / (1000 * 60))} mins`
                              : 'N/A'}
                          </td>
                          <td className="py-3 px-4">{session.ip_address}</td>
                          <td className="py-3 px-4">{session.device}</td>
                          <td className="py-3 px-4">{session.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 text-white/60">
                  No session history available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;
