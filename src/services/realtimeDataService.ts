import { supabase } from '@/integrations/supabase/client';

export interface RealtimeStats {
  totalOnline: number;
  totalPlaying: number;
  activeSessions: number;
  lastUpdated: string;
}

export interface RealtimePlayerUpdate {
  userId: string;
  status: 'online' | 'playing' | 'offline';
  gameId?: string;
  sessionId?: string;
}

class RealtimeDataService {
  private subscribers: Map<string, (data: any) => void> = new Map();
  private playerStatsChannel: any = null;
  private transactionChannel: any = null;
  private currentStats: RealtimeStats = {
    totalOnline: 0,
    totalPlaying: 0,
    activeSessions: 0,
    lastUpdated: new Date().toISOString()
  };
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) {
      console.log('Realtime service already initialized');
      return;
    }

    try {
      console.log('Initializing realtime data service...');
      
      this.playerStatsChannel = supabase
        .channel('realtime-player-stats-config') // Unique channel name
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all changes
            schema: 'public',
            table: 'system_config',
            filter: `config_key=eq.realtime_player_stats` // Filter for specific key
          },
          (payload) => this.handleSystemConfigUpdate(payload)
        )
        .subscribe((status, err) => {
          if (err) {
            console.error('Player stats channel subscription error:', err);
          } else {
            console.log('Player stats channel status:', status);
          }
        });

      this.transactionChannel = supabase
        .channel('transaction-updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'transactions'
          },
          (payload) => this.handleTransactionUpdate(payload)
        )
        .subscribe((status, err) => {
           if (err) {
            console.error('Transaction channel subscription error:', err);
          } else {
            console.log('Transaction channel status:', status);
          }
        });

      await this.fetchCurrentStats();
      
      // Check if realtime_player_stats exists, if not, initialize it via Edge Function
      const { data: initialConfig } = await supabase
        .from('system_config')
        .select('config_key')
        .eq('config_key', 'realtime_player_stats')
        .maybeSingle();

      if (!initialConfig) {
        console.log("realtime_player_stats not found in system_config, attempting to initialize...");
        // Call an edge function to initialize if needed, or ensure admin does it.
        // For now, we assume it might exist or will be created by an admin process.
        // The `updatePlayerStatus` will also effectively create it if it doesn't exist via upsert.
        // Let's make `initializeStatsRecord` also use an Edge Function if it's critical for client init.
        // For now, this will be handled by upsert logic in `update-realtime-stats` if called.
      }

      this.isInitialized = true;
      console.log('Realtime data service initialized successfully');
    } catch (error) {
      console.error('Error initializing realtime data service:', error);
      this.isInitialized = false;
    }
  }

  private async fetchCurrentStats() {
    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('config_value')
        .eq('config_key', 'realtime_player_stats')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116: No rows found
        console.error('Error fetching current stats:', error);
        // Initialize with default if not found, but don't attempt to write here directly
        this.currentStats = { totalOnline: 0, totalPlaying: 0, activeSessions: 0, lastUpdated: new Date().toISOString() };
        this.notifySubscribers('player_stats', this.currentStats);
        return;
      }

      if (data?.config_value) {
        const stats = data.config_value as any;
        this.currentStats = {
          totalOnline: stats.total_online || 0,
          totalPlaying: stats.total_playing || 0,
          activeSessions: stats.active_sessions || 0,
          lastUpdated: stats.updated_at || new Date().toISOString()
        };
        console.log('Current stats fetched:', this.currentStats);
      } else {
        console.log('No real-time stats found in system_config, using defaults.');
        this.currentStats = { totalOnline: 0, totalPlaying: 0, activeSessions: 0, lastUpdated: new Date().toISOString() };
      }
      this.notifySubscribers('player_stats', this.currentStats);
    } catch (error) {
      console.error('Error in fetchCurrentStats:', error);
      this.currentStats = { totalOnline: 0, totalPlaying: 0, activeSessions: 0, lastUpdated: new Date().toISOString() };
      this.notifySubscribers('player_stats', this.currentStats);
    }
  }

  // Removed initializeStatsRecord as direct client-side write is problematic due to RLS.
  // Initialization should be handled by an admin or the `update-realtime-stats` Edge Function's upsert logic.

  private handleSystemConfigUpdate(payload: any) {
    console.log('System config update received:', payload);
    if (payload.new?.config_key === 'realtime_player_stats' && payload.new?.config_value) {
      const stats = payload.new.config_value as any;
      this.currentStats = {
        totalOnline: stats.total_online || 0,
        totalPlaying: stats.total_playing || 0,
        activeSessions: stats.active_sessions || 0,
        lastUpdated: stats.updated_at || new Date().toISOString()
      };
      console.log('Player stats updated via Realtime:', this.currentStats);
      this.notifySubscribers('player_stats', this.currentStats);
    } else if (payload.new?.config_key === 'realtime_player_stats' && !payload.new?.config_value) {
      // This case could happen if the row is updated with a null config_value, or deleted and reinserted in a transaction
      // Handle as a reset or log a warning.
      console.warn('realtime_player_stats config_value is null or undefined in payload:', payload);
    }
  }
  
  private handleTransactionUpdate(payload: any) {
    console.log('New transaction:', payload);
    
    // Notify subscribers about new transaction
    this.notifySubscribers('new_transaction', payload.new);
  }

  async updatePlayerStatus(update: RealtimePlayerUpdate) {
    try {
      if (!this.isInitialized) {
        // Avoid calling initialize() recursively if called from within initialize() path.
        // This function should primarily be called after initialization.
        console.warn('updatePlayerStatus called before service fully initialized. Attempting to proceed.');
        // await this.initialize(); // This could lead to loops if not careful
      }
      console.log(`[RealtimeDataService] Calling update-realtime-stats Edge Function for:`, update);
      console.log(`[RealtimeDataService] Sending current client stats:`, this.currentStats);

      const { data, error } = await supabase.functions.invoke('update-realtime-stats', {
        body: { update, currentStats: this.currentStats }, // Send client's current view of stats for context if needed by Edge Fn
      });

      if (error) {
        console.error('[RealtimeDataService] Error calling update-realtime-stats function:', error);
        throw error;
      }

      if (data && data.success && data.updatedStats) {
        console.log('[RealtimeDataService] update-realtime-stats Edge Function successful. Updated stats from function:', data.updatedStats);
        // The Realtime subscription to system_config should pick up this change and update currentStats via handleSystemConfigUpdate.
        // So, no direct update to this.currentStats here to avoid race conditions / duplicate updates.
        // The Edge Function updates the DB, DB change triggers Realtime, Realtime updates client.
      } else if (data && !data.success) {
        console.error('[RealtimeDataService] update-realtime-stats Edge Function reported failure:', data.error);
        throw new Error(data.error || 'Edge function call failed');
      } else {
        console.warn('[RealtimeDataService] Unexpected response from update-realtime-stats function:', data);
      }

    } catch (error) {
      console.error('[RealtimeDataService] Error in updatePlayerStatus:', error);
      // Potentially notify UI of error
    }
  }

  subscribe(eventType: string, callback: (data: any) => void): string {
    const id = `${eventType}_${Date.now()}_${Math.random()}`;
    this.subscribers.set(id, callback);
    console.log(`New subscriber added: ${id}`);
    return id;
  }

  unsubscribe(subscriptionId: string) {
    const removed = this.subscribers.delete(subscriptionId);
    console.log(`Subscriber ${subscriptionId} removed:`, removed);
  }

  private notifySubscribers(eventType: string, data: any) {
    let notified = 0;
    this.subscribers.forEach((callback, id) => {
      if (id.startsWith(eventType)) {
        try {
          callback(data);
          notified++;
        } catch (error) {
          console.error('Error in subscriber callback:', error);
        }
      }
    });
    console.log(`Notified ${notified} subscribers for event: ${eventType}`);
  }

  getCurrentStats(): RealtimeStats {
    return { ...this.currentStats };
  }

  async cleanup() {
    try {
      if (this.playerStatsChannel) {
        await supabase.removeChannel(this.playerStatsChannel);
        console.log('Player stats channel removed');
      }
      if (this.transactionChannel) {
        await supabase.removeChannel(this.transactionChannel);
        console.log('Transaction channel removed');
      }
      this.subscribers.clear();
      this.isInitialized = false;
      console.log('Realtime service cleaned up');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

export const realtimeDataService = new RealtimeDataService();
export default realtimeDataService;
