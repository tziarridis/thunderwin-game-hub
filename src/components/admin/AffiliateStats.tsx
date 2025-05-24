
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserX, Link2, DollarSign } from 'lucide-react';
import { AffiliateStatSummary } from '@/types/affiliate';
import { Skeleton } from '@/components/ui/skeleton';

const fetchAffiliateStats = async (): Promise<AffiliateStatSummary> => {
  // Fetch total affiliates (users with an inviter_code)
  const { count: totalAffiliates, error: totalError } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .not('inviter_code', 'is', null);

  // Fetch active affiliates (status 'active' and have an inviter_code)
  const { count: activeAffiliates, error: activeError } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .not('inviter_code', 'is', null)
    .eq('status', 'active');

  // Fetch pending affiliates (status 'pending' and have an inviter_code)
  const { count: pendingAffiliates, error: pendingError } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .not('inviter_code', 'is', null)
    .eq('status', 'pending');

  if (totalError || activeError || pendingError) {
    console.error('Error fetching affiliate counts:', totalError || activeError || pendingError);
  }

  return {
    totalAffiliates: totalAffiliates ?? 0,
    activeAffiliates: activeAffiliates ?? 0,
    pendingAffiliates: pendingAffiliates ?? 0,
    totalReferrals: 0,
    totalCommissionPaid: 0,
    activeReferrals: 0,
    pendingCommission: 0,
    totalEarned: 0,
    conversionRate: 0,
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
    { title: 'Total Referrals', value: stats.totalReferrals, icon: <Link2 className="h-5 w-5 text-muted-foreground" /> },
    { title: 'Total Commission Paid', value: `${stats.totalCommissionPaid.toFixed(2)}`, icon: <DollarSign className="h-5 w-5 text-muted-foreground" />, isCurrency: true },
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
              {item.isCurrency ? `$${item.value}` : item.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AffiliateStats;
