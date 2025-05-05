
import React, { useState } from "react";
import { Heart, Search, SlidersHorizontal, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GameGrid from "@/components/casino/GameGrid";
import { useGames } from "@/hooks/useGames";
import { motion } from "framer-motion";
import WinningSlideshow from "@/components/casino/WinningSlideshow";
import GameCategories from "@/components/casino/GameCategories";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const FavoritesPage = () => {
  const { games, loading, error } = useGames();
  const [searchTerm, setSearchTerm] = useState("");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Filter favorite games only
  const favoriteGames = games.filter(game => 
    game.isFavorite && 
    (searchTerm === "" || game.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
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
              <Heart className="mr-3 h-8 w-8 text-pink-500" />
              Favorite Games
            </h1>
            <p className="text-white/60 mt-2">
              Your collection of favorite games for quick access
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input
                type="text"
                placeholder="Search favorites..."
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
        
        {/* Game Display */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Heart className="mr-2 h-5 w-5 text-pink-500" />
            Your Favorite Games ({favoriteGames.length})
          </h2>
          
          {!isAuthenticated ? (
            <div className="text-center py-12 bg-white/5 rounded-lg">
              <Heart className="h-16 w-16 text-white/30 mx-auto mb-4" />
              <p className="text-xl mb-4 text-white/70">Please log in to see your favorite games</p>
              <p className="text-sm text-white/50 mb-6">Save your favorite games for quick and easy access</p>
              <Button 
                variant="default" 
                className="bg-casino-thunder-green text-black mr-3"
                onClick={() => navigate('/login')}
              >
                Log In
              </Button>
              <Button 
                variant="outline" 
                className="border-casino-thunder-green text-casino-thunder-green"
                onClick={() => navigate('/register')}
              >
                Register
              </Button>
            </div>
          ) : loading ? (
            <div className="text-center py-8">
              <div className="animate-pulse text-white/70">Loading games...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">Error loading games</div>
          ) : favoriteGames.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-lg">
              <Heart className="h-16 w-16 text-white/30 mx-auto mb-4" />
              <p className="text-xl mb-4 text-white/70">You don't have any favorite games yet</p>
              <p className="text-sm text-white/50 mb-6">Click the heart icon on any game to add it to your favorites</p>
              <Button 
                variant="outline" 
                className="border-casino-thunder-green text-casino-thunder-green"
                onClick={() => navigate('/casino')}
              >
                Explore Games
              </Button>
            </div>
          ) : (
            <>
              <GameGrid games={favoriteGames} onGameClick={handleGameClick} />
              
              <div className="mt-6 bg-white/5 p-4 rounded-lg flex items-start text-white/70 text-sm">
                <Info className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                <p>
                  To add or remove games from your favorites, click the heart icon on any game card. 
                  Your favorite games will be saved to your account for quick access.
                </p>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default FavoritesPage;
