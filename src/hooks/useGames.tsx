import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Game, GameLaunchOptions, User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { gameAggregatorService } from '@/services/gameAggregatorService'; // If used for launching

interface FavoriteGame {
  game_id: string;
  user_id: string;
  created_at: string;
}

export const useGames = () => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [favoriteGameIds, setFavoriteGameIds] = useState<Set<string>>(new Set());

  const { data: favoriteGames, isLoading: isFavoriteGamesLoading } = useQuery<FavoriteGame[], Error>({
    queryKey: ['favoriteGames', user?.id],
    queryFn: async () => {
      if (!user || !isAuthenticated) {
        return [];
      }
      const { data, error } = await supabase
        .from('favorite_games')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && isAuthenticated, // Only run when user is logged in
  });

  useEffect(() => {
    if (favoriteGames) {
      setFavoriteGameIds(new Set(favoriteGames.map(fav => fav.game_id)));
    } else {
      setFavoriteGameIds(new Set());
    }
  }, [favoriteGames]);

  const toggleFavoriteGameMutation = useMutation<any, Error, string>({
    mutationFn: async (gameId: string) => {
      if (!user || !isAuthenticated) {
        toast.error("Please log in to favorite games.");
        throw new Error("User not authenticated");
      }

      const isFavorite = favoriteGameIds.has(gameId);

      if (isFavorite) {
        // Corrected delete call
        const { error } = await supabase
          .from('favorite_games')
          .delete()
          .match({ game_id: gameId, user_id: user.id });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('favorite_games')
          .insert([{ game_id: gameId, user_id: user.id }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      // Optimistically update the cache
      queryClient.invalidateQueries(['favoriteGames', user?.id]);
      toast.success("Favorites updated!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update favorites: ${error.message}`);
    },
  });
  
  const launchGame = async (gameToLaunch: Game, options: Partial<GameLaunchOptions> = {}): Promise<string | null> => {
    if (gameToLaunch.status === 'maintenance') {
        toast.error("This game is currently under maintenance.");
        return null;
    }

    if (!isAuthenticated && gameToLaunch.status !== 'demo_only') {
        toast.error("Please log in to play games.");
        return null;
    }

    const defaultOptions: GameLaunchOptions = {
        mode: options.mode || 'real', // Default to real play
        user_id: user?.id,
        currency: 'USD', // TODO: Get from user's wallet or settings
        language: 'en', // TODO: Get from user's settings or browser
        platform: 'web',
        // token: user?.session?.access_token, // If provider needs Supabase token
        returnUrl: `${window.location.origin}/casino`, // Example return URL
        // ... any other default options
    };

    const launchOptions: GameLaunchOptions = { ...defaultOptions, ...options };

    try {
        // Prefer game_id for direct launching if available and provider supports it
        const gameIdentifier = gameToLaunch.game_id || gameToLaunch.slug || String(gameToLaunch.id);
        
        if (!gameToLaunch.provider_slug) {
            toast.error("Game provider information is missing.");
            return null;
        }

        // Use the gameAggregatorService or a specific provider service
        const launchUrl = await gameAggregatorService.getGameLaunchUrl(
            gameToLaunch.provider_slug, 
            gameIdentifier, 
            launchOptions
        );

        if (launchUrl) {
            toast.success(`Launching ${gameToLaunch.title}...`);
            return launchUrl;
        } else {
            toast.error(`Could not launch ${gameToLaunch.title}.`);
            return null;
        }
    } catch (error: any) {
        toast.error(`Error launching game: ${error.message || 'Unknown error'}`);
        console.error("Launch game error:", error);
        return null;
    }
  };
  return { 
    favoriteGameIds, 
    toggleFavoriteGame: toggleFavoriteGameMutation.mutate,
    isFavoriting: toggleFavoriteGameMutation.isPending,
    launchGame,
  };
};
