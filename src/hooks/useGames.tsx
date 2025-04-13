
import { useState, useEffect, useCallback } from "react";
import { Game, GameListParams, GameResponse, GameProvider } from "@/types/game";
import { gamesApi } from "@/services/gamesService";
import { useToast } from "@/components/ui/use-toast";

export const useGames = (initialParams: GameListParams = {}) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState<GameListParams>(initialParams);
  const [totalGames, setTotalGames] = useState(0);
  const [providers, setProviders] = useState<GameProvider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const { toast } = useToast();
  
  const fetchGames = useCallback(async (queryParams: GameListParams = params) => {
    try {
      setLoading(true);
      const response = await gamesApi.getGames(queryParams);
      setGames(response.data);
      setTotalGames(response.total);
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
  }, [params, toast]);
  
  const fetchProviders = useCallback(async () => {
    try {
      setLoadingProviders(true);
      const data = await gamesApi.getProviders();
      setProviders(data);
    } catch (err) {
      console.error("Error fetching providers:", err);
      toast({
        title: "Error",
        description: "Failed to load game providers.",
        variant: "destructive",
      });
    } finally {
      setLoadingProviders(false);
    }
  }, [toast]);

  const updateParams = useCallback((newParams: Partial<GameListParams>) => {
    setParams(prev => {
      const updated = { ...prev, ...newParams };
      fetchGames(updated);
      return updated;
    });
  }, [fetchGames]);
  
  const addGame = async (game: Omit<Game, 'id'>) => {
    try {
      const newGame = await gamesApi.addGame(game);
      setGames(prev => [newGame, ...prev]);
      toast({
        title: "Success",
        description: "Game added successfully",
      });
      return newGame;
    } catch (err) {
      console.error("Error adding game:", err);
      toast({
        title: "Error",
        description: "Failed to add game",
        variant: "destructive",
      });
      throw err;
    }
  };
  
  const updateGame = async (game: Game) => {
    try {
      const updatedGame = await gamesApi.updateGame(game);
      setGames(prev => prev.map(g => g.id === game.id ? updatedGame : g));
      toast({
        title: "Success",
        description: "Game updated successfully",
      });
      return updatedGame;
    } catch (err) {
      console.error("Error updating game:", err);
      toast({
        title: "Error",
        description: "Failed to update game",
        variant: "destructive",
      });
      throw err;
    }
  };
  
  const deleteGame = async (id: number) => {
    try {
      await gamesApi.deleteGame(id);
      setGames(prev => prev.filter(g => g.id !== id));
      toast({
        title: "Success",
        description: "Game deleted successfully",
      });
    } catch (err) {
      console.error("Error deleting game:", err);
      toast({
        title: "Error",
        description: "Failed to delete game",
        variant: "destructive",
      });
      throw err;
    }
  };
  
  const toggleGameFeature = async (id: number, feature: 'is_featured' | 'show_home', value: boolean) => {
    try {
      const updatedGame = await gamesApi.toggleGameFeature(id, feature, value);
      setGames(prev => prev.map(g => g.id === id ? updatedGame : g));
      toast({
        title: "Success",
        description: `Game ${feature === 'is_featured' ? 'featured status' : 'home visibility'} updated`,
      });
      return updatedGame;
    } catch (err) {
      console.error(`Error toggling ${feature} for game:`, err);
      toast({
        title: "Error",
        description: `Failed to update game ${feature}`,
        variant: "destructive",
      });
      throw err;
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchGames();
    fetchProviders();
  }, [fetchGames, fetchProviders]);

  return {
    games,
    loading,
    error,
    params,
    totalGames,
    providers,
    loadingProviders,
    updateParams,
    fetchGames,
    addGame,
    updateGame,
    deleteGame,
    toggleGameFeature
  };
};
