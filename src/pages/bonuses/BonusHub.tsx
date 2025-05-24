
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bonus, 
  UserBonus, 
  BonusType, 
  BonusStatus, 
  Promotion, 
  PromotionType, 
  PromotionStatus 
} from '@/types';
import { Gift, Trophy, Star, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Mock services
const mockBonusService = {
  getAvailableBonuses: async (): Promise<Bonus[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      {
        id: '1',
        user_id: 'system',
        name: 'Welcome Bonus',
        type: BonusType.DEPOSIT_MATCH,
        amount: 100,
        currency: 'USD',
        status: BonusStatus.ACTIVE,
        terms: 'Match your first deposit up to $100',
        wagering_requirement: 30,
        wagering_remaining: 30,
        expires_at: '2024-12-31T23:59:59Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];
  },

  getUserBonuses: async (userId: string): Promise<UserBonus[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      {
        id: '1',
        user_id: userId,
        bonus_id: 'bonus-1',
        amount: 50,
        status: BonusStatus.ACTIVE,
        progress: 65,
        created_at: '2024-01-15T00:00:00Z',
        expires_at: '2024-02-15T00:00:00Z',
        bonus_details: {
          name: 'Active Bonus',
          type: BonusType.DEPOSIT_MATCH,
          terms: 'Complete wagering to unlock',
          wagering_requirement: 25
        }
      }
    ];
  },

  getPromotions: async (): Promise<Promotion[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      {
        id: 'promo-1',
        title: 'Weekend Special',
        description: 'Extra bonus for weekend deposits',
        type: PromotionType.DEPOSIT_BONUS,
        status: PromotionStatus.ACTIVE,
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-12-31T23:59:59Z',
        valid_from: '2024-01-01T00:00:00Z',
        valid_until: '2024-12-31T23:59:59Z',
        is_active: true,
        cta_text: 'Claim Now',
        code: 'WEEKEND50',
        min_deposit: 20,
        bonus_percentage: 50,
        max_bonus_amount: 100,
        wagering_requirement: 30,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'promo-2',
        title: 'Free Spins Friday',
        description: 'Get 50 free spins every Friday',
        type: PromotionType.FREE_SPINS,
        status: PromotionStatus.ACTIVE,
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-12-31T23:59:59Z',
        valid_from: '2024-01-01T00:00:00Z',
        valid_until: '2024-12-31T23:59:59Z',
        is_active: true,
        cta_text: 'Get Spins',
        free_spins_count: 50,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];
  },

  claimBonus: async (bonusId: string, userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: 'Bonus claimed successfully!' };
  }
};

