
import { useState, useEffect, useCallback } from 'react';
import { Game, DbGame, GameStatusEnum } from '@/types/game';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseGamesDataProps {
  category?: string;
  provider?: string;
  featured?: boolean;
  popular?: boolean;
  latest?: boolean;
  limit?: number;
  searchQuery?: string;
  initialOffset?: number;
}

interface GamesResult {
  games: Game[];
  count: number;
}

const mapDbGameToGame = (dbGame: DbGame): Game => ({
  id: dbGame.id,
  title: dbGame.game_name || 'Untitled Game',
  slug: dbGame.game_code || dbGame.id,
  description: dbGame.description || '',
  image_url: dbGame.cover || '',
  provider_id: dbGame.provider_id,
  provider_slug: dbGame.provider_slug || 'unknown',
  category_id: dbGame.category_slugs?.[0] || '',
  status: dbGame.status as GameStatusEnum,
  rtp: Number(dbGame.rtp) || 0,
  created_at: dbGame.created_at || new Date().toISOString(),
  updated_at: dbGame.updated_at || new Date().toISOString()
});

const mockGameService = {
  getAllGames: async (options: any = {}): Promise<GamesResult> => {
    const { limit = 100, offset = 0 } = options;
    
    try {
      let query = supabase.from('games').select('*, providers:provider_id(*)', { count: 'exact' });
      
      query = query.range(offset, offset + limit - 1);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      const mappedGames = (data || []).map((dbGame: any) => {
        return mapDbGameToGame(dbGame);
      });
      
      return { 
        games: mappedGames,
        count: count || 0
      };
    } catch (error) {
      console.error('Error fetching games:', error);
      return { games: [], count: 0 };
    }
  }
};

export const useGamesData = ({
  category,
  provider,
  featured,
  popular,
  latest,
  limit = 12,
  searchQuery = '',
  initialOffset = 0,
}: UseGamesDataProps = {}) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(initialOffset);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);

  const fetchGames = useCallback(async (currentOffset: number, replace: boolean = false) => {
    try {
      setLoading(true);
      
      const result = await mockGameService.getAllGames({
        limit,
        offset: currentOffset,
        category,
        provider,
        search: searchQuery,
        featured,
        popular,
        latest,
      });
      
      const fetchedGames = result.games;
      const count = result.count;

      if (replace) {
        setGames(fetchedGames);
        setFilteredGames(fetchedGames);
      } else {
        setGames(prev => [...prev, ...fetchedGames]);
        setFilteredGames(prev => [...prev, ...fetchedGames]);
      }
      
      setTotalCount(count || 0);
      setHasMore(fetchedGames.length > 0 && (currentOffset + fetchedGames.length) < (count || 0));
      setError(null);
    } catch (err: any) {
      console.error('Error fetching games in useGamesData:', err);
      setError(err);
      toast.error('Failed to load games');
    } finally {
      setLoading(false);
    }
  }, [category, provider, featured, popular, latest, limit, searchQuery]);

  useEffect(() => {
    setGames([]);
    setOffset(0);
    fetchGames(0, true);
  }, [fetchGames]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    const nextOffset = offset + limit;
    setOffset(nextOffset);
    fetchGames(nextOffset, false);
  }, [fetchGames, offset, limit, hasMore, loading]);

  const refresh = useCallback(() => {
    setGames([]);
    setOffset(0);
    fetchGames(0, true);
  }, [fetchGames]);

  const filterGames = useCallback((searchTerm?: string, categorySlug?: string, providerSlug?: string) => {
    if (!games.length) return;
    
    let filtered = [...games];
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(game => 
        game.title.toLowerCase().includes(search) || 
        game.provider_slug?.toLowerCase().includes(search)
      );
    }
    
    if (categorySlug) {
      filtered = filtered.filter(game => 
        game.category_id === categorySlug || 
        (Array.isArray(game.category_slugs) && game.category_slugs.includes(categorySlug))
      );
    }
    
    if (providerSlug) {
      filtered = filtered.filter(game => 
        game.provider_slug === providerSlug || 
        String(game.provider_id) === providerSlug
      );
    }
    
    setFilteredGames(filtered);
  }, [games]);

  return {
    games,
    filteredGames,
    loading,
    error,
    totalCount,
    hasMore,
    loadMore,
    refresh,
    filterGames
  };
};

export { useGamesData as useGames };
export default useGamesData;
