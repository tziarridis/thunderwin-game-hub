
import React, { useState, useEffect } from "react";
import { Dice5, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GameGrid from "@/components/casino/GameGrid";
import { useGames } from "@/hooks/useGames";
import { motion } from "framer-motion";
import WinningSlideshow from "@/components/casino/WinningSlideshow";
import GameCategories from "@/components/casino/GameCategories";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const CrashGamesPage = () => {
  const { games, loading, error } = useGames();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("all");
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [crashGames, setCrashGames] = useState<any[]>([]);
  
  // Get unique providers
  const providers = ["all", ...Array.from(new Set(games
    .filter(game => 
      (game.title.toLowerCase().includes("crash") || game.category === "crash"))
    .map(game => game.provider)))];
  
  useEffect(() => {
    if (games.length > 0) {
      processCrashGames();
    }
  }, [games, searchTerm, selectedProvider, isAuthenticated, user]);
  
  const processCrashGames = async () => {
    // Filter crash games based on search term and provider
    let filtered = games.filter(game => 
      (game.title.toLowerCase().includes("crash") || game.category === "crash") && 
      (searchTerm === "" || game.title.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedProvider === "all" || game.provider === selectedProvider)
    );
    
    // If user is authenticated, mark favorites
    if (isAuthenticated && user) {
      try {
        // Fetch user's favorite games
        const { data: favoriteData, error: favoriteError } = await supabase
          .from('favorite_games')
          .select('game_id')
          .eq('user_id', user.id);
          
        if (favoriteError) throw favoriteError;
        
        // Create a set of favorite game IDs for quick lookup
        const favoriteIds = new Set(favoriteData.map(item => item.game_id));
        
        // Mark games as favorites if they're in the user's favorites
        filtered = filtered.map(game => ({
          ...game,
          isFavorite: favoriteIds.has(game.id)
        }));
      } catch (error) {
        console.error("Error fetching favorite games:", error);
      }
    }
    
    setCrashGames(filtered);
  };
  
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

  return (
    <div className="bg-casino-thunder-darker min-h-screen pb-16 relative overflow-hidden">
      <WinningSlideshow />
      
      <div className="pt-20 container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Dice5 className="mr-3 h-8 w-8 text-casino-thunder-green" />
              Crash Games
            </h1>
            <p className="text-white/60 mt-2">
              Test your luck and timing skills with our thrilling crash games
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
        
        {/* Game Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 thunder-glow">Game Categories</h2>
          <GameCategories onCategoryClick={(category) => navigate(`/casino/${category}`)} />
        </div>
        
        {/* Provider Filter */}
        <motion.div 
          className="bg-white/5 backdrop-blur-md rounded-lg p-4 mb-8 overflow-x-auto flex items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span className="text-white/70 mr-4 shrink-0">Provider:</span>
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
        
        {/* Game Display */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Dice5 className="mr-2 h-5 w-5 text-casino-thunder-green" />
            All Crash Games ({crashGames.length})
          </h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-pulse text-white/70">Loading games...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">Error loading games</div>
          ) : crashGames.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-lg">
              <Dice5 className="h-16 w-16 text-white/30 mx-auto mb-4" />
              <p className="text-xl mb-4 text-white/70">No crash games available at the moment.</p>
              <p className="text-sm text-white/50 mb-6">Please check back soon or try a different category.</p>
              <Button 
                variant="outline" 
                className="border-casino-thunder-green text-casino-thunder-green"
                onClick={() => navigate('/casino')}
              >
                Explore All Games
              </Button>
            </div>
          ) : (
            <GameGrid games={crashGames} onGameClick={handleGameClick} />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CrashGamesPage;
