
import { createClient } from "@supabase/supabase-js";

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://xucpujttrmcfnxalnuzr.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1Y3B1anR0cm1jZm54YWxudXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNjU2MzYsImV4cCI6MjA2MDY0MTYzNn0.VvGD7ZD85wyoW_dFSAiPf2hdBpkBOzLk2mtTnH7MOZ4";

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
