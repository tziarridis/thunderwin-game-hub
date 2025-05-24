
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

  async initialize() {
    try {
      // Subscribe to realtime player stats updates
      this.playerStatsChannel = supabase
        .channel('realtime-player-stats')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'realtime_player_stats'
          },
          (payload) => this.handlePlayerStatsUpdate(payload)
        )
        .subscribe();

      // Subscribe to transaction updates for live metrics
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
        .subscribe();

      // Initial stats fetch
      await this.fetchCurrentStats();
      
      console.log('Realtime data service initialized');
    } catch (error) {
      console.error('Error initializing realtime data service:', error);
    }
  }

  private async fetchCurrentStats() {
    try {
      const { data, error } = await supabase
        .from('realtime_player_stats')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching current stats:', error);
        return;
      }

      if (data) {
        this.currentStats = {
          totalOnline: data.total_online || 0,
          totalPlaying: data.total_playing || 0,
          activeSessions: data.active_sessions || 0,
          lastUpdated: data.updated_at || new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Error in fetchCurrentStats:', error);
    }
  }

  private handlePlayerStatsUpdate(payload: any) {
    console.log('Player stats updated:', payload);
    
    if (payload.new) {
      this.currentStats = {
        totalOnline: payload.new.total_online || 0,
        totalPlaying: payload.new.total_playing || 0,
        activeSessions: payload.new.active_sessions || 0,
        lastUpdated: payload.new.updated_at || new Date().toISOString()
      };

      // Notify all subscribers
      this.notifySubscribers('player_stats', this.currentStats);
    }
  }

  private handleTransactionUpdate(payload: any) {
    console.log('New transaction:', payload);
    
    // Notify subscribers about new transaction
    this.notifySubscribers('new_transaction', payload.new);
  }

  async updatePlayerStatus(update: RealtimePlayerUpdate) {
    try {
      // This would typically be handled by a backend service
      // For now, we'll simulate the update
      const statsUpdate = { ...this.currentStats };
      
      switch (update.status) {
        case 'online':
          statsUpdate.totalOnline += 1;
          break;
        case 'playing':
          statsUpdate.totalPlaying += 1;
          statsUpdate.activeSessions += 1;
          break;
        case 'offline':
          statsUpdate.totalOnline = Math.max(0, statsUpdate.totalOnline - 1);
          statsUpdate.totalPlaying = Math.max(0, statsUpdate.totalPlaying - 1);
          break;
      }

      // Update the database
      const { error } = await supabase
        .from('realtime_player_stats')
        .upsert({
          id: '00000000-0000-0000-0000-000000000001', // Use fixed ID for single row
          total_online: statsUpdate.totalOnline,
          total_playing: statsUpdate.totalPlaying,
          active_sessions: statsUpdate.activeSessions,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating player stats:', error);
      }
    } catch (error) {
      console.error('Error in updatePlayerStatus:', error);
    }
  }

  subscribe(eventType: string, callback: (data: any) => void): string {
    const id = `${eventType}_${Date.now()}_${Math.random()}`;
    this.subscribers.set(id, callback);
    return id;
  }

  unsubscribe(subscriptionId: string) {
    this.subscribers.delete(subscriptionId);
  }

  private notifySubscribers(eventType: string, data: any) {
    this.subscribers.forEach((callback, id) => {
      if (id.startsWith(eventType)) {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in subscriber callback:', error);
        }
      }
    });
  }

  getCurrentStats(): RealtimeStats {
    return { ...this.currentStats };
  }

  async cleanup() {
    if (this.playerStatsChannel) {
      await supabase.removeChannel(this.playerStatsChannel);
    }
    if (this.transactionChannel) {
      await supabase.removeChannel(this.transactionChannel);
    }
    this.subscribers.clear();
  }
}

export const realtimeDataService = new RealtimeDataService();
export default realtimeDataService;
