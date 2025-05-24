
import React from 'react';
import { Game, GameTag } from '@/types';
import GameCard from './GameCard';

export interface RelatedGamesProps {
  gameId: string;
  category?: string;
  provider?: string;
  tags?: (string | GameTag)[];
}

const RelatedGames: React.FC<RelatedGamesProps> = ({ gameId, category, provider, tags }) => {
  const [relatedGames, setRelatedGames] = React.useState<Game[]>([]);

  React.useEffect(() => {
    // Mock related games for now
    const mockRelatedGames: Game[] = [
      {
        id: 'related-1',
        title: 'Related Game 1',
        image_url: '/placeholder.svg',
        provider_slug: provider || 'unknown',
        category_id: category || 'slots',
        rtp: 96.5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'related-2',
        title: 'Related Game 2',
        image_url: '/placeholder.svg',
        provider_slug: provider || 'unknown',
        category_id: category || 'slots',
        rtp: 95.8,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    
    setRelatedGames(mockRelatedGames);
  }, [gameId, category, provider, tags]);

  if (relatedGames.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Related Games</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {relatedGames.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onPlay={() => {}}
            onToggleFavorite={() => {}}
            isFavorite={false}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedGames;
