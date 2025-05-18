
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Game, GameLaunchOptions, User } from '@/types';
import { useGames } from '@/hooks/useGames';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Play, Heart, ExternalLink, AlertTriangle, Loader2 } from 'lucide-react'; // Added AlertTriangle
import GameProperties from '@/components/games/GameProperties';
import RelatedGames from '@/components/games/RelatedGames';
import GameReviews from '@/components/games/GameReviews'; // Placeholder
import { Separator } from '@/components/ui/separator';
import MobileWalletSummary from '@/components/user/MobileWalletSummary';

const GameDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { 
    getGameBySlug, // Assuming this exists or getGameById can be adapted
    launchGame, 
    incrementGameView,
    favoriteGameIds,
    toggleFavoriteGame,
    getRelatedGames // Assuming this function exists in useGames
  } = useGames();
  const { user, isAuthenticated, refreshWalletBalance } = useAuth(); // Get user from auth

  const [game, setGame] = useState<Game | null>(null);
  const [relatedGames, setRelatedGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);

  const isFavorite = game ? favoriteGameIds.has(game.id) : false;

  const fetchGameData = useCallback(async () => {
    if (!slug) {
      toast.error('Game slug not found.');
      setLoading(false);
      navigate('/casino/main');
      return;
    }
    setLoading(true);
    try {
      const fetchedGame = await getGameBySlug(slug); // Use getGameBySlug
      if (fetchedGame) {
        setGame(fetchedGame);
        await incrementGameView(fetchedGame.id);
        const fetchedRelatedGames = await getRelatedGames(fetchedGame.category, fetchedGame.id, 5);
        setRelatedGames(fetchedRelatedGames);
      } else {
        toast.error('Game not found.');
        navigate('/casino/main');
      }
    } catch (error) {
      console.error('Error fetching game details:', error);
      toast.error('Failed to load game details.');
    } finally {
      setLoading(false);
    }
  }, [slug, getGameBySlug, incrementGameView, navigate, getRelatedGames]);

  useEffect(() => {
    fetchGameData();
  }, [fetchGameData]);
  
  useEffect(() => {
    // Clear iframe when component unmounts or game changes
    return () => setIframeUrl(null);
  }, [slug]);

  const handleLaunchGame = async (mode: 'real' | 'demo') => {
    if (!game || !user) {
      toast.error('Game or user data is missing.');
      if (!isAuthenticated) navigate('/auth/login');
      return;
    }
    if(mode === 'real' && !isAuthenticated){
      toast.info('Please log in to play with real money.');
      navigate('/auth/login');
      return;
    }

    setIsLaunching(true);
    setIframeUrl(null); // Clear previous iframe if any

    const options: GameLaunchOptions = {
      mode,
      playerId: user.id,
      currency: user.currency || 'USD', // Fallback currency
      platform: 'web', 
      language: user.language || 'en', // Fallback language
      returnUrl: window.location.href,
    };

    try {
      const url = await launchGame(game, options);
      if (url) {
        setIframeUrl(url);
      } else {
        toast.error('Failed to launch game. Please try again.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error launching game.');
      console.error("Game launch error:", error);
    } finally {
      setIsLaunching(false);
    }
  };

  const handleToggleFavorite = () => {
    if (!game) return;
    if (!isAuthenticated) {
      toast.info("Please log in to add favorites.");
      navigate('/auth/login');
      return;
    }
    toggleFavoriteGame(game.id);
  };
  
  const handleRefreshWallet = async () => {
    if (refreshWalletBalance) {
      await refreshWalletBalance();
      toast.success("Wallet balance refreshed!");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-8 min-h-screen flex justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold mb-2">Game Not Found</h1>
        <p className="text-muted-foreground mb-6">The game you are looking for does not exist or could not be loaded.</p>
        <Button onClick={() => navigate('/casino/main')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back to Games
        </Button>
      </div>
    );
  }
  
  const openGameInNewTab = () => {
    if (iframeUrl) {
      window.open(iframeUrl, '_blank');
    } else {
      toast.info("Launch the game first to open in a new tab.");
    }
  };


  return (
    <div className="container mx-auto p-2 md:p-4 lg:p-6">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-4 self-start">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      {/* Mobile Wallet Summary - only on mobile */}
      <div className="md:hidden mb-4">
        <MobileWalletSummary user={user} showRefresh={true} onRefresh={handleRefreshWallet} />
      </div>

      {iframeUrl ? (
        <div className="mb-6">
          <AspectRatio ratio={16 / 9} className="bg-black rounded-lg overflow-hidden">
            <iframe
              src={iframeUrl}
              title={game.title}
              className="w-full h-full border-0"
              allowFullScreen
            />
          </AspectRatio>
          <div className="mt-2 flex justify-end">
            <Button variant="outline" size="sm" onClick={openGameInNewTab}>
              <ExternalLink className="mr-2 h-4 w-4" /> Open in New Tab
            </Button>
          </div>
        </div>
      ) : (
        game.banner && !isLaunching && (
          <div className="mb-6 relative group bg-card rounded-lg overflow-hidden">
            <img src={game.banner || game.image} alt={`${game.title} Banner`} className="w-full h-auto max-h-[400px] object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-4">
                <h1 className="text-3xl md:text-5xl font-bold text-white text-center mb-4 drop-shadow-lg">{game.title}</h1>
                <div className="flex space-x-3">
                    <Button size="lg" onClick={() => handleLaunchGame('real')} disabled={isLaunching} className="bg-primary hover:bg-primary/90">
                        <Play className="mr-2 h-5 w-5" /> {isLaunching ? 'Launching...' : 'Play Real'}
                    </Button>
                    <Button size="lg" variant="secondary" onClick={() => handleLaunchGame('demo')} disabled={isLaunching}>
                        {isLaunching ? 'Launching...' : 'Play Demo'}
                    </Button>
                </div>
            </div>
          </div>
        )
      )}
      {isLaunching && !iframeUrl && (
         <div className="mb-6 flex flex-col items-center justify-center p-10 border rounded-lg bg-card">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground text-lg">Launching {game.title}... Please wait.</p>
        </div>
      )}


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card p-4 sm:p-6 rounded-lg shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">{game.title}</h1>
                <p className="text-sm text-muted-foreground">by {game.providerName || game.provider}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleToggleFavorite} className="mt-2 sm:mt-0 self-start sm:self-center">
                <Heart className={`h-6 w-6 ${isFavorite ? 'text-red-500 fill-current' : 'text-muted-foreground'}`} />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {game.categoryName && <Badge variant="outline">{game.categoryName}</Badge>}
              {game.tags?.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
              {game.isNew && <Badge className="bg-green-500 text-white">New</Badge>}
              {game.is_featured && <Badge className="bg-purple-500 text-white">Featured</Badge>}
            </div>

            {game.description && <p className="text-muted-foreground mb-4">{game.description}</p>}
            
            <GameProperties game={game} />
          </div>
          
          <Separator />
          
          {/* Placeholder for Game Reviews */}
          {/* <GameReviews gameId={game.id} /> */}

        </div>

        <div className="md:col-span-1 space-y-6">
           {/* Desktop Wallet Summary / Actions */}
           <div className="hidden md:block bg-card p-4 rounded-lg shadow">
             <h3 className="text-lg font-semibold mb-3">Wallet</h3>
             <MobileWalletSummary user={user} showRefresh={true} onRefresh={handleRefreshWallet} />
             {/* Add deposit/withdrawal quick links if desired */}
           </div>

          {relatedGames.length > 0 && (
            <RelatedGames games={relatedGames} />
          )}
        </div>
      </div>
    </div>
  );
};

export default GameDetails;
