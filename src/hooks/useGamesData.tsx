
import { useState, useEffect, useCallback } from 'react';
import { Game } from '@/types/game';
import { gameService } from '@/services/gameService';
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

  const fetchGames = useCallback(async (currentOffset: number, replace: boolean = false) => {
    try {
      setLoading(true);
      
      const result = await gameService.getAllGames({
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
      } else {
        setGames(prev => [...prev, ...fetchedGames]);
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

// Aliased export to satisfy read-only components that import `useGames` from this file path
export { useGamesData as useGames };

export default useGamesData;
