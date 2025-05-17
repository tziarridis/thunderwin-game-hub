// @ts-nocheck TODO: Remove ts-nocheck and fix all type errors
import { supabase } from '@/integrations/supabase/client';
import { Game, DbGame, GameCategory as AppGameCategory, GameProvider as AppGameProvider, QueryOptions, ApiResponse, PaginatedResponse } from '@/types'; // Ensure correct types are imported

// Define a more specific type for game creation if needed, matching DB columns
// For now, we'll use Partial<DbGame> for create/update and assume it aligns with DB

export const gamesDatabaseService = {
  // CREATE
  async createGame(gameData: Partial<DbGame>): Promise<ApiResponse<DbGame>> {
    try {
      // Map Partial<DbGame> to ensure all required DB fields are present or defaulted if necessary
      // For example, if 'title' is non-nullable in DB but optional in Partial<DbGame>, handle it.
      // Here we assume gameData is already shaped correctly for DB insertion.
      const { data, error } = await supabase
        .from('games') // Your Supabase table name for games
        .insert([gameData])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error("Error creating game:", error);
      return { success: false, error: error.message };
    }
  },

  // READ ONE
  async getGameById(id: string): Promise<ApiResponse<DbGame>> {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*') // Select all columns from 'games' table
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Not found error
          return { success: false, error: `Game with ID ${id} not found.`, statusCode: 404 };
        }
        throw error;
      }
      return { success: true, data };
    } catch (error: any) {
      console.error(`Error fetching game ${id}:`, error);
      return { success: false, error: error.message };
    }
  },
  
  async getGameBySlug(slug: string): Promise<ApiResponse<DbGame>> {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('slug', slug) // Assuming 'slug' is a unique column in your 'games' table
        .maybeSingle(); // Use maybeSingle if slug might not exist

      if (error) throw error;
      if (!data) return { success: false, error: `Game with slug ${slug} not found.`, statusCode: 404 };
      return { success: true, data };
    } catch (error: any) {
      console.error(`Error fetching game by slug ${slug}:`, error);
      return { success: false, error: error.message };
    }
  },


  // READ ALL (with pagination and filtering)
  async getAllGames(options?: QueryOptions): Promise<ApiResponse<DbGame[]>> {
    try {
      let query = supabase.from('games').select('*', { count: 'exact' });

      // Sorting
      if (options?.sort) {
        query = query.order(options.sort.field as keyof DbGame, { ascending: options.sort.direction === 'asc' });
      } else {
        query = query.order('title' as keyof DbGame, { ascending: true }); // Default sort
      }

      // Pagination
      const page = options?.page || 1;
      const limit = options?.limit || 100; // Default limit
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);
      
      // Filtering (simple example by provider or category slug)
      if (options?.filters?.provider_slug) {
        query = query.eq('provider_slug', options.filters.provider_slug);
      }
      if (options?.filters?.category_slug) {
        // This assumes category_slugs is an array in DB or needs specific query for array contains
        // If category_slugs is text like 'slug1,slug2', use .like or .ilike
         query = query.contains('category_slugs', [options.filters.category_slug]);
      }
      if (options?.search) {
        query = query.ilike('title', `%${options.search}%`);
      }


      const { data, error, count } = await query;

      if (error) throw error;
      return { 
        success: true, 
        data: data as DbGame[],
        // total: count // This would be part of a PaginatedResponse
      };
    } catch (error: any) {
      console.error("Error fetching all games:", error);
      return { success: false, error: error.message };
    }
  },
  
  async getPaginatedGames(options: QueryOptions = {}): Promise<ApiResponse<PaginatedResponse<DbGame>>> {
    const { page = 1, limit = 20, sort, filters, search } = options;
    try {
      let query = supabase.from('games').select('*', { count: 'exact' });

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,provider_slug.ilike.%${search}%`);
      }

      if (filters) {
        for (const key in filters) {
          if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
            if (key === 'category_slugs' && Array.isArray(filters[key])) {
              query = query.contains(key, filters[key]);
            } else if (typeof filters[key] === 'boolean') {
                query = query.is(key as keyof DbGame, filters[key]);
            }
            else {
              query = query.eq(key as keyof DbGame, filters[key]);
            }
          }
        }
      }
      
      if (sort && sort.field) {
        query = query.order(sort.field as keyof DbGame, { ascending: sort.direction === 'asc' });
      } else {
        query = query.order('created_at' as keyof DbGame, { ascending: false });
      }

      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        success: true,
        data: {
          data: data as DbGame[],
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error: any) {
      console.error("Error fetching paginated games:", error);
      return { success: false, error: error.message };
    }
  },

  // UPDATE
  async updateGame(id: string, gameData: Partial<DbGame>): Promise<ApiResponse<DbGame>> {
    try {
      // Ensure only fields present in DbGame are passed for update
      const { data, error } = await supabase
        .from('games')
        .update(gameData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error(`Error updating game ${id}:`, error);
      return { success: false, error: error.message };
    }
  },

  // DELETE
  async deleteGame(id: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true, message: "Game deleted successfully." };
    } catch (error: any) {
      console.error(`Error deleting game ${id}:`, error);
      return { success: false, error: error.message };
    }
  },
  
  async incrementGameViews(gameId: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase.rpc('increment_game_view', { game_id_param: gameId }); // Ensure param name matches SQL function
      if (error) throw error;
      return { success: true, message: "Game views incremented." };
    } catch (error: any) {
      console.error(`Error incrementing views for game ${gameId}:`, error);
      return { success: false, error: error.message };
    }
  },
  
  // Helper to get distinct provider slugs from games table
  async getDistinctProvidersFromGames(): Promise<ApiResponse<string[]>> {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('provider_slug');
        // .distinct(); // Supabase JS client might not have .distinct(), do it manually if needed or use RPC
      
      if (error) throw error;

      // Manual distinct
      const providerSlugs = [...new Set(data.map(item => item.provider_slug).filter(Boolean))];
      
      return { success: true, data: providerSlugs };
    } catch (error: any) {
      console.error("Error fetching distinct providers from games:", error);
      return { success: false, error: error.message };
    }
  },

  async getGamesByProvider(providerSlug: string, options?: QueryOptions): Promise<ApiResponse<DbGame[]>> {
    try {
      let query = supabase
        .from('games')
        .select('*')
        .eq('provider_slug', providerSlug);

      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.sort) {
        query = query.order(options.sort.field as keyof DbGame, { ascending: options.sort.direction === 'asc' });
      }


      const { data, error } = await query;
      if (error) throw error;
      return { success: true, data: data as DbGame[] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
  
  async getGamesByCategory(categorySlug: string, options?: QueryOptions): Promise<ApiResponse<DbGame[]>> {
    try {
      let query = supabase
        .from('games')
        .select('*')
        .contains('category_slugs', [categorySlug]); // Assuming category_slugs is an array

      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.sort) {
        query = query.order(options.sort.field as keyof DbGame, { ascending: options.sort.direction === 'asc' });
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return { success: true, data: data as DbGame[] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
  
  // ... other specific queries as needed
};
