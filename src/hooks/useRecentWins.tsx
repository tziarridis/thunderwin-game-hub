
import { useState, useEffect } from "react";
import { RecentWin } from "@/types/recent-wins";
import { fetchRecentWins } from "@/services/recentWinsService";

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
        const filtered = wins.filter(win => {
          switch (activeCategory) {
            case "slots":
              return win.game_name.includes("Bonanza") || 
                     win.game_name.includes("Party") || 
                     win.game_name.includes("Book") ||
                     win.game_name.includes("King") ||
                     win.game_name.includes("Gold");
            case "live":
              return win.game_name.includes("Roulette") || 
                     win.game_name.includes("Blackjack") || 
                     win.game_name.includes("Poker") ||
                     win.game_name.includes("Table");
            case "originals":
              return win.game_name.includes("Aviator") || 
                     win.game_name.includes("Crash") ||
                     win.game_name.includes("BC") ||
                     win.game_name.includes("Original");
            default:
              return true;
          }
        });
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
