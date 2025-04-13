
import { useState, useEffect } from "react";
import { RecentWin } from "@/types/recent-wins";
import { fetchRecentWins, filterWinsByCategory } from "@/services/recentWinsService";

interface UseRecentWinsResult {
  wins: RecentWin[];
  filteredWins: RecentWin[];
  loading: boolean;
  error: Error | null;
  filterByCategory: (category: string) => void;
}

export const useRecentWins = (): UseRecentWinsResult => {
  const [wins, setWins] = useState<RecentWin[]>([]);
  const [filteredWins, setFilteredWins] = useState<RecentWin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const loadRecentWins = async () => {
      try {
        setLoading(true);
        const data = await fetchRecentWins();
        setWins(data);
        setFilteredWins(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch recent wins"));
        setLoading(false);
      }
    };

    loadRecentWins();
  }, []);

  useEffect(() => {
    if (wins.length > 0) {
      if (activeCategory === "all") {
        setFilteredWins(wins);
      } else {
        const filtered = filterWinsByCategory(wins, activeCategory);
        setFilteredWins(filtered);
      }
    }
  }, [wins, activeCategory]);

  const filterByCategory = (category: string) => {
    setActiveCategory(category);
  };

  return {
    wins,
    filteredWins,
    loading,
    error,
    filterByCategory
  };
};
