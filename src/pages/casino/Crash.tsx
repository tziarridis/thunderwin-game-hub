
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useGames } from '@/hooks/useGames';
import { Game } from '@/types';
import { scrollToTop } from '@/utils/scrollUtils';
import GameSectionLoading from '@/components/casino/GameSectionLoading';
import CasinoGameGrid from '@/components/casino/CasinoGameGrid';

const Crash = () => {
  const { games, isLoadingGames, gamesError } = useGames();
  const [crashGames, setCrashGames] = useState<Game[]>([]);
  const navigate = useNavigate();

  const retryLoading = () => {
    window.location.reload();
  };

  useEffect(() => {
    if (games) {
      const filteredGames = games.filter(game => game.category === 'crash');
      setCrashGames(filteredGames);
    }
  }, [games]);

  return (
    <div className="relative bg-casino-thunder-darker min-h-screen overflow-hidden">
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Crash Games</h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            Experience the thrill of crash games, where you can win big in an instant!
          </p>
        </div>
        
        {isLoadingGames ? (
          <GameSectionLoading />
        ) : gamesError ? (
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
