
import { supabase } from '@/integrations/supabase/client';
import { Game } from '@/types';

export interface GameProvider {
  id: string;
  name: string;
  apiEndpoint: string;
  apiKey: string;
  apiSecret: string;
  status: 'active' | 'inactive';
}

export interface GameLaunchResponse {
  success: boolean;
  gameUrl?: string;
  sessionId?: string;
  error?: string;
}

export interface GameStatistics {
  gameId: string;
  totalPlayers: number;
  totalBets: number;
  totalWins: number;
  rtp: number;
  popularity: number;
}

class GameAggregatorIntegration {
  
  async validateProvider(providerId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('id', providerId)
        .eq('status', 'active')
        .single();
      
      if (error || !data) {
        console.error('Provider validation failed:', error);
        return false;
      }
      
      // Test API connection
      const testResponse = await fetch(`${data.api_endpoint}/ping`, {
        headers: {
          'Authorization': `Bearer ${data.api_key}`,
          'Content-Type': 'application/json'
        }
      });
      
      return testResponse.ok;
    } catch (error) {
      console.error('Provider validation error:', error);
      return false;
    }
  }
  
  async generateLaunchUrl(gameId: string, playerId: string, mode: 'real' | 'demo' = 'demo'): Promise<GameLaunchResponse> {
    try {
      // Get game details
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('*, providers(*)')
        .eq('game_id', gameId)
        .single();
      
      if (gameError || !game) {
        return { success: false, error: 'Game not found' };
      }
      
      // Validate provider
      const isValidProvider = await this.validateProvider(game.provider_id);
      if (!isValidProvider) {
        return { success: false, error: 'Provider validation failed' };
      }
      
      // Generate session token
      const sessionToken = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      // Create game session
      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .insert({
          user_id: playerId,
          game_id: gameId,
          started_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (sessionError) {
        return { success: false, error: 'Failed to create game session' };
      }
      
      // Build launch URL
      const launchUrl = `${game.game_server_url}?` + new URLSearchParams({
        gameId: gameId,
        playerId: playerId,
        sessionId: session.id,
        mode: mode,
        token: sessionToken,
        returnUrl: window.location.origin
      }).toString();
      
      return {
        success: true,
        gameUrl: launchUrl,
        sessionId: session.id
      };
    } catch (error: any) {
      console.error('Game launch error:', error);
      return { success: false, error: error.message };
    }
  }
  
  async trackGameStatistics(gameId: string): Promise<GameStatistics> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('game_id', gameId);
      
      if (error) throw error;
      
      const transactions = data || [];
      const bets = transactions.filter(t => t.type === 'bet');
      const wins = transactions.filter(t => t.type === 'win');
      
      const totalBets = bets.reduce((sum, t) => sum + Number(t.amount), 0);
      const totalWins = wins.reduce((sum, t) => sum + Number(t.amount), 0);
      const uniquePlayers = new Set(transactions.map(t => t.player_id)).size;
      
      const rtp = totalBets > 0 ? (totalWins / totalBets) * 100 : 0;
      
      // Update game views/popularity
      await supabase.rpc('increment_game_view', { game_id: gameId });
      
      return {
        gameId,
        totalPlayers: uniquePlayers,
        totalBets,
        totalWins,
        rtp,
        popularity: uniquePlayers
      };
    } catch (error: any) {
      console.error('Error tracking game statistics:', error);
      throw error;
    }
  }
  
  async syncGamesFromProvider(providerId: string): Promise<Game[]> {
    try {
      const { data: provider, error } = await supabase
        .from('providers')
        .select('*')
        .eq('id', providerId)
        .single();
      
      if (error || !provider) {
        throw new Error('Provider not found');
      }
      
      // Fetch games from provider API
      const response = await fetch(`${provider.api_endpoint}/games`, {
        headers: {
          'Authorization': `Bearer ${provider.api_key}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch games from provider');
      }
      
      const providerGames = await response.json();
      const syncedGames: Game[] = [];
      
      for (const providerGame of providerGames.games || []) {
        const gameData = {
          game_id: providerGame.id,
          game_name: providerGame.name,
          game_code: providerGame.code,
          provider_id: providerId,
          game_type: providerGame.type || 'slot',
          description: providerGame.description,
          cover: providerGame.thumbnail,
          rtp: providerGame.rtp || 96,
          technology: 'html5',
          distribution: 'mobile_desktop',
          status: 'active',
          game_server_url: providerGame.launchUrl
        };
        
        // Upsert game
        const { data, error: upsertError } = await supabase
          .from('games')
          .upsert(gameData, { onConflict: 'game_id' })
          .select()
          .single();
        
        if (!upsertError && data) {
          syncedGames.push({
            id: data.id,
            title: data.game_name,
            name: data.game_name,
            provider: provider.name,
            category: data.game_type,
            image: data.cover || '/placeholder.svg',
            rtp: data.rtp,
            volatility: 'medium',
            minBet: 0.1,
            maxBet: 100,
            isPopular: false,
            isNew: false,
            isFavorite: false,
            jackpot: false,
            releaseDate: data.created_at,
            features: [],
            tags: [],
            description: data.description || ''
          });
        }
      }
      
      return syncedGames;
    } catch (error: any) {
      console.error('Error syncing games from provider:', error);
      throw error;
    }
  }
}

export const gameAggregatorIntegration = new GameAggregatorIntegration();
export default gameAggregatorIntegration;
