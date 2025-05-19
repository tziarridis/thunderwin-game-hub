import React from 'react';
import { Affiliate } from '@/types'; // Ensure Affiliate is exported from types
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AffiliateStatsProps {
  affiliate: Affiliate | null; // Use the defined Affiliate type
  // ... other props like historicalData
}

interface StatCardProps {
  title: string;
  value: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, className = '' }) => (
  <div className="bg-card rounded-lg p-4 shadow">
    <p className="text-sm text-muted-foreground">{title}</p>
    <p className={`text-2xl font-bold ${className}`}>{value}</p>
  </div>
);

const AffiliateStats: React.FC<AffiliateStatsProps> = ({ affiliate }) => {
  

  if (!affiliate) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Affiliate Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No affiliate data available.</p>
        </CardContent>
      </Card>
    );
  }

  // Placeholder data for charts - replace with actual data processing
  const monthlyCommissionsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Commissions Earned',
        data: [120, 190, 300, 500, 200, 350], // Replace with affiliate.monthlyCommissions or similar
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const referredUsersData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Referred Users',
        data: [5, 8, 12, 15, 10, 18], // Replace with affiliate.monthlyReferrals or similar
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
    ],
  };

  // Safely access affiliate properties
  const username = affiliate.username || affiliate.id || 'N/A';
  const totalReferredUsers = affiliate.total_referred_users?.toString() ?? 'N/A';
  const totalCommissionEarned = `$${affiliate.total_commission_earned?.toFixed(2) ?? 'N/A'}`;
  const referralCode = affiliate.referral_code ?? 'N/A';
  const status = affiliate.status ?? 'N/A';
  // Using commission_rate as a general field if specific ones don't exist, or make them optional
  const commissionRateCpa = affiliate.commission_rate_cpa ?? affiliate.commission_rate;
  const commissionRateRevenueShare = affiliate.commission_rate_revenue_share;


  return (
    <Card>
      <CardHeader>
        <CardTitle>Affiliate Stats: {typeof username === 'string' || typeof username === 'number' ? username : 'N/A'}</CardTitle>
        <CardDescription>Overview of affiliate performance.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Total Referred Users" value={totalReferredUsers} />
          <StatCard title="Total Commission Earned" value={totalCommissionEarned} />
          <StatCard title="Referral Code" value={referralCode} />
          <StatCard title="Status" value={status} className="capitalize" />
           {commissionRateCpa !== undefined && (
            <StatCard title="CPA Rate" value={`$${Number(commissionRateCpa).toFixed(2)}`} />
          )}
          {commissionRateRevenueShare !== undefined && (
            <StatCard title="Revenue Share" value={`${commissionRateRevenueShare}%`} />
          )}
        </div>

        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Monthly Commissions</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyCommissionsData.datasets[0].data.map((value, index) => ({
                  month: monthlyCommissionsData.labels[index],
                  value
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Commission ($)"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Referred Users</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={referredUsersData.datasets[0].data.map((value, index) => ({
                  month: referredUsersData.labels[index],
                  value
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Users"
                    stroke="#82ca9d"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AffiliateStats;
