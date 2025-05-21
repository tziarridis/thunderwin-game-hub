import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Bonus, BonusType } from '@/types/bonus'; // Ensure BonusType is defined
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Tag, Info, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const BonusHubPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [availableBonuses, setAvailableBonuses] = useState<Bonus[]>([]);
  const [activeBonuses, setActiveBonuses] = useState<Bonus[]>([]); // Bonuses user has claimed
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBonuses = async () => {
      setIsLoading(true);
      try {
        // Fetch all generally available bonuses
        // This might filter by start/end dates, eligibility criteria not specific to user claims
        const { data: allBonusesData, error: allBonusesError } = await supabase
          .from('bonuses') // Assuming 'bonuses' is your table name
          .select('*')
          .eq('is_active', true) // Only active bonuses
          .lte('start_date', new Date().toISOString()) // Started
          .gte('end_date', new Date().toISOString()); // Not ended

        if (allBonusesError) throw allBonusesError;

        if (isAuthenticated && user) {
          // Fetch bonuses claimed by the user
          const { data: claimedBonusesData, error: claimedError } = await supabase
            .from('user_bonuses') // Assuming 'user_bonuses' join table
            .select('bonus_id, status, claimed_at, expires_at, progress')
            .eq('user_id', user.id);
          
          if (claimedError) throw claimedError;

          const claimedBonusIds = new Set(claimedBonusesData?.map(cb => cb.bonus_id));
          
          // Filter availableBonuses: exclude those already claimed
          setAvailableBonuses(allBonusesData.filter(b => !claimedBonusIds.has(b.id)));
          
          // Map claimedBonusesData to Bonus[] type by fetching full bonus details
          // This is simplified; in reality, you'd join 'bonuses' with 'user_bonuses'
          // or make additional queries to get full Bonus objects for activeBonuses
          const detailedActiveBonuses = allBonusesData
            .filter(b => claimedBonusIds.has(b.id))
            .map(b => {
                const userBonusInfo = claimedBonusesData?.find(cb => cb.bonus_id === b.id);
                return { 
                    ...b, 
                    user_status: userBonusInfo?.status, // 'active', 'completed', 'expired'
                    claimed_at: userBonusInfo?.claimed_at,
                    user_expires_at: userBonusInfo?.expires_at, // Specific expiry for user
                    progress: userBonusInfo?.progress,
                };
            });
          setActiveBonuses(detailedActiveBonuses);

        } else {
          setAvailableBonuses(allBonusesData);
          setActiveBonuses([]);
        }

      } catch (error: any) {
        toast.error("Failed to load bonuses: " + error.message);
        console.error("Bonus fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBonuses();
  }, [isAuthenticated, user]);

  const handleClaimBonus = async (bonusId: string) => {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to claim bonuses.");
      return;
    }
    setIsLoading(true);
    try {
      // Check if bonus can be claimed (e.g., not already claimed, meets requirements)
      // This logic can be complex and might involve an RPC call

      const { error } = await supabase
        .from('user_bonuses')
        .insert({
          user_id: user.id,
          bonus_id: bonusId,
          status: 'active', // Or 'pending_activation'
          // claimed_at is default now()
        });
      
      if (error) throw error;

      toast.success("Bonus claimed successfully!");
      // Refetch bonuses to update lists
      // For a more optimistic update, move the bonus from available to active client-side
      setAvailableBonuses(prev => prev.filter(b => b.id !== bonusId));
      const claimedBonus = availableBonuses.find(b => b.id === bonusId);
      if (claimedBonus) {
        setActiveBonuses(prev => [...prev, {...claimedBonus, user_status: 'active'}]);
      }

    } catch (error: any) {
      toast.error("Failed to claim bonus: " + error.message);
      console.error("Claim bonus error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const BonusCard = ({ bonus, isClaimed }: { bonus: Bonus & { user_status?: string }, isClaimed?: boolean }) => (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" /> {bonus.name}
        </CardTitle>
        <CardDescription>{bonus.type?.replace('_', ' ') || 'General Bonus'}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        <p className="text-sm text-muted-foreground line-clamp-3">{bonus.description || 'No description available.'}</p>
        {bonus.amount && <p className="text-sm"><strong>Amount:</strong> {bonus.currency_symbol || '$'}{bonus.amount} {bonus.currency_code}</p>}
        {bonus.percentage && <p className="text-sm"><strong>Percentage:</strong> {bonus.percentage}%</p>}
        {bonus.wagering_requirement && <p className="text-sm"><strong>Wagering:</strong> {bonus.wagering_requirement}x</p>}
         {bonus.games_allowed && bonus.games_allowed.length > 0 && <p className="text-xs"><strong>Games:</strong> {bonus.games_allowed.join(', ')}</p>}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2">
         {bonus.terms_and_conditions && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" size="sm" className="p-0 h-auto text-xs"><Info className="inline h-3 w-3 mr-1"/>Terms & Conditions</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Terms for {bonus.name}</DialogTitle>
                </DialogHeader>
                <p className="text-sm py-4">{bonus.terms_and_conditions}</p>
              </DialogContent>
            </Dialog>
         )}
        {isClaimed ? (
          <div className="w-full text-center">
            <Badge variant={bonus.user_status === 'active' ? "success" : "outline"} className="capitalize">
                {bonus.user_status || 'Claimed'}
            </Badge>
            {/* Could show progress if 'active' */}
          </div>
        ) : (
          <Button 
            className="w-full" 
            onClick={() => handleClaimBonus(bonus.id)} 
            disabled={isLoading || !isAuthenticated}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CheckCircle className="mr-2 h-4 w-4" />}
            Claim Bonus
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-foreground">Bonus Hub</h1>
        <p className="text-lg text-muted-foreground mt-2">Discover and claim your exclusive casino bonuses!</p>
      </header>

      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && (
        <>
          {activeBonuses.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-foreground">Your Active Bonuses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeBonuses.map(bonus => <BonusCard key={bonus.id} bonus={bonus} isClaimed={true} />)}
              </div>
            </section>
          )}

          {availableBonuses.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-6 text-foreground">Available Bonuses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableBonuses.map(bonus => <BonusCard key={bonus.id} bonus={bonus} />)}
              </div>
            </section>
          )}
          
          {!activeBonuses.length && !availableBonuses.length && (
               <p className="text-center text-muted-foreground py-10 text-xl">No bonuses currently available. Check back soon!</p>
          )}
        </>
      )}
    </div>
  );
};

export default BonusHubPage;
