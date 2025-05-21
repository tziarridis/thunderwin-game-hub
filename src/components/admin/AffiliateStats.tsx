import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client'; // Assuming supabase client is here
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserX, Link2, TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import { AffiliateStatSummary } from '@/types/affiliate'; // Ensure this type is correctly defined
import { Skeleton } from '@/components/ui/skeleton';


const fetchAffiliateStats = async (): Promise<AffiliateStatSummary> => {
  // This is a placeholder. You'll need to implement actual Supabase queries
  // to calculate these statistics from your 'affiliates', 'users', and 'transactions' tables.
  // For example, count affiliates by status, sum commissions, count referred users.

  // Example structure (replace with actual queries):
  const { count: totalAffiliates, error: totalError } = await supabase.from('affiliates').select('*', { count: 'exact', head: true });
  const { count: activeAffiliates, error: activeError } = await supabase.from('affiliates').select('*', { count: 'exact', head: true }).eq('status', 'approved');
  const { count: pendingAffiliates, error: pendingError } = await supabase.from('affiliates').select('*', { count: 'exact', head: true }).eq('status', 'pending');
  
  // These are very simplified examples. You'd need more complex queries for referrals and commissions.
  // For totalReferrals, you might need a join or a way to link users to their referring affiliate.
  // For totalCommissionPaid, you'd sum up commission payments from a relevant table.

  if (totalError || activeError || pendingError) {
    console.error('Error fetching affiliate stats:', totalError || activeError || pendingError);
    // throw totalError || activeError || pendingError;
  }

  return {
    totalAffiliates: totalAffiliates ?? 0,
    activeAffiliates: activeAffiliates ?? 0,
    pendingAffiliates: pendingAffiliates ?? 0,
    totalReferrals: 0, // Placeholder - implement query
    totalCommissionPaid: 0, // Placeholder - implement query
  };
};


const AffiliateStats: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery<AffiliateStatSummary, Error>({
    queryKey: ['affiliateStatsSummary'],
    queryFn: fetchAffiliateStats,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[120px] w-full" />)}
      </div>
    );
  }

  if (error || !stats) {
    return <p className="text-red-500">Error loading affiliate statistics: {error?.message || 'Unknown error'}</p>;
  }
  
  const statItems = [
    { title: 'Total Affiliates', value: stats.totalAffiliates, icon: <Users className="h-5 w-5 text-muted-foreground" /> },
    { title: 'Active Affiliates', value: stats.activeAffiliates, icon: <UserCheck className="h-5 w-5 text-muted-foreground" /> },
    { title: 'Pending Approvals', value: stats.pendingAffiliates, icon: <UserX className="h-5 w-5 text-muted-foreground" /> },
    { title: 'Total Referrals', value: stats.totalReferrals, icon: <Link2 className="h-5 w-5 text-muted-foreground" /> }, // Assuming totalReferrals exists
    { title: 'Total Commission Paid', value: stats.totalCommissionPaid, icon: <DollarSign className="h-5 w-5 text-muted-foreground" />, isCurrency: true }, // Corrected property
  ];


  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-6">
      {statItems.map((item, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            {item.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {item.isCurrency ? `$${item.value.toFixed(2)}` : item.value}
            </div>
            {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AffiliateStats;
