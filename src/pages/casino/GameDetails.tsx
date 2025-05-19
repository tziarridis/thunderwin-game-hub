import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Game } from '@/types';
import { gameService } from '@/services/gameService';
import { Loader2 } from 'lucide-react';

const GameDetails = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { data: game, isLoading, error } = useQuery<Game, Error>({
    queryKey: ['gameDetails', gameId],
    queryFn: () => gameService.getGameById(gameId!),
    enabled: !!gameId,
  });
  
  if (isLoading) return <div className="container mx-auto text-center py-12"><Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" /> <p className="mt-4">Loading game details...</p></div>;
  if (error) return <div className="container mx-auto text-center py-12 text-destructive">Error loading game details: {error.message}</div>;
  if (!game) return <div className="container mx-auto text-center py-12">Game not found.</div>;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-4 border-b border-border">
        <div>
          <h1 className="text-4xl font-bold mb-1">{game.title}</h1>
          <p className="text-lg text-muted-foreground">
            By <span className="font-semibold text-primary">{game.providerName || game.provider_slug}</span> in <span className="font-semibold text-primary">{game.categoryName || (Array.isArray(game.category_slugs) ? game.category_slugs.join(', ') : game.category_slugs)}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameDetails;
