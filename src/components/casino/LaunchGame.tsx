
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate }  from 'react-router-dom';
import { useGames } from '@/hooks/useGames'; // Provides launchGame
import { Game, GameLaunchOptions } from '@/types'; // Corrected import
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2, AlertTriangle } from 'lucide-react';
import ResponsiveEmbed from '@/components/ResponsiveEmbed';

const LaunchGame = () => {
  const { gameId } = useParams<{ gameId: string }>(); // gameId here is likely game slug from URL
  const navigate = useNavigate();
  const { launchGame, getGameBySlug, getGameById } = useGames(); // Assuming getGameBySlug exists
  const { user, isAuthenticated } = useAuth();
  const [gameData, setGameData] = useState<Game | null>(null);
  const [launchUrl, setLaunchUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndLaunch = async () => {
      if (!gameId) {
        setError("Game identifier missing.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch game details first
        let game = await getGameBySlug(gameId);
        if (!game) game = await getGameById(gameId); // Fallback to ID if slug fails

        if (!game) {
          throw new Error("Game not found.");
        }
        setGameData(game);

        // Determine mode: 'demo' if not authenticated, 'real' if authenticated (can be overridden by game tags)
        // This is a simplified logic; actual game launch might have more complex rules
        const mode: 'real' | 'demo' = isAuthenticated && !game.only_demo ? 'real' : 'demo';
        
        if (mode === 'real' && !isAuthenticated) {
             toast.error("Please log in to play real money games.");
             navigate("/login"); // Redirect to login
             setIsLoading(false);
             return;
        }


        const launchOptions: GameLaunchOptions = {
          mode,
          user_id: user?.id,
          username: user?.user_metadata?.username,
          currency: user?.user_metadata?.currency || 'USD',
          language: user?.user_metadata?.language || 'en',
          platform: 'web',
          returnUrl: window.location.origin + '/casino', // Example return URL
        };

        const url = await launchGame(game, launchOptions);
        if (url) {
          setLaunchUrl(url);
        } else {
          throw new Error("Could not retrieve game launch URL.");
        }
      } catch (err: any) {
        console.error("Error in LaunchGame component:", err);
        setError(err.message || "Failed to launch game.");
        toast.error(err.message || "Failed to launch game.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndLaunch();
  }, [gameId, launchGame, getGameBySlug, getGameById, user, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">Loading game session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] text-center p-4">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg text-destructive-foreground mb-2">Error Launching Game</p>
        <p className="text-muted-foreground mb-6">{error}</p>
        <button onClick={() => navigate('/casino')} className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
          Back to Casino
        </button>
      </div>
    );
  }

  if (!launchUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] text-center p-4">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg text-muted-foreground mb-6">Game launch URL not available.</p>
        <button onClick={() => navigate('/casino')} className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
           Back to Casino
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-var(--header-height,80px))]"> {/* Adjust var(--header-height) if you have a CSS var for header height */}
      <ResponsiveEmbed src={launchUrl} title={gameData?.title || "Game"} />
    </div>
  );
};

export default LaunchGame;

