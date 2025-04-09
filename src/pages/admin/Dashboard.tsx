
import { 
  Users, 
  DollarSign, 
  BarChart3, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  CreditCard,
  ChevronRight,
  Flag,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  return (
    <div className="py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Users" 
          value="11,523" 
          change="+12.5%" 
          isPositive={true}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard 
          title="Revenue" 
          value="$158,354" 
          change="+18.2%" 
          isPositive={true}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard 
          title="Active Players" 
          value="2,874" 
          change="-4.3%" 
          isPositive={false}
          icon={<Activity className="h-5 w-5" />}
        />
        <StatCard 
          title="Bets Placed" 
          value="45,213" 
          change="+7.8%" 
          isPositive={true}
          icon={<BarChart3 className="h-5 w-5" />}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <div className="thunder-card">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h2 className="font-semibold text-lg">Recent Transactions</h2>
              <Button variant="link" className="text-casino-thunder-green p-0">View All</Button>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <TransactionItem 
                  user="John Doe"
                  amount="$500.00"
                  type="deposit"
                  time="10 minutes ago"
                  status="completed"
                />
                <TransactionItem 
                  user="Alice Smith"
                  amount="$1,200.00"
                  type="withdrawal"
                  time="25 minutes ago"
                  status="pending"
                />
                <TransactionItem 
                  user="Robert Johnson"
                  amount="$800.00"
                  type="deposit"
                  time="1 hour ago"
                  status="completed"
                />
                <TransactionItem 
                  user="Emma Wilson"
                  amount="$300.00"
                  type="deposit"
                  time="2 hours ago"
                  status="completed"
                />
                <TransactionItem 
                  user="Michael Brown"
                  amount="$950.00"
                  type="withdrawal"
                  time="3 hours ago"
                  status="completed"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Alerts & Notifications */}
        <div>
          <div className="thunder-card mb-6">
            <div className="p-4 border-b border-white/10">
              <h2 className="font-semibold text-lg">Alerts</h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <AlertItem 
                  type="warning"
                  message="Unusual activity detected on account #45872"
                  time="10 minutes ago"
                />
                <AlertItem 
                  type="error"
                  message="Payment gateway service interrupted"
                  time="1 hour ago"
                />
                <AlertItem 
                  type="info"
                  message="New user registration spike detected"
                  time="2 hours ago"
                />
              </div>
            </div>
          </div>
          
          {/* Upcoming Maintenance */}
          <div className="thunder-card">
            <div className="p-4 border-b border-white/10">
              <h2 className="font-semibold text-lg">Upcoming Maintenance</h2>
            </div>
            <div className="p-4">
              <div className="flex items-center mb-4">
                <div className="bg-blue-500/20 rounded-full p-2 mr-3">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-medium">Database Optimization</h3>
                  <p className="text-sm text-white/60">April 15, 2025 - 3:00 AM UTC</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-purple-500/20 rounded-full p-2 mr-3">
                  <Activity className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-medium">Software Update</h3>
                  <p className="text-sm text-white/60">April 20, 2025 - 4:00 AM UTC</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ 
  title, 
  value, 
  change, 
  isPositive, 
  icon 
}: { 
  title: string; 
  value: string; 
  change: string; 
  isPositive: boolean; 
  icon: React.ReactNode;
}) => (
  <div className="thunder-card p-4">
    <div className="flex justify-between items-start mb-2">
      <span className="text-white/60 text-sm">{title}</span>
      <div className="bg-white/10 rounded-full p-2">
        {icon}
      </div>
    </div>
    <div className="flex items-baseline">
      <h3 className="text-2xl font-bold mr-2">{value}</h3>
      <span className={`text-xs flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
        {change}
      </span>
    </div>
  </div>
);

const TransactionItem = ({ 
  user, 
  amount, 
  type, 
  time, 
  status 
}: { 
  user: string; 
  amount: string; 
  type: 'deposit' | 'withdrawal'; 
  time: string; 
  status: 'completed' | 'pending' | 'failed';
}) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center">
      <div className={`rounded-full p-1.5 mr-3 ${
        type === 'deposit' 
          ? 'bg-green-500/20 text-green-500' 
          : 'bg-blue-500/20 text-blue-500'
      }`}>
        {type === 'deposit' 
          ? <ArrowUpRight className="h-4 w-4" /> 
          : <ArrowDownRight className="h-4 w-4" />}
      </div>
      <div>
        <div className="font-medium">{user}</div>
        <div className="text-xs text-white/60">{time}</div>
      </div>
    </div>
    <div className="text-right">
      <div className="font-medium">{amount}</div>
      <div className={`text-xs ${
        status === 'completed' 
          ? 'text-green-500' 
          : status === 'pending' 
            ? 'text-yellow-500' 
            : 'text-red-500'
      }`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    </div>
  </div>
);

const AlertItem = ({ 
  type, 
  message, 
  time 
}: { 
  type: 'warning' | 'error' | 'info'; 
  message: string; 
  time: string;
}) => {
  const alertStyles = {
    warning: {
      bgColor: 'bg-yellow-500/20',
      textColor: 'text-yellow-500',
      icon: <AlertCircle className="h-4 w-4" />
    },
    error: {
      bgColor: 'bg-red-500/20',
      textColor: 'text-red-500',
      icon: <AlertCircle className="h-4 w-4" />
    },
    info: {
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-500',
      icon: <Flag className="h-4 w-4" />
    }
  };
  
  const { bgColor, textColor, icon } = alertStyles[type];
  
  return (
    <div className="flex items-start">
      <div className={`${bgColor} ${textColor} rounded-full p-1.5 mr-3 mt-0.5`}>
        {icon}
      </div>
      <div>
        <div className="font-medium">{message}</div>
        <div className="text-xs text-white/60">{time}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
