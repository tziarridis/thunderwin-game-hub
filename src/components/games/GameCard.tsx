
import { cn } from "@/lib/utils";
import { Play, Star, Info, Zap, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { navigateByButtonName } from "@/utils/navigationUtils";

interface GameCardProps {
  id?: string;
  title: string;
  image?: string; // Make image optional
  provider: string;
  isPopular?: boolean;
  isNew?: boolean;
  rtp?: number;
  minBet?: number;
  maxBet?: number;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  className?: string;
}

const GameCard = ({ 
  id = "1", // Default ID if none provided
  title, 
  image = "/file.svg", // Default to the SVG if no image is provided
  provider, 
  isPopular = false,
  isNew = false,
  rtp,
  minBet = 0.20,
  maxBet = 100,
  isFavorite = false,
  onFavoriteToggle,
  className,
  ...props 
}: GameCardProps) => {
  const [isFav, setIsFav] = useState(isFavorite);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Update internal state when the prop changes
  useEffect(() => {
    setIsFav(isFavorite);
  }, [isFavorite]);
  
  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If parent provided a handler, use it
    if (onFavoriteToggle) {
      onFavoriteToggle();
    } else {
      // Fallback to local state
      setIsFav(!isFav);
      
      toast({
        title: isFav ? "Removed from favorites" : "Added to favorites",
        description: isFav 
          ? `${title} has been removed from your favorites.` 
          : `${title} has been added to your favorites.`,
      });
    }
  };
  
  const handleQuickDemo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    toast({
      title: "Demo Mode",
      description: `${title} is launching in demo mode. No real money will be wagered.`,
    });
  };
  
  const handleButtonClick = (e: React.MouseEvent, buttonText: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigateByButtonName(buttonText, navigate);
  };

  return (
    <div className={cn("thunder-card group relative overflow-hidden transition-all duration-300 hover:transform hover:scale-105", className)}>
      <div className="aspect-[3/4] overflow-hidden relative">
        <img 
          src={image} 
          alt={title}
          onError={(e) => {
            // Fallback to SVG if image fails to load
            const imgElement = e.target as HTMLImageElement;
            imgElement.src = "/file.svg";
          }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Favorite button */}
        <button 
          className="absolute top-2 right-2 z-10 p-1.5 bg-black/50 rounded-full hover:bg-black/80 transition-colors"
          onClick={handleFavorite}
        >
          <Heart className={`h-4 w-4 ${isFav ? "text-red-500 fill-red-500" : "text-white"}`} />
        </button>
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end p-4">
          <Button 
            className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black mb-2 w-full"
            onClick={(e) => handleButtonClick(e, "Play Now")}
          >
            <Play className="mr-2 h-4 w-4" />
            Play Now
          </Button>
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleQuickDemo}
            >
              Demo
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate(`/casino/game/${id}`)}
            >
              <Info className="h-4 w-4 mr-1" />
              Details
            </Button>
          </div>
          
          {/* Game quick info on hover */}
          {(rtp || minBet || maxBet) && (
            <div className="mt-3 w-full grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-white/80">
              {rtp && (
                <div className="flex justify-between">
                  <span>RTP:</span>
                  <span className="text-casino-thunder-green">{rtp}%</span>
                </div>
              )}
              {minBet && (
                <div className="flex justify-between">
                  <span>Min Bet:</span>
                  <span>${minBet}</span>
                </div>
              )}
              {maxBet && (
                <div className="flex justify-between">
                  <span>Max Bet:</span>
                  <span>${maxBet}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isPopular && (
            <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-sm font-medium flex items-center">
              <Star className="h-3 w-3 mr-1" /> Popular
            </span>
          )}
          {isNew && (
            <span className="bg-casino-thunder-green text-black text-xs px-2 py-1 rounded-sm font-medium">
              <Zap className="h-3 w-3 mr-1" /> New
            </span>
          )}
        </div>
      </div>
      
      {/* Game info */}
      <div className="p-3">
        <h3 className="font-medium text-white truncate">{title}</h3>
        <div className="flex justify-between items-center">
          <p className="text-white/60 text-xs">{provider}</p>
          {rtp && <p className="text-white/60 text-xs">RTP: {rtp}%</p>}
        </div>
      </div>
    </div>
  );
};

export default GameCard;
