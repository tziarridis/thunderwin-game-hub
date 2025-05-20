
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import { Affiliate, AffiliateStatSummary } from '@/types/affiliate'; // Corrected import

interface AffiliateStatsProps {
  summary?: AffiliateStatSummary; // Made summary optional
  recentAffiliates?: Affiliate[]; // Made recentAffiliates optional
  isLoading: boolean;
  error?: string | null; // Added error prop
}

const AffiliateStats: React.FC<AffiliateStatsProps> = ({ summary, recentAffiliates = [], isLoading, error }) => {
  if (isLoading) {
    return <div>Loading affiliate stats...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error loading stats: {error}</div>;
  }
  
  if (!summary) {
    return <div className="text-orange-500">Affiliate summary data is not available.</div>;
  }

  const activeAffiliates = recentAffiliates.filter(aff => aff.isActive).length;
  // const pendingAffiliates = recentAffiliates.filter(aff => aff.status === 'pending').length; // Assuming status field exists if needed

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Affiliates</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalAffiliates ?? 0}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Affiliates</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeAffiliates}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Commissions Paid</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${summary.totalCommissionsPaid?.toFixed(2) ?? '0.00'}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New Sign-ups (Month)</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.newSignUpsThisMonth ?? 0}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliateStats;
