
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import UserLayout from '@/components/layout/UserLayout';
// import { affiliateService } from '@/services/affiliateService'; // Assuming this exists
import { AffiliateStats, AffiliateLink, AffiliateEarning } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Copy, LinkIcon, Users, DollarSign, BarChart3, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';


// Define AffiliateDashboardData if it's a specific combined type
interface AffiliateDashboardData {
  stats: AffiliateStats;
  links: AffiliateLink[];
  recentEarnings: AffiliateEarning[];
  referralCode: string;
  referralLinkBase: string; // e.g. "https://yourapp.com/register?ref="
}

// Mock affiliateService
const mockAffiliateService = {
  getDashboardData: async (userId: string): Promise<AffiliateDashboardData> => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
    if (userId === "errorUser") throw new Error("Failed to fetch affiliate data");
    return {
      stats: { clicks: 120, sign_ups: 30, active_players: 15, total_earnings: 250.75, unpaid_earnings: 75.20, commission_rate: 0.25 },
      links: [
        { id: 'link1', name: 'Default Link', url: `https://yourapp.com/register?ref=testcode123`, clicks: 80, sign_ups: 20, created_at: new Date().toISOString() },
        { id: 'link2', name: 'Campaign A', url: `https://yourapp.com/register?ref=campA`, clicks: 40, sign_ups: 10, created_at: new Date().toISOString() },
      ],
      recentEarnings: [
        { id: 'earn1', amount: 10.50, player_id: 'playerX', transaction_id: 'txABC', created_at: new Date(Date.now() - 86400000).toISOString() }, // 1 day ago
        { id: 'earn2', amount: 5.25, player_id: 'playerY', transaction_id: 'txDEF', created_at: new Date(Date.now() - 172800000).toISOString() }, // 2 days ago
      ],
      referralCode: 'testcode123',
      referralLinkBase: 'https://yourapp.com/register?ref='
    };
  }
};
const affiliateService = mockAffiliateService;


const AffiliateDashboardPage: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [customLinkName, setCustomLinkName] = useState('');

  const { data, isLoading, error, refetch } = useQuery<AffiliateDashboardData, Error>({
    queryKey: ['affiliateDashboard', user?.id],
    queryFn: () => {
        if (!user?.id) throw new Error("User not authenticated or ID missing");
        return affiliateService.getDashboardData(user.id);
    },
    enabled: !!user?.id && isAuthenticated && !authLoading,
  });

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleCreateLink = () => {
    if (!customLinkName.trim()) {
      toast.error('Please enter a name for your custom link.');
      return;
    }
    // Placeholder: Implement actual link creation via service
    toast.info(`Creating link "${customLinkName}" (feature not fully implemented).`);
    // Example: affiliateService.createLink(user.id, customLinkName).then(() => refetch());
    setCustomLinkName('');
  };
  
  if (authLoading) {
    return <UserLayout><div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div></UserLayout>;
  }

  if (!isAuthenticated || !user) {
    navigate('/login'); // Redirect if not authenticated
    return null; 
  }

  if (isLoading && !data) {
     return <UserLayout><div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div></UserLayout>;
  }

  if (error) {
    return (
      <UserLayout>
        <div className="container mx-auto py-8 px-4 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Error Loading Affiliate Data</h2>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <Button onClick={() => refetch()}><RefreshCw className="mr-2 h-4 w-4" /> Retry</Button>
        </div>
      </UserLayout>
    );
  }
  
  if (!data) {
     return <UserLayout><div className="text-center py-8">No affiliate data available.</div></UserLayout>;
  }

  const { stats, links, recentEarnings, referralCode, referralLinkBase } = data;
  const defaultReferralLink = `${referralLinkBase}${referralCode}`;

  return (
    <UserLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Affiliate Dashboard</h1>
            <Button onClick={() => refetch()} variant="outline" disabled={isLoading}><RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin': ''}`}/> Refresh Data</Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Earnings" value={`$${stats.total_earnings.toFixed(2)}`} icon={<DollarSign />} />
          <StatCard title="Unpaid Earnings" value={`$${stats.unpaid_earnings.toFixed(2)}`} icon={<DollarSign />} />
          <StatCard title="Commission Rate" value={`${(stats.commission_rate * 100).toFixed(0)}%`} icon={<BarChart3 />} />
          <StatCard title="Total Clicks" value={String(stats.clicks)} icon={<Users />} />
          <StatCard title="Sign Ups" value={String(stats.sign_ups)} icon={<Users />} />
          <StatCard title="Active Players" value={String(stats.active_players)} icon={<Users />} />
        </div>

        {/* Referral Link */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Default Referral Link</CardTitle>
            <CardDescription>Share this link to earn commissions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 bg-muted p-3 rounded-md">
              <LinkIcon className="h-5 w-5 text-muted-foreground" />
              <Input type="text" value={defaultReferralLink} readOnly className="flex-grow bg-transparent border-none focus:ring-0" />
              <Button size="sm" variant="ghost" onClick={() => handleCopyToClipboard(defaultReferralLink)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
             <p className="text-sm text-muted-foreground mt-2">Your referral code: <strong>{referralCode}</strong></p>
          </CardContent>
        </Card>
        
        {/* Custom Links - Simplified for now */}
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Your Affiliate Links</CardTitle>
                <CardDescription>Manage your campaign links.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {links.map(link => (
                        <div key={link.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                            <div>
                                <p className="font-semibold">{link.name}</p>
                                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline break-all">{link.url}</a>
                                <p className="text-xs text-muted-foreground">Clicks: {link.clicks} | Sign-ups: {link.sign_ups}</p>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => handleCopyToClipboard(link.url)}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
                <div className="mt-6 pt-4 border-t">
                    <h3 className="text-lg font-semibold mb-2">Create New Link</h3>
                    <div className="flex gap-2">
                        <Input 
                            type="text" 
                            placeholder="Campaign Name (e.g., SummerPromo)" 
                            value={customLinkName}
                            onChange={(e) => setCustomLinkName(e.target.value)}
                            className="flex-grow"
                        />
                        <Button onClick={handleCreateLink}>Create Link</Button>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Recent Earnings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Earnings</CardTitle>
            <CardDescription>A log of your recent commission earnings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Player ID</TableHead>
                  <TableHead>Source Transaction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEarnings.length > 0 ? recentEarnings.map(earning => (
                  <TableRow key={earning.id}>
                    <TableCell>{format(new Date(earning.created_at), 'PPp')}</TableCell>
                    <TableCell className="text-green-500 font-semibold">${earning.amount.toFixed(2)}</TableCell>
                    <TableCell>{earning.player_id}</TableCell>
                    <TableCell>{earning.transaction_id}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No recent earnings.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </UserLayout>
  );
};

interface StatCardProps { title: string; value: string; icon: React.ReactNode; }
const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export default AffiliateDashboardPage;
