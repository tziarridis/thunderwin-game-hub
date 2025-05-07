
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
}

const GameCard = ({ game, onFavoriteToggle, onClick }: GameCardProps) => {
  const { isAuthenticated } = useAuth();
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(game.id);
    }
  };

  return (
    <Card 
      className="overflow-hidden bg-slate-800 border-slate-700 transition-all hover:scale-[1.02] cursor-pointer"
      onClick={onClick}
    >
      <div className="relative">
        <img 
          src={game.image} 
          alt={game.title}
          className="w-full h-[180px] object-cover"
          loading="lazy"
        />
        {isAuthenticated && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
          >
            <Heart 
              className={`h-5 w-5 ${game.isFavorite ? 'text-red-500 fill-red-500' : 'text-white'}`}
            />
          </button>
        )}
      </div>
      <CardContent className="p-3">
        <h3 className="font-medium text-sm mb-1 truncate">{game.title}</h3>
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">{game.provider}</span>
          <Button 
            size="sm" 
            className="text-xs bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
          >
            Play
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameCard;
