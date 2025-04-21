
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface GameLaunchOptions {
  gameId: string;
  playerId?: string;
  mode?: 'real' | 'demo';
  language?: string;
  currency?: string;
  returnUrl?: string;
  platform?: 'web' | 'mobile';
}

/**
 * Get a game launch URL from Play'n GO
 */
export async function getLaunchUrl(
  config: any, 
  options: GameLaunchOptions
): Promise<string> {
  const { 
    gameId, 
    playerId = 'demo', 
    mode = 'demo',
    language = 'en',
    currency = 'EUR',
    returnUrl
  } = options;
  
  // This is the URL structure for Play'n GO games
  const baseUrl = `https://${config.credentials.apiEndpoint}/launch`;
  
  // Create parameters for the game
  const params = new URLSearchParams({
    game: gameId,
    token: config.credentials.apiToken,
    player: playerId,
    mode,
    lang: language,
    currency: currency,
    home: returnUrl || 'https://captaingamble.com/casino'
  });
  
  console.log(`Launching ${config.name} game: ${gameId} for player: ${playerId} in ${mode} mode with currency: ${currency}`);
  
  // Return mock URL for demo
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Process a wallet callback from Play'n GO
 */
export async function processWalletCallback(config: any, data: any): Promise<any> {
  // Mock successful transaction
  console.log(`Processing ${config.name} wallet callback:`, data);
  
  return {
    success: true,
    balance: 100.00  // Mock balance
  };
}

/**
 * Log a Play'n GO transaction
 */
export async function logTransaction(data: any): Promise<void> {
  try {
    await supabase.from('transactions').insert({
      player_id: data.playerId,
      type: data.type || 'game_action',
      amount: data.amount || 0,
      currency: data.currency || 'EUR',
      provider: 'Play\'n GO',
      game_id: data.gameId,
      status: 'completed'
    });
  } catch (error) {
    console.error("Failed to log Play'n GO transaction:", error);
  }
}
