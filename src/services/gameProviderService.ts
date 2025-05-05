
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Game launch options interface
export interface GameLaunchOptions {
  gameId: string;
  providerId?: string;
  mode: 'demo' | 'real';
  playerId: string;
  language?: string;
  currency?: string;
  returnUrl?: string;
  platform?: 'web' | 'mobile';
}

// Provider interface
interface Provider {
  id: string;
  code: string;
  name: string;
  apiEndpoint: string;
  callbackUrl: string;
  getLaunchUrl: (options: GameLaunchOptions) => string;
}

// Base URL for Supabase functions (edge functions)
const EDGE_FUNCTION_BASE_URL = `https://xucpujttrmcfnxalnuzr.supabase.co/functions/v1`;

// Game provider service
class GameProviderService {
  private providers: Map<string, Provider>;
  
  constructor() {
    this.providers = new Map();
    this.initializeProviders();
  }
  
  // Initialize providers from configuration
  private async initializeProviders() {
    try {
      // Fetch providers from the database
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('status', 'active');
        
      if (error) throw error;
      
      // Initialize each provider
      (data || []).forEach(provider => {
        this.addProvider({
          id: provider.id,
          code: provider.id,
          name: provider.name,
          apiEndpoint: provider.api_endpoint || '',
          callbackUrl: `${EDGE_FUNCTION_BASE_URL}/game_provider_callback/${provider.name.toLowerCase().replace(' ', '-')}`,
          getLaunchUrl: this.getProviderLaunchUrlGenerator(provider.name)
        });
      });
      
      // Always add default providers if not present
      if (!this.providers.has('ppeur')) {
        this.addProvider({
          id: 'ppeur',
          code: 'ppeur',
          name: 'Pragmatic Play',
          apiEndpoint: 'https://api-stage.pragmaticplay.net',
          callbackUrl: `${EDGE_FUNCTION_BASE_URL}/game_provider_callback/pragmatic-play`,
          getLaunchUrl: this.getPragmaticPlayLaunchUrl
        });
      }
      
      if (!this.providers.has('gitslotpark')) {
        this.addProvider({
          id: 'gitslotpark',
          code: 'gitslotpark',
          name: 'GitSlotPark',
          apiEndpoint: 'https://api.gitslotpark.com',
          callbackUrl: `${EDGE_FUNCTION_BASE_URL}/game_provider_callback/gitslotpark`,
          getLaunchUrl: this.getGitSlotParkLaunchUrl
        });
      }
    } catch (error) {
      console.error('Error initializing game providers:', error);
      toast.error('Failed to initialize game providers');
      
      // Add default providers even on error
      this.addProvider({
        id: 'ppeur',
        code: 'ppeur',
        name: 'Pragmatic Play',
        apiEndpoint: 'https://api-stage.pragmaticplay.net',
        callbackUrl: `${EDGE_FUNCTION_BASE_URL}/game_provider_callback/pragmatic-play`,
        getLaunchUrl: this.getPragmaticPlayLaunchUrl
      });
      
      this.addProvider({
        id: 'gitslotpark',
        code: 'gitslotpark',
        name: 'GitSlotPark',
        apiEndpoint: 'https://api.gitslotpark.com',
        callbackUrl: `${EDGE_FUNCTION_BASE_URL}/game_provider_callback/gitslotpark`,
        getLaunchUrl: this.getGitSlotParkLaunchUrl
      });
    }
  }
  
  // Add a provider to the service
  private addProvider(provider: Provider) {
    this.providers.set(provider.id, provider);
    console.log(`Provider added: ${provider.name}`);
  }
  
  // Get all registered providers
  public getProviders(): Provider[] {
    return Array.from(this.providers.values());
  }
  
  // Get launch URL generator function based on provider name
  private getProviderLaunchUrlGenerator(providerName: string): (options: GameLaunchOptions) => string {
    // Map provider names to launch URL generators
    const providerMap: Record<string, (options: GameLaunchOptions) => string> = {
      'Pragmatic Play': this.getPragmaticPlayLaunchUrl,
      'GitSlotPark': this.getGitSlotParkLaunchUrl
    };
    
    // Return the appropriate function or a default one
    return providerMap[providerName] || this.getDefaultLaunchUrl;
  }
  
