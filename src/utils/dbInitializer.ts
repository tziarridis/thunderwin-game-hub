
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// This function initializes the database with mock data
export async function initializeDatabase() {
  console.log("Initializing database with mock data...");
  
  const users = await setupUsers();
  
  console.log("Database initialization complete");
  
  return { users };
}

async function setupUsers() {
  console.log("Setting up users...");
  try {
    // Check if we already have users
    const { data: existingUsers, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
      
    // If we already have users, don't create more
    if (existingUsers && existingUsers.length > 0) {
      console.log("Users already exist, skipping creation");
      return existingUsers;
    }
    
    // Create demo users
    const users = [
      {
        id: "1",
        name: "Admin User",
        username: "admin",
        email: "admin@example.com",
        balance: 10000,
        isAdmin: true,
        vipLevel: 5,
        isVerified: true,
        status: "Active" as const,
        joined: new Date().toISOString(),
        role: "admin" as const,
        favoriteGames: []
      },
      {
        id: "2",
        name: "John Doe",
        username: "johndoe",
        email: "john@example.com",
        balance: 1500,
        isAdmin: false,
        vipLevel: 2,
        isVerified: true,
        status: "Active" as const,
        joined: new Date().toISOString(),
        role: "user" as const,
        favoriteGames: ["game-1", "game-2"]
      },
      {
        id: "3",
        name: "Jane Smith",
        username: "janesmith",
        email: "jane@example.com",
        balance: 2500,
        isAdmin: false,
        vipLevel: 3,
        isVerified: true,
        status: "Active" as const,
        joined: new Date().toISOString(),
        role: "user" as const,
        favoriteGames: ["game-3"]
      },
      {
        id: "4",
        name: "Bob Johnson",
        username: "bobjohnson",
        email: "bob@example.com",
        balance: 500,
        isAdmin: false,
        vipLevel: 1,
        isVerified: true,
        status: "Pending" as const,
        joined: new Date().toISOString(),
        role: "user" as const,
        favoriteGames: []
      }
    ];
    
    // Create users in Supabase
    for (const user of users) {
      // Create the user in auth
      const { data: authUser, error: authError } = await supabase.auth.signUp({
        email: user.email,
        password: 'tempPassword123', // We won't store this in the User object
        options: {
          data: {
            name: user.name
          }
        }
      });
      
      if (authError) {
        console.error("Error creating auth user:", authError);
        continue;
      }
      
      // Create the user in our custom users table
      // Note: This would normally happen through a database trigger
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authUser.user?.id,
          username: user.username,
          email: user.email,
          role_id: user.isAdmin ? 1 : 3, // 1 for admin, 3 for regular user
          status: user.status.toLowerCase(),
          created_at: user.joined
        });
        
      if (userError) {
        console.error("Error creating user:", userError);
        continue;
      }
      
      // Create a wallet for the user
      const { error: walletError } = await supabase
        .from('wallets')
        .insert({
          user_id: authUser.user?.id,
          balance: user.balance,
          currency: 'USD',
          symbol: '$',
          active: true,
          vip_level: user.vipLevel
        });
        
      if (walletError) {
        console.error("Error creating wallet:", walletError);
      }
    }
    
    return users;
    
  } catch (error) {
    console.error("Error setting up users:", error);
    return [];
  }
}
