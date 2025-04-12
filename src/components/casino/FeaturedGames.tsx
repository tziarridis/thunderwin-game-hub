
import React from "react";
import { Game } from "@/types";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Info, Star, Zap, Heart } from "lucide-react";
import { motion } from "framer-motion";

interface FeaturedGamesProps {
  games: Game[];
}

const FeaturedGames = ({ games }: FeaturedGamesProps) => {
  const navigate = useNavigate();
  
  if (games.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white/70">No featured games available</p>
      </div>
    );
  }
  
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
    <div className="glass-card p-5 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Zap className="mr-2 h-5 w-5 text-casino-thunder-green" />
          Featured Games
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-white/70 hover:text-casino-thunder-green text-sm"
          onClick={() => navigate('/casino')}
        >
          View All
        </Button>
      </div>
      
      <motion.div 
        className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {games.map((game) => (
          <motion.div 
            key={game.id} 
            variants={item}
            className="flex-none w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 p-2"
          >
            <motion.div 
              className="relative rounded-xl overflow-hidden group"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.img 
                src={game.image || "/placeholder.svg"} 
                alt={game.title}
                className="w-full aspect-[4/3] object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end p-4">
                <h3 className="text-white font-semibold text-lg mb-1">{game.title}</h3>
                <p className="text-white/70 text-sm mb-4">{game.provider}</p>
                
                <div className="flex gap-2 w-full">
                  <Button 
                    className="flex-1 bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black flex items-center justify-center neo-glow"
                    onClick={() => navigate(`/casino/game/${game.id}`)}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Play
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-white/20 hover:bg-white/10 backdrop-blur-sm"
                    onClick={() => navigate(`/casino/game/${game.id}`)}
                  >
                    <Info className="mr-2 h-4 w-4" />
                    Details
                  </Button>
                </div>
              </div>
              
              {game.isPopular && (
                <div className="absolute top-2 left-2">
                  <motion.span 
                    className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full flex items-center"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Star className="h-3 w-3 mr-1" />
                    Popular
                  </motion.span>
                </div>
              )}
              
              {game.isNew && (
                <div className="absolute top-2 right-2">
                  <motion.span 
                    className="bg-casino-thunder-green text-black text-xs px-2 py-1 rounded-full flex items-center"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    New
                  </motion.span>
                </div>
              )}
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Add to favorites:', game.id);
                }}
              >
                <Heart className={`h-4 w-4 ${game.isFavorite ? 'text-red-500 fill-red-500' : 'text-white'}`} />
              </Button>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default FeaturedGames;