const BonusHub = () => {
  const { user, isAuthenticated } = useAuth();
  const [claimingBonusId, setClaimingBonusId] = useState<string | null>(null);

  const { data: availableBonuses, isLoading: loadingBonuses } = useQuery({
    queryKey: ['availableBonuses'],
    queryFn: mockBonusService.getAvailableBonuses
  });

  const { data: userBonuses, isLoading: loadingUserBonuses } = useQuery({
    queryKey: ['userBonuses', user?.id],
    queryFn: () => user ? mockBonusService.getUserBonuses(user.id) : Promise.resolve([]),
    enabled: !!user
  });

  const { data: promotions, isLoading: loadingPromotions } = useQuery({
    queryKey: ['promotions'],
    queryFn: mockBonusService.getPromotions
  });

  const handleClaimBonus = async (bonusId: string) => {
    if (!isAuthenticated || !user) {
      toast.error('Please log in to claim bonuses');
      return;
    }

    setClaimingBonusId(bonusId);
    try {
      await mockBonusService.claimBonus(bonusId, user.id);
      toast.success('Bonus claimed successfully!');
    } catch (error) {
      toast.error('Failed to claim bonus');
    } finally {
      setClaimingBonusId(null);
    }
  };

  const getBonusIcon = (type: BonusType) => {
    switch (type) {
      case BonusType.DEPOSIT_MATCH:
        return <Gift className="h-6 w-6" />;
      case BonusType.FREE_SPINS:
        return <Star className="h-6 w-6" />;
      case BonusType.CASHBACK:
        return <Trophy className="h-6 w-6" />;
      default:
        return <Gift className="h-6 w-6" />;
    }
  };

  const getStatusColor = (status: BonusStatus) => {
    switch (status) {
      case BonusStatus.ACTIVE:
        return 'default';
      case BonusStatus.EXPIRED:
        return 'destructive';
      case BonusStatus.CLAIMED:
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Bonus Hub</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover exciting bonuses and promotions designed to enhance your gaming experience
        </p>
      </div>

      <Tabs defaultValue="bonuses" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bonuses">Available Bonuses</TabsTrigger>
          <TabsTrigger value="active">My Active Bonuses</TabsTrigger>
          <TabsTrigger value="promotions">Special Promotions</TabsTrigger>
        </TabsList>

        <TabsContent value="bonuses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Bonuses</CardTitle>
              <CardDescription>Claim these bonuses to boost your gameplay</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingBonuses ? (
                <div className="text-center py-8">Loading bonuses...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableBonuses?.map((bonus) => (
                    <Card key={bonus.id} className="relative overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getBonusIcon(bonus.type)}
                            <CardTitle className="text-lg">{bonus.name}</CardTitle>
                          </div>
                          <Badge variant={getStatusColor(bonus.status)}>
                            {bonus.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-2xl font-bold text-primary">
                            ${bonus.amount}
                          </p>
                          <p className="text-sm text-muted-foreground">{bonus.terms}</p>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Wagering:</span>
                            <span>{bonus.wagering_requirement}x</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Expires:</span>
                            <span>{new Date(bonus.expires_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Button 
                          className="w-full" 
                          onClick={() => handleClaimBonus(bonus.id)}
                          disabled={!isAuthenticated || claimingBonusId === bonus.id}
                        >
                          {claimingBonusId === bonus.id ? 'Claiming...' : 'Claim Bonus'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Active Bonuses</CardTitle>
              <CardDescription>Track your current bonus progress</CardDescription>
            </CardHeader>
            <CardContent>
              {!isAuthenticated ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Please log in to view your active bonuses</p>
                  <Button>Log In</Button>
                </div>
              ) : loadingUserBonuses ? (
                <div className="text-center py-8">Loading your bonuses...</div>
              ) : (
                <div className="space-y-4">
                  {userBonuses?.map((userBonus) => (
                    <Card key={userBonus.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <Gift className="h-6 w-6 text-primary" />
                            <div>
                              <h3 className="font-semibold">{userBonus.bonus_details?.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {userBonus.bonus_details?.terms}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">${userBonus.amount}</p>
                            <Badge variant={getStatusColor(userBonus.status)}>
                              {userBonus.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{userBonus.progress}%</span>
                          </div>
                          <Progress value={userBonus.progress} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Wagering: {userBonus.bonus_details?.wagering_requirement || 0}x</span>
                            <span>Expires: {new Date(userBonus.expires_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {(!userBonuses || userBonuses.length === 0) && (
                    <div className="text-center py-8">
                      <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No active bonuses</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promotions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingPromotions ? (
              <div className="col-span-full text-center py-8">Loading promotions...</div>
            ) : (
              promotions?.map((promotion) => (
                <Card key={promotion.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{promotion.title}</CardTitle>
                      <Badge variant="default">
                        {promotion.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{promotion.description}</p>
                    <div className="space-y-2 text-sm">
                      {promotion.code && (
                        <div className="flex justify-between">
                          <span>Code:</span>
                          <Badge variant="outline">{promotion.code}</Badge>
                        </div>
                      )}
                      {promotion.bonus_percentage && (
                        <div className="flex justify-between">
                          <span>Bonus:</span>
                          <span>{promotion.bonus_percentage}%</span>
                        </div>
                      )}
                      {promotion.free_spins_count && (
                        <div className="flex justify-between">
                          <span>Free Spins:</span>
                          <span>{promotion.free_spins_count}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Valid Until:</span>
                        <span>{new Date(promotion.valid_until).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button className="w-full">
                      {promotion.cta_text || 'Learn More'}
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BonusHub;
