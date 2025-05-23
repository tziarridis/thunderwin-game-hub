import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Game } from '@/types/game';
import { toast } from 'sonner';

interface PaginationOptions {
  page: number;
  limit: number;
}

interface SearchOptions {
  query?: string;
  category?: string;
  provider?: string;
  tag?: string;
}

interface GamesContextType {
  games: Game[];
  isLoadingGames: boolean;
  isLoading: boolean;
  gamesError: string | null;
  favoriteGameIds: Set<string>;
  toggleFavoriteGame: (gameId: string) => void;
  launchGame: (game: Game, options?: any) => Promise<string | null>;
  getFeaturedGames?: (count?: number) => Promise<Game[]>;
  getGameLaunchUrl?: (game: Game, options?: any) => Promise<string | null>;
  handlePlayGame?: (game: Game, mode?: string) => void;
  handleGameDetails?: (game: Game) => void;
  searchGames: (query: string) => Game[];
  getGamesByCategory: (category: string) => Game[];
  refreshGames: () => Promise<void>;
  loadMoreGames: () => Promise<void>;
  hasMoreGames: boolean;
  currentPage: number;
  getGameById: (id: string) => Promise<Game | null>;
  getGameBySlug: (slug: string) => Promise<Game | null>;
}

const GamesContext = createContext<GamesContextType | undefined>(undefined);

// Improved mock games data with pagination support
const generateMockGames = (count: number = 50): Game[] => {
  const games: Game[] = [];
  const providers = ['Pragmatic Play', 'NetEnt', 'Microgaming', 'Play\'n GO', 'Evolution'];
  const categories = ['slots', 'table-games', 'live-casino', 'jackpots'];
  
  for (let i = 1; i <= count; i++) {
    games.push({
      id: `game-${i}`,
      slug: `game-slug-${i}`,
      name: `Game ${i}`,
      title: `Game ${i}`,
      game_name: `Game ${i}`,
      provider_name: providers[i % providers.length],
      provider_slug: `provider-${i % providers.length}`,
      category_name: categories[i % categories.length],
      category_slugs: [categories[i % categories.length]],
      game_type: categories[i % categories.length],
      cover: '/placeholder.svg',
      thumbnail: '/placeholder.svg',
      image: '/placeholder.svg',
      image_url: '/placeholder.svg',
      rtp: 95 + Math.random() * 5,
      volatility: ['low', 'medium', 'high'][i % 3],
      is_mobile: true,
      is_featured: i <= 10,
      isPopular: i <= 20,
      isNew: i <= 5,
      is_new: i <= 5,
      only_real: i % 7 === 0, // Some games are real money only
      only_demo: i % 11 === 0, // Some games are demo only
      tags: ['featured'],
      created_at: new Date().toISOString()
    });
  }
  return games;
};

