import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { GameSectionLoading } from '@/components/ui/loading';
import { useGames } from '@/hooks/useGames';
import { Game } from '@/types';
import { scrollToTop } from '@/utils/scrollUtils';

// Update the import to use the new component name
import CasinoGameGrid from '@/components/casino/CasinoGameGrid';

const Crash = () => {
  const { games, loading, error, retryLoading } = useGames({ category: 'crash' });
  const [crashGames, setCrashGames] = useState<Game[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (games) {
      setCrashGames(games);
    }
  }, [games]);

  // Use the renamed component
  return (
    <div className="relative bg-casino-thunder-darker min-h-screen overflow-hidden">
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Crash Games</h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            Experience the thrill of crash games, where you can win big in an instant!
          </p>
        </div>
        
        {loading ? (
          <GameSectionLoading />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-xl mb-4">Failed to load crash games.</p>
            <Button onClick={retryLoading}>Retry</Button>
          </div>
        ) : (
          <CasinoGameGrid 
            games={crashGames} 
            onGameClick={(game) => {
              navigate(`/casino/game/${game.id}`);
              scrollToTop();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Crash;
