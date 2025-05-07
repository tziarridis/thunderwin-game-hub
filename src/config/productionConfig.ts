
/**
 * Production configuration for the casino
 * This file contains settings that should be adjusted for production deployment
 */

interface CasinoConfig {
  apiUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  enableAnalytics: boolean;
  maxRetries: number;
  gameProviders: {
    pragmaticPlay: {
      enabled: boolean;
      useRealEndpoints: boolean;
    },
    gitSlotPark: {
      enabled: boolean;
      useRealEndpoints: boolean;
    },
    infinGame: {
      enabled: boolean;
      useRealEndpoints: boolean;
    }
  };
  features: {
    demoMode: boolean;
    realMoneyEnabled: boolean;
    favoriteGames: boolean;
    achievements: boolean;
    tournaments: boolean;
    promotions: boolean;
  };
}

export const productionConfig: CasinoConfig = {
  // Replace these with actual production URLs
  apiUrl: 'https://api.thunderwin.com',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://xucpujttrmcfnxalnuzr.supabase.co',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1Y3B1anR0cm1jZm54YWxudXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNjU2MzYsImV4cCI6MjA2MDY0MTYzNn0.VvGD7ZD85wyoW_dFSAiPf2hdBpkBOzLk2mtTnH7MOZ4',
  enableAnalytics: true,
  maxRetries: 3,
  gameProviders: {
    pragmaticPlay: {
      enabled: true,
      useRealEndpoints: true  // Set to true for real money transactions
    },
    gitSlotPark: {
      enabled: true,
      useRealEndpoints: true
    },
    infinGame: {
      enabled: true,
      useRealEndpoints: true
    }
  },
  features: {
    demoMode: true,
    realMoneyEnabled: true,
    favoriteGames: true,
    achievements: false, // Future feature
    tournaments: true,
    promotions: true
  }
};

export default productionConfig;
