
import { useState, useEffect, useCallback } from 'react';
import { Game } from '@/types'; // Game from game.ts
import { gameService } from '@/services/gameService';
import { toast } from 'sonner';

interface UseGamesDataProps {
  category?: string; // category slug
  provider?: string; // provider slug
  featured?: boolean;
  popular?: boolean;
  latest?: boolean;
  limit?: number;
  searchQuery?: string;
  initialOffset?: number; // Added initialOffset
}

export const useGamesData = ({
  category,
  provider,
  featured,
  popular,
  latest,
  limit = 12,
  searchQuery = '',
  initialOffset = 0, // Default initialOffset to 0
}: UseGamesDataProps = {}) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(initialOffset); // Use offset state

  const fetchGames = useCallback(async (currentOffset: number, replace: boolean = false) => {
    // `replace` flag to determine if we append or replace games array
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
      
      const fetchedGames = result.games as unknown as Game[];
      const count = result.count;

      if (replace) {
        setGames(fetchedGames);
      } else {
        setGames(prev => [...prev, ...fetchedGames]);
      }
      
      setTotalCount(count || 0);
      // Corrected hasMore logic
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
    setGames([]); // Clear games when filters change
    setOffset(0); // Reset offset
    fetchGames(0, true); // Initial fetch, replacing games
  }, [fetchGames]); // fetchGames itself has dependencies that trigger re-fetch

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    const nextOffset = offset + limit;
    setOffset(nextOffset); // Update offset state
    fetchGames(nextOffset, false); // Fetch next page, appending games
  }, [fetchGames, offset, limit, hasMore, loading]);

  const refresh = useCallback(() => {
    setGames([]); // Clear games
    setOffset(0); // Reset offset
    fetchGames(0, true); // Re-fetch first page, replacing games
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
