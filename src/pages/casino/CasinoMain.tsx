import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FilterX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useGames } from "@/hooks/useGames";
import { Game } from "@/types";
import RecentBigWins from "@/components/casino/RecentBigWins";
import GameCategories from "@/components/casino/GameCategories";
import AggregatorGameSection from "@/components/casino/AggregatorGameSection";
import { useAuth } from "@/contexts/AuthContext";
import { scrollToTop } from "@/utils/scrollUtils";
import CasinoGameGrid from '@/components/casino/CasinoGameGrid';

// Mock data for configurable banners from backend
const banners = [
  {
    id: 1,
    title: "Welcome Bonus",
    description: "Get 100% up to $500 + 100 Free Spins on your first deposit!",
    imageUrl: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81",
    ctaText: "Claim Now",
    ctaUrl: "/promotions",
    backgroundColor: "from-purple-900 to-blue-900",
    textColor: "text-white"
  },
  {
    id: 2,
    title: "Casino Tournament",
    description: "Win big in our weekly casino tournament with $10,000 prize pool",
    imageUrl: "https://images.unsplash.com/photo-1518998053901-5348d3961a04",
    ctaText: "Join Now",
    ctaUrl: "/tournaments",
    backgroundColor: "from-green-800 to-blue-900",
    textColor: "text-white"
  }
];

const CasinoMain = () => {
  const { games, loading, error } = useGames();
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (games) {
      applyFilters();
    }
  }, [games, searchText, activeTab]);

  const applyFilters = () => {
    let currentGames = games || [];
    let filtered = [...currentGames];

    // Apply search filter
    if (searchText) {
      filtered = filtered.filter(game => 
        game.title.toLowerCase().includes(searchText.toLowerCase()) ||
        (game.provider && game.provider.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    // Apply category filter
    if (activeTab !== "all") {
      filtered = filtered.filter(game => {
        switch (activeTab) {
          case "popular":
            return game.isPopular;
          case "new":
            return game.isNew;
          case "slots":
            return game.category === "slots";
          case "table":
            return game.category === "table";
          case "live":
            return game.category === "live"; // or game.isLive
          case "jackpots":
            return !!game.jackpot; // Check if jackpot data exists
          case "favorites":
            // Favorites logic might be handled differently, e.g., user-specific
            // For now, assuming Game type has an isFavorite property
            return game.isFavorite; 
          default:
            return true;
        }
      });
    }

    setFilteredGames(filtered);
  };

  const handleClearSearch = () => {
    setSearchText("");
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading games...</div>;
  }

  if (error) {
    // Ensure error is treated as a string or an object with a message
    const errorMessage = typeof error === 'string' ? error : (error as Error)?.message || "Unknown error occurred";
    return <div className="container mx-auto px-4 py-12 text-center text-red-500">Error loading games: {errorMessage}</div>;
  }
  
  // ... keep existing code (JSX structure)
  return (
    <div className="relative bg-casino-thunder-darker min-h-screen overflow-hidden">
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Casino Games</h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            Explore our vast selection of casino games, from slots to table games and live dealer experiences.
          </p>
        </div>
        
        {/* Configurable Banners Section - Added at top */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map(banner => (
              <div
                key={banner.id}
                className={`rounded-lg overflow-hidden relative h-60 bg-gradient-to-r ${banner.backgroundColor}`}
              >
                <div className="absolute inset-0 opacity-60 bg-black">
                  <img 
                    src={banner.imageUrl} 
                    alt={banner.title} 
                    className="w-full h-full object-cover mix-blend-overlay"
                  />
                </div>
                <div className="absolute inset-0 flex flex-col justify-center p-8 z-10">
                  <h3 className={`text-2xl font-bold mb-2 ${banner.textColor}`}>
                    {banner.title}
                  </h3>
                  <p className={`${banner.textColor} mb-4 opacity-80 max-w-md`}>
                    {banner.description}
                  </p>
                  <div>
                    <Button 
                      className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
                      onClick={() => navigate(banner.ctaUrl)}
                    >
                      {banner.ctaText}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Game Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 thunder-glow">Game Categories</h2>
          <GameCategories onCategoryClick={(category) => {
            navigate(`/casino/${category}`);
            scrollToTop();
          }} />
        </div>
        
        {/* Aggregator Game Section - NEW SECTION */}
        <div className="mb-8">
          <AggregatorGameSection />
        </div>
        
        {/* Recent Big Wins */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 thunder-glow">Recent Big Wins</h2>
          <RecentBigWins />
        </div>
        
        <div className="mb-6">
          <div className="relative mb-4">
            <Input
              type="text"
              placeholder="Search games or providers..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 py-6 bg-casino-thunder-gray/30 border-white/10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            {searchText && (
              <Button 
                variant="ghost" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2" 
                onClick={handleClearSearch}
              >
                <FilterX size={18} />
              </Button>
            )}
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full flex overflow-x-auto py-2 justify-start">
              <TabsTrigger value="all">All Games</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="slots">Slots</TabsTrigger>
              <TabsTrigger value="table">Table Games</TabsTrigger>
              <TabsTrigger value="live">Live Casino</TabsTrigger>
              <TabsTrigger value="jackpots">Jackpots</TabsTrigger>
              {isAuthenticated && <TabsTrigger value="favorites">Favorites</TabsTrigger>}
            </TabsList>
          </Tabs>
        </div>
        
        {filteredGames.length === 0 && searchText ? (
          <div className="text-center py-12">
            <p className="text-xl mb-4">No games match your search criteria.</p>
            <Button 
              variant="outline" 
              className="border-casino-thunder-green text-casino-thunder-green"
              onClick={handleClearSearch}
            >
              Clear Search & Filters
            </Button>
          </div>
        ) : filteredGames.length === 0 && activeTab !== "all" ? (
            <div className="text-center py-12">
                <p className="text-xl mb-4">No games found in this category.</p>
                <Button 
                variant="outline" 
                className="border-casino-thunder-green text-casino-thunder-green"
                onClick={() => setActiveTab("all")}
                >
                Show All Games
                </Button>
            </div>
        ) : (
          <CasinoGameGrid
            games={filteredGames}
            onGameClick={(game) => {
              navigate(`/casino/game/${game.id}`);
              scrollToTop();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default CasinoMain;
