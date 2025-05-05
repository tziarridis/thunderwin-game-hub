
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FilterX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useGames } from "@/hooks/useGames";
import GameCard from "@/components/games/GameCard";
import RecentBigWins from "@/components/casino/RecentBigWins";
import GameCategories from "@/components/casino/GameCategories";
import AggregatorGameSection from "@/components/casino/AggregatorGameSection";
import { useAuth } from "@/contexts/AuthContext";
import { scrollToTop } from "@/utils/scrollUtils";
import { useEffect } from "react";

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
  const [filteredGames, setFilteredGames] = useState([]);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    scrollToTop();
  }, []);
  
  const handleClearSearch = () => {
    setSearchText("");
  };

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
        
        {/* Main Casino Content - Now using Aggregator Game Section instead of the old games */}
        <div className="mb-12">
          <AggregatorGameSection />
        </div>
        
        {/* Recent Big Wins */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 thunder-glow">Recent Big Wins</h2>
          <RecentBigWins />
        </div>
        
        {/* All Games Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold mb-0 thunder-glow">Explore All Games</h2>
            <Button 
              variant="outline" 
              className="text-casino-thunder-green border-casino-thunder-green"
              onClick={() => {
                navigate('/casino/all-games');
                scrollToTop();
              }}
            >
              View All Games
            </Button>
          </div>
          
          <div className="text-center py-8">
            <p className="text-xl mb-6">Discover hundreds of games from our partner providers</p>
            <Button 
              size="lg"
              className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
              onClick={() => {
                navigate('/casino/aggregator-games');
                scrollToTop();
              }}
            >
              Browse All Games
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CasinoMain;
