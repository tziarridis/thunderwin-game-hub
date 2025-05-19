import React, { useState, useEffect, useMemo } from 'react';
import { Promotion } from '@/types'; // Adjusted path if Promotion is in @/types/promotion
import { Button } from '@/components/ui/button';
// ... keep existing code (other imports: Card, Input, Select, Dialog, icons, useAuth, useGames, toast)
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import PromotionCard from '@/components/promotions/PromotionCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertTriangle, CalendarDays, Search, Tag, CheckCircle, Gift } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGames } from '@/hooks/useGames';
import { toast } from 'sonner';
import { promotionsService } from '@/services/promotionsService'; // Corrected import

const mockPromotions: Promotion[] = [
  {
    id: 'promo1',
    title: 'Welcome Bonus',
    description: 'Get a 100% match bonus up to $200 on your first deposit!',
    type: 'deposit_match',
    imageUrl: '/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png', // Renamed
    startDate: new Date('2025-05-01T00:00:00Z').toISOString(), // Renamed
    endDate: new Date('2025-12-31T23:59:59Z').toISOString(), // Renamed
    termsAndConditions: 'Minimum deposit $20. Wagering requirement 35x. Full T&Cs apply.', // Renamed
    status: 'active',
    isActive: true, // Added based on status
    validFrom: new Date('2025-05-01T00:00:00Z').toISOString(), // Added for consistency
    validUntil: new Date('2025-12-31T23:59:59Z').toISOString(), // Added for consistency
    eligibility: { type: 'new_users' },
    bonus_details: { percentage: 100, max_amount: 200, currency: 'USD' },
    cta_text: 'Claim Bonus',
  },
  {
    id: 'promo2',
    title: 'Weekend Free Spins',
    description: 'Enjoy 50 free spins on "Book of Slots" every weekend with a deposit of $50 or more.',
    type: 'free_spins',
    imageUrl: '/placeholder.svg', // Renamed
    startDate: new Date('2025-05-01T00:00:00Z').toISOString(), // Renamed
    endDate: new Date('2025-12-31T23:59:59Z').toISOString(), // Renamed
    termsAndConditions: 'Minimum deposit $50. Spins valid for 7 days. Winnings subject to 20x wagering. Full T&Cs apply.', // Renamed
    status: 'active',
    isActive: true,
    validFrom: new Date('2025-05-01T00:00:00Z').toISOString(),
    validUntil: new Date('2025-12-31T23:59:59Z').toISOString(),
    eligibility: { type: 'all_users', min_deposit: 50 },
    bonus_details: { free_spins_count: 50, game_slug: 'book-of-slots' },
    cta_text: 'Get Spins',
  },
  {
    id: 'promo3',
    title: 'Loyalty Cashback',
    description: 'Get 10% cashback on your net losses every Monday. Exclusively for VIP Gold members and above.',
    type: 'cashback',
    imageUrl: '/placeholder.svg', // Renamed
    startDate: new Date('2025-01-01T00:00:00Z').toISOString(), // Renamed
    endDate: null, // Renamed (type allows null)
    termsAndConditions: 'Cashback credited by 18:00 CET every Monday. Minimum cashback $5. Maximum $500. Full T&Cs apply.', // Renamed
    status: 'active',
    isActive: true,
    validFrom: new Date('2025-01-01T00:00:00Z').toISOString(),
    validUntil: null,
    eligibility: { type: 'vip_level', min_vip_level: 'gold' },
    bonus_details: { percentage: 10 },
    cta_text: 'Learn More',
  },
  {
    id: 'promo4',
    title: 'Expired Offer',
    description: 'This offer has ended.',
    type: 'tournament',
    imageUrl: '/placeholder.svg', // Renamed
    startDate: new Date('2024-01-01T00:00:00Z').toISOString(), // Renamed
    endDate: new Date('2024-01-31T23:59:59Z').toISOString(), // Renamed
    termsAndConditions: 'This tournament has concluded.', // Renamed
    status: 'expired',
    isActive: false,
    validFrom: new Date('2024-01-01T00:00:00Z').toISOString(),
    validUntil: new Date('2024-01-31T23:59:59Z').toISOString(),
    bonus_details: { prize_pool: 10000, currency: 'USD' },
    cta_text: 'View Results',
  },
];


