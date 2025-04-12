import { useState, useEffect } from "react";
import { 
  BarChart2, 
  LineChart, 
  PieChart, 
  Users, 
  DollarSign, 
  ShoppingBag,
  Loader2
} from "lucide-react";
import { usersApi, transactionsApi } from "@/services/apiService";
import { TransactionType } from "@/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

const AdminDashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const users = await usersApi.getUsers();
        const transactions = await transactionsApi.getTransactions();
        
        setTotalUsers(users.length);
        setTotalTransactions(transactions);
        setTotalRevenue(transactions.reduce((sum, tx) => sum + tx.amount, 0));
        
        toast({
          title: "Success",
          description: "Dashboard data loaded successfully",
          variant: "default"
        });
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  // Calculate statistics
  const depositAmount = totalTransactions.filter(tx => tx.type === 'deposit').reduce((sum, tx) => sum + tx.amount, 0);
  const withdrawalAmount = totalTransactions.filter(tx => tx.type === 'withdraw').reduce((sum, tx) => sum + tx.amount, 0);
  const bonusAmount = totalTransactions.filter(tx => tx.type === 'bonus').reduce((sum, tx) => sum + tx.amount, 0);
  const betAmount = totalTransactions.filter(tx => tx.type === 'bet').reduce((sum, tx) => sum + tx.amount, 0);
  const winAmount = totalTransactions.filter(tx => tx.type === 'win').reduce((sum, tx) => sum + tx.amount, 0);
  
  // Mock chart data
  const transactionData = {
    labels: ['Deposits', 'Withdrawals', 'Bonuses', 'Bets', 'Wins'],
    datasets: [
      {
        label: 'Transaction Amounts',
        data: [depositAmount, withdrawalAmount, bonusAmount, betAmount, winAmount],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',   // blue
          'rgba(255, 99, 132, 0.8)',    // red
          'rgba(255, 206, 86, 0.8)',    // yellow
          'rgba(75, 192, 192, 0.8)',    // green
          'rgba(153, 102, 255, 0.8)',   // purple
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const userData = {
    labels: ['Active', 'Inactive', 'Pending'],
    datasets: [
      {
        label: 'User Status',
        data: [
          totalTransactions.filter(tx => tx.status === 'completed').length,
          totalTransactions.filter(tx => tx.status === 'pending').length,
          totalTransactions.filter(tx => tx.status === 'failed').length,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="py-8 px-4">
      <div className="md:flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[300px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="bottom">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) =>
                date > new Date() || date < new Date("2020-01-01")
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-casino-thunder-green" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="thunder-card p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/60 text-sm">Total Users</p>
                  <h3 className="text-2xl font-bold">{totalUsers}</h3>
                </div>
                <div className="bg-white/10 p-3 rounded-full">
                  <Users className="h-6 w-6 text-casino-thunder-green" />
                </div>
              </div>
            </div>
            
            <div className="thunder-card p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/60 text-sm">Total Revenue</p>
                  <h3 className="text-2xl font-bold">${totalRevenue.toFixed(2)}</h3>
                </div>
                <div className="bg-white/10 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </div>
            
            <div className="thunder-card p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/60 text-sm">Total Transactions</p>
                  <h3 className="text-2xl font-bold">{totalTransactions.length}</h3>
                </div>
                <div className="bg-white/10 p-3 rounded-full">
                  <ShoppingBag className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="thunder-card p-4">
              <h4 className="font-semibold mb-3">Transaction Overview</h4>
              <PieChart data={transactionData} />
            </div>
            
            <div className="thunder-card p-4">
              <h4 className="font-semibold mb-3">User Status</h4>
              <LineChart data={userData} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
