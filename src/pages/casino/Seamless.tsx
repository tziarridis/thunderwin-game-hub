
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { gamesDatabaseService } from '@/services/gamesDatabaseService'; // Assuming this is correct for direct DB access
import { Game, DbGame } from '@/types';
import LaunchGame from '@/components/casino/LaunchGame'; // Using LaunchGame component
import { Loader2, AlertTriangle } from 'lucide-react';
import { useGames } from '@/hooks/useGames'; // To use the mapDbGameToGame or similar if needed

// Helper to map DbGame to Game, can be imported from useGames or utils if it exists there
const mapDbGameToFrontendGame = (dbGame: DbGame): Game => {
  return {
    id: dbGame.id,
    slug: dbGame.slug,
    title: dbGame.title || 'Unknown Title',
    provider: dbGame.provider_slug || dbGame.provider_id?.toString() || 'unknown-provider',
    category: Array.isArray(dbGame.category_slugs) ? (dbGame.category_slugs[0] || 'unknown-category') : (dbGame.category_slugs || 'unknown-category'),
    image: dbGame.cover || dbGame.image_url || '/placeholder.svg',
    // Map other essential fields for LaunchGame component
    game_id: dbGame.game_id, 
    // ... any other fields Game type or LaunchGame might need
  };
};


const Seamless = () => {
  const { gameId } = useParams<{ gameId: string }>(); // Assuming gameId is the DB game UUID or unique code
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const { mapDbGameToGame } = useGames(); // If you have a centralized mapper

  useEffect(() => {
    const fetchGame = async () => {
      if (!gameId) {
        setError('Game ID is missing');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Assuming getGameById from gamesDatabaseService returns a DbGame
        const dbGame = await gamesDatabaseService.getGameById(gameId); // This should return DbGame or null
        if (dbGame) {
          // Map DbGame to the Game type expected by LaunchGame or other UI components
          setSelectedGame(mapDbGameToFrontendGame(dbGame));
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
      <p className="text-center text-muted-foreground mb-6">Provider: {selectedGame.providerName || selectedGame.provider}</p>
      
      <div className="flex flex-col items-center gap-4">
        <img src={selectedGame.image || selectedGame.cover} alt={selectedGame.title} className="w-full max-w-sm h-auto rounded-lg shadow-lg mb-4" />
        <LaunchGame 
          game={selectedGame} 
          mode="real" 
          buttonText="Play Real Money" 
          size="lg"
          className="bg-primary hover:bg-primary/90"
        />
        <LaunchGame 
          game={selectedGame} 
          mode="demo" 
          buttonText="Play Demo" 
          variant="outline"
          size="lg"
        />
      </div>
      
      {/* You could add more game details here if needed */}
      <div className="mt-8 p-4 bg-card rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-2">Game Information</h3>
        {selectedGame.description && <p className="text-muted-foreground mb-2">{selectedGame.description}</p>}
        {selectedGame.rtp && <p className="text-sm">RTP: <span className="font-medium">{selectedGame.rtp}%</span></p>}
        {selectedGame.volatility && <p className="text-sm">Volatility: <span className="font-medium capitalize">{selectedGame.volatility}</span></p>}
      </div>
    </div>
  );
};

export default Seamless;
