import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Game } from '@/types';
import { useGames } from '@/hooks/useGames';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, PlayCircle, CircleDollarSign, Heart, HeartCrack, SearchX, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Placeholder components - replace with actual implementations
const GameProperties = ({ game }: { game: Game | null }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div className="bg-muted/50 p-3 rounded-lg">
      <p className="text-sm text-muted-foreground">RTP</p>
      <p className="font-medium">{game?.rtp || 'N/A'}%</p>
    </div>
    <div className="bg-muted/50 p-3 rounded-lg">
      <p className="text-sm text-muted-foreground">Volatility</p>
      <p className="font-medium">{game?.volatility || 'N/A'}</p>
    </div>
    <div className="bg-muted/50 p-3 rounded-lg">
      <p className="text-sm text-muted-foreground">Mobile Compatible</p>
      <p className="font-medium">{game?.is_mobile_compatible ? 'Yes' : 'No'}</p>
    </div>
    <div className="bg-muted/50 p-3 rounded-lg">
      <p className="text-sm text-muted-foreground">Provider</p>
      <p className="font-medium">{game?.provider_id || 'N/A'}</p>
    </div>
  </div>
);

const GameReviews = ({ gameId, user }: { gameId: string, user: any }) => (
  <Card>
    <CardContent className="p-6">
      <p className="text-muted-foreground">Reviews coming soon.</p>
      {user && <Button className="mt-4" disabled>Write a Review</Button>}
      {!user && <p className="text-sm text-muted-foreground mt-2">Please log in to leave a review.</p>}
    </CardContent>
  </Card>
);

const RelatedGames = ({ categoryId, currentGameId }: { categoryId?: string, currentGameId: string }) => (
  <Card>
    <CardContent className="p-6">
      <p className="text-muted-foreground">Related games coming soon.</p>
    </CardContent>
  </Card>
);

const GamePage: React.FC = () => {
  const { gameIdOrSlug } = useParams<{ gameIdOrSlug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // From useGames hook for favorite functionality
  const { favoriteGameIds, toggleFavoriteGame, launchGame } = useGames();

  // Replace with actual useQuery from @tanstack/react-query
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGameDetails = async () => {
      if (!gameIdOrSlug) {
        setError("Game identifier is missing.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        // const fetchedGame = await gameService.getGameBySlugOrId(gameIdOrSlug);
        // Simulate fetch:
        const fetchedGame: Game | null = { 
            id: gameIdOrSlug, slug: gameIdOrSlug, title: `Awesome Game ${gameIdOrSlug}`, description: 'An amazing game experience awaits you.', 
            provider_id: 'provider1', category_id: 'slots', tags: ['popular', 'new'], 
            image_url: '/placeholder.svg', launch_url_patterns: {real: "/launch/real/{gameId}", demo: "/launch/demo/{gameId}"}, 
            status: 'active', rtp: 96.5, volatility: 'medium', features: ['free_spins', 'bonus_round'],
            is_mobile_compatible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
            // Ensure all Game type fields are present
        } as Game; // Cast as Game, ensuring all fields from types/game.ts are covered
        
        if (fetchedGame) {
          setGame(fetchedGame);
        } else {
          setError("Game not found.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load game details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchGameDetails();
  }, [gameIdOrSlug]);

  const handlePlayGame = async (mode: 'real' | 'demo') => {
    if (!game) return;
    try {
      toast.info(`Launching ${game.title} in ${mode} mode...`);
      const launchUrl = await launchGame(game, { mode });
      if (launchUrl) {
        // In a real scenario, this might open in an iframe or new tab
        // For iframe, you might need a component like ResponsiveEmbed
        // window.open(launchUrl, '_blank'); // Example: open in new tab
        alert(`Simulating game launch to: ${launchUrl}`);
      } else {
        toast.error("Could not get launch URL for the game.");
      }
    } catch (e: any) {
      toast.error(`Error launching game: ${e.message}`);
    }
  };
  
  const handleToggleFavorite = () => {
    if (!user) {
      toast.error("Please log in to manage favorites.");
      navigate('/login');
      return;
    }
    if (game) {
      toggleFavoriteGame(String(game.id));
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Error Loading Game</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => navigate('/casino/main')} className="mt-6">Back to Games</Button>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <SearchX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Game Not Found</h2>
        <p className="text-muted-foreground">The game you are looking for does not exist or is currently unavailable.</p>
        <Button onClick={() => navigate('/casino/main')} className="mt-6">Back to Games</Button>
      </div>
    );
  }
  
  const isFavorite = favoriteGameIds.has(String(game.id));

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs or back button */}
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Games
      </Button>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Game Image & Actions */}
        <div className="md:col-span-1 space-y-4">
          <Card className="overflow-hidden">
            <AspectRatio ratio={4 / 3}>
              <img src={game?.image_url || '/placeholder.svg'} alt={game?.title} className="object-cover w-full h-full" />
            </AspectRatio>
          </Card>
          <div className="grid grid-cols-2 gap-3">
            <Button size="lg" onClick={() => handlePlayGame('real')} className="bg-green-600 hover:bg-green-700">
              <PlayCircle className="mr-2 h-5 w-5" /> Play Real
            </Button>
            <Button size="lg" variant="secondary" onClick={() => handlePlayGame('demo')}>
              <CircleDollarSign className="mr-2 h-5 w-5" /> Play Demo
            </Button>
          </div>
          <Button variant="outline" className="w-full" onClick={handleToggleFavorite} disabled={!user}>
            {isFavorite ? <HeartCrack className="mr-2 h-5 w-5 text-red-500" /> : <Heart className="mr-2 h-5 w-5" />}
            {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          </Button>
        </div>

        {/* Right Column: Game Details */}
        <div className="md:col-span-2 space-y-6">
          <header>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">{game?.title}</h1>
            {/* TODO: Fetch provider name based on game.provider_id */}
            <p className="text-lg text-muted-foreground">Provider: {game?.provider_id}</p> 
          </header>

          <div className="flex flex-wrap gap-2">
            {/* TODO: Fetch category name based on game.category_id */}
            <Badge variant="secondary" className="text-sm px-3 py-1">Category: {game?.category_id}</Badge>
            {game?.tags?.map(tag => <Badge key={tag} variant="outline" className="text-sm px-3 py-1">{tag}</Badge>)}
          </div>
          
          <Card>
            <CardHeader><CardTitle>Game Description</CardTitle></CardHeader>
            <CardContent>
              <p className="text-foreground/80 leading-relaxed">{game?.description || "No description available."}</p>
            </CardContent>
          </Card>

          <GameProperties game={game} />
          
          <Tabs defaultValue="rules" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="rules">How to Play</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="related">Related Games</TabsTrigger>
            </TabsList>
            <TabsContent value="rules" className="mt-4">
              <Card><CardContent className="p-6"><p>How to play information coming soon. RTP: {game?.rtp}%</p></CardContent></Card>
            </TabsContent>
            <TabsContent value="features" className="mt-4">
               <Card><CardContent className="p-6">
                <ul className="list-disc list-inside space-y-1">
                    {game?.features?.map(feature => <li key={feature}>{feature.replace(/_/g, ' ')}</li>) || <li>No special features listed.</li>}
                </ul>
               </CardContent></Card>
            </TabsContent>
            <TabsContent value="reviews" className="mt-4">
              <GameReviews gameId={String(game?.id)} user={user} />
            </TabsContent>
            <TabsContent value="related" className="mt-4">
              <RelatedGames categoryId={game?.category_id} currentGameId={String(game?.id)} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
