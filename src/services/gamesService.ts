import { Game } from '@/types'; // Ensure this is the correct Game type
import { supabase } from '@/integrations/supabase/client';

// This file seems to be a subset of gameService.ts functionality.
// Consolidating or clarifying its purpose is recommended.
// For now, fixing the specific error.

export const gamesService = {
  async getFeaturedGames(limit: number = 8): Promise<Game[]> {
    const { data, error } = await supabase
      .from('games')
      .select('*, providers(name)') // Assuming relation for provider name
      .eq('is_featured', true)
      .limit(limit)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching featured games:', error);
      throw error;
    }
    // Map data to Game type
    return (data || []).map((item: any) => ({
      id: String(item.id),
      title: item.game_name || 'Unknown Title',
      providerName: item.providers?.name || item.provider_slug || 'Unknown Provider', // Ensured providerName
      image: item.cover || '/placeholder.svg',
      categoryName: item.game_type || 'Unknown Category',
      rtp: typeof item.rtp === 'string' ? parseFloat(item.rtp) : item.rtp,
      isPopular: item.is_popular || item.show_home || false,
      isNew: item.is_new || (item.created_at ? new Date(item.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 : false),
      is_featured: item.is_featured,
      slug: item.slug || (item.game_name || '').toLowerCase().replace(/\s+/g, '-'),
      // Add all other required Game properties or make them optional in the type
      provider: item.providers?.name || item.provider_slug,
      category: item.game_type,
      // ... map other Game fields
    } as Game)); // Cast to Game, ensure all fields are covered
  },

  async getGameDetails(slugOrId: string): Promise<Game | null> {
    let query = supabase.from('games').select('*, providers(name)');
    
    // Check if slugOrId is likely a UUID (for ID search) or a slug
    const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(slugOrId);

    if (isUUID) {
      query = query.eq('id', slugOrId);
    } else {
      query = query.eq('slug', slugOrId);
    }

    const { data: item, error } = await query.maybeSingle();

    if (error) {
      console.error(`Error fetching game details for ${slugOrId}:`, error);
      throw error;
    }
    if (!item) return null;

    return {
      id: String(item.id),
      title: item.game_name || 'Unknown Title',
      providerName: item.providers?.name || item.provider_slug || 'Unknown Provider', // Ensured providerName
      image: item.cover || '/placeholder.svg',
      categoryName: item.game_type || 'Unknown Category',
      rtp: typeof item.rtp === 'string' ? parseFloat(item.rtp) : item.rtp,
      // ... map all other Game fields
      slug: item.slug,
      description: item.description,
      features: item.features || [],
      tags: item.tags || [],
      // ... etc.
    } as Game; // Cast to Game
  }
};
