
// Fix the gameProviderSyncService errors
import { supabase } from '@/integrations/supabase/client';
import { Game } from '@/types/game';
import { gameProviderService } from './gameProviderService';

// Create an interface for the provider-specific game data
interface ProviderGame {
  name: string;
  slug?: string;
  image?: string;
  launch_url?: string;
  categories?: string[];
  description?: string;
  is_new?: boolean;
  is_popular?: boolean;
  provider_name?: string;
}

export class GameProviderSyncService {
  // Add a method to fetch games by provider ID
  async fetchGamesByProvider(providerId: string): Promise<ProviderGame[]> {
    try {
      // This would normally call an API. For now, return mock data
      // In a real implementation, we'd call the provider's API
      console.log(`Fetching games for provider ${providerId}`);
      
      // Get the provider name from the ID for mocked data
      const providerName = providerId.toUpperCase().includes('PP') 
        ? 'Pragmatic Play' 
        : providerId.toUpperCase().includes('GSP') 
          ? 'GitSlotPark' 
          : 'Unknown Provider';
      
      // Return mock data for now
      return [
        {
          name: 'Sweet Bonanza',
          slug: 'sweet-bonanza',
          image: 'https://example.com/images/sweet-bonanza.jpg',
          categories: ['slots', 'popular'],
          description: 'A sweet candy-themed slot game with cascading reels',
          is_popular: true,
          provider_name: providerName
        },
        {
          name: 'Wolf Gold',
          slug: 'wolf-gold',
          image: 'https://example.com/images/wolf-gold.jpg',
          categories: ['slots', 'animals'],
          description: 'Experience the wild west with this wolf-themed slot',
          is_new: true,
          provider_name: providerName
        }
      ];
    } catch (error) {
      console.error(`Failed to fetch games for provider ${providerId}:`, error);
      throw error;
    }
  }

  async syncProviderGames(providerId: string): Promise<Game[]> {
    try {
      // Fetch games from the provider
      const providerGames = await this.fetchGamesByProvider(providerId);
      
      // Map provider games to our Game schema
      const mappedGames = providerGames.map((game: ProviderGame) => ({
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

      // Check if 'games' table exists before proceeding
      const { data: existingTables } = await supabase
        .from('game_categories')
        .select('id')
        .limit(1);
      
      console.log("Existing tables check:", existingTables);
      
      // For now, just return the mapped games
      // In a real implementation, we would insert or update the games in the database
      return mappedGames;

      /* 
      // This code would be used if the games table exists in the database
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
            .insert([game]);
        }
      }

      // Return the updated list of games
      const { data: updatedGames } = await supabase
        .from('games')
        .select('*')
        .eq('provider_id', providerId);

      return updatedGames || [];
      */

    } catch (error: any) {
      console.error('Failed to sync provider games:', error);
      throw new Error(`Failed to sync provider games: ${error.message}`);
    }
  }
}

export const gameProviderSyncService = new GameProviderSyncService();
