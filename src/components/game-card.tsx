
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Game } from '@/types';
import { Heart } from "lucide-react";
import { Button } from './ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface GameCardProps {
  game: Game;
  onFavoriteToggle?: (gameId: string) => void;
  onClick?: () => void;
  // Added isFavorite for consistency, assuming it comes from parent or Game object
  isFavorite?: boolean; 
}

const GameCard = ({ game, onFavoriteToggle, onClick, isFavorite }: GameCardProps) => {
  const { isAuthenticated } = useAuth();
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(String(game.id)); // Ensure gameId is string
    }
  };

  // Determine favorite status: from prop or from game object
  const favoriteStatus = typeof isFavorite === 'boolean' ? isFavorite : game.isFavorite;

  return (
    <Card 
      className="overflow-hidden bg-slate-800 border-slate-700 transition-all hover:scale-[1.02] cursor-pointer"
      onClick={onClick}
    >
      <div className="relative">
        <img 
          src={game.image || '/placeholder.svg'} 
          alt={game.title}
          className="w-full h-[180px] object-cover"
          loading="lazy"
        />
        {isAuthenticated && onFavoriteToggle && ( // only show if handler is provided
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
            aria-label={favoriteStatus ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart 
              className={`h-5 w-5 ${favoriteStatus ? 'text-red-500 fill-red-500' : 'text-white'}`}
            />
          </button>
        )}
      </div>
      <CardContent className="p-3">
        <h3 className="font-medium text-sm mb-1 truncate">{game.title}</h3>
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">{game.providerName || game.provider}</span>
          <Button 
            size="sm" 
            className="text-xs bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
            // onClick prop on Button might conflict with Card's onClick.
            // If "Play" button should also trigger card's onClick (details page), then no onClick here.
            // If "Play" button is for direct launch, it needs its own handler.
            // Assuming for now it's part of the card click or handled by parent via Card's onClick.
          >
            Play
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameCard;
