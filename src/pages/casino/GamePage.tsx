import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Game, DisplayGame } from '@/types/game'; // Use DisplayGame
import { WalletType } from '@/types/wallet'; // Corrected import
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Star, Info, Users, BarChart3, AlertTriangle, Loader2, Heart } from 'lucide-react';
import GameSuggestions from '@/components/games/GameSuggestions';
import { useGames } from '@/hooks/useGames'; // For favorites

const GamePage: React.FC = () => {
  const { gameSlug } = useParams<{ gameSlug: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { favoriteGameIds, toggleFavoriteGame, isLoading: favoritesLoading } = useGames();
  const location = useLocation();

  const [game, setGame] = useState<DisplayGame | null>(null);
  const [isLoadingGame, setIsLoadingGame] = useState(true);
  const [gameLaunchUrl, setGameLaunchUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // const [wallet, setWallet] = useState<WalletType | null>(null); // Wallet might come from AuthContext or a dedicated WalletContext

  const fetchGameDetails = useCallback(async () => {
    if (!gameSlug) return;
    setIsLoadingGame(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('games')
        .select('*')
        .or(`slug.eq.${gameSlug},id.eq.${gameSlug}`) // Allow fetching by ID if slug fails or isn't primary identifier
        .single();

      if (dbError) throw dbError;
      if (!data) throw new Error('Game not found.');
      
      const displayGameData: DisplayGame = {
        ...(data as Game), // Cast to base Game type first
        isFavorite: favoriteGameIds.has(String(data.id)), // Check if favorite
      };
      setGame(displayGameData);

    } catch (err: any) {
      console.error("Error fetching game details:", err);
      setError(err.message || "Failed to load game details.");
      toast.error(err.message || "Failed to load game details.");
    } finally {
      setIsLoadingGame(false);
    }
  }, [gameSlug, favoriteGameIds]);

  useEffect(() => {
    fetchGameDetails();
  }, [fetchGameDetails]); // gameSlug is part of fetchGameDetails dependencies

  // Update favorite status if favoriteGameIds change externally
   useEffect(() => {
    if (game) {
      setGame(prevGame => prevGame ? { ...prevGame, isFavorite: favoriteGameIds.has(String(prevGame.id)) } : null);
    }
  }, [favoriteGameIds, game?.id]);


  const handlePlayGame = async (mode: 'real' | 'demo') => {
    if (!game) return;
    if (!isAuthenticated && mode === 'real') {
      toast.info("Please log in to play with real money.");
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    toast.info(`Launching ${game.title} in ${mode} mode... (Placeholder)`);
    // Placeholder for game launch URL logic
    // const launchUrl = await getGameLaunchUrl(game.id, mode, user?.id);
    // if (launchUrl) setGameLaunchUrl(launchUrl); else toast.error("Could not launch game.");
    // For demo, often a direct URL:
    setGameLaunchUrl(game.game_url_demo || game.game_url || `https://example.com/play/${game.slug}?mode=${mode}`);
  };
  
  const handleToggleFavorite = async () => {
    if (!game) return;
    if (!isAuthenticated) {
      toast.info("Please log in to manage favorites.");
      return;
    }
    await toggleFavoriteGame(String(game.id)); // toggleFavoriteGame handles optimistic updates and toasts
    // No need to manually setGame here as useEffect on favoriteGameIds will update it
  };


  if (isLoadingGame || authLoading || favoritesLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (error || !game) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Game Not Found</h1>
        <p className="text-muted-foreground mb-6">{error || "The game you are looking for could not be found or loaded."}</p>
        <Button onClick={() => navigate('/casino')}>Back to Games</Button>
      </div>
    );
  }
  
  const gameProvider = game.providerName || game.provider_slug || 'Unknown Provider';
  const gameCategories = (game.category_slugs || []).join(', ').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A';


  return (
    <div className="container mx-auto py-8 px-4">
      {/* Game iframe or launch area */}
      {gameLaunchUrl ? (
        <AspectRatio ratio={16 / 9} className="bg-black rounded-lg overflow-hidden shadow-xl mb-8">
          <iframe
            src={gameLaunchUrl}
            title={game.title}
            className="w-full h-full border-0"
            allowFullScreen
            // sandbox="allow-scripts allow-same-origin allow-popups" // Adjust sandbox as needed
          />
        </AspectRatio>
      ) : (
         <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden shadow-xl mb-8 flex items-center justify-center">
          <img src={game.banner || game.cover || game.image_url || '/placeholder-game-banner.png'} alt={game.title} className="w-full h-full object-cover" />
          {/* Overlay with play buttons */}
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-4 p-4">
            <h1 className="text-4xl font-bold text-white text-center mb-4 drop-shadow-lg">{game.title}</h1>
             <div className="flex gap-4">
                <Button size="lg" onClick={() => handlePlayGame('real')} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Play Real
                </Button>
                {game.has_demo !== false && ( // Show demo if has_demo is true or undefined (default to true)
                    <Button size="lg" variant="outline" onClick={() => handlePlayGame('demo')} className="border-primary text-primary hover:bg-primary/10">
                    Play Demo
                    </Button>
                )}
            </div>
          </div>
        </AspectRatio>
      )}

      {/* Game Info and Actions */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold">{game.title}</h1>
              <p className="text-lg text-muted-foreground">by {gameProvider}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleToggleFavorite} disabled={favoritesLoading || !isAuthenticated} className={game.isFavorite ? "text-yellow-400 hover:text-yellow-500" : "text-muted-foreground hover:text-foreground"}>
              {favoritesLoading && game.id === (favoriteGameIds.has(String(game.id)) ? String(game.id) : null) ? <Loader2 className="h-6 w-6 animate-spin"/> : (game.isFavorite ? <Heart fill="currentColor" className="h-6 w-6"/> : <Heart className="h-6 w-6"/>)}
              <span className="sr-only">{game.isFavorite ? 'Remove from favorites' : 'Add to favorites'}</span>
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {game.isNew && <Badge variant="success">New</Badge>}
            {game.is_featured && <Badge variant="default">Featured</Badge>}
            {game.rtp && <Badge variant="outline">RTP: {game.rtp}%</Badge>}
            {game.volatility && <Badge variant="outline" className="capitalize">Volatility: {game.volatility}</Badge>}
            {game.lines && <Badge variant="outline">Lines: {game.lines}</Badge>}
            {game.has_freespins && <Badge variant="secondary">Freespins</Badge>}
          </div>

          <Tabs defaultValue="description" className="w-full">
            <TabsList>
              <TabsTrigger value="description"><Info className="mr-2 h-4 w-4"/>Description</TabsTrigger>
              <TabsTrigger value="details"><BarChart3 className="mr-2 h-4 w-4"/>Details</TabsTrigger>
              {/* <TabsTrigger value="reviews"><Users className="mr-2 h-4 w-4"/>Reviews</TabsTrigger> */}
            </TabsList>
            <TabsContent value="description" className="pt-4 prose max-w-none dark:prose-invert">
              <p>{game.description || "No description available for this game."}</p>
            </TabsContent>
            <TabsContent value="details" className="pt-4">
              <ul className="space-y-1 text-sm">
                <li><strong>Provider:</strong> {gameProvider}</li>
                <li><strong>Categories:</strong> {gameCategories}</li>
                <li><strong>Release Date:</strong> {game.releaseDate ? new Date(game.releaseDate).toLocaleDateString() : 'N/A'}</li>
                {/* Add more details as available */}
              </ul>
            </TabsContent>
            {/* <TabsContent value="reviews" className="pt-4">
              <p>Player reviews coming soon!</p>
            </TabsContent> */}
          </Tabs>
        </div>

        <div className="md:col-span-1 space-y-6">
            <Card>
                <CardHeader><CardTitle>Game Overview</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <p><strong>Provider:</strong> {gameProvider}</p>
                    <p><strong>Categories:</strong> {gameCategories}</p>
                    {game.rtp && <p><strong>RTP:</strong> {game.rtp}%</p>}
                    {game.volatility && <p className="capitalize"><strong>Volatility:</strong> {game.volatility}</p>}
                </CardContent>
            </Card>
           {/* Placeholder for Wallet Summary or Responsible Gaming info */}
           {/* {isAuthenticated && user && (
             <Card>
               <CardHeader><CardTitle>Your Balance</CardTitle></CardHeader>
               <CardContent>
                 <p>Wallet info placeholder. User: {user.email}</p>
               </CardContent>
             </Card>
           )} */}
        </div>
      </div>

      {/* Suggested Games */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">You Might Also Like</h2>
        <GameSuggestions currentGameId={String(game.id)} categorySlugs={game.category_slugs} count={5} />
      </div>
    </div>
  );
};

export default GamePage;
