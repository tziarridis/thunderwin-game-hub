
import { supabase } from "@/integrations/supabase/client";

// This file is maintained for backward compatibility,
// but now it's just a wrapper around Supabase client

// Initialize the database connection once at startup
export const initializeDatabase = async () => {
  try {
    console.log("Connecting to Supabase database...");
    const { data, error } = await supabase.from('wallets').select('id').limit(1);
    
    if (error) {
      console.error("Failed to connect to Supabase database:", error);
      return false;
    }
    
    console.log("Successfully connected to Supabase database");
    return true;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    return false;
  }
};

// Export a function to get the database status
export const getDatabaseStatus = async () => {
  try {
    const { data, error } = await supabase.from('users').select('id').limit(1);
    
    if (error) {
      return { 
        connected: false, 
        message: `Database connection failed: ${error.message}` 
      };
    }
    
    return { connected: true, message: "Supabase database connected successfully" };
  } catch (error) {
    return { 
      connected: false, 
      message: `Database connection failed: ${(error as Error).message}` 
    };
  }
};

// For development and testing purposes only
export const db = {
  connect: initializeDatabase,
  status: getDatabaseStatus,
  disconnect: () => {
    console.log("Disconnected from Supabase database");
    return true;
  }
};
