
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
        .subscribe((status) => {
          console.log('Player stats channel status:', status);
        });

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
        .subscribe((status) => {
          console.log('Transaction channel status:', status);
        });

      // Initial stats fetch
      await this.fetchCurrentStats();
      
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
        .from('realtime_player_stats')
        .select('*')
        .maybeSingle();

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
        console.log('Current stats fetched:', this.currentStats);
      } else {
        console.log('No real-time stats found, initializing with defaults');
        // Initialize with default values if no record exists
        await this.initializeStatsRecord();
      }
    } catch (error) {
      console.error('Error in fetchCurrentStats:', error);
    }
  }

  private async initializeStatsRecord() {
    try {
      const { error } = await supabase
        .from('realtime_player_stats')
        .upsert({
          id: '00000000-0000-0000-0000-000000000001',
          total_online: 0,
          total_playing: 0,
          active_sessions: 0,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error initializing stats record:', error);
      } else {
        console.log('Stats record initialized successfully');
      }
    } catch (error) {
      console.error('Error in initializeStatsRecord:', error);
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
      // Ensure we're initialized
      if (!this.isInitialized) {
        await this.initialize();
      }

      const statsUpdate = { ...this.currentStats };
      
      switch (update.status) {
        case 'online':
          statsUpdate.totalOnline = Math.max(0, statsUpdate.totalOnline + 1);
          break;
        case 'playing':
          statsUpdate.totalPlaying = Math.max(0, statsUpdate.totalPlaying + 1);
          statsUpdate.activeSessions = Math.max(0, statsUpdate.activeSessions + 1);
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
          id: '00000000-0000-0000-0000-000000000001',
          total_online: statsUpdate.totalOnline,
          total_playing: statsUpdate.totalPlaying,
          active_sessions: statsUpdate.activeSessions,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating player stats:', error);
      } else {
        console.log('Player stats updated successfully:', statsUpdate);
      }
    } catch (error) {
      console.error('Error in updatePlayerStatus:', error);
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
