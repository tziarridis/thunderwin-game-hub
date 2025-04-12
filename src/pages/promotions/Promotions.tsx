
import { useState, useEffect } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import PromotionCard from "@/components/promotions/PromotionCard";
import { Button } from "@/components/ui/button";
import { Gift, Calendar, Info, Filter } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Promotion } from "@/types";

const Promotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("all");
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Load promotions from localStorage on component mount
  useEffect(() => {
    const storedPromotions = localStorage.getItem('promotions');
    if (storedPromotions) {
      const parsedPromotions = JSON.parse(storedPromotions);
      // Only show active promotions
      const activePromotions = parsedPromotions.filter((promo: Promotion) => promo.isActive);
      setPromotions(activePromotions);
    }
    setIsLoading(false);
  }, []);

  const filteredPromotions = currentTab === "all" 
    ? promotions 
    : promotions.filter(promo => promo.category === currentTab);

  const handleClaimPromotion = (promoId: string) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to claim this promotion");
      return;
    }
    
    const promotion = promotions.find(p => p.id === promoId);
    if (promotion) {
      toast.success(`Claimed: ${promotion.title}`);
    }
  };

  const handleViewDetails = (promoId: string) => {
    setShowDetails(showDetails === promoId ? null : promoId);
  };

  return (
    <div className="bg-casino-thunder-darker min-h-screen pt-8 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            <span className="text-casino-thunder-green thunder-glow">Promotions</span> & Bonuses
          </h1>
          <p className="text-white/70 text-lg mb-8">
            Explore our exciting promotions and boost your gameplay with exclusive bonuses and rewards.
          </p>
        </div>
        
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="mb-8">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-casino-thunder-dark">
              <TabsTrigger value="all" className="px-4">All Promotions</TabsTrigger>
              <TabsTrigger value="deposit" className="px-4">Deposit Bonuses</TabsTrigger>
              <TabsTrigger value="cashback" className="px-4">Cashback</TabsTrigger>
              <TabsTrigger value="tournament" className="px-4">Tournaments</TabsTrigger>
              <TabsTrigger value="recurring" className="px-4">Recurring</TabsTrigger>
              <TabsTrigger value="special" className="px-4">Special</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value={currentTab} className="mt-0">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-white/70">Loading promotions...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPromotions.map(promotion => (
                  <div key={promotion.id} className="flex flex-col h-full">
                    <PromotionCard 
                      title={promotion.title}
                      description={promotion.description}
                      image={promotion.image}
                      endDate={promotion.endDate}
                      onClick={() => handleClaimPromotion(promotion.id)}
                      className="h-full"
                    />
                    
                    {showDetails === promotion.id && (
                      <div className="mt-4 p-4 bg-casino-thunder-dark rounded-lg border border-white/10">
                        <h4 className="font-semibold text-white mb-2 flex items-center">
                          <Info className="h-4 w-4 mr-2 text-casino-thunder-green" />
                          Promotion Details
                        </h4>
                        <div className="text-white/70 text-sm space-y-2">
                          <p>• Available for all players</p>
                          <p>• Minimum deposit: $20</p>
                          <p>• Wagering requirement: 35x</p>
                          <p>• Maximum withdrawal: $2,000</p>
                        </div>
                        <div className="flex justify-end mt-3">
                          <Button size="sm" variant="outline" onClick={() => setShowDetails(null)}>
                            Close Details
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-2 flex justify-end">
                      <Button 
                        variant="link" 
                        className="text-white/70 hover:text-casino-thunder-green p-0"
                        onClick={() => handleViewDetails(promotion.id)}
                      >
                        {showDetails === promotion.id ? "Hide Details" : "View Details"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!isLoading && filteredPromotions.length === 0 && (
              <div className="text-center py-12 bg-casino-thunder-dark rounded-lg">
                <p className="text-white/70">No promotions available in this category at the moment.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="bg-casino-thunder-dark rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Calendar className="mr-3 text-casino-thunder-green" />
            Upcoming Promotions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-casino-thunder-gray/30 rounded-lg border border-white/5">
              <h3 className="text-white font-semibold mb-2">Summer Heat Tournament</h3>
              <p className="text-white/70 text-sm mb-3">
                Join our biggest tournament of the summer with a massive $50,000 prize pool.
              </p>
              <div className="text-casino-thunder-green text-sm">Coming June 15th</div>
            </div>
            
            <div className="p-4 bg-casino-thunder-gray/30 rounded-lg border border-white/5">
              <h3 className="text-white font-semibold mb-2">Mystery Bonus Week</h3>
              <p className="text-white/70 text-sm mb-3">
                Different surprise bonuses every day for a whole week!
              </p>
              <div className="text-casino-thunder-green text-sm">Coming Next Month</div>
            </div>
          </div>
        </div>
        
        <div className="bg-casino-thunder-dark rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Filter className="mr-3 text-casino-thunder-green" />
            Promotion Terms & Conditions
          </h2>
          
          <div className="text-white/70 space-y-4">
            <p>
              All bonuses and promotions are subject to our general terms and conditions.
            </p>
            <p>
              Wagering requirements must be completed before any withdrawals of bonus funds or related winnings can be made.
            </p>
            <p>
              ThunderWin reserves the right to modify or cancel any promotion at any time.
            </p>
            <p>
              Only one bonus can be active at a time.
            </p>
            <p>
              Some games may contribute differently towards wagering requirements. Please check the full terms for details.
            </p>
            
            <div className="pt-4">
              <Button variant="outline">
                <Info className="mr-2 h-4 w-4" />
                Full Terms & Conditions
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Promotions;
