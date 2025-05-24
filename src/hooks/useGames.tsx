import { useState, useEffect, useCallback } from "react";
import { Game, GameListParams, GameResponse, GameProvider } from "@/types/game";
import { Game as UIGame, GameProvider as UIGameProvider } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { adaptGamesForUI, adaptProvidersForUI, adaptGameForAPI, adaptGameForUI } from "@/utils/gameAdapter";
import { clientGamesApi } from "@/services/gamesService";
import { providerIntegrationService } from "@/services/providerIntegrationService";
import { sessionManagerService } from "@/services/sessionManagerService";
import { availableProviders } from "@/config/gameProviders";
import { supabase } from "@/integrations/supabase/client";

export interface GameLaunchOptions {
  gameId: string;
  providerId?: string;
  mode?: "demo" | "real";
  playerId?: string;
  language?: string;
  currency?: string;
  returnUrl?: string;
  platform?: "web" | "mobile";
}

export const useGames = (initialParams: GameListParams = {}) => {
  const [games, setGames] = useState<UIGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState<GameListParams>(initialParams);
  const [totalGames, setTotalGames] = useState(0);
  const [providers, setProviders] = useState<UIGameProvider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [launchingGame, setLaunchingGame] = useState(false);
  const { toast } = useToast();
  
  const fetchGames = useCallback(async (queryParams: GameListParams = params) => {
    try {
      setLoading(true);
      // Use supabase to fetch games in the future
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
  
  const addGame = async (gameData: Omit<UIGame, 'id'>) => {
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

  // Fix the mode type issue in launchGame
  const launchGame = async (game: UIGame, options: Partial<GameLaunchOptions> = {}) => {
    try {
      setLaunchingGame(true);
      
      const launchOptions: GameLaunchOptions = {
        gameId: game.id,
        providerId: options.providerId || "ppeur",
        mode: options.mode || "demo",
        playerId: options.playerId || "demo_player",
        language: options.language || "en",
        currency: options.currency || "USD",
        returnUrl: options.returnUrl || window.location.href,
        platform: options.platform || "web"
      };
      
      console.log('Launching game with options:', launchOptions);

      // Create or restore game session
      let gameSession = null;
      if (launchOptions.playerId !== "demo_player") {
        gameSession = await sessionManagerService.handleReconnection(
          launchOptions.playerId,
          launchOptions.gameId,
          launchOptions.providerId!
        );

        if (!gameSession) {
          gameSession = await sessionManagerService.createGameSession(
            launchOptions.playerId,
            launchOptions.gameId,
            launchOptions.providerId!
          );
        }
      }

      // Launch game with failover support
      const launchRequest = {
        gameId: launchOptions.gameId,
        playerId: launchOptions.playerId,
        mode: launchOptions.mode as 'real' | 'demo',
        currency: launchOptions.currency,
        language: launchOptions.language,
        returnUrl: launchOptions.returnUrl,
        sessionToken: gameSession?.sessionToken
      };

      const response = await providerIntegrationService.launchGameWithFailover(
        launchRequest,
        launchOptions.providerId!
      );

      if (!response.success) {
        throw new Error(response.errorMessage || 'Failed to launch game');
      }

      // Open game in new window
      if (response.gameUrl) {
        const gameWindow = window.open(response.gameUrl, "_blank");
        
        if (!gameWindow) {
          throw new Error("Pop-up blocker might be preventing the game from opening. Please allow pop-ups for this site.");
        }

        // Show success message with provider info
        const providerMessage = response.fallbackProvider 
          ? `Game launched using backup provider (${response.fallbackProvider})`
          : `Game launched successfully`;
          
        toast({
          title: "Game Launched",
          description: `${game.title} - ${providerMessage}`,
        });

        return response.gameUrl;
      } else {
        throw new Error("No game URL received from provider");
      }
      
    } catch (err: any) {
      console.error("Error launching game:", err);
      
      // End session if it was created
      if (options.playerId !== "demo_player") {
        const userSessions = sessionManagerService.getUserActiveSessions(options.playerId!);
        for (const session of userSessions) {
          if (session.gameId === game.id) {
            await sessionManagerService.endSession(session.id, 'launch_failed');
          }
        }
      }
      
      toast({
        title: "Error",
        description: `Failed to launch game: ${err.message || "Unknown error"}`,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLaunchingGame(false);
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
    launchingGame,
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
    toggleGameFeature,
    launchGame
  };
};
