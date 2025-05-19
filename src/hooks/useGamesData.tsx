
import { useState, useEffect, useCallback } from 'react';
import { Game, DbGame } from '@/types'; // Game from game.ts, DbGame from types/index.d.ts
import { gameService } from '@/services/gameService'; // Use the consolidated gameService
import { useAuth } from '@/contexts/AuthContext'; // Keep for user context if needed for favorites later
import { toast } from 'sonner';

interface UseGamesDataProps {
  category?: string; // category slug
  provider?: string; // provider slug
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
  // const { user } = useAuth(); // Not directly used in fetchGames, favorites are client-side

  const fetchGames = useCallback(async (offset = 0) => {
    try {
      setLoading(true);
      
      const { games: fetchedGames, count } = await gameService.getAllGames({
        limit,
        offset,
        category,
        provider,
        search: searchQuery,
        featured,
        popular,
        latest,
      });
      
      if (offset === 0) {
        setGames(fetchedGames);
      } else {
        setGames(prev => [...prev, ...fetchedGames]);
      }
      
      setTotalCount(count || 0);
      setHasMore(fetchedGames.length >= limit && (offset + limit) < (count || 0));
      setError(null);
    } catch (err: any) {
      console.error('Error fetching games in useGamesData:', err);
      setError(err);
      toast.error('Failed to load games');
    } finally {
      setLoading(false);
    }
  }, [category, provider, featured, popular, latest, limit, searchQuery]); // Removed user?.id as it's not used for fetching

  useEffect(() => {
    fetchGames(0); // Initial fetch
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
