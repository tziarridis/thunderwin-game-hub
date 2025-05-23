
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { UserBonus, Promotion, PromotionType } from '@/types';
import PromotionCard from '@/components/promotions/PromotionCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Gift, Loader2, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import AppLayout from '@/components/layout/AppLayout';

// Mock services
const mockBonusService = {
  getActiveUserBonuses: async (userId: string): Promise<UserBonus[]> => {
    await new Promise(res => setTimeout(res, 500));
    return [
      { id: 'ub1', bonus_id: 'b1', user_id: userId, status: 'active', activated_at: new Date().toISOString(), expires_at: new Date(Date.now() + 86400000 * 7).toISOString(), progress: 0.3, bonus_details: { name: 'Active Welcome Bonus', type: 'deposit_match', amount: 50, currency: 'USD' } },
      { id: 'ub2', bonus_id: 'b2', user_id: userId, status: 'available', bonus_details: { name: 'Weekend Spins', type: 'free_spins', amount: 20, currency: 'FS' } },
    ];
  },
  claimBonus: async (userId: string, bonusCodeOrId: string): Promise<UserBonus> => {
    await new Promise(res => setTimeout(res, 1000));
    if (bonusCodeOrId === 'EXPIREDCODE') throw new Error("Bonus code is expired or invalid.");
    toast.success(`Bonus "${bonusCodeOrId}" claimed successfully!`);
    return { id: 'ub_new', bonus_id: bonusCodeOrId, user_id: userId, status: 'active', activated_at: new Date().toISOString(), expires_at: new Date(Date.now() + 86400000 * 3).toISOString(), progress: 0, bonus_details: { name: `Claimed: ${bonusCodeOrId}`, type: 'deposit_match', amount: 10, currency: 'USD'} };
  }
};

const mockPromotionService = {
  getAvailablePromotions: async (): Promise<Promotion[]> => {
    await new Promise(res => setTimeout(res, 500));
    return [
      { id: 'p1', title: '100% Deposit Bonus', description: 'Double your first deposit up to $100.', type: 'deposit_bonus' as PromotionType, status: 'active', valid_from: new Date().toISOString(), valid_until: new Date(Date.now() + 86400000 * 14).toISOString(), cta_text: 'Claim Now', code: 'WELCOME100', min_deposit: 10, bonus_percentage: 100, max_bonus_amount: 100, wagering_requirement: 30 },
      { id: 'p2', title: '50 Free Spins on Starburst', description: 'Get 50 Free Spins when you sign up.', type: 'free_spins' as PromotionType, status: 'active', valid_from: new Date().toISOString(), valid_until: new Date(Date.now() + 86400000 * 7).toISOString(), cta_text: 'Get Spins', free_spins_count: 50 },
    ];
  }
};

const bonusService = mockBonusService;
const promotionService = mockPromotionService;

const BonusHubPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bonusCode, setBonusCode] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Please log in to view bonuses.");
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const { data: activeBonuses, isLoading: isLoadingActiveBonuses, refetch: refetchActiveBonuses } = useQuery<UserBonus[], Error>({
    queryKey: ['userActiveBonuses', user?.id],
    queryFn: () => user ? bonusService.getActiveUserBonuses(user.id) : Promise.resolve([]),
    enabled: !!user && isAuthenticated,
  });

  const { data: availablePromotions, isLoading: isLoadingPromotions } = useQuery<Promotion[], Error>({
    queryKey: ['availablePromotions'],
    queryFn: promotionService.getAvailablePromotions,
  });
  
  const handleClaimBonusCode = async () => {
    if (!user || !bonusCode.trim()) {
      toast.error("Please enter a bonus code.");
      return;
    }
    setIsClaiming(true);
    try {
      await bonusService.claimBonus(user.id, bonusCode.trim());
      setBonusCode('');
      refetchActiveBonuses();
    } catch (error: any) {
      toast.error(error.message || "Failed to claim bonus.");
    } finally {
      setIsClaiming(false);
    }
  };

  const handleClaimPromotion = async (promotion: Promotion) => {
    if (!user) {
      toast.error("Please log in to claim promotions.");
      return;
    }
    setIsClaiming(true);
    try {
      const claimIdentifier = promotion.code || promotion.id;
      await bonusService.claimBonus(user.id, claimIdentifier);
      toast.success(`Promotion "${promotion.title}" claimed!`);
      refetchActiveBonuses();
    } catch (error: any) {
      toast.error(error.message || `Failed to claim promotion "${promotion.title}".`);
    } finally {
      setIsClaiming(false);
    }
  };

  if (authLoading || (isLoadingActiveBonuses && isLoadingPromotions && !activeBonuses && !availablePromotions)) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold mb-8 text-center">Bonus Hub</h1>

        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-1/2 mx-auto mb-6">
            <TabsTrigger value="available">Available Promotions</TabsTrigger>
            <TabsTrigger value="active">My Active Bonuses</TabsTrigger>
          </TabsList>

          <TabsContent value="available">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center"><Tag className="mr-2 h-5 w-5"/> Claim with Bonus Code</CardTitle>
                <CardDescription>Have a bonus code? Enter it below to claim your reward.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="text" 
                  placeholder="Enter bonus code" 
                  value={bonusCode}
                  onChange={(e) => setBonusCode(e.target.value.toUpperCase())}
                  className="input flex-grow bg-card border border-input rounded-md px-3 py-2 text-sm"
                />
                <Button onClick={handleClaimBonusCode} disabled={isClaiming || !bonusCode.trim()} className="w-full sm:w-auto">
                  {isClaiming && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                  Claim Bonus
                </Button>
              </CardContent>
            </Card>

            <h2 className="text-2xl font-semibold mb-4">Current Offers</h2>
            {isLoadingPromotions ? (
              <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : availablePromotions && availablePromotions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availablePromotions.map(promo => (
                  <PromotionCard 
                    key={promo.id} 
                    promotion={promo} 
                    onClaim={user ? () => handleClaimPromotion(promo) : undefined}
                    onDetails={(p) => toast.info(`Details for ${p.title} (Not implemented)`)} 
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-10">No promotions available at the moment. Check back soon!</p>
            )}
          </TabsContent>

          <TabsContent value="active">
            <h2 className="text-2xl font-semibold mb-4">Your Active & Available Bonuses</h2>
            {isLoadingActiveBonuses ? (
              <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : activeBonuses && activeBonuses.length > 0 ? (
              <div className="space-y-4">
                {activeBonuses.map(userBonus => (
                  <Card key={userBonus.id} className={`border-l-4 ${userBonus.status === 'active' ? 'border-green-500' : 'border-blue-500'}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {userBonus.bonus_details?.name || `Bonus ID: ${userBonus.bonus_id}`}
                        <Badge variant={userBonus.status === 'active' ? 'default' : 'secondary'}>{userBonus.status}</Badge>
                      </CardTitle>
                      <CardDescription>
                        {userBonus.bonus_details?.type && `Type: ${userBonus.bonus_details.type}`}
                        {userBonus.bonus_details?.amount && ` | Value: ${userBonus.bonus_details.amount} ${userBonus.bonus_details.currency || ''}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {userBonus.expires_at && <p className="text-sm text-muted-foreground">Expires: {format(new Date(userBonus.expires_at), 'PPpp')}</p>}
                      {userBonus.status === 'active' && userBonus.progress !== undefined && (
                        <div>
                          <p className="text-sm">Progress: {(userBonus.progress * 100).toFixed(0)}%</p>
                          <div className="w-full bg-muted rounded-full h-2.5 mt-1">
                            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${userBonus.progress * 100}%` }}></div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-10">You have no active or available bonuses right now.</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default BonusHubPage;
