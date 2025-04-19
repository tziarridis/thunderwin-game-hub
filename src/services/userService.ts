
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

export interface UserFilter {
  email?: string;
  username?: string;
  role?: string;
  status?: string;
  limit?: number;
}

/**
 * Get user by ID
 */
export const getUserById = async (id: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      wallets (*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error getting user:', error);
    return null;
  }

  // Transform the data to match our User interface
  return {
    id: data.id,
    username: data.username,
    email: data.email,
    balance: data.wallets?.[0]?.balance || 0,
    isAdmin: data.role_id === 1,
    avatar: data.avatar,
    vipLevel: data.wallets?.[0]?.vip_level || 0,
    createdAt: data.created_at,
    isVerified: !data.banned,
    name: data.username,
    status: data.status as "Active" | "Pending" | "Inactive",
    joined: data.created_at,
    role: data.role_id === 1 ? "admin" : "user",
    favoriteGames: []
  };
};

/**
 * Get all users, optionally filtered
 */
export const getUsers = async (filter: UserFilter = {}): Promise<User[]> => {
  let query = supabase
    .from('users')
    .select(`
      *,
      wallets (*)
    `);
  
  if (filter.email) {
    query = query.ilike('email', `%${filter.email}%`);
  }
  
  if (filter.username) {
    query = query.ilike('username', `%${filter.username}%`);
  }
  
  if (filter.role) {
    const roleId = filter.role === 'admin' ? 1 : 3;
    query = query.eq('role_id', roleId);
  }
  
  if (filter.status) {
    query = query.eq('status', filter.status);
  }
  
  if (filter.limit) {
    query = query.limit(filter.limit);
  }
  
  const { data, error } = await query;

  if (error) {
    console.error('Error getting users:', error);
    return [];
  }

  // Transform the data to match our User interface
  return data.map(item => ({
    id: item.id,
    username: item.username,
    email: item.email,
    balance: item.wallets?.[0]?.balance || 0,
    isAdmin: item.role_id === 1,
    avatar: item.avatar,
    vipLevel: item.wallets?.[0]?.vip_level || 0,
    createdAt: item.created_at,
    isVerified: !item.banned,
    name: item.username,
    status: item.status as "Active" | "Pending" | "Inactive",
    joined: item.created_at,
    role: item.role_id === 1 ? "admin" : "user",
    favoriteGames: []
  }));
};

/**
 * Update user
 */
export const updateUser = async (user: User): Promise<User | null> => {
  // Update user table
  const { data, error } = await supabase
    .from('users')
    .update({
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      banned: !user.isVerified,
      role_id: user.role === 'admin' ? 1 : 3,
      status: user.status
    })
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating user:', error);
    return null;
  }

  // Update wallet if balance is provided
  if (user.balance !== undefined) {
    const wallet = await supabase
      .from('wallets')
      .update({
        balance: user.balance,
        vip_level: user.vipLevel || 0
      })
      .eq('user_id', user.id);
    
    if (wallet.error) {
      console.error('Error updating user wallet:', wallet.error);
    }
  }

  return getUserById(user.id);
};

export default {
  getUserById,
  getUsers,
  updateUser
};
