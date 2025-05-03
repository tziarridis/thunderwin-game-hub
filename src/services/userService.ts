
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

export default {
  getUserById,
  getUserByUsername
};
