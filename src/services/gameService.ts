
import { Game, GameLaunchOptions } from '@/types/game';
import { supabase } from '@/integrations/supabase/client';
import { mapDbGameToGameAdapter } from '@/components/admin/GameAdapter';

export const gameService = {
  async getGameById(gameId: string): Promise<Game | null> {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*, providers:provider_id(*)')
        .eq('id', gameId)
        .single();

      if (error) throw error;
      if (!data) return null;

      return mapDbGameToGameAdapter(data);
    } catch (error) {
      console.error('Error fetching game by ID:', error);
      return null;
    }
  },

  async getGameBySlug(slug: string): Promise<Game | null> {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*, providers:provider_id(*)')
        .eq('game_code', slug)
        .single();

      if (error) throw error;
      if (!data) return null;

      return mapDbGameToGameAdapter(data);
    } catch (error) {
      console.error('Error fetching game by slug:', error);
      return null;
    }
  },

  async launchGame(game: Game, options: GameLaunchOptions): Promise<string | null> {
    // Mock launch URL generation
    const baseUrl = window.location.origin;
    const mode = options.mode || 'demo';
    const gameId = game.game_id || game.id;
    
    // Return a mock launch URL
    return `${baseUrl}/game-launch/${gameId}?mode=${mode}&user=${options.user_id || 'guest'}`;
  }
};
