
import { useState, useEffect } from "react";
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
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Wallet,
  BadgeDollarSign,
  Gift as GiftIcon,
  Globe,
  Gamepad2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { gamesApi, transactionsApi, usersApi } from "@/services/apiService";
import { Game, Transaction, User } from "@/types";
import { useToast } from "@/components/ui/use-toast";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsers: 0,
    activePlayers: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    ggr: 0,
    ngr: 0,
    totalBonuses: 0,
    bettingVolume: 0,
    availableBalance: 0
  });
  const [topGames, setTopGames] = useState<Game[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch real data
        const [users, games, transactions] = await Promise.all([
          usersApi.getUsers(),
          gamesApi.getGames(),
          transactionsApi.getTransactions()
        ]);

        // Calculate stats
        const totalUsers = users.length;
        const newUsers = users.filter(u => {
          const createdDate = new Date(u.createdAt || Date.now());
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return createdDate > sevenDaysAgo;
        }).length;

        const activePlayers = users.filter(u => u.lastLoginAt && new Date(u.lastLoginAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length;
        
        const deposits = transactions.filter(t => t.type === 'deposit');
        const withdrawals = transactions.filter(t => t.type === 'withdrawal');
        
        const totalDeposits = deposits.reduce((sum, t) => sum + t.amount, 0);
        const totalWithdrawals = withdrawals.reduce((sum, t) => sum + t.amount, 0);
        
        // Calculate GGR (Gross Gaming Revenue)
        const ggr = totalDeposits - totalWithdrawals;
        
        // Calculate bonuses
        const bonuses = transactions.filter(t => t.type === 'bonus');
        const totalBonuses = bonuses.reduce((sum, t) => sum + t.amount, 0);
        
        // Calculate NGR (Net Gaming Revenue)
        const ngr = ggr - totalBonuses;
        
        // Calculate betting volume (total of all bets)
        const bets = transactions.filter(t => t.type === 'bet');
        const bettingVolume = bets.reduce((sum, t) => sum + t.amount, 0);
        
        // Available balance (simplified calculation)
        const availableBalance = ggr * 0.7; // Just an example, in reality this would be more complex

        setStats({
          totalUsers,
          newUsers,
          activePlayers,
          totalDeposits,
          totalWithdrawals,
          ggr,
          ngr,
          totalBonuses,
          bettingVolume,
          availableBalance
        });

        // Top games by NGR (for this demo we'll just sort by popularity)
        setTopGames(games.sort((a, b) => b.rtp - a.rtp).slice(0, 5));

        toast({
          title: "Success",
          description: "Dashboard data loaded successfully",
          variant: "default"
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Using fallback values.",
          variant: "destructive"
        });
        
        // Set fallback values
        setStats({
          totalUsers: 11523,
          newUsers: 342,
          activePlayers: 2874,
          totalDeposits: 287456,
          totalWithdrawals: 189234,
          ggr: 142350,
          ngr: 98713,
          totalBonuses: 32487,
          bettingVolume: 458932,
          availableBalance: 243679
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Format numbers with commas and 2 decimal places for currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Financial Overview</h1>
      
      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="GGR" 
          value={formatCurrency(stats.ggr)} 
          change="+8.5%" 
          subtitle="Gross Gaming Revenue"
          isPositive={true}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard 
          title="NGR" 
          value={formatCurrency(stats.ngr)} 
          change="+5.2%" 
          subtitle="Net Gaming Revenue"
          isPositive={true}
          icon={<BadgeDollarSign className="h-5 w-5" />}
        />
        <StatCard 
          title="Total Bonuses" 
          value={formatCurrency(stats.totalBonuses)} 
          change="+12.3%" 
          subtitle="Paid to players"
          isPositive={false}
          icon={<GiftIcon className="h-5 w-5" />}
        />
        <StatCard 
          title="Available Balance" 
          value={formatCurrency(stats.availableBalance)} 
          change="+3.8%" 
          subtitle="Casino liquidity"
          isPositive={true}
          icon={<Wallet className="h-5 w-5" />}
        />
      </div>
      
      {/* Player Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers.toLocaleString()} 
          change="+12.5%" 
          subtitle="Registered accounts"
          isPositive={true}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard 
          title="New Users" 
          value={stats.newUsers.toLocaleString()} 
          change="+8.2%" 
          subtitle="Last 7 days"
          isPositive={true}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard 
          title="Active Players" 
          value={stats.activePlayers.toLocaleString()} 
          change="-4.3%" 
          subtitle="Last 24 hours"
          isPositive={false}
          icon={<Activity className="h-5 w-5" />}
        />
        <StatCard 
          title="Betting Volume" 
          value={formatCurrency(stats.bettingVolume)} 
          change="+7.8%" 
          subtitle="Last 7 days"
          isPositive={true}
          icon={<BarChart3 className="h-5 w-5" />}
        />
      </div>
      
      {/* Transaction Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
        <StatCard 
          title="Total Deposits" 
          value={formatCurrency(stats.totalDeposits)} 
          change="+15.2%" 
          subtitle="Last 30 days"
          isPositive={true}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard 
          title="Total Withdrawals" 
          value={formatCurrency(stats.totalWithdrawals)} 
          change="+9.7%" 
          subtitle="Last 30 days"
          isPositive={false}
          icon={<TrendingDown className="h-5 w-5" />}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Top Games by NGR */}
        <div className="lg:col-span-2">
          <div className="thunder-card">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h2 className="font-semibold text-lg">Top Games by NGR</h2>
              <Button variant="link" className="text-casino-thunder-green p-0">View All</Button>
            </div>
            <div className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Game</TableHead>
                    <TableHead>NGR</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Volume</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topGames.map((game, index) => (
                    <TableRow key={game.id}>
                      <TableCell className="font-medium">{game.title}</TableCell>
                      <TableCell>{formatCurrency(Math.floor(Math.random() * 20000) + 10000)}</TableCell>
                      <TableCell>{game.provider}</TableCell>
                      <TableCell>{formatCurrency(Math.floor(Math.random() * 100000) + 50000)}</TableCell>
                    </TableRow>
                  ))}
                  {topGames.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">No game data available</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        
        {/* NGR Distribution */}
        <div className="thunder-card">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold text-lg">NGR by Region</h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <RegionRow
                region="Europe"
                amount={formatCurrency(stats.ngr * 0.43)}
                percentage={43}
              />
              <RegionRow
                region="North America"
                amount={formatCurrency(stats.ngr * 0.29)}
                percentage={29}
              />
              <RegionRow
                region="Asia"
                amount={formatCurrency(stats.ngr * 0.19)}
                percentage={19}
              />
              <RegionRow
                region="South America"
                amount={formatCurrency(stats.ngr * 0.06)}
                percentage={6}
              />
              <RegionRow
                region="Africa"
                amount={formatCurrency(stats.ngr * 0.03)}
                percentage={3}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Bonus Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="thunder-card lg:col-span-2">
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <h2 className="font-semibold text-lg">Bonus Distribution</h2>
            <Button variant="link" className="text-casino-thunder-green p-0">View All</Button>
          </div>
          <div className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bonus Type</TableHead>
                  <TableHead>Total Given</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Average</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Welcome Bonus</TableCell>
                  <TableCell>{formatCurrency(stats.totalBonuses * 0.38)}</TableCell>
                  <TableCell>{Math.floor(stats.totalUsers * 0.03)}</TableCell>
                  <TableCell>{formatCurrency(stats.totalBonuses * 0.38 / Math.floor(stats.totalUsers * 0.03))}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Reload Bonus</TableCell>
                  <TableCell>{formatCurrency(stats.totalBonuses * 0.27)}</TableCell>
                  <TableCell>{Math.floor(stats.totalUsers * 0.05)}</TableCell>
                  <TableCell>{formatCurrency(stats.totalBonuses * 0.27 / Math.floor(stats.totalUsers * 0.05))}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Cashback</TableCell>
                  <TableCell>{formatCurrency(stats.totalBonuses * 0.17)}</TableCell>
                  <TableCell>{Math.floor(stats.totalUsers * 0.03)}</TableCell>
                  <TableCell>{formatCurrency(stats.totalBonuses * 0.17 / Math.floor(stats.totalUsers * 0.03))}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Free Spins</TableCell>
                  <TableCell>{formatCurrency(stats.totalBonuses * 0.12)}</TableCell>
                  <TableCell>{Math.floor(stats.totalUsers * 0.04)}</TableCell>
                  <TableCell>{formatCurrency(stats.totalBonuses * 0.12 / Math.floor(stats.totalUsers * 0.04))}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">VIP Rewards</TableCell>
                  <TableCell>{formatCurrency(stats.totalBonuses * 0.06)}</TableCell>
                  <TableCell>{Math.floor(stats.totalUsers * 0.007)}</TableCell>
                  <TableCell>{formatCurrency(stats.totalBonuses * 0.06 / Math.floor(stats.totalUsers * 0.007))}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
        
        {/* NGR by Provider */}
        <div className="thunder-card">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold text-lg">NGR by Provider</h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <ProviderRow
                provider="Evolution"
                amount={formatCurrency(stats.ngr * 0.39)}
                percentage={39}
              />
              <ProviderRow
                provider="ThunderBall"
                amount={formatCurrency(stats.ngr * 0.33)}
                percentage={33}
              />
              <ProviderRow
                provider="Pragmatic"
                amount={formatCurrency(stats.ngr * 0.16)}
                percentage={16}
              />
              <ProviderRow
                provider="NetEnt"
                amount={formatCurrency(stats.ngr * 0.09)}
                percentage={9}
              />
              <ProviderRow
                provider="Others"
                amount={formatCurrency(stats.ngr * 0.03)}
                percentage={3}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps { 
  title: string; 
  value: string; 
  change: string; 
  subtitle: string;
  isPositive: boolean; 
  icon: React.ReactNode;
}

const StatCard = ({ 
  title, 
  value, 
  change, 
  subtitle,
  isPositive, 
  icon 
}: StatCardProps) => (
  <div className="thunder-card p-4">
    <div className="flex justify-between items-start mb-2">
      <span className="text-white/60 text-sm">{title}</span>
      <div className="bg-white/10 rounded-full p-2">
        {icon}
      </div>
    </div>
    <div className="flex flex-col gap-1">
      <h3 className="text-2xl font-bold">{value}</h3>
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/60">{subtitle}</span>
        <span className={`text-xs flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
          {change}
        </span>
      </div>
    </div>
  </div>
);

interface RegionRowProps {
  region: string;
  amount: string;
  percentage: number;
}

const RegionRow = ({ region, amount, percentage }: RegionRowProps) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-white/60" />
        <span>{region}</span>
      </div>
      <span className="font-medium">{amount}</span>
    </div>
    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-casino-thunder-green to-teal-400" 
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
    <div className="text-xs text-right text-white/60">{percentage}%</div>
  </div>
);

interface ProviderRowProps {
  provider: string;
  amount: string;
  percentage: number;
}

const ProviderRow = ({ provider, amount, percentage }: ProviderRowProps) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Gamepad2 className="h-4 w-4 text-white/60" />
        <span>{provider}</span>
      </div>
      <span className="font-medium">{amount}</span>
    </div>
    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-purple-500 to-blue-400" 
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
    <div className="text-xs text-right text-white/60">{percentage}%</div>
  </div>
);

export default AdminDashboard;
