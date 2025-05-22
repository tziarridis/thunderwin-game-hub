import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Bonus, BonusType, BonusStatus } from '@/types/bonus'; // Bonus type from bonus.ts
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Gift, Ticket, RotateCcw, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge'; // Added Badge import

// Example API call structure
const fetchAvailableBonuses = async (userId?: string): Promise<Bonus[]> => {
  // In a real app, filter by userId if provided, or fetch general available bonuses
  console.log("Fetching available bonuses, userId:", userId);
  await new Promise(resolve => setTimeout(resolve, 700)); // Simulate delay
  // Example data
  return [
    { id: "promo1", name: "Welcome Bonus", description: "100% up to $100 on first deposit", type: "deposit", status: "active", percentage: 100, max_bonus_amount: 100, code: "WELCOME100", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), valid_until: new Date(Date.now() + 30*24*60*60*1000).toISOString() },
    { id: "promo2", name: "20 Free Spins on Starburst", description: "Get 20 free spins, no deposit required!", type: "free_spins", status: "active", free_spins_count: 20, game_ids: ["starburst-slot"], created_at: new Date().toISOString(), updated_at: new Date().toISOString(), valid_until: new Date(Date.now() + 7*24*60*60*1000).toISOString() },
    { id: "promo3", name: "Expired Offer", description: "This offer has expired.", type: "cashback", status: "expired", amount: 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), valid_until: new Date(Date.now() - 24*60*60*1000).toISOString() },
  ];
};

const fetchClaimedBonuses = async (userId: string): Promise<Bonus[]> => {
  // In a real app, fetch bonuses specifically claimed by this user
  console.log("Fetching claimed bonuses for userId:", userId);
  await new Promise(resolve => setTimeout(resolve, 700)); // Simulate delay
  // Example data
  return [
    { id: "claimed1", name: "Weekly Cashback", description: "5% cashback on losses", type: "cashback", status: "used", amount: 5, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), valid_until: new Date(Date.now() + 3*24*60*60*1000).toISOString() },
  ];
};


const BonusHubPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [availableBonuses, setAvailableBonuses] = useState<Bonus[]>([]);
  const [claimedBonuses, setClaimedBonuses] = useState<Bonus[]>([]);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(true);
  const [isLoadingClaimed, setIsLoadingClaimed] = useState(true);
  const [isClaiming, setIsClaiming] = useState<Record<string, boolean>>({}); // Track claiming state per bonus

  useEffect(() => {
    const loadBonuses = async () => {
      setIsLoadingAvailable(true);
      try {
        const bonuses = await fetchAvailableBonuses(user?.id);
        setAvailableBonuses(bonuses.filter(b => b.status === 'active')); // Show only active ones as available
      } catch (err) {
        toast.error("Failed to load available bonuses.");
        console.error(err);
      } finally {
        setIsLoadingAvailable(false);
      }

      if (isAuthenticated && user?.id) {
        setIsLoadingClaimed(true);
        try {
          const bonuses = await fetchClaimedBonuses(user.id);
          setClaimedBonuses(bonuses);
        } catch (err) {
          toast.error("Failed to load your claimed bonuses.");
          console.error(err);
        } finally {
          setIsLoadingClaimed(false);
          setClaimedBonuses([]);
        }
      }
    };
    loadBonuses();
  }, [isAuthenticated, user?.id]);

  const handleClaimBonus = async (bonus: Bonus) => {
    if (!isAuthenticated || !user?.id) {
      toast.error("Please log in to claim bonuses.");
      return;
    }
    if (bonus.status !== 'active') {
        toast.warn("This bonus is not currently active.");
        return;
    }
    setIsClaiming(prev => ({ ...prev, [bonus.id]: true }));
    try {
      // Simulate API call to claim bonus
      console.log(`Claiming bonus ${bonus.name} for user ${user.id}`);
      // In a real app, this would be: await supabase.rpc('claim_bonus', { p_user_id: user.id, p_bonus_id: bonus.id });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Bonus "${bonus.name}" claimed successfully!`);
      // Move bonus from available to claimed (or update its status)
      setAvailableBonuses(prev => prev.filter(b => b.id !== bonus.id));
      setClaimedBonuses(prev => [...prev, { ...bonus, status: 'used' }]); // Or 'pending_activation'
    } catch (error: any) {
      toast.error(`Failed to claim bonus: ${error.message || 'Please try again.'}`);
    } finally {
      setIsClaiming(prev => ({ ...prev, [bonus.id]: false }));
    }
  };
  
  const BonusCard: React.FC<{ bonus: Bonus, onClaim?: (bonus: Bonus) => void, isClaimed?: boolean, isClaiming?: boolean }> = ({ bonus, onClaim, isClaimed = false, isClaiming = false }) => {
    const Icon = bonus.type === 'free_spins' ? Gift : bonus.type === 'deposit' ? Ticket : RotateCcw;
    const isExpired = bonus.valid_until && new Date(bonus.valid_until) < new Date();
    const statusText = isExpired ? "Expired" : isClaimed ? (bonus.status === 'used' ? "Used" : "Claimed") : bonus.status.replace(/_/g, ' ');

    return (
        <Card className={`w-full ${isExpired || bonus.status === 'expired' ? 'opacity-60' : ''}`}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{bonus.name}</CardTitle>
                        <CardDescription className="text-xs">{bonus.type.replace(/_/g, ' ').toUpperCase()}</CardDescription>
                    </div>
                    <Badge variant={isExpired || bonus.status === 'expired' ? 'outline' : (bonus.status === 'active' && !isClaimed ? 'success' : 'secondary')} className="capitalize">
                      {statusText}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{bonus.description}</p>
                {bonus.amount && <p className="text-sm">Amount: ${bonus.amount}</p>}
                {bonus.percentage && <p className="text-sm">Percentage: {bonus.percentage}%</p>}
                {bonus.max_bonus_amount && <p className="text-sm">Max Bonus: ${bonus.max_bonus_amount}</p>}
                {bonus.free_spins_count && <p className="text-sm">Free Spins: {bonus.free_spins_count}</p>}
                {bonus.wagering_requirement && <p className="text-sm">Wagering: {bonus.wagering_requirement}x</p>}
                {bonus.code && <p className="text-sm">Code: <span className="font-semibold">{bonus.code}</span></p>}
                 {bonus.valid_until && <p className={`text-xs mt-1 ${isExpired ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {isExpired ? 'Expired on:' : 'Valid until:'} {new Date(bonus.valid_until).toLocaleDateString()}
                </p>}
            </CardContent>
            {!isClaimed && bonus.status === 'active' && !isExpired && onClaim && (
                <CardFooter>
                    <Button className="w-full" onClick={() => onClaim(bonus)} disabled={isClaiming}>
                        {isClaiming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Claim Bonus
                    </Button>
                </CardFooter>
            )}
             {(isClaimed || bonus.status !== 'active' || isExpired) && (
                <CardFooter>
                    <Button className="w-full" variant="outline" disabled>
                        {isClaimed ? (bonus.status === 'used' ? 'Already Used' : 'Already Claimed') : (isExpired ? 'Expired' : 'Unavailable')}
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
};


  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Bonus Hub</h1>
        <p className="text-xl text-muted-foreground mt-2">Discover and manage your bonuses.</p>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="available">Available Bonuses</TabsTrigger>
          <TabsTrigger value="claimed">My Bonuses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="available">
          <h2 className="text-2xl font-semibold mb-4">Available For You</h2>
          {isLoadingAvailable ? (
             <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <span className="ml-3">Loading available bonuses...</span></div>
          ) : availableBonuses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableBonuses.map(bonus => (
                <BonusCard key={bonus.id} bonus={bonus} onClaim={handleClaimBonus} isClaiming={isClaiming[bonus.id]} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-10">No new bonuses available at the moment. Check back soon!</p>
          )}
        </TabsContent>

        <TabsContent value="claimed">
          <h2 className="text-2xl font-semibold mb-4">Your Claimed Bonuses</h2>
          {!isAuthenticated ? (
            <p className="text-muted-foreground text-center py-10">Please <Link to="/login" className="text-primary hover:underline">log in</Link> to see your claimed bonuses.</p>
          ) : isLoadingClaimed ? (
            <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <span className="ml-3">Loading your bonuses...</span></div>
          ) : claimedBonuses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {claimedBonuses.map(bonus => (
                <BonusCard key={bonus.id} bonus={bonus} isClaimed={true} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-10">You haven't claimed any bonuses yet.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BonusHubPage;
