
import { cn } from "@/lib/utils";
import { Play, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface GameCardProps {
  id?: string;
  title: string;
  image: string;
  provider: string;
  isPopular?: boolean;
  isNew?: boolean;
  className?: string;
}

const GameCard = ({ 
  id = "1", // Default ID if none provided
  title, 
  image, 
  provider, 
  isPopular = false,
  isNew = false,
  className 
}: GameCardProps) => {
  return (
    <div className={cn("thunder-card group relative overflow-hidden", className)}>
      <div className="aspect-[3/4] overflow-hidden relative">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end p-4">
          <Link to={`/casino/game/${id}`}>
            <Button 
              className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black mb-4 w-full"
            >
              <Play className="mr-2 h-4 w-4" />
              Play Now
            </Button>
          </Link>
          <Link to={`/casino/game/${id}`}>
            <Button variant="outline" className="w-full">Demo</Button>
          </Link>
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
              New
            </span>
          )}
        </div>
      </div>
      
      {/* Game info */}
      <div className="p-3">
        <h3 className="font-medium text-white truncate">{title}</h3>
        <p className="text-white/60 text-xs">{provider}</p>
      </div>
    </div>
  );
};

export default GameCard;
