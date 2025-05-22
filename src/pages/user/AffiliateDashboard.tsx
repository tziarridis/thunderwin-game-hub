import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Referral, AffiliateStats } from '@/types/affiliate';
import { ColumnDef, SortingState, useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel, CellContext } from "@tanstack/react-table";
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import UserLayout from '@/components/layout/UserLayout';
import UserPageLoadingSkeleton from '@/components/user/UserPageLoadingSkeleton';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Users, DollarSign, Percent, CreditCard, Copy } from 'lucide-react';

const AffiliateDashboardPage: React.FC = () => {
  const { user } = useAuth();
  
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(true);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);

  // Simulated data fetching
  useEffect(() => {
    setIsLoadingStats(true); setIsLoadingReferrals(true);
    if(user?.referralCode && user?.referralLink) {
        // Simulate API calls
        // const fetchedStats = await affiliateService.getStats(user.id);
        // const fetchedReferrals = await affiliateService.getReferrals(user.id, {page, limit});
        setTimeout(() => {
            setStats({
                totalReferrals: 5,
                activeReferrals: 3,
                totalEarnings: 150.75,
                commissionRate: 0.20, // 20%
                pendingPayout: 25.50,
                referralCode: user.referralCode!,
                referralLink: user.referralLink!,
            });
            setReferrals([
                { id: 'ref1', referredUserId: 'userABC', referredUsername: 'PlayerOne', joinDate: new Date().toISOString(), commissionEarned: 75.20, status: 'active' },
                { id: 'ref2', referredUserId: 'userXYZ', referredUsername: 'PlayerTwo', joinDate: new Date(Date.now() - 86400000 * 5).toISOString(), commissionEarned: 50.55, status: 'active' },
                { id: 'ref3', referredUserId: 'userDEF', referredUsername: 'PlayerThree', joinDate: new Date(Date.now() - 86400000 * 10).toISOString(), commissionEarned: 25.00, status: 'pending_first_deposit' },
            ]);
            setIsLoadingStats(false); setIsLoadingReferrals(false);
        }, 1000);
    } else {
        setIsLoadingStats(false); setIsLoadingReferrals(false);
    }
  }, [user]);
  
  const pageCount = Math.ceil((stats?.totalReferrals || 0) / pagination.pageSize);


  const columns: ColumnDef<Referral>[] = [
    { accessorKey: "referredUsername", header: "Referred User" },
    { accessorKey: "joinDate", header: "Join Date", cell: ({row}) => format(new Date(row.original.joinDate), "PP") },
    { accessorKey: "status", header: "Status", cell: ({row}) => <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>{row.original.status.replace(/_/g, ' ')}</Badge> },
    { accessorKey: "commissionEarned", header: "Commission Earned", cell: ({row}) => `$${row.original.commissionEarned.toFixed(2)}` },
  ];
  
  const table = useReactTable({
    data: referrals,
    columns,
    pageCount: pageCount,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true, // If API handles pagination
    manualSorting: true, // If API handles sorting
  });

  if (isLoadingStats || isLoadingReferrals && !stats && referrals.length === 0) {
    return <UserPageLoadingSkeleton />;
  }
  
  if (!user || !stats?.referralCode) {
    return (
      <UserLayout>
        <div className="container mx-auto px-4 py-8 text-center">
            <Users className="mx-auto h-12 w-12 text-primary mb-4" />
            <h1 className="text-2xl font-semibold mb-2">Affiliate Program</h1>
            <p className="text-muted-foreground mb-4">It looks like you're not yet set up for our affiliate program, or your referral code is missing.</p>
            <Button>Contact Support to Join</Button> {/* Placeholder action */}
        </div>
      </UserLayout>
    );
  }


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Referral link copied to clipboard!");
    }).catch(err => {
      toast.error("Failed to copy link.");
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <UserLayout title="Affiliate Dashboard">
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.totalReferrals}</div></CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</div></CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{(stats.commissionRate * 100).toFixed(0)}%</div></CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">${stats.pendingPayout.toFixed(2)}</div></CardContent>
          </Card>
        </div>

        {/* Referral Link */}
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Link</CardTitle>
            <CardDescription>Share this link to invite new players and earn commissions.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center space-x-2">
            <Input value={stats.referralLink} readOnly className="flex-grow" />
            <Button onClick={() => copyToClipboard(stats.referralLink!)}><Copy className="mr-2 h-4 w-4"/> Copy Link</Button>
          </CardContent>
           <CardFooter className="text-xs text-muted-foreground">
            Your referral code: <Badge variant="secondary" className="ml-1">{stats.referralCode}</Badge>
          </CardFooter>
        </Card>

        {/* Referrals Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Referrals</CardTitle>
            <CardDescription>List of users you've referred.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable table={table} columns={columns} isLoading={isLoadingReferrals} />
          </CardContent>
           {pageCount > 1 && (
            <CardFooter className="flex items-center justify-end space-x-2 py-4">
                <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
                <span>Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
                <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
            </CardFooter>
            )}
        </Card>
        {/* Potentially add sections for marketing materials, payout history, etc. */}
      </div>
    </UserLayout>
  );
};

export default AffiliateDashboardPage;
