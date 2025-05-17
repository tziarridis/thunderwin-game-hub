
import { supabase } from '@/integrations/supabase/client';
import { Game, GameCategory, GameProvider } from '@/types'; // Assuming Game is defined in @/types
import { PostgrestSingleResponse } from '@supabase/supabase-js';

// Helper to map DB game to Game type
const mapDbGameToGameType = (dbGame: any): Game => {
  // Fallback for missing name field, use title.
  const title = dbGame.title || dbGame.game_name || 'Unknown Game';
  return {
    id: dbGame.id || dbGame.game_id,
    title: title,
    name: dbGame.name || title, // Ensure name is populated
    description: dbGame.description || '',
    provider: dbGame.provider || dbGame.provider_name || 'Unknown Provider',
    category: dbGame.category || dbGame.category_name || 'general',
    image: dbGame.image || dbGame.cover || '/placeholder.svg',
    rtp: dbGame.rtp || 0,
    minBet: dbGame.min_bet || dbGame.minBet || 0,
    maxBet: dbGame.max_bet || dbGame.maxBet || 0,
    volatility: dbGame.volatility || 'medium',
    isPopular: dbGame.is_popular || dbGame.isPopular || false,
    isNew: dbGame.is_new || dbGame.isNew || false,
    jackpot: dbGame.jackpot || dbGame.has_jackpot || null, // or some default if it's a specific type
    isLive: dbGame.is_live || dbGame.is_live_game || false,
    views: dbGame.views || 0,
    features: dbGame.features || [], // Ensure features is an array
    tags: dbGame.tags || [], // Ensure tags is an array
    url: dbGame.url || dbGame.game_server_url || '',
    createdAt: dbGame.created_at || new Date().toISOString(),
    updatedAt: dbGame.updated_at || new Date().toISOString(),
  };
};

export const gamesDatabaseService = {
  // Fetch all games
  async getAllGames(): Promise<Game[]> {
    const { data, error } = await supabase.from('games').select('*');
    if (error) throw error;
    return data ? data.map(mapDbGameToGameType) : [];
  },

  // Fetch a single game by ID
  async getGameById(id: string): Promise<Game | null> {
    const { data, error }: PostgrestSingleResponse<any> = await supabase
      .from('games')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data ? mapDbGameToGameType(data) : null;
  },
  
  // Fetch games by category
  async getGamesByCategory(categorySlug: string): Promise<Game[]> {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('category', categorySlug); // Assuming 'category' column stores slug or name
    if (error) throw error;
    return data ? data.map(mapDbGameToGameType) : [];
  },

  // Fetch games by provider
  async getGamesByProvider(providerSlug: string): Promise<Game[]> {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('provider', providerSlug); // Assuming 'provider' column stores slug or name
    if (error) throw error;
    return data ? data.map(mapDbGameToGameType) : [];
  },

  // Fetch popular games
  async getPopularGames(limit: number = 10): Promise<Game[]> {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('is_popular', true)
      .limit(limit);
    if (error) throw error;
    return data ? data.map(mapDbGameToGameType) : [];
  },

  // Fetch new games
  async getNewGames(limit: number = 10): Promise<Game[]> {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('is_new', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ? data.map(mapDbGameToGameType) : [];
  },

  // Search games
  async searchGames(searchTerm: string): Promise<Game[]> {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .or(`title.ilike.%${searchTerm}%,provider.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
    if (error) throw error;
    return data ? data.map(mapDbGameToGameType) : [];
  },
  
  // Increment game view count
  async incrementGameView(gameId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_game_view', { game_id: gameId });
    if (error) {
      console.error('Error incrementing game view:', error);
      // Don't throw, as it's not critical for game play
    }
  },

  // Fetch all game categories
  async getGameCategories(): Promise<GameCategory[]> {
    // This might need to fetch from a 'categories' table or derive from 'games'
    // For now, let's assume a 'game_categories' table
    const { data, error } = await supabase.from('game_categories').select('*');
    if (error) throw error;
    return data || [];
  },

  // Fetch all game providers
  async getGameProviders(): Promise<GameProvider[]> {
    // Similar to categories, assuming a 'game_providers' table
    const { data, error } = await supabase.from('game_providers').select('*');
    if (error) throw error;
    return data || [];
  },
  
  // Add more functions as needed for CRUD operations, if required by admin panel
  // Example: Add a new game (ensure gameData matches Game type partially, id generated by DB)
  async addGame(gameData: Omit<Game, 'id' | 'createdAt' | 'updatedAt' | 'views'>): Promise<Game | null> {
    const { data, error }: PostgrestSingleResponse<any> = await supabase
      .from('games')
      .insert([gameData])
      .select()
      .single();
    if (error) throw error;
    return data ? mapDbGameToGameType(data) : null;
  },

  // Example: Update an existing game
  async updateGame(gameId: string, updates: Partial<Game>): Promise<Game | null> {
    const { data, error }: PostgrestSingleResponse<any> = await supabase
      .from('games')
      .update(updates)
      .eq('id', gameId)
      .select()
      .single();
    if (error) throw error;
    return data ? mapDbGameToGameType(data) : null;
  },

  // Example: Delete a game
  async deleteGame(gameId: string): Promise<boolean> {
    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', gameId);
    if (error) throw error;
    return true;
  },
};

