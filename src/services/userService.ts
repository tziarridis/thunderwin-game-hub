
import { supabase } from "@/integrations/supabase/client";

/**
 * Get user by ID
 * @param userId User ID
 * @returns User data or null
 */
export const getUserById = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    return null;
  }
};

/**
 * Get user data by username
 * @param username Username
 * @returns User data or null
 */
export const getUserByUsername = async (username: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error fetching user by username ${username}:`, error);
    return null;
  }
};

/**
 * Update user data
 * @param userId User ID
 * @param userData Updated user data
 * @returns Updated user data or null
 */
export const updateUser = async (userId: string, userData: Partial<any>) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    return null;
  }
};

/**
 * Get all users with pagination
 * @param page Page number (starting at 1)
 * @param pageSize Number of users per page
 * @returns Array of users and total count
 */
export const getUsers = async (page: number = 1, pageSize: number = 10) => {
  try {
    // Calculate the range for pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    // Get total count
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (countError) throw countError;
    
    // Get paginated data
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) throw error;
    
    return {
      users: data || [],
      total: count || 0
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { users: [], total: 0 };
  }
};

export default {
  getUserById,
  getUserByUsername,
  updateUser,
  getUsers
};