const PromotionsPage: React.FC = () => {
  // ... keep existing code (hooks: useAuth, useGames, state: promotions, searchTerm, filterType, etc.)
  const { user, isAuthenticated } = useAuth();
  const { games, launchGame } = useGames();
  const [promotions, setPromotions] = useState<Promotion[]>(mockPromotions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | Promotion['type']>('all');
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    promotionsService.getActivePromotions()
      .then(data => {
        // Filter for active promotions if service returns all, or ensure service only returns active
        const activePromos = data.filter(p => p.status === 'active' || p.isActive);
        setPromotions(activePromos.length > 0 ? activePromos : mockPromotions.filter(p => p.status === 'active' || p.isActive));
      })
      .catch(error => {
        console.error("Failed to fetch promotions:", error);
        toast.error("Could not load promotions.");
        setPromotions(mockPromotions.filter(p => p.status === 'active' || p.isActive)); // Fallback to active mock promotions
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredPromotions = useMemo(() => {
    return promotions // promotions state should now primarily hold active ones from useEffect
      .filter(promo => 
        promo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (promo.description && promo.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .filter(promo => filterType === 'all' || promo.type === filterType);
  }, [promotions, searchTerm, filterType]);

  const handleViewDetails = (promo: Promotion) => {
    setSelectedPromotion(promo);
    setIsModalOpen(true);
  };

  const handleClaimPromotion = async (promo: Promotion) => {
    if (!isAuthenticated) {
      toast.info("Please log in to claim promotions.");
      return;
    }
    if (!user) return;

    try {
      setIsLoading(true);
      // Ensure user.id is correctly passed if that's the expected ID type
      const result = await promotionsService.claimPromotion(user.id, promo.id);
      if (result.success) {
        toast.success(result.message || `Successfully claimed ${promo.title}!`);
      } else {
        toast.error(result.error || `Failed to claim ${promo.title}.`);
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred while claiming the promotion.");
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  const promotionTypes: Promotion['type'][] = ['deposit_match', 'free_spins', 'cashback', 'tournament', 'reload_bonus', 'no_deposit_bonus', 'deposit_bonus', 'welcome_bonus', 'loyalty_reward', 'tournament_prize'];


  return (
    <div className="container mx-auto py-8 px-4">
      {/* ... keep existing code (header, filters section) ... */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight flex items-center justify-center">
          <Gift className="mr-3 h-10 w-10 text-primary" /> Casino Promotions
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Check out our latest offers and boost your play!
        </p>
      </header>

      <div className="mb-8 p-4 bg-card rounded-lg shadow-md flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search promotions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={(value) => setFilterType(value as typeof filterType)}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {promotionTypes.map(type => (
              <SelectItem key={type} value={type} className="capitalize">
                {typeof type === 'string' ? type.replace(/_/g, ' ') : String(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {isLoading && filteredPromotions.length === 0 && (
        <div className="text-center py-10"><p>Loading promotions...</p></div>
      )}

      {!isLoading && filteredPromotions.length === 0 && (
        <div className="text-center py-16 bg-card rounded-lg shadow-md">
          <AlertTriangle className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
          <p className="text-xl text-muted-foreground">No promotions match your criteria.</p>
          <p className="mt-2">Try adjusting your search or come back later for new offers!</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPromotions.map((promo) => (
          <PromotionCard
            key={promo.id}
            promotion={promo}
            // The original PromotionCard.tsx doesn't have onViewDetails or onClaim props.
            // These were likely intended for this PromotionsPage to handle.
            // If PromotionCard should handle these, it needs to be updated.
            // For now, assuming this page handles click via modal.
            // onViewDetails={() => handleViewDetails(promo)}
            // onClaim={() => handleClaimPromotion(promo)}
            className="h-full flex flex-col"
          />
        ))}
      </div>

      {/* Promotion Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center">
              <Tag className="mr-2 h-6 w-6 text-primary" />
              {selectedPromotion?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedPromotion?.description}
            </DialogDescription>
          </DialogHeader>
          {selectedPromotion && (
            <div className="py-4 space-y-4">
              {selectedPromotion.imageUrl && ( // Renamed
                <img src={selectedPromotion.imageUrl} alt={selectedPromotion.title} className="w-full h-48 object-cover rounded-md mb-4" />
              )}
              <div>
                <h4 className="font-semibold text-sm mb-1">Availability:</h4>
                <p className="text-sm text-muted-foreground flex items-center">
                  <CalendarDays className="mr-2 h-4 w-4" /> 
                  {/* Use endDate or validUntil consistently */}
                  Ends {selectedPromotion.endDate ? new Date(selectedPromotion.endDate).toLocaleDateString() : (selectedPromotion.validUntil ? new Date(selectedPromotion.validUntil).toLocaleDateString() : 'Ongoing')}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Terms & Conditions:</h4>
                <p className="text-xs text-muted-foreground whitespace-pre-line">
                  {selectedPromotion.termsAndConditions} {/* Renamed */}
                </p>
              </div>
              {/* Add more details like bonus type specifics */}
            </div>
          )}
          <DialogFooter className="sm:justify-start">
             <Button 
                type="button" 
                onClick={() => selectedPromotion && handleClaimPromotion(selectedPromotion)}
                disabled={isLoading || !isAuthenticated || selectedPromotion?.status !== 'active'}
                className="bg-primary hover:bg-primary/80 w-full sm:w-auto"
              >
                {isLoading ? "Claiming..." : (isAuthenticated ? selectedPromotion?.cta_text || 'Claim Now' : 'Log in to Claim')}
              </Button>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromotionsPage;
