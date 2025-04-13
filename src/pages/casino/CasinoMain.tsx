
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FilterX, Crown, Trophy, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useGames } from "@/hooks/useGames";
import { Game } from "@/types";
import GameCard from "@/components/games/GameCard";
import WinningSlideshow from "@/components/casino/WinningSlideshow";
import GameCategories from "@/components/casino/GameCategories";

const CasinoMain = () => {
  const { games, loading, error } = useGames();
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (games) {
      applyFilters();
    }
  }, [games, searchText, activeTab]);

  const applyFilters = () => {
    let filtered = [...games];

    // Apply search filter
    if (searchText) {
      filtered = filtered.filter(game => 
        game.title.toLowerCase().includes(searchText.toLowerCase()) ||
        game.provider.toLowerCase().includes(searchText.toLowerCase())
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
            return game.category === "live";
          case "jackpots":
            return game.jackpot;
          case "favorites":
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
    return <div className="container mx-auto px-4 py-12">Loading games...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-12">Error loading games: {error.message}</div>;
  }

  return (
    <div className="relative bg-casino-thunder-darker min-h-screen overflow-hidden">
      <WinningSlideshow />
      
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Casino Games</h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            Explore our vast selection of casino games, from slots to table games and live dealer experiences.
          </p>
        </div>
        
        {/* Add VIP Tiers Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 thunder-glow">VIP Program</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Gold VIP */}
            <div className="bg-gradient-to-b from-yellow-700/40 to-yellow-900/30 rounded-xl p-6 border border-yellow-600/30 hover:border-yellow-500/50 transition-all shadow-lg hover:shadow-yellow-600/20 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Gold VIP</h3>
                <Crown className="h-8 w-8 text-yellow-500" />
              </div>
              <p className="text-white/70 mb-4">Begin your premium journey with enhanced rewards and special access.</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-white/80">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2"></div>
                  <span>5% Weekly Cashback</span>
                </li>
                <li className="flex items-center text-white/80">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2"></div>
                  <span>Dedicated Account Manager</span>
                </li>
                <li className="flex items-center text-white/80">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2"></div>
                  <span>Faster Withdrawals</span>
                </li>
              </ul>
              <Button className="w-full bg-transparent border border-yellow-500 text-yellow-500 hover:bg-yellow-500/10" onClick={() => navigate('/vip')}>
                Learn More
              </Button>
            </div>
            
            {/* Platinum VIP */}
            <div className="bg-gradient-to-b from-slate-500/40 to-slate-700/30 rounded-xl p-6 border border-slate-400/30 hover:border-slate-300/50 transition-all shadow-lg hover:shadow-slate-400/20 backdrop-blur-sm transform scale-105">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Platinum VIP</h3>
                <Trophy className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-white/70 mb-4">Elevate your experience with premium rewards and exclusive events.</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-white/80">
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full mr-2"></div>
                  <span>10% Weekly Cashback</span>
                </li>
                <li className="flex items-center text-white/80">
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full mr-2"></div>
                  <span>Premium Account Manager</span>
                </li>
                <li className="flex items-center text-white/80">
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full mr-2"></div>
                  <span>Exclusive Tournaments</span>
                </li>
                <li className="flex items-center text-white/80">
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full mr-2"></div>
                  <span>Luxury Gifts</span>
                </li>
              </ul>
              <Button className="w-full bg-gradient-to-r from-slate-400 to-slate-300 text-black hover:from-slate-300 hover:to-slate-400" onClick={() => navigate('/vip')}>
                Join Platinum VIP
              </Button>
            </div>
            
            {/* Diamond VIP */}
            <div className="bg-gradient-to-b from-blue-700/40 to-blue-900/30 rounded-xl p-6 border border-blue-400/30 hover:border-blue-300/50 transition-all shadow-lg hover:shadow-blue-400/20 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Diamond VIP</h3>
                <Sparkles className="h-8 w-8 text-blue-300" />
              </div>
              <p className="text-white/70 mb-4">The ultimate VIP experience with unmatched perks and rewards.</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-white/80">
                  <div className="w-1.5 h-1.5 bg-blue-300 rounded-full mr-2"></div>
                  <span>15% Weekly Cashback</span>
                </li>
                <li className="flex items-center text-white/80">
                  <div className="w-1.5 h-1.5 bg-blue-300 rounded-full mr-2"></div>
                  <span>VIP Host Available 24/7</span>
                </li>
                <li className="flex items-center text-white/80">
                  <div className="w-1.5 h-1.5 bg-blue-300 rounded-full mr-2"></div>
                  <span>Invitation to VIP Events</span>
                </li>
                <li className="flex items-center text-white/80">
                  <div className="w-1.5 h-1.5 bg-blue-300 rounded-full mr-2"></div>
                  <span>Luxury Travel Packages</span>
                </li>
              </ul>
              <Button className="w-full bg-transparent border border-blue-300 text-blue-300 hover:bg-blue-500/10" onClick={() => navigate('/vip')}>
                Learn More
              </Button>
            </div>
          </div>
        </div>
        
        {/* Game Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 thunder-glow">Game Categories</h2>
          <GameCategories onCategoryClick={(category) => navigate(`/casino/${category}`)} />
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
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {filteredGames.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl mb-4">No games match your search criteria.</p>
            <Button 
              variant="outline" 
              className="border-casino-thunder-green text-casino-thunder-green"
              onClick={handleClearSearch}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredGames.map(game => (
              <GameCard 
                key={game.id}
                id={game.id}
                title={game.title}
                image={game.image}
                provider={game.provider}
                isPopular={game.isPopular}
                isNew={game.isNew}
                rtp={game.rtp}
                isFavorite={game.isFavorite}
                minBet={game.minBet}
                maxBet={game.maxBet}
                onClick={() => navigate(`/casino/game/${game.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CasinoMain;
