import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { User, AffiliateStatsData, CommissionEarning, MarketingMaterial } from '@/types'; // Assuming these types are defined
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Copy, Download, Share2, Users, DollarSign, Percent, TrendingUp, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

// Placeholder components - these would need to be implemented
const AffiliateStats: React.FC<{ stats: AffiliateStatsData | null, isLoading: boolean }> = ({ stats, isLoading }) => {
    if (isLoading) return <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">{Array(4).fill(0).map((_,i)=><Card key={i}><CardHeader><Loader2 className="h-5 w-5 animate-spin"/></CardHeader><CardContent><Loader2 className="h-8 w-20 animate-spin"/></CardContent></Card>)}</div>;
    if (!stats) return <p>No stats available.</p>;
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card><CardHeader><CardTitle>Clicks</CardTitle><Users className="h-5 w-5 text-muted-foreground"/></CardHeader><CardContent><p className="text-2xl font-bold">{stats.clicks ?? 0}</p></CardContent></Card>
            <Card><CardHeader><CardTitle>Registrations</CardTitle><Users className="h-5 w-5 text-muted-foreground"/></CardHeader><CardContent><p className="text-2xl font-bold">{stats.registrations ?? 0}</p></CardContent></Card>
            <Card><CardHeader><CardTitle>FTDs</CardTitle><DollarSign className="h-5 w-5 text-muted-foreground"/></CardHeader><CardContent><p className="text-2xl font-bold">{stats.firstTimeDepositors ?? 0}</p></CardContent></Card>
            <Card><CardHeader><CardTitle>Commissions</CardTitle><Percent className="h-5 w-5 text-muted-foreground"/></CardHeader><CardContent><p className="text-2xl font-bold">${(stats.totalCommission ?? 0).toFixed(2)}</p></CardContent></Card>
        </div>
    );
};

