
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Game, GameProvider, GameCategory, GameLaunchOptions } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GamesContextType {
  games: Game[];
  providers: GameProvider[];
  categories: GameCategory[];
  isLoadingGames: boolean;
  isLoading: boolean;
  gamesError: Error | null;
  favoriteGameIds: Set<string>;
  getFavoriteGames: () => Promise<Game[]>;
  getFeaturedGames: (count?: number) => Promise<Game[]>;
  getGameBySlug: (slug: string) => Promise<Game | null>;
  getGameById: (id: string) => Promise<Game | null>;
  getGameLaunchUrl: (game: Game, options?: GameLaunchOptions) => Promise<string | null>;
  toggleFavoriteGame: (gameId: string) => Promise<void>;
  launchGame: (game: Game, options?: GameLaunchOptions) => Promise<string | null>;
  handlePlayGame: (game: Game, mode?: 'real' | 'demo') => Promise<void>;
  handleGameDetails: (game: Game) => void;
}

const GamesContext = createContext<GamesContextType | undefined>(undefined);

export const useGames = () => {
  const context = useContext(GamesContext);
  if (!context) {
    throw new Error('useGames must be used within a GamesProvider');
  }
  return context;
};

interface GamesProviderProps {
  children: ReactNode;
}

export const GamesProvider: React.FC<GamesProviderProps> = ({ children }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [providers, setProviders] = useState<GameProvider[]>([]);
  const [categories, setCategories] = useState<GameCategory[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(true);
  const [gamesError, setGamesError] = useState<Error | null>(null);
  const [favoriteGameIds, setFavoriteGameIds] = useState<Set<string>>(new Set());

  const isLoading = isLoadingGames;

  const fetchGames = async () => {
    try {
      setIsLoadingGames(true);
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;

      const mappedGames: Game[] = (data || []).map(game => ({
        id: game.id,
        title: game.game_name || 'Untitled Game',
        name: game.game_name,
        slug: game.game_code || game.id,
        description: game.description || '',
        image_url: game.cover || '',
        cover: game.cover,
        provider_id: game.provider_id,
        provider_slug: game.provider_slug || 'unknown',
        category_id: game.game_type || '',
        category: game.game_type,
        status: game.status,
        rtp: Number(game.rtp) || 0,
        created_at: game.created_at || new Date().toISOString(),
        updated_at: game.updated_at || new Date().toISOString(),
        isNew: game.is_new || false,
        isPopular: game.is_featured || false,
        is_featured: game.is_featured || false,
        is_new: game.is_new || false,
        show_home: game.show_home || false,
        features: game.features || [],
        tags: game.tags || [],
        has_lobby: game.has_lobby || false,
        is_mobile: game.is_mobile || false,
        has_freespins: game.has_freespins || false,
        has_tables: game.has_tables || false,
        only_demo: game.only_demo || false,
        views: game.views || 0,
      }));

      setGames(mappedGames);
      setGamesError(null);
    } catch (error: any) {
      console.error('Error fetching games:', error);
      setGamesError(error);
    } finally {
      setIsLoadingGames(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;

      const mappedProviders: GameProvider[] = (data || []).map(provider => ({
        id: provider.id,
        name: provider.name,
        slug: provider.name.toLowerCase().replace(/\s+/g, '-'),
        logo: provider.logo,
        logoUrl: provider.logo,
        created_at: provider.created_at,
      }));

      setProviders(mappedProviders);
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('game_categories')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;

      const mappedCategories: GameCategory[] = (data || []).map(category => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        icon: category.icon,
        created_at: category.created_at,
      }));

      setCategories(mappedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const getFavoriteGames = async (): Promise<Game[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('favorite_games')
        .select('game_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const favoriteGameIds = data.map(fav => fav.game_id);
      return games.filter(game => favoriteGameIds.includes(game.id));
    } catch (error) {
      console.error('Error fetching favorite games:', error);
      return [];
    }
  };

  const getFeaturedGames = async (count: number = 12): Promise<Game[]> => {
    const featuredGames = games.filter(game => game.is_featured);
    return featuredGames.slice(0, count);
  };

  const getGameBySlug = async (slug: string): Promise<Game | null> => {
    return games.find(game => game.slug === slug || game.id === slug) || null;
  };

  const getGameById = async (id: string): Promise<Game | null> => {
    return games.find(game => game.id === id) || null;
  };

  const getGameLaunchUrl = async (game: Game, options: GameLaunchOptions = {}): Promise<string | null> => {
    try {
      return `https://example.com/game/${game.slug}?mode=${options.mode || 'demo'}`;
    } catch (error: any) {
      console.error('Error getting game launch URL:', error);
      throw error;
    }
  };

  const toggleFavoriteGame = async (gameId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to manage favorites');
        return;
      }

      const isFavorite = favoriteGameIds.has(gameId);

      if (isFavorite) {
        const { error } = await supabase
          .from('favorite_games')
          .delete()
          .eq('user_id', user.id)
          .eq('game_id', gameId);

        if (error) throw error;

        setFavoriteGameIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(gameId);
          return newSet;
        });
        toast.success('Removed from favorites');
      } else {
        const { error } = await supabase
          .from('favorite_games')
          .insert([{ user_id: user.id, game_id: gameId }]);

        if (error) throw error;

        setFavoriteGameIds(prev => new Set(prev).add(gameId));
        toast.success('Added to favorites');
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const launchGame = async (game: Game, options: GameLaunchOptions = {}): Promise<string | null> => {
    try {
      return `https://example.com/game/${game.slug}?mode=${options.mode || 'demo'}`;
    } catch (error: any) {
      console.error('Error launching game:', error);
      throw error;
    }
  };

  const handlePlayGame = async (game: Game, mode: 'real' | 'demo' = 'demo') => {
    try {
      const url = await launchGame(game, { mode });
      if (url) {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error playing game:', error);
      toast.error('Failed to launch game');
    }
  };

  const handleGameDetails = (game: Game) => {
    window.location.href = `/casino/game/${game.slug || game.id}`;
  };

  useEffect(() => {
    fetchGames();
    fetchProviders();
    fetchCategories();
  }, []);

  const value: GamesContextType = {
    games,
    providers,
    categories,
    isLoadingGames,
    isLoading,
    gamesError,
    favoriteGameIds,
    getFavoriteGames,
    getFeaturedGames,
    getGameBySlug,
    getGameById,
    getGameLaunchUrl,
    toggleFavoriteGame,
    launchGame,
    handlePlayGame,
    handleGameDetails,
  };

  return <GamesContext.Provider value={value}>{children}</GamesContext.Provider>;
};
