
import { Game } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export interface GameResponse {
  data: Game[];
  count: number;
  error: string | null;
}

export const gamesDatabaseService = {
  async getGames(filters?: any): Promise<GameResponse> {
    try {
      let query = supabase
        .from('games')
        .select('*', { count: 'exact' });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.provider) {
        query = query.eq('provider', filters.provider);
      }
      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }
      if (filters?.isPopular) {
        query = query.eq('is_popular', filters.isPopular);
      }
      if (filters?.isNew) {
        query = query.eq('is_new', filters.isNew);
      }
      if (filters?.hasJackpot) {
        query = query.eq('jackpot', filters.hasJackpot);
      }
      if (filters?.isLive) {
        query = query.eq('is_live', filters.isLive);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + filters.limit) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching games:', error);
        return { data: [], count: 0, error: error.message };
      }

      // Map database fields to our Game interface
      const mappedGames: Game[] = data.map(game => ({
        id: game.id,
        title: game.title || game.game_name || '',
        description: game.description || '',
        provider: game.provider || '',
        category: game.category || game.game_type || '',
        image: game.image || game.cover || '',
        rtp: game.rtp || 0,
        minBet: game.min_bet || 0,
        maxBet: game.max_bet || 0,
        volatility: game.volatility || '',
        isPopular: game.is_popular || false,
        isNew: game.is_new || false,
        jackpot: game.jackpot || false,
        isLive: game.is_live || false,
        views: game.views || 0,
        gameIdentifier: game.game_id || '',
        gameCode: game.game_code || '',
        technology: game.technology || '',
        createdAt: game.created_at || '',
        updatedAt: game.updated_at || '',
      }));

      return { data: mappedGames, count: count || 0, error: null };
    } catch (error: any) {
      console.error('Error fetching games:', error);
      return { data: [], count: 0, error: error.message };
    }
  },

  async getGameById(id: string): Promise<Game | null> {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching game by ID:', error);
        return null;
      }

      if (!data) return null;

      // Map database fields to our Game interface
      const game: Game = {
        id: data.id,
        title: data.title || data.game_name || '',
        description: data.description || '',
        provider: data.provider || '',
        category: data.category || data.game_type || '',
        image: data.image || data.cover || '',
        rtp: data.rtp || 0,
        minBet: data.min_bet || 0,
        maxBet: data.max_bet || 0,
        volatility: data.volatility || '',
        isPopular: data.is_popular || false,
        isNew: data.is_new || false,
        jackpot: data.jackpot || false,
        isLive: data.is_live || false,
        views: data.views || 0,
        gameIdentifier: data.game_id || '',
        gameCode: data.game_code || '',
        technology: data.technology || '',
        createdAt: data.created_at || '',
        updatedAt: data.updated_at || '',
      };

      return game;
    } catch (error) {
      console.error('Error fetching game by ID:', error);
      return null;
    }
  },

  async toggleFavorite(gameId: string, userId: string, isFavorite: boolean): Promise<boolean> {
    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorite_games')
          .delete()
          .eq('game_id', gameId)
          .eq('user_id', userId);

        if (error) {
          console.error('Error removing from favorites:', error);
          return false;
        }
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorite_games')
          .insert([{ game_id: gameId, user_id: userId }]);

        if (error) {
          console.error('Error adding to favorites:', error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  },

  async getFavoriteGames(userId: string): Promise<GameResponse> {
    try {
      const { data: favoriteIds, error: favError } = await supabase
        .from('favorite_games')
        .select('game_id')
        .eq('user_id', userId);

      if (favError) {
        console.error('Error fetching favorite game IDs:', favError);
        return { data: [], count: 0, error: favError.message };
      }

      if (!favoriteIds || favoriteIds.length === 0) {
        return { data: [], count: 0, error: null };
      }

      const gameIds = favoriteIds.map(fav => fav.game_id);
      
      const { data, error, count } = await supabase
        .from('games')
        .select('*', { count: 'exact' })
        .in('id', gameIds);

      if (error) {
        console.error('Error fetching favorite games:', error);
        return { data: [], count: 0, error: error.message };
      }

      // Map database fields to our Game interface
      const mappedGames: Game[] = data.map(game => ({
        id: game.id,
        title: game.title || game.game_name || '',
        description: game.description || '',
        provider: game.provider || '',
        category: game.category || game.game_type || '',
        image: game.image || game.cover || '',
        rtp: game.rtp || 0,
        minBet: game.min_bet || 0,
        maxBet: game.max_bet || 0,
        volatility: game.volatility || '',
        isPopular: game.is_popular || false,
        isNew: game.is_new || false,
        jackpot: game.jackpot || false,
        isLive: game.is_live || false,
        views: game.views || 0,
        isFavorite: true,
        gameIdentifier: game.game_id || '',
        gameCode: game.game_code || '',
        technology: game.technology || '',
        createdAt: game.created_at || '',
        updatedAt: game.updated_at || '',
      }));

      return { data: mappedGames, count: count || 0, error: null };
    } catch (error: any) {
      console.error('Error fetching favorite games:', error);
      return { data: [], count: 0, error: error.message };
    }
  },

  async incrementGameViews(gameId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('increment_game_view', { game_id: gameId });
      
      if (error) {
        console.error('Error incrementing game views:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error incrementing game views:', error);
      return false;
    }
  }
};

export default gamesDatabaseService;
