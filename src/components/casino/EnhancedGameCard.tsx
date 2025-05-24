
import React from "react";
import { motion } from "framer-motion";
import { Play, Star, Zap, Heart, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Game } from "@/types";
import { useNavigate } from "react-router-dom";
import "./animations.css";

interface EnhancedGameCardProps {
  game: Game;
  index?: number;
}

const EnhancedGameCard = ({ game, index = 0 }: EnhancedGameCardProps) => {
  const navigate = useNavigate();
  
  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/casino/game/${game.id}`);
  };
  
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Handle toggling favorite state
    console.log('Toggle favorite:', game.id);
  };
  
  return (
    <motion.div
      className="relative group card-hover-effect"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ z: 20 }}
      onClick={() => navigate(`/casino/game/${game.id}`)}
    >
      <div className="relative overflow-hidden rounded-lg">
        {/* Game Image */}
        <div className="aspect-[4/3] overflow-hidden relative">
          <img 
            src={game.image || "/placeholder.svg"} 
            alt={game.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Action buttons */}
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-between gap-2">
            <Button 
              size="sm" 
              className="flex-1 bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black neo-glow text-xs"
              onClick={handlePlay}
            >
              <Play className="mr-1 h-3 w-3" />
              Play
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 hover:border-white/30 neo-glow"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/casino/game/${game.id}`);
              }}
            >
              <Info className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {game.isPopular && (
            <motion.span 
              className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full flex items-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Star className="h-3 w-3 mr-1" />
              Popular
            </motion.span>
          )}
          
          {game.isNew && (
            <motion.span 
              className="bg-casino-thunder-green text-black text-xs px-2 py-0.5 rounded-full flex items-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Zap className="h-3 w-3 mr-1" />
              New
            </motion.span>
          )}
        </div>
        
        {/* Favorite Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/40 hover:bg-black/60 text-white z-10"
          onClick={handleToggleFavorite}
        >
          <Heart className={`h-3.5 w-3.5 ${game.isFavorite ? 'text-red-500 fill-red-500' : 'text-white'}`} />
        </Button>
        
        {/* Game Info */}
        <div className="p-2.5">
          <h3 className="font-medium text-sm text-white truncate group-hover:text-casino-thunder-green transition-colors">
            {game.title}
          </h3>
          <p className="text-xs text-white/60 truncate">{game.provider}</p>
          
          {/* RTP Info */}
          {game.rtp && (
            <div className="mt-1.5 flex items-center gap-2">
              <div className="text-xs text-white/70 bg-white/5 px-1.5 py-0.5 rounded">
                RTP: {game.rtp}%
              </div>
              
              {game.minBet && game.maxBet && (
                <div className="text-xs text-white/70">
                  ${game.minBet} - ${game.maxBet}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedGameCard;
