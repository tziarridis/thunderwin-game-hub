
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define interfaces for data structures
export interface GameCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  status: string;
  show_home: boolean;
}

export interface GameCategoryMapping {
  id: string;
  game_id: string;
  category_id: string;
}

export const gameCategoryService = {
  /**
   * Fetch all game categories
   */
  getCategories: async () => {
    try {
      const { data, error } = await supabase
        .from('game_categories')
        .select('*')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching game categories:', error);
      toast.error('Failed to load game categories');
      return [];
    }
  },

  /**
   * Fetch a single category by slug
   */
  getCategoryBySlug: async (slug: string) => {
    try {
      const { data, error } = await supabase
        .from('game_categories')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error(`Error fetching category with slug ${slug}:`, error);
      return null;
    }
  },

  /**
   * Get games for a specific category
   */
  getGamesByCategory: async (categoryId: string) => {
    try {
      // Check if the game_category_mappings table exists
      // If not, we'll fall back to using the game_type field on the games table
      const { data: tableExists } = await supabase
        .from('game_categories')
        .select('id')
        .limit(1);
      
      if (tableExists) {
        // For now, skip using game_category_mappings since it might not exist
        // Just query games table directly using game_type
        const category = await gameCategoryService.getCategoryBySlug(categoryId);
        
        if (category) {
          const { data, error } = await supabase
            .from('games')
            .select('*, providers(name)')
            .eq('game_type', category.name);
            
          if (error) throw error;
          return data || [];
        }
      }
      
      // Fallback: direct query using slug as game_type
      const { data, error } = await supabase
        .from('games')
        .select('*, providers(name)')
        .eq('game_type', categoryId);
        
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error(`Error fetching games for category ${categoryId}:`, error);
      toast.error('Failed to load category games');
      return [];
    }
  },

  /**
   * Add a new game category
   */
  addCategory: async (category: Omit<GameCategory, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('game_categories')
        .insert(category)
        .select()
        .single();
      
      if (error) throw error;
      toast.success(`Category ${category.name} added successfully`);
      return data;
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast.error(error.message || 'Failed to add category');
      throw error;
    }
  },

  /**
   * Update an existing game category
   */
  updateCategory: async (id: string, category: Partial<GameCategory>) => {
    try {
      const { data, error } = await supabase
        .from('game_categories')
        .update(category)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      toast.success(`Category updated successfully`);
      return data;
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast.error(error.message || 'Failed to update category');
      throw error;
    }
  },

  /**
   * Delete a game category
   */
  deleteCategory: async (id: string) => {
    try {
      const { error } = await supabase
        .from('game_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success(`Category deleted successfully`);
      return true;
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error(error.message || 'Failed to delete category');
      throw error;
    }
  }
};

export default gameCategoryService;
