
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, DollarSign, BarChart3, AlertCircle } from 'lucide-react';
import { Affiliate, AffiliateStatSummary } from '@/types'; // Using updated Affiliate type
// Assume a service exists to fetch affiliate data
// import { affiliateService } from '@/services/affiliateService'; 

// Mock service until a real one is implemented
const mockAffiliateService = {
  getAffiliateStatsSummary: async (): Promise<AffiliateStatSummary> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
    return {
      totalAffiliates: 150,
      totalCommissionsPaid: 25000.75,
      newSignUpsThisMonth: 25,
    };
  },
  getTopAffiliates: async (limit: number = 5): Promise<Affiliate[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { id: 'aff1', userId: 'user1', name: 'Affiliate Alpha', email: 'alpha@example.com', code: 'ALPHA10', totalCommissions: 5200, clicks: 1200, signUps: 50, depositingUsers: 20, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: 'active', total_referred_users: 50, commission_rate_cpa: 10, commission_rate_revenue_share: 25 },
      { id: 'aff2', userId: 'user2', name: 'Beta Affiliates', email: 'beta@example.com', code: 'BETAADV', totalCommissions: 3800, clicks: 950, signUps: 35, depositingUsers: 15, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: 'active', total_referred_users: 35, commission_rate_cpa: 8, commission_rate_revenue_share: 20 },
      // ... more mock affiliates
    ].slice(0, limit);
  }
};


const AffiliateStats = () => {
  const { data: summary, isLoading: isLoadingSummary, error: summaryError } = useQuery<AffiliateStatSummary, Error>({
    queryKey: ['affiliateStatsSummary'],
    queryFn: () => mockAffiliateService.getAffiliateStatsSummary(),
  });

  const { data: topAffiliates, isLoading: isLoadingTop, error: topAffiliatesError } = useQuery<Affiliate[], Error>({
    queryKey: ['topAffiliates'],
    queryFn: () => mockAffiliateService.getTopAffiliates(),
  });

  const stats = useMemo(() => [
    { title: 'Total Affiliates', value: summary?.totalAffiliates ?? 0, icon: Users, change: '+5 this week' },
    { title: 'Commissions Paid (Month)', value: `$${(summary?.totalCommissionsPaid ?? 0 / 12).toFixed(2)}`, icon: DollarSign, change: '+2.5% vs last month' },
    { title: 'New Sign-ups (Month)', value: summary?.newSignUpsThisMonth ?? 0, icon: BarChart3, change: '-10% vs last month' },
  ], [summary]);

  if (isLoadingSummary || isLoadingTop) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (summaryError || topAffiliatesError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertCircle className="h-12 w-12 mb-2" />
        <p>Error loading affiliate data: {(summaryError || topAffiliatesError)?.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              {/* <p className="text-xs text-slate-400">{stat.change}</p> */}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Top Performing Affiliates</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-slate-700/30">
                <TableHead className="text-slate-300">Name</TableHead>
                <TableHead className="text-slate-300">Sign-ups</TableHead>
                <TableHead className="text-slate-300">Commission</TableHead>
                <TableHead className="text-slate-300">Code</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-slate-300">Rate (CPA / RevShare)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topAffiliates?.map((affiliate) => (
                <TableRow key={affiliate.id} className="border-slate-700 hover:bg-slate-700/30">
                  <TableCell className="font-medium text-white">{affiliate.name || affiliate.user?.user_metadata?.username || 'N/A'}</TableCell>
                  <TableCell className="text-slate-300">{affiliate.total_referred_users ?? affiliate.signUps ?? 0}</TableCell>
                  <TableCell className="text-slate-300">${(affiliate.totalCommissions ?? 0).toFixed(2)}</TableCell>
                  <TableCell className="text-slate-300">{affiliate.code || 'N/A'}</TableCell>
                  <TableCell><Badge variant={affiliate.status === 'active' ? 'success' : 'secondary'}>{affiliate.status || 'Pending'}</Badge></TableCell>
                  <TableCell className="text-slate-300">
                    ${(affiliate.commission_rate_cpa ?? 0).toFixed(2)} / {affiliate.commission_rate_revenue_share ?? 0}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliateStats;
