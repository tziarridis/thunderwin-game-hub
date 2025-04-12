
import { useState, useEffect } from "react";
import { Game } from "@/types";
import { getGames } from "@/services/apiService";
import { useToast } from "@/components/ui/use-toast";

export const useGames = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const data = await getGames();
        setGames(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching games:", err);
        setError(err as Error);
        toast({
          title: "Error",
          description: "Failed to load games. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [toast]);

  return { games, loading, error };
};
