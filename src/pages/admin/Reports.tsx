
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar, 
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ReportsPage = () => {
  const [timeframe, setTimeframe] = useState("7days");
  const [reportType, setReportType] = useState("financial");
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="users">User Activity</SelectItem>
              <SelectItem value="games">Game Performance</SelectItem>
              <SelectItem value="bonuses">Bonus Usage</SelectItem>
              <SelectItem value="affiliates">Affiliate Performance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs value={reportType} onValueChange={setReportType}>
        <TabsList className="mb-6">
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="users">User Activity</TabsTrigger>
          <TabsTrigger value="games">Game Performance</TabsTrigger>
          <TabsTrigger value="bonuses">Bonus Usage</TabsTrigger>
          <TabsTrigger value="affiliates">Affiliate Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="financial">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Gross Revenue</CardTitle>
                <CardDescription>Total gaming revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$142,350</div>
                <div className="flex items-center text-green-500 text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>+8.5% from previous period</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Net Revenue</CardTitle>
                <CardDescription>After bonuses & costs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$98,713</div>
                <div className="flex items-center text-green-500 text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>+5.2% from previous period</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Margin</CardTitle>
                <CardDescription>Profit ratio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">69.3%</div>
                <div className="flex items-center text-red-500 text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" transform="rotate(90)" />
                  <span>-1.7% from previous period</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="thunder-card mb-6">
            <div className="p-4 border-b border-white/10">
              <h2 className="font-semibold text-lg">Revenue Over Time</h2>
            </div>
            <div className="p-4 h-64 flex items-center justify-center">
              <BarChart3 className="h-12 w-12 text-gray-500" />
              <span className="ml-2 text-gray-500">Revenue chart would be displayed here</span>
            </div>
          </div>
          
          <div className="thunder-card">
            <div className="p-4 border-b border-white/10">
              <h2 className="font-semibold text-lg">Financial Transaction Details</h2>
            </div>
            <div className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Transaction Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Users Count</TableHead>
                    <TableHead>Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>2025-04-12</TableCell>
                    <TableCell>Deposits</TableCell>
                    <TableCell>$28,450</TableCell>
                    <TableCell>342</TableCell>
                    <TableCell>Credit Card, Crypto</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2025-04-12</TableCell>
                    <TableCell>Withdrawals</TableCell>
                    <TableCell>$18,975</TableCell>
                    <TableCell>187</TableCell>
                    <TableCell>Bank Transfer, Crypto</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2025-04-11</TableCell>
                    <TableCell>Deposits</TableCell>
                    <TableCell>$24,320</TableCell>
                    <TableCell>298</TableCell>
                    <TableCell>Credit Card, E-Wallet</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2025-04-11</TableCell>
                    <TableCell>Withdrawals</TableCell>
                    <TableCell>$15,840</TableCell>
                    <TableCell>164</TableCell>
                    <TableCell>Bank Transfer, E-Wallet</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2025-04-10</TableCell>
                    <TableCell>Deposits</TableCell>
                    <TableCell>$26,780</TableCell>
                    <TableCell>312</TableCell>
                    <TableCell>Credit Card, Crypto</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="users">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Active Users</CardTitle>
                <CardDescription>Daily active users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,874</div>
                <div className="flex items-center text-red-500 text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" transform="rotate(90)" />
                  <span>-4.3% from previous period</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">New Users</CardTitle>
                <CardDescription>New registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">342</div>
                <div className="flex items-center text-green-500 text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>+8.2% from previous period</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Conversion</CardTitle>
                <CardDescription>Registration to deposit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">43.8%</div>
                <div className="flex items-center text-green-500 text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>+2.1% from previous period</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="thunder-card">
            <div className="p-4 border-b border-white/10">
              <h2 className="font-semibold text-lg">User Activity Details</h2>
            </div>
            <div className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Active Users</TableHead>
                    <TableHead>New Registrations</TableHead>
                    <TableHead>Retention Rate</TableHead>
                    <TableHead>Avg. Session Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>2025-04-12</TableCell>
                    <TableCell>2,874</TableCell>
                    <TableCell>98</TableCell>
                    <TableCell>68.3%</TableCell>
                    <TableCell>24 min</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2025-04-11</TableCell>
                    <TableCell>2,945</TableCell>
                    <TableCell>104</TableCell>
                    <TableCell>67.9%</TableCell>
                    <TableCell>26 min</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2025-04-10</TableCell>
                    <TableCell>3,012</TableCell>
                    <TableCell>112</TableCell>
                    <TableCell>69.4%</TableCell>
                    <TableCell>28 min</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2025-04-09</TableCell>
                    <TableCell>2,890</TableCell>
                    <TableCell>95</TableCell>
                    <TableCell>68.1%</TableCell>
                    <TableCell>25 min</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2025-04-08</TableCell>
                    <TableCell>2,756</TableCell>
                    <TableCell>88</TableCell>
                    <TableCell>67.2%</TableCell>
                    <TableCell>22 min</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="games">
          {/* Game Performance tab */}
          <div className="thunder-card">
            <div className="p-4 border-b border-white/10">
              <h2 className="font-semibold text-lg">Top Games by NGR</h2>
            </div>
            <div className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Game</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>NGR</TableHead>
                    <TableHead>Players</TableHead>
                    <TableHead>Avg. Bet</TableHead>
                    <TableHead>RTP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Thunder Megaways</TableCell>
                    <TableCell>ThunderBall</TableCell>
                    <TableCell>$24,354</TableCell>
                    <TableCell>1,245</TableCell>
                    <TableCell>$8.92</TableCell>
                    <TableCell>96.2%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Blackjack VIP</TableCell>
                    <TableCell>Evolution</TableCell>
                    <TableCell>$18,768</TableCell>
                    <TableCell>764</TableCell>
                    <TableCell>$52.31</TableCell>
                    <TableCell>99.4%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Lightning Roulette</TableCell>
                    <TableCell>Evolution</TableCell>
                    <TableCell>$16,543</TableCell>
                    <TableCell>982</TableCell>
                    <TableCell>$35.28</TableCell>
                    <TableCell>97.3%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Book of Thunder</TableCell>
                    <TableCell>ThunderBall</TableCell>
                    <TableCell>$14,873</TableCell>
                    <TableCell>1,108</TableCell>
                    <TableCell>$7.43</TableCell>
                    <TableCell>95.8%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Cash Eruption</TableCell>
                    <TableCell>Pragmatic</TableCell>
                    <TableCell>$12,564</TableCell>
                    <TableCell>875</TableCell>
                    <TableCell>$6.21</TableCell>
                    <TableCell>96.5%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="bonuses">
          {/* Bonus Usage tab */}
          <div className="thunder-card">
            <div className="p-4 border-b border-white/10">
              <h2 className="font-semibold text-lg">Bonus Usage Report</h2>
            </div>
            <div className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bonus Type</TableHead>
                    <TableHead>Total Given</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Avg. Value</TableHead>
                    <TableHead>Wagering Complete %</TableHead>
                    <TableHead>ROI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Welcome Bonus</TableCell>
                    <TableCell>$12,450</TableCell>
                    <TableCell>342</TableCell>
                    <TableCell>$36.40</TableCell>
                    <TableCell>48%</TableCell>
                    <TableCell>135%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Reload Bonus</TableCell>
                    <TableCell>$8,756</TableCell>
                    <TableCell>623</TableCell>
                    <TableCell>$14.05</TableCell>
                    <TableCell>67%</TableCell>
                    <TableCell>182%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Cashback</TableCell>
                    <TableCell>$5,432</TableCell>
                    <TableCell>378</TableCell>
                    <TableCell>$14.37</TableCell>
                    <TableCell>100%</TableCell>
                    <TableCell>210%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Free Spins</TableCell>
                    <TableCell>$3,845</TableCell>
                    <TableCell>512</TableCell>
                    <TableCell>$7.51</TableCell>
                    <TableCell>72%</TableCell>
                    <TableCell>156%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">VIP Rewards</TableCell>
                    <TableCell>$2,004</TableCell>
                    <TableCell>87</TableCell>
                    <TableCell>$23.03</TableCell>
                    <TableCell>89%</TableCell>
                    <TableCell>245%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="affiliates">
          {/* Affiliate Performance tab */}
          <div className="thunder-card">
            <div className="p-4 border-b border-white/10">
              <h2 className="font-semibold text-lg">Affiliate Performance Report</h2>
            </div>
            <div className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Affiliate</TableHead>
                    <TableHead>Signups</TableHead>
                    <TableHead>Deposits</TableHead>
                    <TableHead>NGR</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Conversion %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">ThunderAff12</TableCell>
                    <TableCell>86</TableCell>
                    <TableCell>$12,450</TableCell>
                    <TableCell>$3,254</TableCell>
                    <TableCell>$975</TableCell>
                    <TableCell>62%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">CasinoHunter</TableCell>
                    <TableCell>54</TableCell>
                    <TableCell>$8,756</TableCell>
                    <TableCell>$2,186</TableCell>
                    <TableCell>$655</TableCell>
                    <TableCell>48%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">BetMaster</TableCell>
                    <TableCell>43</TableCell>
                    <TableCell>$6,432</TableCell>
                    <TableCell>$1,843</TableCell>
                    <TableCell>$552</TableCell>
                    <TableCell>56%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">GamingPros</TableCell>
                    <TableCell>37</TableCell>
                    <TableCell>$5,845</TableCell>
                    <TableCell>$1,425</TableCell>
                    <TableCell>$427</TableCell>
                    <TableCell>51%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">SlotNation</TableCell>
                    <TableCell>28</TableCell>
                    <TableCell>$4,204</TableCell>
                    <TableCell>$1,203</TableCell>
                    <TableCell>$360</TableCell>
                    <TableCell>54%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
