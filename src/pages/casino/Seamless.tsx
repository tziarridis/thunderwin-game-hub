import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// import { gamesDatabaseService } from '@/services/gamesDatabaseService'; // Using gameService now
import { gameService } from '@/services/gameService';
import { Game } from '@/types'; // Using updated Game type
import LaunchGame from '@/components/casino/LaunchGame'; 
import { Loader2, AlertTriangle } from 'lucide-react';
import { useGames } from '@/hooks/useGames'; // For consistent game object mapping if needed

const Seamless = () => {
  const { gameId } = useParams<{ gameId: string }>(); // gameId here refers to the slug or UUID
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGame = async () => {
      if (!gameId) {
        setError('Game identifier is missing');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // gameService.getGameById can handle slugs or UUIDs
        const gameData = await gameService.getGameById(gameId); 
        if (gameData) {
          setSelectedGame(gameData);
        } else {
          setError('Game not found');
        }
      } catch (err: any) {
        console.error("Error fetching game for seamless launch:", err);
        setError(err.message || 'Failed to load game data');
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [gameId]);

  if (loading) {
    
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading game...</p>
      </div>
    );
  }

  if (error) {
    
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-4" />
        <p className="text-destructive-foreground">Error: {error}</p>
      </div>
    );
  }

  if (!selectedGame) {
    
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Game details could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4 text-center">{selectedGame.title}</h1>
      <p className="text-center text-muted-foreground mb-6">Provider: {selectedGame.providerName || selectedGame.provider_slug}</p>
      
      <div className="flex flex-col items-center gap-4">
        <img src={selectedGame.image || selectedGame.cover || '/placeholder.svg'} alt={selectedGame.title || 'Game image'} className="w-full max-w-sm h-auto rounded-lg shadow-lg mb-4" />
        <LaunchGame 
          game={selectedGame} 
          mode="real" 
          buttonText="Play Real Money" 
          size="lg"
          className="bg-primary hover:bg-primary/90"
        />
        {!selectedGame.only_demo && ( // Show demo button if not demo-only
            <LaunchGame 
            game={selectedGame} 
            mode="demo" 
            buttonText="Play Demo" 
            variant="outline"
            size="lg"
            />
        )}
      </div>
      
      <div className="mt-8 p-4 bg-card rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-2">Game Information</h3>
        {selectedGame.description && <p className="text-muted-foreground mb-2">{selectedGame.description}</p>}
        {typeof selectedGame.rtp === 'number' && <p className="text-sm">RTP: <span className="font-medium">{selectedGame.rtp}%</span></p>}
        {selectedGame.volatility && <p className="text-sm">Volatility: <span className="font-medium capitalize">{selectedGame.volatility}</span></p>}
        {selectedGame.releaseDate && <p className="text-sm">Release Date: <span className="font-medium">{new Date(selectedGame.releaseDate).toLocaleDateString()}</span></p>}
        {selectedGame.lines && <p className="text-sm">Lines: <span className="font-medium">{selectedGame.lines}</span></p>}
        {selectedGame.tags && selectedGame.tags.length > 0 && <p className="text-sm">Tags: <span className="font-medium">{selectedGame.tags.join(', ')}</span></p>}
      </div>
    </div>
  );
};

export default Seamless;
