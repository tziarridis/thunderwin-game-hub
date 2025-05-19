
import React, { useState, useMemo, useEffect } from 'react';
import { Game, GameProvider as ProviderType } from '@/types';
import GameCard from '@/components/games/GameCard'; // General GameCard
import { useGames } from '@/hooks/useGames';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Search, FilterX } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProviderGameTabProps {
  provider: ProviderType;
}

const ITEMS_PER_PAGE = 12;

const ProviderGameTab: React.FC<ProviderGameTabProps> = ({ provider }) => {
  const { 
    games: allGames, 
    isLoading: isLoadingGames, 
    launchGame, 
    favoriteGameIds, 
    toggleFavoriteGame 
  } = useGames();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [providerGames, setProviderGames] = useState<Game[]>([]);
  const [isGameLaunching, setIsGameLaunching] = useState(false);


  useEffect(() => {
    const filtered = allGames.filter(game => 
        (game.provider_slug === provider.slug || game.providerName === provider.name || String(game.provider_id) === String(provider.id)) &&
        (!searchTerm || game.title.toLowerCase().includes(searchTerm.toLowerCase())) &&
        game.status !== 'inactive' && game.status !== 'archived' && !game.only_demo // Corrected check for demo_only
    );
    setProviderGames(filtered);
    setVisibleCount(ITEMS_PER_PAGE); // Reset pagination on filter or provider change
  }, [allGames, provider, searchTerm]);

  const displayedGames = useMemo(() => {
    return providerGames.slice(0, visibleCount);
  }, [providerGames, visibleCount]);

  const hasMore = useMemo(() => {
    return visibleCount < providerGames.length;
  }, [visibleCount, providerGames.length]);

  const loadMoreGames = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };
  
  const handlePlayGame = async (gameToPlay: Game) => {
    if (!isAuthenticated && !gameToPlay.only_demo) {
      toast.error("Please log in to play real money games.");
      navigate('/login');
      return;
    }
    setIsGameLaunching(true);
    try {
      const launchUrl = await launchGame(gameToPlay, { 
        mode: gameToPlay.only_demo || !isAuthenticated ? 'demo' : 'real',
        // user_id, username, currency, language will be set by launchGame from useAuth context
      });
      if (launchUrl) {
        window.open(launchUrl, '_blank');
      } else {
        toast.error(`Could not launch ${gameToPlay.title}.`);
      }
    } catch (error: any) {
      toast.error(`Error launching ${gameToPlay.title}: ${error.message}`);
    } finally {
      setIsGameLaunching(false);
    }
  };

  return (
    <div className="py-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-white">Games by {provider.name}</h2>
        <div className="relative w-full sm:w-auto sm:min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder={`Search in ${provider.name}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full bg-card border-border focus:ring-primary text-white"
          />
          {searchTerm && (
            <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setSearchTerm('')}>
              <FilterX className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {isLoadingGames && displayedGames.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg bg-slate-700" />
          ))}
        </div>
      ) : displayedGames.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {displayedGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                isFavorite={favoriteGameIds.has(String(game.id))}
                onToggleFavorite={() => toggleFavoriteGame(String(game.id))}
                onPlay={() => handlePlayGame(game)}
              />
            ))}
          </div>
          {hasMore && (
            <div className="text-center mt-8">
              <Button onClick={loadMoreGames} variant="outline" disabled={isLoadingGames || isGameLaunching}>
                {isLoadingGames || isGameLaunching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Games'
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          <FilterX className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg">No games found {searchTerm ? `for "${searchTerm}"` : ""} from {provider.name}.</p>
        </div>
      )}
    </div>
  );
};

export default ProviderGameTab;

