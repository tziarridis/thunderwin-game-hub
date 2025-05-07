
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { gamesDatabaseService } from '@/services/gamesDatabaseService';
import { Game } from '@/types';
import GameLauncher from '@/components/games/GameLauncher';

const Seamless = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGame = async () => {
      if (!gameId) {
        setError('Game ID is missing');
        setLoading(false);
        return;
      }

      try {
        const game = await gamesDatabaseService.getGameById(gameId);
        if (game) {
          setSelectedGame(game);
        } else {
          setError('Game not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load game');
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [gameId]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      
      {selectedGame && (
        <div className="flex justify-end mt-4">
          <GameLauncher
            game={selectedGame}
            buttonText="Launch Game"
          />
        </div>
      )}
      
    </div>
  );
};

export default Seamless;
