
import { useState, useEffect, useCallback } from "react";
import { Game, GameListParams, GameResponse, GameProvider } from "@/types/game";
import { Game as UIGame, GameProvider as UIGameProvider } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { adaptGamesForUI, adaptProvidersForUI, adaptGameForAPI } from "@/utils/gameAdapter";
import { clientGamesApi } from "@/services/mockGamesService";

export const useGames = (initialParams: GameListParams = {}) => {
  const [games, setGames] = useState<UIGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState<GameListParams>(initialParams);
  const [totalGames, setTotalGames] = useState(0);
  const [providers, setProviders] = useState<UIGameProvider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const { toast } = useToast();
  
  const fetchGames = useCallback(async (queryParams: GameListParams = params) => {
    try {
      setLoading(true);
      const response = await clientGamesApi.getGames(queryParams);
      
      // Convert API game format to UI game format
      const adaptedGames = adaptGamesForUI(response.data);
      setGames(adaptedGames);
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
      const data = await clientGamesApi.getProviders();
      // Convert API provider format to UI provider format
      const adaptedProviders = adaptProvidersForUI(data);
      setProviders(adaptedProviders);
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
  
  const addGame = async (gameData: Omit<UIGame, 'id'> | Partial<UIGame>) => {
    try {
      // Convert UI game to API game format
      const apiGame = adaptGameForAPI(gameData as UIGame);
      const result = await clientGamesApi.addGame(apiGame);
      // Convert the result back to UI format
      const uiGame = adaptGameForUI(result);
      setGames(prev => [uiGame, ...prev]);
      toast({
        title: "Success",
        description: "Game added successfully",
      });
      return uiGame;
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
  
  const updateGame = async (game: UIGame) => {
    try {
      // Convert UI game to API game format
      const apiGame = {
        id: parseInt(game.id),
        ...adaptGameForAPI(game)
      };
      
      const result = await clientGamesApi.updateGame(apiGame);
      // Convert the result back to UI format
      const uiGame = adaptGameForUI(result);
      setGames(prev => prev.map(g => g.id === game.id ? uiGame : g));
      toast({
        title: "Success",
        description: "Game updated successfully",
      });
      return uiGame;
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
  
  const deleteGame = async (id: string | number) => {
    try {
      await clientGamesApi.deleteGame(id);
      setGames(prev => prev.filter(g => g.id !== id.toString()));
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
  
  const toggleGameFeature = async (id: string | number, feature: 'is_featured' | 'show_home', value: boolean) => {
    try {
      const numericId = typeof id === 'string' ? parseInt(id) : id;
      const updatedGame = await clientGamesApi.toggleGameFeature(numericId, feature, value);
      const adaptedGame = adaptGameForUI(updatedGame);
      
      setGames(prev => prev.map(g => g.id === id.toString() ? adaptedGame : g));
      toast({
        title: "Success",
        description: `Game ${feature === 'is_featured' ? 'featured status' : 'home visibility'} updated`,
      });
      return adaptedGame;
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
