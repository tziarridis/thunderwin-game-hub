import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/user'; // Assuming this is your detailed User type

export const userService = {
  async getAllUsers(options: { limit?: number; offset?: number; search?: string } = {}): Promise<User[]> {
    // This fetches from auth.users. You might have a separate 'profiles' or 'users' table.
    // For this example, we assume user_metadata contains enough info or you're fetching directly from auth.users
    // In a real app, you'd likely fetch from your public 'users' or 'profiles' table which is synced with auth.users
    
    // This is a placeholder. Admin SDK should be used for user listing.
    // supabase.auth.admin.listUsers() is an admin function and needs service_role key.
    // For client-side admin panel, you might query a 'profiles' table that RLS allows admin to read.

    // Let's query a 'profiles' table if it exists, or a 'users' public table.
    // Assuming 'users' table exists and is populated by 'handle_new_user' trigger
    let query = supabase.from('users').select('*'); // Select all from your public 'users' table

    if (options.search) {
      query = query.or(`email.ilike.%${options.search}%,username.ilike.%${options.search}%,id.ilike.%${options.search}%`);
    }
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + options.limit! - 1);
    }
     query = query.order('created_at', { ascending: false });


    const { data, error } = await query;

    if (error) {
      console.error("Error fetching users from 'users' table:", error);
      // Fallback or alternative if 'users' table isn't the primary source for User type
      // This part is tricky without knowing the exact DB schema and RLS for admin user listing
      // For now, we'll return data as is, assuming it somewhat matches the User type.
      // A proper mapping function would be needed here.
       return []; // Or throw error
    }
    
    // Map data from your 'users' table to the User type
    return (data || []).map(dbUser => ({
        id: dbUser.id, // This is the ID from your 'users' table, should match auth.users.id if synced
        email: dbUser.email,
        username: dbUser.username,
        created_at: dbUser.created_at,
        updated_at: dbUser.updated_at,
        role: dbUser.role_id === 1 ? 'admin' : dbUser.role_id === 2 ? 'moderator' : 'user', // Example mapping
        status: dbUser.status as User['status'],
        user_metadata: { // Populate from dbUser fields or assume it's fetched separately if needed
            name: dbUser.username, // Or first_name, last_name if you have them
            avatar_url: dbUser.avatar,
            kyc_status: (dbUser.kyc_status as User['user_metadata']['kyc_status']) || 'not_submitted',
        },
        // ... other fields from User type, ensure they are mapped
        app_meta_data: {}, // Placeholder
        aud: '', // Placeholder
    })) as User[];
  },

  async getUserById(id: string): Promise<User | null> {
    // Similar to getAllUsers, this should ideally fetch from your public 'users' or 'profiles' table
    // combined with auth user data if necessary.
    const { data: dbUser, error } = await supabase
      .from('users') // Your public users table
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!dbUser) return null;

    // Map to User type
    return {
        id: dbUser.id,
        email: dbUser.email,
        username: dbUser.username,
        created_at: dbUser.created_at,
        updated_at: dbUser.updated_at,
        role: dbUser.role_id === 1 ? 'admin' : dbUser.role_id === 2 ? 'moderator' : 'user',
        status: dbUser.status as User['status'],
        user_metadata: {
            name: dbUser.username,
            avatar_url: dbUser.avatar,
            kyc_status: (dbUser.kyc_status as User['user_metadata']['kyc_status']) || 'not_submitted',
        },
        app_meta_data: {},
        aud: '',
    } as User;
  },

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    // This should update your public 'users' table and potentially auth.users via admin functions if needed.
    // For simplicity, updating only 'users' table here.
    const updatePayload: any = {};
    if (userData.email) updatePayload.email = userData.email;
    if (userData.username) updatePayload.username = userData.username;
    if (userData.status) updatePayload.status = userData.status;
    if (userData.role) {
        updatePayload.role_id = userData.role === 'admin' ? 1 : userData.role === 'moderator' ? 2 : 3;
    }
    if (userData.user_metadata?.avatar_url) updatePayload.avatar = userData.user_metadata.avatar_url;
    // ... map other fields from User to your 'users' table schema

    const { data, error } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // If you need to update auth.users (e.g. email, password, metadata not synced by triggers)
    // you would call supabase.auth.admin.updateUserById(id, { ... }) here.
    // This requires service_role key and running in a secure environment (e.g., Supabase Edge Function).
    // Example for user_metadata (if not handled by triggers):
    // if (userData.user_metadata) {
    //   const { error: authUpdateError } = await supabase.auth.admin.updateUserById(id, {
    //     user_metadata: { ...currentUser.user_metadata, ...userData.user_metadata } // Merge metadata
    //   });
    //   if (authUpdateError) console.warn("Failed to update auth user metadata:", authUpdateError);
    // }

    return (await this.getUserById(data.id))!; // Re-fetch to get the full mapped User object
  },

  async deleteUser(id: string): Promise<void> {
    // Deleting from your public 'users' table.
    // Deleting from auth.users requires service_role key and supabase.auth.admin.deleteUser(id).
    // This should typically be handled by a Supabase Edge Function triggered by your app,
    // or ensure RLS allows cascade delete if 'users.id' is a FK to 'auth.users.id'.
    // For now, just deleting from the public 'users' table.
    const { error: dbError } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
    if (dbError) {
        console.error("Error deleting from 'users' table:", dbError);
        // Decide if to throw or proceed to try deleting auth user
    }

    // Attempt to delete the auth user (requires admin privileges, will fail client-side without proper setup)
    // This is usually done in a backend/edge function.
    // For client-side admin panel, this part would be an API call to such a function.
    // Silently ignore error for client-side example if it's due to permissions.
    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    if (authError && authError.message !== 'Database error saving new user') { // Ignore specific common error if user already deleted from auth
         // Check for specific permission errors if needed
        if (authError.message.includes("కరెంటు వాడుకరి")) { // "current user" in Telugu - possible Supabase internal message for permission denied
            console.warn(`Admin privileges required to delete auth user ${id}. User might remain in authentication system.`);
        } else if(!authError.message.includes("User not found")) { // Ignore if user is already gone from auth
            console.error(`Error deleting auth user ${id}:`, authError.message);
            // throw authError; // Optionally re-throw if critical
        }
    }
  },
  
  // createUser might involve sending an invite or setting a temporary password.
  // This is simplified and likely needs more robust implementation for an admin panel.
  // async createUser(userData: User): Promise<User> {
  //   // This is highly dependent on your setup (invite vs direct creation)
  //   // For direct creation with email/password (requires admin to set one):
  //   // const { data, error } = await supabase.auth.admin.createUser({
  //   //   email: userData.email,
  //   //   password: userData.password, // Needs a way to set/generate password
  //   //   user_metadata: userData.user_metadata,
  //   //   email_confirm: true, // Or false if you handle confirmation differently
  //   // });
  //   // if (error) throw error;
  //   // return data.user as User;
  //   throw new Error("Admin user creation not fully implemented client-side. Consider an invite system or server-side creation.");
  // }
};
