
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Game } from '@/types/game';
import { toast } from 'sonner';

interface GamesContextType {
  games: Game[];
  isLoadingGames: boolean;
  gamesError: string | null;
  favoriteGameIds: Set<string>;
  toggleFavoriteGame: (gameId: string) => void;
  launchGame: (game: Game, options?: { mode?: 'demo' | 'real' }) => Promise<string | null>;
  getFeaturedGames?: (count?: number) => Promise<Game[]>;
  handlePlayGame?: (game: Game, mode?: string) => void;
  handleGameDetails?: (game: Game) => void;
  searchGames: (query: string) => Game[];
  getGamesByCategory: (category: string) => Game[];
  refreshGames: () => Promise<void>;
}

const GamesContext = createContext<GamesContextType | undefined>(undefined);

// Mock games data with pagination support
const generateMockGames = (count: number = 50): Game[] => {
  const games: Game[] = [];
  const providers = ['Pragmatic Play', 'NetEnt', 'Microgaming', 'Play\'n GO', 'Evolution'];
  const categories = ['slots', 'table-games', 'live-casino', 'jackpots'];
  
  for (let i = 1; i <= count; i++) {
    games.push({
      id: `game-${i}`,
      slug: `game-${i}`,
      game_name: `Game ${i}`,
      name: `Game ${i}`,
      provider_name: providers[i % providers.length],
      category_name: categories[i % categories.length],
      game_type: categories[i % categories.length],
      cover: '/placeholder.svg',
      rtp: 95 + Math.random() * 5,
      is_mobile: true,
      is_featured: i <= 10,
      isPopular: i <= 20,
      isNew: i <= 5,
      tags: ['featured'],
      created_at: new Date().toISOString()
    });
  }
  return games;
};

export const GamesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(true);
  const [gamesError, setGamesError] = useState<string | null>(null);
  const [favoriteGameIds, setFavoriteGameIds] = useState<Set<string>>(new Set());

  // Memoize expensive operations
  const memoizedGames = useMemo(() => games, [games]);

  const loadGames = useCallback(async () => {
    try {
      setIsLoadingGames(true);
      setGamesError(null);
      
      // Simulate API call with smaller dataset
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockGames = generateMockGames(50); // Reduced from 500 to 50
      
      setGames(mockGames);
    } catch (error) {
      console.error('Error loading games:', error);
      setGamesError('Failed to load games');
      toast.error('Failed to load games');
    } finally {
      setIsLoadingGames(false);
    }
  }, []);

  const refreshGames = useCallback(async () => {
    await loadGames();
  }, [loadGames]);

  useEffect(() => {
    loadGames();
    
    // Cleanup function
    return () => {
      setGames([]);
      setGamesError(null);
    };
  }, [loadGames]);

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

  const launchGame = useCallback(async (game: Game, options?: { mode?: 'demo' | 'real' }) => {
    try {
      console.log('Launching game:', game.name || game.game_name, 'in', options?.mode || 'demo', 'mode');
      // Mock game launch
      return `https://demo-game-url.com/${game.slug || game.id}`;
    } catch (error) {
      console.error('Error launching game:', error);
      throw new Error('Failed to launch game');
    }
  }, []);

  const getFeaturedGames = useCallback(async (count: number = 8): Promise<Game[]> => {
    return memoizedGames.filter(game => game.is_featured).slice(0, count);
  }, [memoizedGames]);

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

  const value: GamesContextType = {
    games: memoizedGames,
    isLoadingGames,
    gamesError,
    favoriteGameIds,
    toggleFavoriteGame,
    launchGame,
    getFeaturedGames,
    searchGames,
    getGamesByCategory,
    refreshGames
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
