import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useGames } from '@/hooks/useGames'; 
import { useAuth } from '@/contexts/AuthContext'; 
import { Game, GameLaunchOptions } from '@/types';
import { toast } from 'sonner';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Home, RefreshCw } from 'lucide-react';
import ResponsiveEmbed from '@/components/ResponsiveEmbed'; // Use the new ResponsiveEmbed
import CasinoGameGrid from '@/components/casino/CasinoGameGrid';

const GameLauncher = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { launchGame, getGameById, games: allGames, isLoading: gamesLoading } = useGames();
  const { user, isAuthenticated } = useAuth();
  const [game, setGame] = useState<Game | null>(null);
  const [launchUrl, setLaunchUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedGames, setRelatedGames] = useState<Game[]>([]);

  const loadGameDetails = useCallback(async () => {
    if (!gameId) {
      setError("No game ID provided.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fetchedGame = await getGameById(gameId);
      if (fetchedGame) {
        setGame(fetchedGame);
        // Simulate fetching related games (e.g., same category or provider)
        const filteredRelatedGames = allGames
          .filter(g => g.id !== fetchedGame.id && (g.category === fetchedGame.category || g.provider === fetchedGame.provider))
          .slice(0, 6); // Show up to 6 related games
        setRelatedGames(filteredRelatedGames);

      } else {
        setError("Game not found.");
        toast.error("Game not found.");
      }
    } catch (err: any) {
      console.error("Error fetching game details:", err);
      setError(err.message || "Failed to load game details.");
      toast.error(err.message || "Failed to load game details.");
    } finally {
      setIsLoading(false);
    }
  }, [gameId, getGameById, allGames]);

  useEffect(() => {
    loadGameDetails();
  }, [loadGameDetails]);


  const handleLaunchGame = useCallback(async (mode: 'real' | 'demo' = 'real') => {
    if (!game) {
      toast.error("Game data is not loaded yet.");
      return;
    }
    if (mode === 'real' && !isAuthenticated) {
      toast.error("Please log in to play for real money.");
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    setIsLoading(true);
    setError(null);

    const launchOptions: GameLaunchOptions = {
      mode,
      playerId: user?.id || 'demo-player',
      currency: user?.currency || 'USD', 
      platform: 'web', 
      language: user?.language || 'en',
      returnUrl: `${window.location.origin}/casino` 
    };

    try {
      const url = await launchGame(game, launchOptions);
      if (url) {
        setLaunchUrl(url);
      } else {
        setError("Could not retrieve game launch URL.");
        toast.error("Could not retrieve game launch URL. The game might be unavailable.");
      }
    } catch (err: any) {
      console.error("Error launching game:", err);
      setError(err.message || "Failed to launch game.");
      toast.error(err.message || "Failed to launch game. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [game, isAuthenticated, user, launchGame, navigate, location.pathname]);

  useEffect(() => {
    if (game && !launchUrl && !isLoading && !error) {
      if(!isAuthenticated || game.tags?.includes('demo_only')) { 
         handleLaunchGame('demo');
      }
    }
  }, [game, launchUrl, isLoading, error, handleLaunchGame, isAuthenticated]);


  if (isLoading && !game) { 
    return (
      <div className="container mx-auto p-4 min-h-[calc(100vh-200px)] flex flex-col items-center justify-center text-center">
        <Loader2 className="h-12 w-12 animate-spin text-casino-thunder-green mb-4" />
        <p className="text-xl font-semibold">Loading Game...</p>
        <p className="text-white/70">Please wait while we prepare your game.</p>
      </div>
    );
  }

  if (error && !launchUrl) { 
    return (
      <div className="container mx-auto p-4 min-h-[calc(100vh-200px)] flex flex-col items-center justify-center text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-xl font-semibold text-red-400">Error Loading Game</p>
        <p className="text-white/70 mb-6">{error}</p>
        <div className="flex gap-4">
          <Button onClick={() => navigate('/casino')} variant="outline">
            <Home className="mr-2 h-4 w-4" /> Go to Casino
          </Button>
          <Button onClick={loadGameDetails} >
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      {game && (
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{game.title}</h1>
          <p className="text-white/80">Provider: {game.providerName || game.provider}</p>
        </div>
      )}

      {isLoading && launchUrl && ( 
         <div className="w-full bg-black rounded-lg shadow-xl overflow-hidden mb-8">
            <AspectRatio ratio={16 / 9}>
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-casino-thunder-green" />
                </div>
            </AspectRatio>
        </div>
      )}
      
      {!isLoading && launchUrl && (
        // Use the ResponsiveEmbed component here
        <ResponsiveEmbed src={launchUrl} title={game?.title || 'Game'} />
      )}
      
      {!launchUrl && !isLoading && !error && game && ( 
         <div className="w-full bg-black rounded-lg shadow-xl overflow-hidden mb-8">
            <AspectRatio ratio={16 / 9} className="bg-gray-800 flex flex-col items-center justify-center">
                <img src={game.image || game.cover || '/placeholder.svg'} alt={game.title} className="max-h-[200px] mb-4 opacity-50" />
                <p className="text-lg text-white/70 mb-2">Ready to play {game.title}?</p>
                 <div className="flex gap-4">
                    {isAuthenticated && (
                        <Button onClick={() => handleLaunchGame('real')} size="lg" className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">
                            Play Real Money
                        </Button>
                    )}
                    <Button onClick={() => handleLaunchGame('demo')} size="lg" variant="outline">
                        Play Demo
                    </Button>
                </div>
            </AspectRatio>
        </div>
      )}

      {game && (
        <div className="my-8 p-6 bg-casino-thunder-dark rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2">Game Details</h3>
          <p className="text-sm text-white/70 mb-1"><strong>RTP:</strong> {game.rtp ? `${game.rtp}%` : 'N/A'}</p>
          <p className="text-sm text-white/70 mb-1"><strong>Volatility:</strong> {game.volatility || 'N/A'}</p>
          {game.description && <p className="text-sm text-white/70 mt-2">{game.description}</p>}
        </div>
      )}

      {relatedGames.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">You Might Also Like</h2>
          <CasinoGameGrid 
            games={relatedGames} 
            onGameClick={(clickedGame) => navigate(`/casino/game/${clickedGame.id}`)} 
          />
        </div>
      )}
    </div>
  );
};

export default GameLauncher;
