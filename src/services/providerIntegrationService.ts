
import { supabase } from '@/integrations/supabase/client';
import { getProviderConfig } from '@/config/gameProviders';
import { toast } from 'sonner';

export interface ProviderStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'degraded';
  responseTime: number;
  lastCheck: string;
  uptime: number;
  errorRate: number;
}

export interface GameLaunchRequest {
  gameId: string;
  playerId: string;
  mode: 'real' | 'demo';
  currency: string;
  language: string;
  returnUrl: string;
  sessionToken?: string;
}

export interface GameLaunchResponse {
  success: boolean;
  gameUrl?: string;
  sessionId?: string;
  errorMessage?: string;
  fallbackProvider?: string;
}

class ProviderIntegrationService {
  private providerStatus: Map<string, ProviderStatus> = new Map();
  private failoverProviders: Map<string, string[]> = new Map();
  private lastHealthCheck = 0;
  private healthCheckInterval = 60000; // 1 minute

  constructor() {
    this.initializeFailoverMapping();
    this.startHealthChecks();
  }

  private initializeFailoverMapping() {
    // Define failover providers for each primary provider
    this.failoverProviders.set('ppeur', ['ppusd', 'gspeur']);
    this.failoverProviders.set('ppusd', ['ppeur', 'gspeur']);
    this.failoverProviders.set('gspeur', ['ppeur', 'infineur']);
    this.failoverProviders.set('infineur', ['gspeur', 'ppeur']);
  }

  async launchGameWithFailover(request: GameLaunchRequest, primaryProviderId: string): Promise<GameLaunchResponse> {
    console.log(`Attempting to launch game ${request.gameId} with provider ${primaryProviderId}`);
    
    // Try primary provider first
    let response = await this.launchGameWithProvider(request, primaryProviderId);
    
    if (response.success) {
      await this.logProviderPerformance(primaryProviderId, true, Date.now());
      return response;
    }

    // If primary fails, try failover providers
    const failoverList = this.failoverProviders.get(primaryProviderId) || [];
    
    for (const failoverProviderId of failoverList) {
      console.log(`Primary provider ${primaryProviderId} failed, trying failover: ${failoverProviderId}`);
      
      const providerStatus = this.providerStatus.get(failoverProviderId);
      if (providerStatus?.status === 'offline') {
        continue; // Skip offline providers
      }

      response = await this.launchGameWithProvider(request, failoverProviderId);
      
      if (response.success) {
        response.fallbackProvider = failoverProviderId;
        await this.logProviderPerformance(failoverProviderId, true, Date.now());
        
        toast.info(`Game launched using backup provider: ${failoverProviderId}`);
        return response;
      }
    }

    // All providers failed
    await this.logProviderPerformance(primaryProviderId, false, Date.now());
    return {
      success: false,
      errorMessage: 'All game providers are currently unavailable. Please try again later.'
    };
  }

