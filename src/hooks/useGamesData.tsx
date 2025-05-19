
import { useState, useEffect, useCallback } from 'react';
import { Game } from '@/types'; // Removed GameProvider as it's not used locally
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UseGamesDataProps {
  category?: string;
  provider?: string;
  featured?: boolean;
  popular?: boolean;
  latest?: boolean;
  limit?: number;
  searchQuery?: string;
}

interface DbGame {
  id: string;
  game_name: string;
  cover: string;
  game_type: string;
  rtp: number;
  show_home: boolean;
  created_at: string;
  providers?: { // This structure implies 'providers' is a related table, not a direct column
    name: string;
  };
  min_bet?: number;
  max_bet?: number;
  is_popular?: boolean;
  is_new?: boolean;
  is_featured?: boolean; // Added for consistency if used in filters
}

export const useGamesData = ({
  category,
  provider,
  featured,
  popular,
  latest,
  limit = 12,
  searchQuery = ''
}: UseGamesDataProps = {}) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const { user } = useAuth();

  const fetchGames = useCallback(async (offset = 0) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('games')
        .select('*, providers(name)', { count: 'exact' }); // providers(name) assumes a 'providers' table related to 'games'
      
      if (category && category !== 'all') {
        query = query.eq('game_type', category);
      }
      
      // Filtering by provider name from a related table needs a specific syntax if 'providers' is a join.
      // If 'provider' is a direct column on 'games' table (e.g., provider_slug), use:
      // if (provider) query = query.eq('provider_slug', provider);
      // For now, assuming 'providers.name' works as intended with RLS or view setup.
      if (provider) {
         // This might need adjustment based on how 'providers' table is actually structured and related
         // If 'games' table has a 'provider_id' and 'providers' table has 'id' and 'name',
         // and you want to filter by provider name, a function or a view might be better.
         // Or filter by a 'provider_slug' directly on the 'games' table if it exists.
         // For simplicity, this example assumes 'providers.name' is directly filterable or refers to a column that holds the provider name.
        query = query.eq('providers.name', provider);
      }
      
      if (featured) {
        query = query.eq('is_featured', true);
      }
      
      if (popular) {
        query = query.eq('show_home', true); // Or 'is_popular' depending on DB schema
      }
      
      if (latest) {
        query = query.order('created_at', { ascending: false });
      }
      
      if (searchQuery) {
        query = query.ilike('game_name', `%${searchQuery}%`);
      }
      
      query = query
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false }); // Default sort, can be overridden by 'latest'
      
      const { data, error: queryError, count } = await query;
      
      if (queryError) throw queryError;
      
      let favorites: Record<string, boolean> = {};
      if (user?.id) {
        const { data: favData } = await supabase
          .from('favorite_games')
          .select('game_id')
          .eq('user_id', user.id);
          
        if (favData) {
          favorites = favData.reduce((acc: Record<string, boolean>, item: { game_id: string }) => {
            acc[item.game_id] = true;
            return acc;
          }, {});
        }
      }
      
      const formattedGames = data?.map((game: DbGame) => {
        const gameObject: Game = {
          id: game.id,
          title: game.game_name,
          // name: game.game_name, // Removed: 'name' is not a property of Game type
          providerName: game.providers?.name || 'Unknown', // Use providerName for consistency
          provider: game.providers?.name || 'Unknown', // Keep provider for broader compatibility if needed elsewhere
          image: game.cover || '/placeholder.svg',
          categoryName: game.game_type, // Use categoryName
          category: game.game_type, // Keep category for compatibility
          rtp: game.rtp,
          isPopular: game.show_home || game.is_popular || false,
          isNew: game.is_new || (new Date(game.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000),
          isFavorite: favorites[game.id] || false,
          minBet: game.min_bet, // Keep as number | undefined
          maxBet: game.max_bet, // Keep as number | undefined
          volatility: 'medium', 
          features: [],
          tags: [],
          slug: game.game_name.toLowerCase().replace(/\s+/g, '-'), // Basic slug generation
        };
        return gameObject;
      }) || [];
      
      if (offset === 0) {
        setGames(formattedGames);
      } else {
        setGames(prev => [...prev, ...formattedGames]);
      }
      
      setTotalCount(count || 0);
      setHasMore(formattedGames.length >= limit && (offset + limit) < (count || 0));
      setError(null);
    } catch (err: any) {
      console.error('Error fetching games:', err);
      setError(err);
      toast.error('Failed to load games');
    } finally {
      setLoading(false);
    }
  }, [category, provider, featured, popular, latest, limit, searchQuery, user?.id]);

  // Initial fetch
  useEffect(() => {
    fetchGames(0);
  }, [fetchGames]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    fetchGames(games.length);
  }, [fetchGames, games.length, hasMore, loading]);

  const refresh = useCallback(() => {
    fetchGames(0);
  }, [fetchGames]);


  return {
    games,
    loading,
    error,
    totalCount,
    hasMore,
    loadMore,
    refresh
  };
};

export default useGamesData;

