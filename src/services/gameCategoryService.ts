
import { supabase } from "@/integrations/supabase/client";

export interface GameCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  showHome: boolean;
}

export const gameCategoryService = {
  /**
   * Get all game categories
   */
  getCategories: async (): Promise<GameCategory[]> => {
    try {
      const { data, error } = await supabase
        .from('game_categories')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;

      return data?.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon || undefined,
        image: cat.image || undefined,
        showHome: cat.show_home
      })) || [];
    } catch (error: any) {
      console.error('Error fetching game categories:', error);
      return [];
    }
  },

  /**
   * Get categories that should be shown on the home page
   */
  getHomeCategories: async (): Promise<GameCategory[]> => {
    try {
      const { data, error } = await supabase
        .from('game_categories')
        .select('*')
        .eq('status', 'active')
        .eq('show_home', true)
        .order('name');

      if (error) throw error;

      return data?.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon || undefined,
        image: cat.image || undefined,
        showHome: cat.show_home
      })) || [];
    } catch (error: any) {
      console.error('Error fetching home game categories:', error);
      return [];
    }
  },

  /**
   * Get games in a specific category
   */
  getGamesByCategory: async (categorySlug: string, limit = 12): Promise<any[]> => {
    try {
      // First get category ID from slug
      const { data: category, error: catError } = await supabase
        .from('game_categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();

      if (catError) throw catError;

      if (!category) {
        return [];
      }

      // Get game IDs in this category
      const { data: mappings, error: mapError } = await supabase
        .from('game_category_mappings')
        .select('game_id')
        .eq('category_id', category.id)
        .limit(limit);

      if (mapError) throw mapError;

      if (!mappings || mappings.length === 0) {
        return [];
      }

      // Get game details
      const gameIds = mappings.map(m => m.game_id);
      const { data: games, error: gameError } = await supabase
        .from('games')
        .select('*, providers(name)')
        .in('id', gameIds);

      if (gameError) throw gameError;

      return games || [];
    } catch (error: any) {
      console.error(`Error fetching games for category ${categorySlug}:`, error);
      return [];
    }
  }
};

export default gameCategoryService;