  private async launchGameWithProvider(request: GameLaunchRequest, providerId: string): Promise<GameLaunchResponse> {
    try {
      const startTime = Date.now();
      const providerConfig = getProviderConfig(providerId);
      
      if (!providerConfig) {
        return {
          success: false,
          errorMessage: `Provider configuration not found: ${providerId}`
        };
      }

      // Build the actual API request based on provider
      const apiRequest = this.buildProviderRequest(request, providerConfig);
      const apiUrl = this.getProviderApiUrl(providerConfig, 'launch');
      
      console.log(`Calling ${providerId} API:`, apiUrl, apiRequest);
      
      // Make the actual API call
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${providerConfig.credentials.token || providerConfig.credentials.secretKey}`,
          'User-Agent': 'CasinoThunder/1.0'
        },
        body: JSON.stringify(apiRequest),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      const responseTime = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Parse provider-specific response format
      const result = this.parseProviderResponse(data, providerId);
      
      // Update provider status
      await this.updateProviderStatus(providerId, 'online', responseTime);
      
      return result;
      
    } catch (error: any) {
      console.error(`Provider ${providerId} API error:`, error);
      
      await this.updateProviderStatus(providerId, 'offline', 0);
      
      return {
        success: false,
        errorMessage: `Provider ${providerId} error: ${error.message}`
      };
    }
  }

  private buildProviderRequest(request: GameLaunchRequest, providerConfig: any): any {
    const baseRequest = {
      playerId: request.playerId,
      gameId: request.gameId,
      mode: request.mode,
      currency: request.currency,
      language: request.language,
      returnUrl: request.returnUrl,
      timestamp: new Date().toISOString()
    };

    // Customize based on provider
    switch (providerConfig.code) {
      case 'PP': // Pragmatic Play
        return {
          secureLogin: providerConfig.credentials.agentId,
          playerId: request.playerId,
          gameSymbol: request.gameId,
          platform: 'WEB',
          mode: request.mode.toUpperCase(),
          lang: request.language,
          cur: request.currency,
          lobbyURL: request.returnUrl
        };
        
      case 'GSP': // GitSlotPark
        return {
          agent_id: providerConfig.credentials.agentId,
          player_id: request.playerId,
          game_id: request.gameId,
          mode: request.mode,
          currency: request.currency,
          language: request.language,
          return_url: request.returnUrl
        };
        
      case 'INFIN': // InfinGame
        return {
          agent: providerConfig.credentials.agentId,
          player_id: request.playerId,
          game_id: request.gameId,
          type: request.mode,
          currency: request.currency,
          lang: request.language,
          lobby_url: request.returnUrl
        };
        
      default:
        return baseRequest;
    }
  }

  private getProviderApiUrl(providerConfig: any, endpoint: string): string {
    const baseUrl = `https://${providerConfig.credentials.apiEndpoint}`;
    
    switch (providerConfig.code) {
      case 'PP':
        return `${baseUrl}/IntegrationService/v3/http/CasinoGameAPI/game/launch`;
      case 'GSP':
        return `${baseUrl}/api/v1/games/launch`;
      case 'INFIN':
        return `${baseUrl}/api/games/launch`;
      default:
        return `${baseUrl}/api/launch`;
    }
  }

  private parseProviderResponse(data: any, providerId: string): GameLaunchResponse {
    switch (providerId) {
      case 'ppeur':
      case 'ppusd':
        return {
          success: data.error === 0 || data.status === 'success',
          gameUrl: data.gameURL || data.launch_url,
          sessionId: data.sessionId || data.session_id,
          errorMessage: data.error !== 0 ? data.description : undefined
        };
        
      case 'gspeur':
        return {
          success: data.status === 'success',
          gameUrl: data.game_url,
          sessionId: data.session_id,
          errorMessage: data.status !== 'success' ? data.message : undefined
        };
        
      case 'infineur':
        return {
          success: data.success === true,
          gameUrl: data.url,
          sessionId: data.session_id,
          errorMessage: !data.success ? data.error : undefined
        };
        
      default:
        return {
          success: data.success || false,
          gameUrl: data.gameUrl || data.url,
          sessionId: data.sessionId || data.session_id,
          errorMessage: data.error || data.message
        };
    }
  }

  private async updateProviderStatus(providerId: string, status: 'online' | 'offline' | 'degraded', responseTime: number) {
    const current = this.providerStatus.get(providerId) || {
      id: providerId,
      name: providerId,
      status: 'offline',
      responseTime: 0,
      lastCheck: new Date().toISOString(),
      uptime: 0,
      errorRate: 0
    };

    this.providerStatus.set(providerId, {
      ...current,
      status,
      responseTime,
      lastCheck: new Date().toISOString()
    });

    // Store in database for persistence
    try {
      await supabase.from('system_config').upsert({
        config_key: `provider_status_${providerId}`,
        config_value: {
          status,
          responseTime,
          lastCheck: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        description: `Status tracking for provider ${providerId}`
      });
    } catch (error) {
      console.error('Error updating provider status:', error);
    }
  }

  private async logProviderPerformance(providerId: string, success: boolean, responseTime: number) {
    try {
      await supabase.from('provider_callback_logs').insert({
        provider_id: null, // We'll need to map this properly
        callback_type: 'game_launch',
        request_data: { providerId, timestamp: new Date().toISOString() },
        response_data: { success, responseTime },
        status_code: success ? 200 : 500,
        processing_time_ms: responseTime
      });
    } catch (error) {
      console.error('Error logging provider performance:', error);
    }
  }

  async verifyGameResult(gameSessionId: string, providerId: string, resultData: any): Promise<boolean> {
    try {
      const providerConfig = getProviderConfig(providerId);
      if (!providerConfig) return false;

      const verificationUrl = this.getProviderApiUrl(providerConfig, 'verify');
      
      const response = await fetch(verificationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${providerConfig.credentials.token || providerConfig.credentials.secretKey}`
        },
        body: JSON.stringify({
          sessionId: gameSessionId,
          resultData: resultData,
          timestamp: new Date().toISOString()
        })
      });

      const data = await response.json();
      return data.verified === true;
      
    } catch (error) {
      console.error('Error verifying game result:', error);
      return false;
    }
  }

  async createDispute(gameSessionId: string, playerId: string, reason: string, evidence: any): Promise<string> {
    try {
      const { data, error } = await supabase.from('audit_logs').insert({
        action: 'game_dispute_created',
        resource_type: 'game_session',
        resource_id: gameSessionId,
        user_id: playerId,
        old_values: null,
        new_values: {
          reason,
          evidence,
          status: 'open',
          createdAt: new Date().toISOString()
        }
      }).select('id').single();

      if (error) throw error;
      
      toast.info('Dispute has been created and will be reviewed by our team.');
      return data.id;
      
    } catch (error) {
      console.error('Error creating dispute:', error);
      throw error;
    }
  }

  private async startHealthChecks() {
    setInterval(async () => {
      const now = Date.now();
      if (now - this.lastHealthCheck < this.healthCheckInterval) return;

      this.lastHealthCheck = now;
      await this.performHealthChecks();
    }, this.healthCheckInterval);
  }

  private async performHealthChecks() {
    const providers = ['ppeur', 'ppusd', 'gspeur', 'infineur'];
    
    for (const providerId of providers) {
      const providerConfig = getProviderConfig(providerId);
      if (!providerConfig) continue;

      try {
        const startTime = Date.now();
        const healthUrl = `https://${providerConfig.credentials.apiEndpoint}/health`;
        
        const response = await fetch(healthUrl, {
          method: 'GET',
          signal: AbortSignal.timeout(5000) // 5 second timeout for health checks
        });

        const responseTime = Date.now() - startTime;
        const status = response.ok ? 'online' : 'degraded';
        
        await this.updateProviderStatus(providerId, status, responseTime);
        
      } catch (error) {
        console.warn(`Health check failed for ${providerId}:`, error);
        await this.updateProviderStatus(providerId, 'offline', 0);
      }
    }
  }

  getProviderStatus(): ProviderStatus[] {
    return Array.from(this.providerStatus.values());
  }

  async getProviderSLAMetrics(providerId: string, days: number = 30): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('provider_callback_logs')
        .select('*')
        .eq('callback_type', 'game_launch')
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const metrics = {
        totalRequests: data.length,
        successfulRequests: data.filter(log => log.status_code === 200).length,
        averageResponseTime: data.reduce((sum, log) => sum + (log.processing_time_ms || 0), 0) / data.length,
        uptime: 0,
        errorRate: 0
      };

      metrics.uptime = (metrics.successfulRequests / metrics.totalRequests) * 100;
      metrics.errorRate = ((metrics.totalRequests - metrics.successfulRequests) / metrics.totalRequests) * 100;

      return metrics;
      
    } catch (error) {
      console.error('Error fetching SLA metrics:', error);
      return null;
    }
  }
}

export const providerIntegrationService = new ProviderIntegrationService();
export default providerIntegrationService;
