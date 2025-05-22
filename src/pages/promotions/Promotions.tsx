
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
// import { promotionService } from '@/services/promotionService'; // Real service
import { Promotion, PromotionType } from '@/types'; // Ensure PromotionType is imported
import PromotionCard from '@/components/promotions/PromotionCard';
import AppLayout from '@/components/layout/AppLayout';
import { Loader2, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
// import { bonusService } from '@/services/bonusService'; // If claiming directly creates a UserBonus

// Mock services
const mockPromotionService = {
  getAvailablePromotions: async (): Promise<Promotion[]> => {
    await new Promise(res => setTimeout(res, 500));
    return [
      { id: 'promo1', title: 'Grand Welcome Offer', description: 'Get a massive bonus on your first deposit to kickstart your adventure.', type: 'deposit_bonus' as PromotionType, valid_from: new Date(Date.now() - 86400000*2).toISOString() , valid_until: new Date(Date.now() + 86400000 * 10).toISOString(), cta_text: 'Claim Bonus', image_url: '/placeholder.svg', code: 'GRAND150', min_deposit: 20, bonus_percentage: 150, max_bonus_amount: 300, wagering_requirement: 35 },
      { id: 'promo2', title: 'Weekly Free Spins Fiesta', description: 'Enjoy 75 free spins every Monday on our featured slot game!', type: 'free_spins' as PromotionType, valid_from: new Date(Date.now() - 86400000*1).toISOString(), valid_until: new Date(Date.now() + 86400000 * 5).toISOString(), cta_text: 'Get Your Spins', image_url: '/placeholder.svg', free_spins_count: 75, wagering_requirement: 25, terms_and_conditions_url: '#' },
      { id: 'promo3', title: 'Weekend Cashback', description: 'Get 10% cashback on your net losses over the weekend.', type: 'cashback_offer' as PromotionType, valid_from: new Date(Date.now() - 86400000*0).toISOString(), valid_until: new Date(Date.now() + 86400000 * 2).toISOString(), cta_text: 'Opt-In', value: 10, terms_and_conditions_url: '#' },
      { id: 'promo4', title: 'Upcoming Tournament', description: 'Join our upcoming slots tournament with a huge prize pool!', type: 'tournament' as PromotionType, valid_from: new Date(Date.now() + 86400000 * 3).toISOString(), valid_until: new Date(Date.now() + 86400000 * 10).toISOString(), cta_text: 'Learn More', image_url: '/placeholder.svg', terms_and_conditions_url: '#' },
    ];
  }
};
const mockBonusService = { // For claim action
  claimBonus: async (userId: string, bonusCodeOrId: string): Promise<any> => {
    await new Promise(res => setTimeout(res, 1000));
    if (bonusCodeOrId === 'EXPIRED') throw new Error("This promotion is expired or invalid.");
    return { id: 'claimed_promo_bonus', bonus_id: bonusCodeOrId, user_id: userId, status: 'active' };
  }
};

const promotionService = mockPromotionService;
const bonusService = mockBonusService; // Assuming claim actions use bonus service


const PromotionsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [claimingPromoId, setClaimingPromoId] = useState<string | null>(null);

  const { data: promotions, isLoading, error } = useQuery<Promotion[], Error>({
    queryKey: ['allPromotions'],
    queryFn: promotionService.getAvailablePromotions, // Or a different method if needed
  });

  const handleClaimPromotion = async (promotion: Promotion) => {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to claim promotions.");
      return;
    }
    if (promotion.id === claimingPromoId) return; // Already claiming this one

    setClaimingPromoId(promotion.id);
    try {
      const claimIdentifier = promotion.code || promotion.id;
      await bonusService.claimBonus(user.id, claimIdentifier); // Assuming claim through bonus service
      toast.success(`Successfully claimed "${promotion.title}"!`);
      // Potentially refetch user bonuses or promotions if list should update
    } catch (err: any) {
      toast.error(err.message || `Failed to claim "${promotion.title}".`);
    } finally {
      setClaimingPromoId(null);
    }
  };
  
  const handleShowDetails = (promotion: Promotion) => {
    // Navigate to a details page or show a modal
    toast.info(`Displaying details for: ${promotion.title} (UI not implemented)`);
    // navigate(`/promotions/${promotion.id}`);
  };


  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-12 px-4 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-lg text-muted-foreground">Loading promotions...</p>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto py-12 px-4 text-center">
          <Info className="h-12 w-12 text-red-500 mx-auto" />
          <p className="mt-4 text-lg text-red-400">Could not load promotions: {error.message}</p>
        </div>
      </AppLayout>
    );
  }
  
  if (!promotions || promotions.length === 0) {
     return (
      <AppLayout>
        <div className="container mx-auto py-12 px-4 text-center">
          <Info className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="mt-4 text-lg text-muted-foreground">No promotions available at the moment. Please check back later!</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="bg-gradient-to-b from-casino-thunder-dark to-casino-thunder-darker py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-white mb-4">
            Our Exclusive Promotions
          </h1>
          <p className="text-lg md:text-xl text-center text-casino-gold mb-10 max-w-3xl mx-auto">
            Boost your gameplay with our exciting range of bonuses and special offers. Find the perfect promotion for you!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
            {promotions.map((promo) => (
              <PromotionCard 
                key={promo.id} 
                promotion={promo} 
                onClaim={isAuthenticated && user ? () => handleClaimPromotion(promo) : undefined}
                onDetails={handleShowDetails} 
              />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default PromotionsPage;

