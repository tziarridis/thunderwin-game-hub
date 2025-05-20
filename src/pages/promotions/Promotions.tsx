
import React, { useState, useEffect, useMemo } from 'react';
import { Promotion } from '@/types/promotion'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import PromotionCard from '@/components/promotions/PromotionCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertTriangle, CalendarDays, Search, Tag, CheckCircle, Gift, Loader2 } from 'lucide-react'; // Added Loader2
import { useAuth } from '@/contexts/AuthContext';
// import { useGames } from '@/hooks/useGames'; // Not directly used in this version, but can be for game-specific promos
import { toast } from 'sonner';
import { promotionsService } from '@/services/promotionsService'; 

// Initial mock promotions, to be replaced by API data
const initialMockPromotions: Promotion[] = [
  {
    id: 'promo1',
    title: 'Welcome Bonus',
    description: 'Get a 100% match bonus up to $200 on your first deposit!',
    type: 'deposit_match',
    category: 'welcome', // Added category
    imageUrl: '/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png',
    validFrom: new Date('2025-05-01T00:00:00Z').toISOString(),
    validUntil: new Date('2025-12-31T23:59:59Z').toISOString(),
    termsAndConditions: 'Minimum deposit $20. Wagering requirement 35x. Full T&Cs apply.',
    status: 'active',
    isActive: true,
    eligibility: { type: 'new_users' },
    bonus_details: { percentage: 100, max_amount: 200, currency: 'USD' },
    cta_text: 'Claim Bonus',
    minDeposit: 20,
    bonusPercentage: 100,
    maxBonusAmount: 200,
    wageringRequirement: 35,
  },
  {
    id: 'promo2',
    title: 'Weekend Free Spins',
    description: 'Enjoy 50 free spins on "Book of Slots" every weekend with a deposit of $50 or more.',
    type: 'free_spins',
    category: 'recurring', // Added category
    imageUrl: '/placeholder.svg', // Replace with actual image if available
    validFrom: new Date('2025-05-01T00:00:00Z').toISOString(),
    validUntil: new Date('2025-12-31T23:59:59Z').toISOString(),
    termsAndConditions: 'Minimum deposit $50. Spins valid for 7 days. Winnings subject to 20x wagering. Full T&Cs apply.',
    status: 'active',
    isActive: true,
    eligibility: { type: 'all_users', min_deposit: 50 },
    bonus_details: { free_spins_count: 50, game_slug: 'book-of-slots' },
    cta_text: 'Get Spins',
    minDeposit: 50,
    freeSpinsCount: 50,
    wageringRequirement: 20,
    games: ['book-of-slots']
  },
];


const PromotionsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  // const { games } = useGames(); // If needed for filtering or displaying game-specific promos
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | Promotion['type']>('all');
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // For main promotions list
  const [isClaiming, setIsClaiming] = useState(false); // For claim action

  useEffect(() => {
    setIsLoading(true);
    promotionsService.getActivePromotions()
      .then(data => {
        // Ensure service returns only active or filter here if needed
        const activePromos = data.filter(p => p.isActive !== false && (p.status === 'active' || p.status === 'upcoming'));
        setPromotions(activePromos.length > 0 ? activePromos : initialMockPromotions.filter(p => p.isActive && p.status === 'active'));
      })
      .catch(error => {
        console.error("Failed to fetch promotions:", error);
        toast.error("Could not load promotions. Displaying default offers.");
        setPromotions(initialMockPromotions.filter(p => p.isActive && p.status === 'active')); // Fallback to active mock promotions
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredPromotions = useMemo(() => {
    return promotions
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
      // Potentially redirect to login or open a login modal
      return;
    }
    if (!user?.id) { // Ensure user and user.id are available
        toast.error("User information not available. Please try again.");
        return;
    }

    setIsClaiming(true);
    try {
      const result = await promotionsService.claimPromotion(user.id, promo.id);
      if (result.success) {
        toast.success(result.message || `Successfully claimed ${promo.title}!`);
        // TODO: Potentially refresh user's bonus balance or claimed promotions list
      } else {
        toast.error(result.error || `Failed to claim ${promo.title}.`);
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred while claiming the promotion.");
    } finally {
      setIsClaiming(false);
      setIsModalOpen(false); // Close modal after attempt
    }
  };

  // Define unique promotion types from the available promotions for filtering
  const promotionTypes = useMemo(() => {
    const types = new Set(promotions.map(p => p.type).filter(Boolean) as string[]);
    return Array.from(types);
  }, [promotions]);

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight flex items-center justify-center">
          <Gift className="mr-3 h-10 w-10 text-primary" /> Casino Promotions
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Check out our latest offers and boost your play!
        </p>
      </header>

      <div className="mb-8 p-4 bg-card rounded-lg shadow-md flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search promotions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10"
            aria-label="Search promotions"
          />
        </div>
        <Select value={filterType} onValueChange={(value) => setFilterType(value as typeof filterType)}>
          <SelectTrigger className="w-full md:w-[200px]" aria-label="Filter by promotion type">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {promotionTypes.map(type => (
              <SelectItem key={type} value={type} className="capitalize">
                {type.replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {isLoading && filteredPromotions.length === 0 && (
        <div className="text-center py-10 flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p>Loading promotions...</p>
        </div>
      )}

      {!isLoading && filteredPromotions.length === 0 && (
        <div className="text-center py-16 bg-card rounded-lg shadow-md">
          <AlertTriangle className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
          <p className="text-xl text-muted-foreground">No promotions match your criteria.</p>
          <p className="mt-2">Try adjusting your search or check back later for new offers!</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPromotions.map((promo) => (
          <PromotionCard
            key={promo.id}
            promotion={promo}
            className="h-full flex flex-col" // Ensures cards in a row are same height
            // onClaim={() => handleClaimPromotion(promo)} // If PromotionCard has its own claim button
            onViewDetails={() => handleViewDetails(promo)} // If PromotionCard has a view details button
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
              {selectedPromotion.imageUrl && (
                <img src={selectedPromotion.imageUrl} alt={selectedPromotion.title} className="w-full h-48 object-cover rounded-md mb-4" />
              )}
              <div>
                <h4 className="font-semibold text-sm mb-1">Availability:</h4>
                <p className="text-sm text-muted-foreground flex items-center">
                  <CalendarDays className="mr-2 h-4 w-4" /> 
                  {selectedPromotion.validFrom && `Starts: ${new Date(selectedPromotion.validFrom).toLocaleDateString()} `}
                  {selectedPromotion.validUntil ? `Ends: ${new Date(selectedPromotion.validUntil).toLocaleDateString()}` : 'Ongoing'}
                </p>
              </div>
              {selectedPromotion.minDeposit && (
                <div>
                    <h4 className="font-semibold text-sm mb-1">Minimum Deposit:</h4>
                    <p className="text-sm text-muted-foreground">{selectedPromotion.currency || '$'}{selectedPromotion.minDeposit}</p>
                </div>
              )}
              {selectedPromotion.wageringRequirement && (
                <div>
                    <h4 className="font-semibold text-sm mb-1">Wagering:</h4>
                    <p className="text-sm text-muted-foreground">{selectedPromotion.wageringRequirement}x</p>
                </div>
              )}
              {selectedPromotion.termsAndConditions && (
                <div>
                    <h4 className="font-semibold text-sm mb-1">Terms & Conditions:</h4>
                    <p className="text-xs text-muted-foreground whitespace-pre-line">
                    {selectedPromotion.termsAndConditions}
                    </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="sm:justify-start gap-2">
             <Button 
                type="button" 
                onClick={() => selectedPromotion && handleClaimPromotion(selectedPromotion)}
                disabled={isClaiming || !isAuthenticated || selectedPromotion?.status !== 'active' || !selectedPromotion?.isActive}
                className="bg-primary hover:bg-primary/80 w-full sm:w-auto"
              >
                {isClaiming ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isAuthenticated ? (selectedPromotion?.cta_text || 'Claim Now') : 'Log in to Claim')}
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
