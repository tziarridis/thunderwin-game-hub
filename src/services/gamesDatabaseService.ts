// Fix the infinite type instantiation by using more specific types
import { Game, GameResponse } from '@/types';
import { supabase } from '@/integrations/supabase/client';

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
        query = query.eq('isPopular', filters.isPopular);
      }
      if (filters?.isNew) {
        query = query.eq('isNew', filters.isNew);
      }
      if (filters?.hasJackpot) {
        query = query.eq('jackpot', filters.hasJackpot);
      }
      if (filters?.isLive) {
        query = query.eq('isLive', filters.isLive);
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

      return { data: data || [], count: count || 0, error: null };
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

      return data as Game;
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
  }
};

export default gamesDatabaseService;
