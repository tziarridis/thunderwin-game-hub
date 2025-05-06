
import { useState, useEffect, useCallback } from 'react';
import { Game } from '@/types';
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
      
      // Start building the query
      let query = supabase
        .from('games')
        .select('*, providers(name)', { count: 'exact' });
      
      // Apply filters
      if (category && category !== 'all') {
        query = query
          .eq('game_type', category);
      }
      
      if (provider) {
        query = query
          .eq('providers.name', provider);
      }
      
      if (featured) {
        query = query
          .eq('is_featured', true);
      }
      
      if (popular) {
        query = query
          .eq('show_home', true);
      }
      
      if (latest) {
        // Order by created_at to get the latest games
        query = query.order('created_at', { ascending: false });
      }
      
      if (searchQuery) {
        query = query
          .ilike('game_name', `%${searchQuery}%`);
      }
      
      // Apply pagination
      query = query
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });
      
      // Execute query
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      // Fetch user favorites
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
      
      // Format games data
      const formattedGames = data?.map(game => {
        const gameObject: Game = {
          id: game.id,
          title: game.game_name,
          name: game.game_name, // Adding name property for compatibility
          provider: game.providers?.name || 'Unknown',
          image: game.cover || '/placeholder.svg',
          category: game.game_type,
          rtp: game.rtp,
          isPopular: game.show_home || false,
          isNew: (new Date(game.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          isFavorite: favorites[game.id] || false,
          minBet: 1, // Default value
          maxBet: 100, // Default value
          volatility: 'medium', // Default value
          features: [],
          tags: []
        };
        return gameObject;
      }) || [];
      
      // Update state
      if (offset === 0) {
        setGames(formattedGames);
      } else {
        setGames(prev => [...prev, ...formattedGames]);
      }
      
      setTotalCount(count || 0);
      setHasMore(formattedGames.length >= limit && (offset + limit) < (count || 0));
      setError(null);
    } catch (error: any) {
      console.error('Error fetching games:', error);
      setError(error);
      toast.error('Failed to load games');
    } finally {
      setLoading(false);
    }
  }, [category, provider, featured, popular, latest, limit, searchQuery, user?.id]);

  // Initial fetch
  useEffect(() => {
    fetchGames(0);
  }, [fetchGames]);

  // Function to load more games
  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    fetchGames(games.length);
  }, [fetchGames, games.length, hasMore, loading]);

  // Function to refresh games
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