const AffiliateLink: React.FC<{ link: string | null, code: string | null }> = ({ link, code }) => {
    if (!link) return <p>Referral link not available.</p>;
    const handleCopy = (textToCopy: string, type: string) => {
        navigator.clipboard.writeText(textToCopy);
        toast.success(`${type} copied to clipboard!`);
    };
    return (
        <Card className="mb-6">
            <CardHeader><CardTitle>Your Referral Link & Code</CardTitle></CardHeader>
            <CardContent className="space-y-3">
                <div>
                    <Label htmlFor="referralLink">Link:</Label>
                    <div className="flex items-center gap-2">
                        <Input id="referralLink" value={link} readOnly />
                        <Button variant="outline" size="icon" onClick={() => handleCopy(link, "Link")}><Copy className="h-4 w-4"/></Button>
                    </div>
                </div>
                {code && (
                     <div>
                        <Label htmlFor="referralCode">Code:</Label>
                        <div className="flex items-center gap-2">
                            <Input id="referralCode" value={code} readOnly />
                            <Button variant="outline" size="icon" onClick={() => handleCopy(code, "Code")}><Copy className="h-4 w-4"/></Button>
                        </div>
                    </div>
                )}
                 <p className="text-xs text-muted-foreground">Share this link or code with your audience to earn commissions.</p>
            </CardContent>
        </Card>
    );
};
const CommissionHistory: React.FC<{ earnings: CommissionEarning[], isLoading: boolean }> = ({ earnings, isLoading }) => {
    if (isLoading) return <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin"/></div>;
    if (!earnings.length) return <p className="text-center text-muted-foreground py-4">No commission history yet.</p>;
    return (
        <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
                {earnings.map(e => (
                    <TableRow key={e.id}>
                        <TableCell>{format(new Date(e.date), 'PP')}</TableCell>
                        <TableCell>${e.amount.toFixed(2)}</TableCell>
                        <TableCell className="capitalize">{e.type}</TableCell>
                        <TableCell className="capitalize">{e.status}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
const MarketingMaterials: React.FC<{ materials: MarketingMaterial[], isLoading: boolean }> = ({ materials, isLoading }) => {
     if (isLoading) return <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin"/></div>;
    if (!materials.length) return <p className="text-center text-muted-foreground py-4">No marketing materials available currently.</p>;
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.map(m => (
                <Card key={m.id}>
                    <CardHeader><CardTitle>{m.title}</CardTitle><CardDescription>{m.type}</CardDescription></CardHeader>
                    <CardContent>
                        {m.previewUrl && <img src={m.previewUrl} alt={m.title} className="rounded-md mb-2 max-h-40 w-full object-contain"/>}
                        <p className="text-sm text-muted-foreground mb-3">{m.description}</p>
                         <div className="flex gap-2">
                            {m.downloadUrl && <Button variant="outline" size="sm" asChild><a href={m.downloadUrl} download><Download className="mr-2 h-4 w-4"/>Download</a></Button>}
                            {/* Implement share functionality if needed */}
                            {/* <Button variant="outline" size="sm"><Share2 className="mr-2 h-4 w-4"/>Share</Button> */}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};


const AffiliateDashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<AffiliateStatsData | null>(null);
  const [earnings, setEarnings] = useState<CommissionEarning[]>([]);
  const [materials, setMaterials] = useState<MarketingMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [referralLink, setReferralLink] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);


  useEffect(() => {
    if (!isAuthenticated || !user) {
      setIsLoading(false);
      return;
    }

    const fetchAffiliateData = async () => {
      setIsLoading(true);
      try {
        // Simulate fetching data
        // In a real app, these would be Supabase calls, e.g., rpc calls or table queries
        // const { data: statsData, error: statsError } = await supabase.rpc('get_affiliate_stats', { p_user_id: user.id });
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
        
        // Example: User's referral code might be on the user object itself or a related table
        // This depends on how AppUser is populated in AuthContext.
        setReferralCode(user.referralCode || `REF-${user.id.substring(0,6).toUpperCase()}`);
        setReferralLink(user.referralLink || `${window.location.origin}/register?ref=${user.referralCode || `REF-${user.id.substring(0,6).toUpperCase()}`}`);


        setStats({ clicks: 1250, registrations: 85, firstTimeDepositors: 23, totalCommission: 475.50 });
        setEarnings([
          { id: '1', date: new Date(Date.now() - 5*24*60*60*1000).toISOString(), amount: 150.00, type: 'revenue_share', status: 'paid' },
          { id: '2', date: new Date(Date.now() - 12*24*60*60*1000).toISOString(), amount: 75.25, type: 'cpa', status: 'paid' },
          { id: '3', date: new Date(Date.now() - 20*24*60*60*1000).toISOString(), amount: 250.25, type: 'revenue_share', status: 'pending' },
        ]);
        setMaterials([
          { id: 'm1', title: 'Casino Welcome Banner', type: 'banner', description: 'Attractive banner for new players.', previewUrl: 'https://via.placeholder.com/300x250/007bff/ffffff?text=Welcome+Banner', downloadUrl: '#' },
          { id: 'm2', title: 'Slots Promotion Image', type: 'image', description: 'Image for slots promotion.', previewUrl: 'https://via.placeholder.com/300x250/28a745/ffffff?text=Slots+Promo', downloadUrl: '#' },
        ]);

      } catch (error: any) {
        toast.error("Failed to load affiliate data: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAffiliateData();
  }, [user, isAuthenticated]);


  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <h1 className="text-2xl font-semibold">Affiliate Dashboard</h1>
        <p className="mt-4 text-muted-foreground">Please log in to view your affiliate dashboard.</p>
        <Button asChild className="mt-6"><Link to="/login">Login</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Affiliate Dashboard</h1>
            <p className="text-muted-foreground">Track your referrals, earnings, and access marketing tools.</p>
        </div>
        {/* Maybe a button to "Request Payout" or "Settings" */}
      </header>

      <AffiliateStats stats={stats} isLoading={isLoading} />
      <AffiliateLink link={referralLink} code={referralCode} />

      <Tabs defaultValue="commissions" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 mb-6"> {/* Adjusted for 2 or 3 tabs */}
          <TabsTrigger value="commissions">Commission History</TabsTrigger>
          <TabsTrigger value="materials">Marketing Materials</TabsTrigger>
          {/* <TabsTrigger value="referrals">My Referrals</TabsTrigger> */}
        </TabsList>
        
        <TabsContent value="commissions">
          <Card>
            <CardHeader><CardTitle>Your Earnings</CardTitle></CardHeader>
            <CardContent>
              <CommissionHistory earnings={earnings} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials">
           <Card>
            <CardHeader><CardTitle>Promotional Tools</CardTitle><CardDescription>Use these materials to promote our platform.</CardDescription></CardHeader>
            <CardContent>
                <MarketingMaterials materials={materials} isLoading={isLoading}/>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* <TabsContent value="referrals">
          <Card>
            <CardHeader><CardTitle>Referred Users</CardTitle></CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-4">Referred users list coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>
    </div>
  );
};

export default AffiliateDashboardPage;
