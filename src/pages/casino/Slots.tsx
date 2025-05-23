import React, { useState } from "react";
import { Gamepad2, Search, Filter, Star, Zap, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GameGrid from "@/components/casino/GameGrid";
import { useGames } from "@/hooks/useGames";
import { motion } from "framer-motion";
import GameCategories from "@/components/casino/GameCategories";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Mock data for configurable banners
const banners = [
  {
    id: 1,
    title: "Slot Tournament",
    description: "Win up to $10,000 in our weekly slots tournament",
    imageUrl: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81",
    ctaText: "Join Now",
    ctaUrl: "/promotions",
    backgroundColor: "from-purple-900 to-blue-900",
    textColor: "text-white"
  },
  {
    id: 2,
    title: "New Slots Released",
    description: "Try our newest slot games with exciting bonus features",
    imageUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    ctaText: "Play Now",
    ctaUrl: "/casino/new-games",
    backgroundColor: "from-green-800 to-blue-900",
    textColor: "text-white"
  }
];

const SlotsPage = () => {
  const { games, loading, error } = useGames();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("all");
  const navigate = useNavigate();
  
  // Filter slots games only
  const slotsGames = games.filter(game => 
    game.category === "slots" && 
    (searchTerm === "" || game.title.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedProvider === "all" || game.provider === selectedProvider)
  );
  
  const popularSlotsGames = slotsGames.filter(game => game.isPopular);
  const newSlotsGames = slotsGames.filter(game => game.isNew);
  
  // Get unique providers
  const providers = ["all", ...Array.from(new Set(slotsGames.map(game => game.provider)))];
  
  // Handle game click
  const handleGameClick = (game: any) => {
    toast.info(`Opening ${game.title}`);
    navigate(`/casino/game/${game.id}`);
  };
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-casino-thunder-darker min-h-screen pb-16 relative overflow-hidden">
      <div className="pt-20 container mx-auto px-4">
        {/* Configurable Banners Section */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-6 thunder-glow">Featured Slots</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map(banner => (
              <motion.div
                key={banner.id}
                whileHover={{ scale: 1.02 }}
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
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Gamepad2 className="mr-3 h-8 w-8 text-casino-thunder-green" />
              Slots Games
            </h1>
            <p className="text-white/60 mt-2">
              Spin the reels and win big with our collection of exciting slot games
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input
                type="text"
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white w-full sm:w-60 md:w-80"
              />
            </div>
            
            <Button variant="outline" className="flex items-center gap-2 border-white/10 bg-white/5">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
            </Button>
          </div>
        </motion.div>
        
        {/* Add GameCategories component */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 thunder-glow">Game Categories</h2>
          <GameCategories onCategoryClick={(category) => navigate(`/casino/${category}`)} />
        </div>
        
        <motion.div 
          className="bg-white/5 backdrop-blur-md rounded-lg p-4 mb-8 overflow-x-auto flex items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Label className="text-white/70 mr-4 shrink-0">Provider:</Label>
          <div className="flex flex-wrap gap-2">
            {providers.map((provider) => (
              <Button
                key={provider}
                variant={selectedProvider === provider ? "default" : "outline"}
                size="sm"
                className={`text-sm ${
                  selectedProvider === provider 
                    ? "bg-casino-thunder-green text-black" 
                    : "bg-white/5 text-white border-white/10"
                }`}
                onClick={() => setSelectedProvider(provider)}
              >
                {provider === "all" ? "All Providers" : provider}
              </Button>
            ))}
          </div>
        </motion.div>
        
        <Tabs defaultValue="all" className="w-full enhanced-tabs">
          <TabsList className="bg-casino-thunder-gray/30 backdrop-blur-md w-full justify-start mb-6 overflow-x-auto">
            <TabsTrigger value="all" className="tab-highlight">
              <Gamepad2 className="mr-2 h-4 w-4" />
              All Slots
            </TabsTrigger>
            <TabsTrigger value="popular" className="tab-highlight">
              <Star className="mr-2 h-4 w-4" />
              Popular
            </TabsTrigger>
            <TabsTrigger value="new" className="tab-highlight">
              <Zap className="mr-2 h-4 w-4" />
              New Games
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-pulse text-white/70">Loading games...</div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">Error loading games</div>
            ) : (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
              >
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Gamepad2 className="mr-2 h-5 w-5 text-casino-thunder-green" />
                  All Slot Games ({slotsGames.length})
                </h2>
                <GameGrid games={slotsGames} onGameClick={handleGameClick} />
              </motion.div>
            )}
          </TabsContent>
          
          <TabsContent value="popular" className="mt-0">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-pulse text-white/70">Loading games...</div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">Error loading games</div>
            ) : (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
              >
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Star className="mr-2 h-5 w-5 text-yellow-500" />
                  Popular Slot Games ({popularSlotsGames.length})
                </h2>
                <GameGrid games={popularSlotsGames} onGameClick={handleGameClick} />
              </motion.div>
            )}
          </TabsContent>
          
          <TabsContent value="new" className="mt-0">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-pulse text-white/70">Loading games...</div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">Error loading games</div>
            ) : (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
              >
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-casino-thunder-green" />
                  New Slot Games ({newSlotsGames.length})
                </h2>
                <GameGrid games={newSlotsGames} onGameClick={handleGameClick} />
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SlotsPage;