  // Default launch URL generator
  private getDefaultLaunchUrl = (options: GameLaunchOptions): string => {
    const baseParams = new URLSearchParams({
      gameId: options.gameId,
      playerId: options.playerId,
      mode: options.mode,
      language: options.language || 'en',
      currency: options.currency || 'USD',
      platform: options.platform || 'web',
      returnUrl: options.returnUrl || window.location.origin
    });
    
    return `${window.location.origin}/casino/game/${options.gameId}?${baseParams.toString()}`;
  };
  
  // Pragmatic Play launch URL generator
  private getPragmaticPlayLaunchUrl = (options: GameLaunchOptions): string => {
    // Get the provider
    const provider = this.providers.get('ppeur');
    
    // Generate URL with proper callback
    const baseParams = new URLSearchParams({
      gameId: options.gameId,
      playerId: options.playerId,
      mode: options.mode,
      language: options.language || 'en',
      currency: options.currency || 'USD',
      platform: options.platform || 'web',
      returnUrl: options.returnUrl || window.location.origin,
      callbackUrl: provider?.callbackUrl || `${EDGE_FUNCTION_BASE_URL}/game_provider_callback/pragmatic-play`
    });
    
    // Use the real Pragmatic Play API endpoint if available
    const apiEndpoint = provider?.apiEndpoint || 'https://api-stage.pragmaticplay.net';
    return `${apiEndpoint}/launch/${options.gameId}?${baseParams.toString()}`;
  };
  
  // GitSlotPark launch URL generator
  private getGitSlotParkLaunchUrl = (options: GameLaunchOptions): string => {
    // Get the provider
    const provider = this.providers.get('gitslotpark');
    
    // Generate URL with proper callback
    const baseParams = new URLSearchParams({
      gameId: options.gameId,
      playerId: options.playerId,
      mode: options.mode,
      language: options.language || 'en',
      currency: options.currency || 'USD',
      platform: options.platform || 'web',
      returnUrl: options.returnUrl || window.location.origin,
      callbackUrl: provider?.callbackUrl || `${EDGE_FUNCTION_BASE_URL}/game_provider_callback/gitslotpark`
    });
    
    // Use the real GitSlotPark API endpoint if available
    const apiEndpoint = provider?.apiEndpoint || 'https://api.gitslotpark.com';
    return `${apiEndpoint}/launch?${baseParams.toString()}`;
  };
  
  // Get launch URL for a game
  public async getLaunchUrl(options: GameLaunchOptions): Promise<string> {
    try {
      // Validate options
      if (!options.gameId) {
        throw new Error('Game ID is required');
      }
      
      if (!options.playerId) {
        throw new Error('Player ID is required');
      }
      
      // Default provider ID to ppeur if not provided
      const providerId = options.providerId || 'ppeur';
      
      // Get the provider
      const provider = this.providers.get(providerId);
      
      if (!provider) {
        throw new Error(`Provider not found: ${providerId}`);
      }
      
      // Log game launch
      console.log(`Launching game ${options.gameId} with provider ${provider.name}`);
      
      // Record game launch in the database
      await this.recordGameLaunch(options, provider);
      
      // Get game launch URL
      return provider.getLaunchUrl(options);
    } catch (error: any) {
      console.error('Error getting game launch URL:', error);
      toast.error(error.message || 'Failed to launch game');
      throw error;
    }
  }
  
  // Record game launch in the database
  private async recordGameLaunch(options: GameLaunchOptions, provider: Provider) {
    try {
      const transactionData = {
        player_id: options.playerId,
        game_id: options.gameId,
        provider: provider.name,
        type: 'game_launch',
        amount: 0,
        currency: options.currency || 'USD',
        status: 'completed',
        description: `${provider.name} game launch: ${options.gameId}`
      };
      
      await supabase
        .from('transactions')
        .insert(transactionData);
    } catch (error) {
      console.error('Error recording game launch:', error);
      // Non-blocking - continue even if recording fails
    }
  }
}

export const gameProviderService = new GameProviderService();
export default gameProviderService;
