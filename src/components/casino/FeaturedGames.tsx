
import React from "react";
import { Game } from "@/types";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Info, Star } from "lucide-react";

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
  
  return (
    <div className="thunder-card p-1">
      <div className="flex overflow-x-auto gap-2 p-2 scrollbar-hide">
        {games.map((game) => (
          <div 
            key={game.id} 
            className="flex-none w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 p-2"
          >
            <div className="relative rounded-lg overflow-hidden group">
              <img 
                src={game.image || "/placeholder.svg"} 
                alt={game.title}
                className="w-full aspect-[4/3] object-cover transition-transform duration-300 group-hover:scale-110"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end p-4">
                <h3 className="text-white font-semibold text-lg mb-2">{game.title}</h3>
                <p className="text-white/70 text-sm mb-4">{game.provider}</p>
                
                <div className="flex gap-2 w-full">
                  <Button 
                    className="flex-1 bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black flex items-center justify-center"
                    onClick={() => navigate(`/casino/game/${game.id}`)}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Play
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-white/20 hover:bg-white/10"
                    onClick={() => navigate(`/casino/game/${game.id}`)}
                  >
                    <Info className="mr-2 h-4 w-4" />
                    Details
                  </Button>
                </div>
              </div>
              
              {game.isPopular && (
                <div className="absolute top-2 left-2">
                  <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded flex items-center">
                    <Star className="h-3 w-3 mr-1" />
                    Popular
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedGames;