export const GamesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [displayedGames, setDisplayedGames] = useState<Game[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(true);
  const [gamesError, setGamesError] = useState<string | null>(null);
  const [favoriteGameIds, setFavoriteGameIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreGames, setHasMoreGames] = useState(true);
  const gamesPerPage = 20; // Reduced from 50 to 20 for better performance

  // Memoize expensive operations
  const memoizedGames = useMemo(() => displayedGames, [displayedGames]);

  const loadInitialGames = useCallback(async () => {
    try {
      console.log('Loading initial games');
      setIsLoadingGames(true);
      setGamesError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      const mockGames = generateMockGames(100); // Generate 100 games in total
      
      setAllGames(mockGames);
      setDisplayedGames(mockGames.slice(0, gamesPerPage));
      setHasMoreGames(mockGames.length > gamesPerPage);
      
      console.log(`Loaded ${mockGames.slice(0, gamesPerPage).length} games`);
    } catch (error) {
      console.error('Error loading games:', error);
      setGamesError('Failed to load games');
      toast.error('Failed to load games');
    } finally {
      setIsLoadingGames(false);
    }
  }, []);

  const loadMoreGames = useCallback(async () => {
    try {
      console.log('Loading more games');
      if (!hasMoreGames) {
        return;
      }
      
      setIsLoadingGames(true);
      
      // Calculate next page
      const nextPage = currentPage + 1;
      const startIndex = (nextPage - 1) * gamesPerPage;
      const endIndex = startIndex + gamesPerPage;
      
      // Check if we have more games to load
      if (startIndex >= allGames.length) {
        setHasMoreGames(false);
        return;
      }
      
      // Get next batch of games
      const nextGames = allGames.slice(0, endIndex);
      setDisplayedGames(nextGames);
      setCurrentPage(nextPage);
      setHasMoreGames(endIndex < allGames.length);
      
      console.log(`Loaded ${nextGames.length} games total`);
    } catch (error) {
      console.error('Error loading more games:', error);
      toast.error('Failed to load more games');
    } finally {
      setIsLoadingGames(false);
    }
  }, [currentPage, hasMoreGames, allGames, gamesPerPage]);

  const refreshGames = useCallback(async () => {
    setCurrentPage(1);
    await loadInitialGames();
  }, [loadInitialGames]);

  useEffect(() => {
    console.log('GamesProvider mounted');
    loadInitialGames();
    
    // Cleanup function
    return () => {
      console.log('GamesProvider unmounted');
      setAllGames([]);
      setDisplayedGames([]);
      setGamesError(null);
    };
  }, [loadInitialGames]);

  const toggleFavoriteGame = useCallback((gameId: string) => {
    setFavoriteGameIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(gameId)) {
        newSet.delete(gameId);
      } else {
        newSet.add(gameId);
      }
      return newSet;
    });
  }, []);

  const launchGame = useCallback(async (game: Game, options?: any) => {
    try {
      console.log('Launching game:', game.name || game.game_name, 'with options:', options);
      // Mock game launch
      await new Promise(resolve => setTimeout(resolve, 300));
      return `https://demo-game-url.com/${game.slug || game.id}`;
    } catch (error) {
      console.error('Error launching game:', error);
      throw new Error('Failed to launch game');
    }
  }, []);

  const getFeaturedGames = useCallback(async (count: number = 8): Promise<Game[]> => {
    return allGames.filter(game => game.is_featured).slice(0, count);
  }, [allGames]);

  const getGameLaunchUrl = useCallback(async (game: Game, options?: any): Promise<string | null> => {
    try {
      console.log('Getting game launch URL for:', game.name || game.game_name, 'with options:', options);
      // Mock game launch URL
      await new Promise(resolve => setTimeout(resolve, 300));
      return `https://demo-game-url.com/${game.slug || game.id}`;
    } catch (error) {
      console.error('Error getting game launch URL:', error);
      throw new Error('Failed to get game launch URL');
    }
  }, []);

  const searchGames = useCallback((query: string): Game[] => {
    if (!query.trim()) return memoizedGames;
    
    const lowercaseQuery = query.toLowerCase();
    return memoizedGames.filter(game => 
      (game.name || game.game_name || '').toLowerCase().includes(lowercaseQuery) ||
      (game.provider_name || '').toLowerCase().includes(lowercaseQuery)
    );
  }, [memoizedGames]);

  const getGamesByCategory = useCallback((category: string): Game[] => {
    return memoizedGames.filter(game => 
      game.category_name === category || 
      game.game_type === category
    );
  }, [memoizedGames]);

  const getGameById = useCallback(async (id: string): Promise<Game | null> => {
    const game = allGames.find(g => g.id === id);
    return game || null;
  }, [allGames]);

  const getGameBySlug = useCallback(async (slug: string): Promise<Game | null> => {
    const game = allGames.find(g => g.slug === slug);
    return game || null;
  }, [allGames]);

  const handlePlayGame = useCallback((game: Game, mode?: string) => {
    console.log(`Playing game ${game.name || game.title} in ${mode || 'default'} mode`);
    launchGame(game, { mode: mode || 'demo' })
      .then(url => {
        if (url) {
          window.open(url, '_blank');
        }
      })
      .catch(error => {
        console.error('Failed to play game:', error);
        toast.error('Failed to launch game');
      });
  }, [launchGame]);

  const handleGameDetails = useCallback((game: Game) => {
    console.log('Viewing game details for:', game.name || game.title);
  }, []);

  const value: GamesContextType = {
    games: memoizedGames,
    isLoadingGames,
    isLoading: isLoadingGames,
    gamesError,
    favoriteGameIds,
    toggleFavoriteGame,
    launchGame,
    getFeaturedGames,
    getGameLaunchUrl,
    handlePlayGame,
    handleGameDetails,
    searchGames,
    getGamesByCategory,
    refreshGames,
    loadMoreGames,
    hasMoreGames,
    currentPage,
    getGameById,
    getGameBySlug
  };

  return (
    <GamesContext.Provider value={value}>
      {children}
    </GamesContext.Provider>
  );
};

export const useGames = (): GamesContextType => {
  const context = useContext(GamesContext);
  if (context === undefined) {
    throw new Error('useGames must be used within a GamesProvider');
  }
  return context;
};
