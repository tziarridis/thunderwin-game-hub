import { supabase } from "@/integrations/supabase/client";
import { Game, GameProvider } from "@/types";
import { toast } from "sonner";

export interface GameFilters {
  category?: string;
  provider?: string;
  search?: string;
  minRTP?: number;
  isNew?: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
  hasJackpot?: boolean;
  sortBy?: 'name' | 'rtp' | 'provider' | 'date' | 'popularity';
  sortDir?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface GameResponse {
  data: Game[];
  total: number;
  page: number;
  limit: number;
}

export const gamesDatabaseService = {
  /**
   * Get games from the database with filters
   */
  getGames: async (filters: GameFilters = {}): Promise<GameResponse> => {
    try {
      const {
        category,
        provider,
        search,
        minRTP,
        isNew,
        isPopular,
        isFeatured,
        hasJackpot,
        sortBy = 'popularity',
        sortDir = 'desc',
        limit = 20,
        offset = 0
      } = filters;

      // Start building query without count to avoid type issues
      let query = supabase
        .from('games')
        .select('*, providers(name)');

      // Apply filters
      if (category && category !== 'all') {
        query = query.eq('game_type', category);
      }

      if (provider && provider !== 'all') {
        query = query.eq('providers.name', provider);
      }

      if (search) {
        query = query.ilike('game_name', `%${search}%`);
      }

      if (minRTP && minRTP > 0) {
        query = query.gte('rtp', minRTP);
      }

      if (isNew) {
        query = query.eq('is_new', true);
      }

      if (isPopular) {
        query = query.eq('is_popular', true);
      }

      if (isFeatured) {
        query = query.eq('is_featured', true);
      }

      if (hasJackpot) {
        query = query.eq('jackpot', true);
      }

      // Apply sorting
      switch (sortBy) {
        case 'name':
          query = query.order('game_name', { ascending: sortDir === 'asc' });
          break;
        case 'rtp':
          query = query.order('rtp', { ascending: sortDir === 'asc' });
          break;
        case 'provider':
          query = query.order('providers.name', { ascending: sortDir === 'asc' });
          break;
        case 'date':
          query = query.order('created_at', { ascending: sortDir === 'asc' });
          break;
        case 'popularity':
        default:
          query = query.order('views', { ascending: sortDir === 'asc' });
          break;
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      // Execute query
      const { data, error, count } = await query;

      if (error) throw error;

      // Format games data
      const formattedGames = (data || []).map(game => ({
        id: game.id,
        title: game.game_name,
        name: game.game_name,
        provider: game.providers?.name || 'Unknown',
        image: game.cover || '/placeholder.svg',
        category: game.game_type,
        rtp: game.rtp,
        volatility: game.volatility || 'medium',
        minBet: game.min_bet,
        maxBet: game.max_bet,
        isPopular: game.is_popular || false,
        isNew: game.is_new || false,
        isFeatured: game.is_featured || false,
        jackpot: game.jackpot || false,
        features: [],
        tags: []
      }));

      return {
        data: formattedGames,
        total: count || 0,
        page: Math.floor(offset / limit) + 1,
        limit
      };
    } catch (error: any) {
      console.error('Error fetching games:', error);
      throw error;
    }
  },

  /**
   * Get game by ID
   */
  getGameById: async (id: string): Promise<Game | null> => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*, providers(name)')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) return null;

      return {
        id: data.id,
        title: data.game_name,
        provider: data.providers?.name || 'Unknown',
        image: data.cover || '/placeholder.svg',
        category: data.game_type,
        rtp: data.rtp,
        volatility: data.volatility,
        minBet: data.min_bet,
        maxBet: data.max_bet,
        isPopular: data.is_popular,
        isNew: data.is_new,
        isFeatured: data.is_featured,
        jackpot: data.jackpot,
      } as Game;
    } catch (error: any) {
      console.error('Error fetching game:', error);
      return null;
    }
  },

  /**
   * Get game providers
   */
  getProviders: async (): Promise<GameProvider[]> => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('id, name, logo, status')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;

      return data?.map(provider => ({
        id: provider.id,
        name: provider.name,
        status: provider.status,
        logo: provider.logo || null
      })) || [];
    } catch (error: any) {
      console.error('Error fetching providers:', error);
      return [];
    }
  },

  /**
   * Get user's favorite games
   */
  getFavoriteGames: async (userId: string): Promise<Game[]> => {
    if (!userId) return [];

    try {
      // First, get the user's favorite game IDs
      const { data: favorites, error: favError } = await supabase
        .from('favorite_games')
        .select('game_id')
        .eq('user_id', userId);

      if (favError) throw favError;

      if (!favorites || favorites.length === 0) {
        return [];
      }

      // Get the game details for the favorite games
      const gameIds = favorites.map(fav => fav.game_id);
      const { data: games, error: gamesError } = await supabase
        .from('games')
        .select('*, providers(name)')
        .in('id', gameIds);

      if (gamesError) throw gamesError;

      return games?.map(game => ({
        id: game.id,
        title: game.game_name,
        name: game.game_name, 
        provider: game.providers?.name || 'Unknown',
        image: game.cover || '/placeholder.svg',
        category: game.game_type,
        rtp: game.rtp,
        volatility: game.volatility || 'medium',
        minBet: game.min_bet,
        maxBet: game.max_bet,
        isPopular: game.is_popular || false,
        isNew: game.is_new || false,
        isFeatured: game.is_featured || false,
        jackpot: game.jackpot || false,
        isFavorite: true,
        features: [],
        tags: []
      })) || [];
    } catch (error: any) {
      console.error('Error fetching favorite games:', error);
      toast.error('Failed to load favorite games');
      return [];
    }
  },

  /**
   * Toggle game favorite status
   */
  toggleFavorite: async (gameId: string, userId: string, isFavorite: boolean): Promise<boolean> => {
    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorite_games')
          .delete()
          .eq('user_id', userId)
          .eq('game_id', gameId);

        if (error) throw error;
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorite_games')
          .insert({ user_id: userId, game_id: gameId });

        if (error) throw error;
      }

      return true;
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  },

  /**
   * Increment game views
   */
  incrementGameViews: async (gameId: string): Promise<void> => {
    try {
      await supabase.rpc('increment_game_view', { game_id: gameId });
    } catch (error) {
      console.error('Error incrementing game views:', error);
      // Don't throw here as this isn't critical
    }
  }
};

export default gamesDatabaseService;
