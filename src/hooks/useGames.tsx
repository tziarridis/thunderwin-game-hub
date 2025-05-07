
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Game, GameCategory, GameLaunchOptions, GamesContextType } from '@/types';
import { gameAggregatorService } from '@/services/gameAggregatorService';
import { toast } from 'sonner';
import { gamesDatabaseService } from '@/services/gamesDatabaseService';
import { trackEvent } from '@/utils/analytics';

// Create a context for games
const GamesContext = createContext<GamesContextType>({
  games: [],
  categories: [],
  loading: false,
  error: null,
  popularGames: [],
  newGames: [],
  jackpotGames: [],
  liveGames: [],
  loadingMore: false,
  loadMore: () => {},
  hasMore: false,
  visibleCount: 0,
  totalCount: 0,
  toggleFavorite: async () => false,
  filterGames: () => [],
  loadGame: async () => null,
  launchGame: async () => '',
});

export const GamesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<GameCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadGames();
    loadCategories();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      const fetchedGames = await gamesDatabaseService.getAllGames();
      setGames(fetchedGames);
      setTotalCount(fetchedGames.length);
    } catch (err: any) {
      console.error('Error loading games:', err);
      setError(err.message || 'Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('game_categories')
        .select('*')
        .order('name');

      if (error) throw error;

      const formattedCategories: GameCategory[] = data.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon || '',
        image: cat.image || '',
        showHome: cat.show_home || false,
        status: cat.status,
        createdAt: cat.created_at,
        updatedAt: cat.updated_at
      }));

      setCategories(formattedCategories);
    } catch (err: any) {
      console.error('Error loading categories:', err);
    }
  };

  const loadMore = () => {
    setLoadingMore(true);
    setVisibleCount(prev => prev + 20);
    setLoadingMore(false);
  };

  const toggleFavorite = async (gameId: string): Promise<boolean> => {
    try {
      const game = games.find(g => g.id === gameId);
      if (!game) return false;

      const isFavorite = game.isFavorite;
      
      // Update local state immediately for UI responsiveness
      setGames(prev => 
        prev.map(g => g.id === gameId ? { ...g, isFavorite: !isFavorite } : g)
      );

      // Make API call to update in database
      const success = await gamesDatabaseService.toggleFavorite(gameId, '', isFavorite || false);
      
      if (!success) {
        // Revert if API call fails
        setGames(prev => 
          prev.map(g => g.id === gameId ? { ...g, isFavorite: isFavorite } : g)
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  };

  const filterGames = (category: string, searchTerm: string): Game[] => {
    let filtered = [...games];
    
    if (category && category !== 'all') {
      filtered = filtered.filter(g => g.category.toLowerCase() === category.toLowerCase());
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(g => 
        g.title.toLowerCase().includes(term) || 
        g.provider.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  };

  const loadGame = async (id: string): Promise<Game | null> => {
    try {
      return await gamesDatabaseService.getGameById(id);
    } catch (error) {
      console.error('Error loading game:', error);
      return null;
    }
  };

  const launchGame = async (game: Game, options: GameLaunchOptions): Promise<string> => {
    try {
      trackEvent('game_launch', {
        game_id: game.id,
        title: game.title,
        provider: game.provider,
        mode: options.mode
      });
      
      const response = await gameAggregatorService.createSession(
        game.id,
        options.playerId,
        options.currency,
        options.platform
      );
      
      if (!response.success || !response.gameUrl) {
        throw new Error(response.errorMessage || 'Failed to generate game URL');
      }
      
      return response.gameUrl;
    } catch (error: any) {
      console.error('Error launching game:', error);
      toast.error(error.message || 'Failed to launch game');
      throw error;
    }
  };

  const popularGames = games.filter(game => game.isPopular);
  const newGames = games.filter(game => game.isNew);
  const jackpotGames = games.filter(game => game.jackpot);
  const liveGames = games.filter(game => game.category === 'live');
  
  const hasMore = games.length > visibleCount;

  return (
    <GamesContext.Provider
      value={{
        games,
        categories,
        loading,
        error,
        popularGames,
        newGames,
        jackpotGames,
        liveGames,
        loadingMore,
        loadMore,
        hasMore,
        visibleCount,
        totalCount,
        toggleFavorite,
        filterGames,
        loadGame,
        launchGame
      }}
    >
      {children}
    </GamesContext.Provider>
  );
};

export const useGames = () => useContext(GamesContext);

export default useGames;
