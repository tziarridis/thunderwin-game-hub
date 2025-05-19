
import { GameLaunchOptions } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// The interface for getting a launch URL
interface GetLaunchUrlParams {
  gameId: string;
  providerId: string;
  mode: 'real' | 'demo';
  user_id?: string;
  username?: string; 
  currency?: string;
  language?: string;
  platform?: 'web' | 'mobile' | 'desktop';
  returnUrl?: string;
  token?: string;
  [key: string]: any; // Allow additional provider-specific parameters
}

// This service handles launching games from different providers
const gameProviderService = {
  async getLaunchUrl(params: GetLaunchUrlParams): Promise<string | null> {
    const { gameId, providerId, mode, user_id, username, currency = 'USD', language = 'en' } = params;
    
    try {
      // In a real application, you would fetch provider data from the database
      // and use provider-specific logic to build the launch URL
      
      // Check if provider exists
      const { data: provider, error: providerError } = await supabase
        .from('providers')
        .select('api_endpoint, name')
        .eq('id', providerId)
        .maybeSingle();
      
      if (providerError || !provider) {
        // Fallback to finding by slug
        const { data: providerBySlug, error: slugError } = await supabase
          .from('providers')
          .select('api_endpoint, name')
          .eq('slug', providerId)
          .maybeSingle();
          
        if (slugError || !providerBySlug) {
          console.error("Provider not found:", providerId);
          toast.error("Game provider not found");
          return null;
        }
        
        provider.api_endpoint = providerBySlug.api_endpoint;
        provider.name = providerBySlug.name;
      }
      
      // For demo purposes, we'll use a mocked launch URL
      const baseUrl = provider.api_endpoint || 'https://demo-games.example.com';
      const launchUrl = new URL(`${baseUrl}/launch/${gameId}`);
      
      // Add common parameters
      launchUrl.searchParams.append('mode', mode);
      launchUrl.searchParams.append('language', language);
      launchUrl.searchParams.append('currency', currency);
      launchUrl.searchParams.append('platform', params.platform || 'web');
      
      if (mode === 'real' && user_id && username) {
        launchUrl.searchParams.append('userId', user_id);
        launchUrl.searchParams.append('username', username);
        
        // Create a game session record
        const { error: sessionError } = await supabase
          .from('game_sessions')
          .insert({
            user_id,
            game_id: gameId,
          });
          
        if (sessionError) {
          console.error("Error creating game session:", sessionError);
        }
      }
      
      if (params.returnUrl) {
        launchUrl.searchParams.append('returnUrl', params.returnUrl);
      }
      
      // For demo, just return to a generic game preview since we don't have real game integrations
      return `/casino/game-preview?gameId=${gameId}&mode=${mode}`;
      
      // In a real implementation, you would return the proper URL:
      // return launchUrl.toString();
    } catch (error) {
      console.error("Error getting game launch URL:", error);
      return null;
    }
  }
};

export default gameProviderService;
