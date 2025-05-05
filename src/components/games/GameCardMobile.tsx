
import { useState } from 'react';
import { Game } from '@/types';
import { Heart, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface GameCardMobileProps {
  game: Game;
  onLaunch?: (game: Game) => void;
  className?: string;
}

const GameCardMobile = ({ game, onLaunch, className }: GameCardMobileProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const handleLaunch = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to play games');
      navigate('/login');
      return;
    }
    
    if (onLaunch) {
      onLaunch(game);
    } else {
      navigate(`/casino/game/${game.id}`);
    }
  };
  
  return (
    <div 
      className={cn(
        "relative w-full rounded-lg overflow-hidden bg-casino-thunder-dark/40 border border-casino-thunder-gray/20 transition-all",
        isHovering ? "scale-[1.02] shadow-lg shadow-casino-thunder-green/10" : "",
        className
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="aspect-[4/3] w-full overflow-hidden relative">
        <img 
          src={game.thumbnailUrl || game.imageUrl || '/placeholder-game.jpg'} 
          alt={game.title} 
          className="w-full h-full object-cover transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        
        <Button 
          size="icon" 
          variant="ghost" 
          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/30 hover:bg-black/50 text-white"
          onClick={(e) => {
            e.stopPropagation();
            toast.success('Added to favorites');
          }}
        >
          <Heart className="h-4 w-4" />
        </Button>
        
        <div className="absolute bottom-0 left-0 right-0 p-2 flex flex-col gap-1">
          <h3 className="text-sm font-medium line-clamp-1 text-white">{game.title}</h3>
          <Button 
            size="sm" 
            className="w-full h-8 bg-casino-thunder-green hover:bg-casino-thunder-green/90 text-black"
            onClick={handleLaunch}
          >
            <Play className="mr-1.5 h-3.5 w-3.5" />
            Play Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameCardMobile;
