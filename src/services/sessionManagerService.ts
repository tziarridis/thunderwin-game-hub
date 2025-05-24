
import { supabase } from '@/integrations/supabase/client';
import { realtimeDataService } from './realtimeDataService';

export interface GameSession {
  id: string;
  userId: string;
  gameId: string;
  providerId: string;
  sessionToken: string;
  startedAt: string;
  lastActivity: string;
  status: 'active' | 'paused' | 'ended' | 'migrating';
  connectionId?: string;
  migrationData?: any;
}

export interface SessionMigrationData {
  gameState: any;
  balance: number;
  currentBet: number;
  roundInProgress: boolean;
  sessionMetadata: any;
}

class SessionManagerService {
  private activeSessions: Map<string, GameSession> = new Map();
  private heartbeatInterval = 30000; // 30 seconds
  private sessionTimeout = 300000; // 5 minutes
  private migrationInProgress: Set<string> = new Set();

  constructor() {
    this.startHeartbeatMonitoring();
    this.startSessionCleanup();
    this.setupReconnectionHandling();
  }

  async createGameSession(
    userId: string, 
    gameId: string, 
    providerId: string,
    connectionId?: string
  ): Promise<GameSession> {
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const sessionToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
      
      const session: GameSession = {
        id: sessionId,
        userId,
        gameId,
        providerId,
        sessionToken,
        startedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        status: 'active',
        connectionId
      };

      // Store in database
      const { error } = await supabase.from('game_launch_sessions').insert({
        id: sessionId,
        user_id: userId,
        game_id: gameId,
        session_token: sessionToken,
        provider_session_id: providerId,
        status: 'active'
      });

      if (error) {
        console.error('Error creating session in database:', error);
      }

      // Store in memory for quick access
      this.activeSessions.set(sessionId, session);

      // Update real-time player statistics
      await realtimeDataService.updatePlayerStatus({
        userId,
        status: 'playing',
        gameId,
        sessionId
      });

      console.log(`Game session created: ${sessionId} for user ${userId}`);
      return session;

    } catch (error) {
      console.error('Error creating game session:', error);
      throw error;
    }
  }

  async updateSessionActivity(sessionId: string, activityData?: any): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        console.warn(`Session ${sessionId} not found in active sessions`);
        return;
      }

      // Update last activity timestamp
      session.lastActivity = new Date().toISOString();
      
      if (activityData) {
        session.migrationData = {
          ...session.migrationData,
          ...activityData,
          lastUpdated: new Date().toISOString()
        };
      }

      this.activeSessions.set(sessionId, session);

      // Update database periodically (not every heartbeat to avoid spam)
      const timeSinceStart = Date.now() - new Date(session.startedAt).getTime();
      if (timeSinceStart % 60000 < 30000) { // Update every minute
        await supabase.from('game_launch_sessions')
          .update({ last_activity: session.lastActivity })
          .eq('id', sessionId);
      }

    } catch (error) {
      console.error('Error updating session activity:', error);
    }
  }

  async pauseSession(sessionId: string, reason: string = 'user_request'): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) return;

      session.status = 'paused';
      this.activeSessions.set(sessionId, session);

      await supabase.from('game_launch_sessions')
        .update({ status: 'paused' })
        .eq('id', sessionId);

      console.log(`Session paused: ${sessionId}, reason: ${reason}`);

    } catch (error) {
      console.error('Error pausing session:', error);
    }
  }

  async resumeSession(sessionId: string): Promise<boolean> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) return false;

      session.status = 'active';
      session.lastActivity = new Date().toISOString();
      this.activeSessions.set(sessionId, session);

      await supabase.from('game_launch_sessions')
        .update({ 
          status: 'active',
          last_activity: session.lastActivity 
        })
        .eq('id', sessionId);

      console.log(`Session resumed: ${sessionId}`);
      return true;

    } catch (error) {
      console.error('Error resuming session:', error);
      return false;
    }
  }

  async migrateSession(sessionId: string, newConnectionId: string): Promise<boolean> {
    try {
      if (this.migrationInProgress.has(sessionId)) {
        console.log(`Migration already in progress for session ${sessionId}`);
        return false;
      }

      this.migrationInProgress.add(sessionId);
      
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        this.migrationInProgress.delete(sessionId);
        return false;
      }

      // Mark session as migrating
      session.status = 'migrating';
      session.connectionId = newConnectionId;
      this.activeSessions.set(sessionId, session);

      // Capture current game state for migration
      const migrationData: SessionMigrationData = {
        gameState: session.migrationData?.gameState || {},
        balance: session.migrationData?.balance || 0,
        currentBet: session.migrationData?.currentBet || 0,
        roundInProgress: session.migrationData?.roundInProgress || false,
        sessionMetadata: {
          originalStartTime: session.startedAt,
          migrationTime: new Date().toISOString(),
          previousConnectionId: session.connectionId
        }
      };

      // Update database with migration data
      await supabase.from('game_launch_sessions')
        .update({ 
          status: 'active', // Resume as active after migration
          last_activity: new Date().toISOString()
        })
        .eq('id', sessionId);

      // Complete migration
      session.status = 'active';
      session.migrationData = migrationData;
      session.lastActivity = new Date().toISOString();
      this.activeSessions.set(sessionId, session);

      this.migrationInProgress.delete(sessionId);
      
      console.log(`Session migrated successfully: ${sessionId}`);
      return true;

    } catch (error) {
      console.error('Error migrating session:', error);
      this.migrationInProgress.delete(sessionId);
      return false;
    }
  }

  async endSession(sessionId: string, reason: string = 'user_logout'): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) return;

      const endTime = new Date();
      const durationMinutes = Math.floor(
        (endTime.getTime() - new Date(session.startedAt).getTime()) / 1000 / 60
      );

      // Update database
      await supabase.from('game_launch_sessions')
        .update({
          status: 'ended',
          ended_at: endTime.toISOString()
        })
        .eq('id', sessionId);

      // Remove from active sessions
      this.activeSessions.delete(sessionId);

      // Update real-time player statistics
      await realtimeDataService.updatePlayerStatus({
        userId: session.userId,
        status: 'online' // Back to online but not playing
      });

      console.log(`Session ended: ${sessionId}, duration: ${durationMinutes} minutes, reason: ${reason}`);

    } catch (error) {
      console.error('Error ending session:', error);
    }
  }

  async handleReconnection(userId: string, gameId: string, providerId: string): Promise<GameSession | null> {
    try {
      // Look for existing active session
      const existingSession = Array.from(this.activeSessions.values())
        .find(session => 
          session.userId === userId && 
          session.gameId === gameId && 
          session.providerId === providerId &&
          session.status === 'active'
        );

      if (existingSession) {
        console.log(`Reconnecting to existing session: ${existingSession.id}`);
        
        // Update activity and connection
        await this.updateSessionActivity(existingSession.id);
        return existingSession;
      }

      // Check database for recent sessions that can be resumed
      const { data, error } = await supabase
        .from('game_launch_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('game_id', gameId)
        .eq('status', 'active')
        .gte('last_activity', new Date(Date.now() - this.sessionTimeout).toISOString())
        .order('last_activity', { ascending: false })
        .limit(1);

      if (error || !data || data.length === 0) {
        console.log('No resumable session found, creating new session');
        return null;
      }

      const dbSession = data[0];
      
      // Restore session to memory
      const restoredSession: GameSession = {
        id: dbSession.id,
        userId: dbSession.user_id,
        gameId: dbSession.game_id || gameId,
        providerId: dbSession.provider_session_id || providerId,
        sessionToken: dbSession.session_token,
        startedAt: dbSession.started_at,
        lastActivity: new Date().toISOString(),
        status: 'active'
      };

      this.activeSessions.set(restoredSession.id, restoredSession);
      await this.updateSessionActivity(restoredSession.id);

      console.log(`Session restored from database: ${restoredSession.id}`);
      return restoredSession;

    } catch (error) {
      console.error('Error handling reconnection:', error);
      return null;
    }
  }

  private startHeartbeatMonitoring(): void {
    setInterval(() => {
      this.checkSessionTimeouts();
    }, this.heartbeatInterval);
  }

  private startSessionCleanup(): void {
    // Run cleanup every 5 minutes
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000);
  }

  private setupReconnectionHandling(): void {
    // Listen for network connection changes
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('Network reconnected, checking sessions...');
        this.handleNetworkReconnection();
      });

      window.addEventListener('beforeunload', () => {
        // Save session states before page unload
        this.saveSessionStates();
      });
    }
  }

  private checkSessionTimeouts(): void {
    const now = Date.now();
    const timeoutThreshold = now - this.sessionTimeout;

    for (const [sessionId, session] of this.activeSessions.entries()) {
      const lastActivity = new Date(session.lastActivity).getTime();
      
      if (lastActivity < timeoutThreshold && session.status === 'active') {
        console.log(`Session timeout detected: ${sessionId}`);
        this.endSession(sessionId, 'timeout');
      }
    }
  }

  private async cleanupExpiredSessions(): Promise<void> {
    try {
      const expiredThreshold = new Date(Date.now() - this.sessionTimeout).toISOString();
      
      const { error } = await supabase
        .from('game_launch_sessions')
        .update({ status: 'ended', ended_at: new Date().toISOString() })
        .eq('status', 'active')
        .lt('last_activity', expiredThreshold);

      if (error) {
        console.error('Error cleaning up expired sessions:', error);
      }
    } catch (error) {
      console.error('Error in session cleanup:', error);
    }
  }

  private async handleNetworkReconnection(): Promise<void> {
    // Check all active sessions and attempt to re-establish connections
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.status === 'active') {
        await this.updateSessionActivity(sessionId);
      }
    }
  }

  private saveSessionStates(): void {
    // Save current session states to localStorage for recovery
    const sessionStates = Array.from(this.activeSessions.entries());
    if (typeof window !== 'undefined') {
      localStorage.setItem('gameSessionStates', JSON.stringify(sessionStates));
    }
  }

  getActiveSession(sessionId: string): GameSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  getUserActiveSessions(userId: string): GameSession[] {
    return Array.from(this.activeSessions.values())
      .filter(session => session.userId === userId && session.status === 'active');
  }

  getSessionCount(): number {
    return this.activeSessions.size;
  }
}

export const sessionManagerService = new SessionManagerService();
export default sessionManagerService;
