import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Affiliate } from '@/types';

const mockAffiliates: Affiliate[] = [
  {
    id: '1',
    userId: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    code: 'JOHN10',
    totalCommissions: 1500.75,
    clicks: 1200,
    signUps: 150,
    depositingUsers: 30,
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2023-05-10T14:30:00Z',
    status: 'active', // Corrected status
    total_referred_users: 150,
    commission_rate_cpa: 25,
    commission_rate_revenue_share: 0.15,
  },
  {
    id: '2',
    userId: 'user2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    code: 'JANE20',
    totalCommissions: 850.00,
    clicks: 800,
    signUps: 90,
    depositingUsers: 15,
    createdAt: '2023-02-20T11:00:00Z',
    updatedAt: '2023-05-01T10:15:00Z',
    status: 'pending', // Corrected status
    total_referred_users: 90,
    commission_rate_cpa: 20,
    commission_rate_revenue_share: 0.10,
  },
];

const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'code',
    header: 'Referral Code',
  },
  {
    accessorKey: 'totalCommissions',
    header: 'Commissions',
  },
  {
    accessorKey: 'clicks',
    header: 'Clicks',
  },
  {
    accessorKey: 'signUps',
    header: 'Sign-Ups',
  },
  {
    accessorKey: 'depositingUsers',
    header: 'Depositing Users',
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
  },
];

const AffiliateStats = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Affiliate Statistics</CardTitle>
        <CardDescription>View and manage affiliate performance.</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={mockAffiliates} />
      </CardContent>
    </Card>
  );
};

export default AffiliateStats;
