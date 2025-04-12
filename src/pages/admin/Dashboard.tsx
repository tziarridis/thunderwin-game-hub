
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

const AdminDashboard = () => {
  return (
    <div className="py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Financial Overview</h1>
      
      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="GGR" 
          value="$142,350" 
          change="+8.5%" 
          subtitle="Gross Gaming Revenue"
          isPositive={true}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard 
          title="NGR" 
          value="$98,713" 
          change="+5.2%" 
          subtitle="Net Gaming Revenue"
          isPositive={true}
          icon={<BadgeDollarSign className="h-5 w-5" />}
        />
        <StatCard 
          title="Total Bonuses" 
          value="$32,487" 
          change="+12.3%" 
          subtitle="Paid to players"
          isPositive={false}
          icon={<GiftIcon className="h-5 w-5" />}
        />
        <StatCard 
          title="Available Balance" 
          value="$243,679" 
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
          value="11,523" 
          change="+12.5%" 
          subtitle="Registered accounts"
          isPositive={true}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard 
          title="New Users" 
          value="342" 
          change="+8.2%" 
          subtitle="Last 7 days"
          isPositive={true}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard 
          title="Active Players" 
          value="2,874" 
          change="-4.3%" 
          subtitle="Last 24 hours"
          isPositive={false}
          icon={<Activity className="h-5 w-5" />}
        />
        <StatCard 
          title="Betting Volume" 
          value="$458,932" 
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
          value="$287,456" 
          change="+15.2%" 
          subtitle="Last 30 days"
          isPositive={true}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard 
          title="Total Withdrawals" 
          value="$189,234" 
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
                  <TableRow>
                    <TableCell className="font-medium">Thunder Megaways</TableCell>
                    <TableCell>$24,354</TableCell>
                    <TableCell>ThunderBall</TableCell>
                    <TableCell>$148,975</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Blackjack VIP</TableCell>
                    <TableCell>$18,768</TableCell>
                    <TableCell>Evolution</TableCell>
                    <TableCell>$125,340</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Lightning Roulette</TableCell>
                    <TableCell>$16,543</TableCell>
                    <TableCell>Evolution</TableCell>
                    <TableCell>$98,654</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Book of Thunder</TableCell>
                    <TableCell>$14,873</TableCell>
                    <TableCell>ThunderBall</TableCell>
                    <TableCell>$76,321</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Cash Eruption</TableCell>
                    <TableCell>$12,564</TableCell>
                    <TableCell>Pragmatic</TableCell>
                    <TableCell>$68,742</TableCell>
                  </TableRow>
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
                amount="$42,563"
                percentage={43}
              />
              <RegionRow
                region="North America"
                amount="$28,954"
                percentage={29}
              />
              <RegionRow
                region="Asia"
                amount="$18,723"
                percentage={19}
              />
              <RegionRow
                region="South America"
                amount="$5,827"
                percentage={6}
              />
              <RegionRow
                region="Africa"
                amount="$2,646"
                percentage={3}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bonus Distribution */}
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
                  <TableCell>$12,450</TableCell>
                  <TableCell>342</TableCell>
                  <TableCell>$36.40</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Reload Bonus</TableCell>
                  <TableCell>$8,756</TableCell>
                  <TableCell>623</TableCell>
                  <TableCell>$14.05</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Cashback</TableCell>
                  <TableCell>$5,432</TableCell>
                  <TableCell>378</TableCell>
                  <TableCell>$14.37</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Free Spins</TableCell>
                  <TableCell>$3,845</TableCell>
                  <TableCell>512</TableCell>
                  <TableCell>$7.51</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">VIP Rewards</TableCell>
                  <TableCell>$2,004</TableCell>
                  <TableCell>87</TableCell>
                  <TableCell>$23.03</TableCell>
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
                amount="$38,745"
                percentage={39}
              />
              <ProviderRow
                provider="ThunderBall"
                amount="$32,564"
                percentage={33}
              />
              <ProviderRow
                provider="Pragmatic"
                amount="$15,867"
                percentage={16}
              />
              <ProviderRow
                provider="NetEnt"
                amount="$8,425"
                percentage={9}
              />
              <ProviderRow
                provider="Others"
                amount="$3,112"
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
