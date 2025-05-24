
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import AffiliateStats from '@/components/admin/AffiliateStats';
import { AffiliateUser, AffiliateCommissionTier } from '@/types/affiliate';
import { Users, TrendingUp, DollarSign, Search, Download } from 'lucide-react';

// Mock service
const mockAffiliateService = {
  getAllAffiliates: async (): Promise<AffiliateUser[]> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [
      {
        id: '1',
        user_id: 'user-1',
        userId: 'user-1',
        username: 'affiliate1',
        email: 'affiliate1@example.com',
        firstName: 'John',
        lastName: 'Doe',
        affiliate_code: 'AFF001',
        tracking_code: 'TRACK001',
        website_url: 'https://example.com',
        total_referrals: 25,
        commission_earned: 1250.00,
        status: 'active',
        commission_type: 'percentage',
        default_commission_rate: 10,
        commission_tiers: [
          {
            id: '1',
            min_referrals: 0,
            commission_rate: 5,
            name: 'Bronze',
            threshold: 10,
            rate: 5,
            type: 'basic'
          }
        ],
        created_at: '2024-01-15T00:00:00Z'
      }
    ];
  }
};

const Affiliates = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: affiliates, isLoading, error } = useQuery<AffiliateUser[], Error>({
    queryKey: ['affiliates'],
    queryFn: mockAffiliateService.getAllAffiliates,
  });

  const filteredAffiliates = affiliates?.filter(affiliate =>
    affiliate.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    affiliate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    affiliate.affiliate_code.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const columns = [
    {
      accessorKey: 'username',
      header: 'Username',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'affiliate_code',
      header: 'Affiliate Code',
    },
    {
      accessorKey: 'total_referrals',
      header: 'Total Referrals',
    },
    {
      accessorKey: 'commission_earned',
      header: 'Commission Earned',
      cell: ({ row }: any) => `$${row.original.commission_earned.toFixed(2)}`,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
          {row.original.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Affiliate Management</h1>
          <p className="text-muted-foreground">Manage affiliate partners and track performance</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      <AffiliateStats />

      <Card>
        <CardHeader>
          <CardTitle>Affiliate Partners</CardTitle>
          <CardDescription>All registered affiliate partners and their performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search affiliates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading affiliates...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Error loading affiliates: {error.message}
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredAffiliates}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Affiliates;
