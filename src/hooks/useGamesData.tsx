import { useState, useEffect, useCallback } from 'react';
import { Game, DbGame as LocalDbGame } from '@/types'; // Use LocalDbGame to avoid conflict if DbGame is global
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

// Renamed DbGame to LocalDbGame to avoid potential global conflicts if DbGame is defined elsewhere.
// If DbGame is already correctly typed globally (e.g. in types/index.d.ts), you can use that.
interface DbGameResponseItem extends LocalDbGame { // LocalDbGame from @/types
  // any additional fields from the actual response structure if different
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
        .select('*, providers(name)', { count: 'exact' }); 
      
      if (category && category !== 'all') {
        query = query.eq('game_type', category);
      }
      
      if (provider) {
        query = query.eq('providers.name', provider);
      }
      
      if (featured) {
        query = query.eq('is_featured', true);
      }
      
      if (popular) {
        query = query.eq('show_home', true);
      }
      
      if (latest) {
        query = query.order('created_at', { ascending: false });
      }
      
      if (searchQuery) {
        query = query.ilike('game_name', `%${searchQuery}%`);
      }
      
      query = query
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false }); 
      
      const { data, error: queryError, count } = await query;
      
      if (queryError) throw queryError;
      
      // Favorites are handled by useGames hook and applied at the component level
      // let favorites: Record<string, boolean> = {};
      // if (user?.id) { ... }

      const formattedGames = data?.map((dbGameItem: DbGameResponseItem) => {
        // The 'isFavorite' property should not be set here as it's not part of the base Game type.
        // It's typically derived dynamically in components using favoriteGameIds from useGames.
        const gameObject: Game = {
          id: dbGameItem.id || String(Date.now() + Math.random()), // Ensure ID is string
          title: dbGameItem.game_name || 'Unknown Title',
          providerName: dbGameItem.providers?.name || dbGameItem.provider_slug || 'Unknown Provider',
          provider: dbGameItem.providers?.name || dbGameItem.provider_slug || 'Unknown Provider',
          image: dbGameItem.cover || '/placeholder.svg',
          categoryName: dbGameItem.game_type || 'Unknown Category',
          category: dbGameItem.game_type || 'Unknown Category',
          rtp: typeof dbGameItem.rtp === 'string' ? parseFloat(dbGameItem.rtp) : dbGameItem.rtp, // Ensure rtp is number if possible
          isPopular: dbGameItem.show_home || dbGameItem.is_popular || false,
          isNew: dbGameItem.is_new || (dbGameItem.created_at && new Date(dbGameItem.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000),
          // isFavorite: favorites[game.id] || false, // REMOVED: Game type doesn't have isFavorite
          minBet: dbGameItem.min_bet,
          maxBet: dbGameItem.max_bet,
          volatility: dbGameItem.volatility || 'medium', 
          features: dbGameItem.features || [],
          tags: dbGameItem.tags || [],
          slug: dbGameItem.slug || (dbGameItem.game_name || '').toLowerCase().replace(/\s+/g, '-'),
          game_id: dbGameItem.game_id,
          game_code: dbGameItem.game_code,
          provider_slug: dbGameItem.provider_slug,
          category_slugs: dbGameItem.category_slugs,
          status: dbGameItem.status,
          description: dbGameItem.description,
          banner: dbGameItem.banner,
          is_featured: dbGameItem.is_featured,
          show_home: dbGameItem.show_home,
          themes: dbGameItem.themes,
          lines: dbGameItem.lines,
          release_date: dbGameItem.release_date,
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
