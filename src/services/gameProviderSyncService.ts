
// Fix the gameProviderSyncService errors
import { supabase } from '@/integrations/supabase/client';
import { Game } from '@/types/game';
import { gameProviderService } from './gameProviderService';

export class GameProviderSyncService {
  async syncProviderGames(providerId: string): Promise<Game[]> {
    try {
      // Fetch games from the provider
      const providerGames = await gameProviderService.fetchGamesByProvider(providerId);
      
      // Map provider games to our Game schema
      const mappedGames = providerGames.map((game: any) => ({
        provider_id: providerId,
        name: game.name,
        slug: game.slug || game.name.toLowerCase().replace(/\s+/g, '-'),
        thumbnail_url: game.image || '',
        launch_url: game.launch_url || '',
        categories: game.categories || [],
        description: game.description || '',
        is_new: game.is_new || false,
        is_popular: game.is_popular || false,
        status: 'active',
        provider_name: game.provider_name || '',
      }));

      // For each mapped game, insert or update
      for (const game of mappedGames) {
        const { data: existingGame } = await supabase
          .from('games')
          .select('*')
          .eq('slug', game.slug)
          .eq('provider_id', providerId)
          .maybeSingle();

        if (existingGame) {
          // Update existing game
          await supabase
            .from('games')
            .update(game)
            .eq('id', existingGame.id);
        } else {
          // Insert new game
          await supabase
            .from('games')
            .insert([game]); // Fixed: removed the unnecessary argument
        }
      }

      // Return the updated list of games
      const { data: updatedGames } = await supabase
        .from('games')
        .select('*')
        .eq('provider_id', providerId);

      return updatedGames || [];
    } catch (error: any) {
      console.error('Failed to sync provider games:', error);
      throw new Error(`Failed to sync provider games: ${error.message}`);
    }
  }
}

export const gameProviderSyncService = new GameProviderSyncService();
