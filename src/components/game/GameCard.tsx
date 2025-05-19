
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Game } from '@/types';
import { Heart } from "lucide-react";
import { Button } from '@/components/ui/button'; // Ensure this path is correct
import { useAuth } from '@/contexts/AuthContext';

interface GameCardProps {
  game: Game;
  onFavoriteToggle?: (gameId: string) => void;
  onClick?: () => void;
  isFavorite?: boolean; // Assuming this is passed from parent
}

const GameCard = ({ game, onFavoriteToggle, onClick, isFavorite }: GameCardProps) => {
  const { isAuthenticated } = useAuth();
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(String(game.id)); // Ensure gameId is string
    }
  };

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
        {isAuthenticated && onFavoriteToggle && (
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
            // onClick on this button should be handled if it's for direct play.
            // For now, assuming it's part of the card click.
          >
            Play
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameCard;
