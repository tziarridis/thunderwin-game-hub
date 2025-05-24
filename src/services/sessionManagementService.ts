
import { supabase } from '@/integrations/supabase/client';
import { realtimeDataService } from './realtimeDataService';

export interface GameSession {
  id: string;
  userId: string;
  gameId: string;
  startedAt: string;
  endedAt?: string;
  duration: number;
  totalBets: number;
  totalWins: number;
  status: 'active' | 'ended' | 'abandoned';
}

export interface SessionMetrics {
  activeSessions: number;
  averageDuration: number;
  totalSessions: number;
  conversionRate: number;
}

class SessionManagementService {
  private activeSessions: Map<string, GameSession> = new Map();
  private sessionTimeout = 30 * 60 * 1000; // 30 minutes

  async startSession(userId: string, gameId: string): Promise<string> {
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const session: GameSession = {
        id: sessionId,
        userId,
        gameId,
        startedAt: new Date().toISOString(),
        duration: 0,
        totalBets: 0,
        totalWins: 0,
        status: 'active'
      };

      // Store in database
      const { error } = await supabase
        .from('game_sessions')
        .insert({
          id: sessionId,
          user_id: userId,
          game_id: gameId,
          started_at: session.startedAt,
          total_bets: 0,
          total_wins: 0
        });

      if (error) {
        console.error('Error creating session in database:', error);
      }

      // Store in memory for quick access
      this.activeSessions.set(sessionId, session);

      // Update realtime stats
      await realtimeDataService.updatePlayerStatus({
        userId,
        status: 'playing',
        gameId,
        sessionId
      });

      console.log(`Session started: ${sessionId} for user ${userId} in game ${gameId}`);
      return sessionId;
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  }

  async endSession(sessionId: string): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      
      if (!session) {
        console.warn(`Session ${sessionId} not found in active sessions`);
        return;
      }

      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - new Date(session.startedAt).getTime()) / 1000 / 60);

      // Update database
      const { error } = await supabase
        .from('game_sessions')
        .update({
          ended_at: endTime.toISOString(),
          duration_minutes: duration,
          total_bets: session.totalBets,
          total_wins: session.totalWins
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Error updating session in database:', error);
      }

      // Remove from active sessions
      this.activeSessions.delete(sessionId);

      // Update realtime stats
      await realtimeDataService.updatePlayerStatus({
        userId: session.userId,
        status: 'online'
      });

      console.log(`Session ended: ${sessionId}, duration: ${duration} minutes`);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }

  async updateSessionActivity(sessionId: string, betAmount?: number, winAmount?: number): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      
      if (!session) {
        console.warn(`Session ${sessionId} not found`);
        return;
      }

      // Update session metrics
      if (betAmount) {
        session.totalBets += betAmount;
      }
      
      if (winAmount) {
        session.totalWins += winAmount;
      }

      // Update last activity time
      session.duration = Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000 / 60);

      // Update in memory
      this.activeSessions.set(sessionId, session);

      // Periodically update database (every 10 bets or 5 minutes)
      if (session.totalBets % 10 === 0 || session.duration % 5 === 0) {
        const { error } = await supabase
          .from('game_sessions')
          .update({
            total_bets: session.totalBets,
            total_wins: session.totalWins,
            duration_minutes: session.duration
          })
          .eq('id', sessionId);

        if (error) {
          console.error('Error updating session activity:', error);
        }
      }
    } catch (error) {
      console.error('Error updating session activity:', error);
    }
  }

  async getActiveSessionsCount(): Promise<number> {
    return this.activeSessions.size;
  }

  async getSessionMetrics(): Promise<SessionMetrics> {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('duration_minutes, total_bets, ended_at')
        .gte('started_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        console.error('Error fetching session metrics:', error);
        return {
          activeSessions: this.activeSessions.size,
          averageDuration: 0,
          totalSessions: 0,
          conversionRate: 0
        };
      }

      const totalSessions = data.length;
      const completedSessions = data.filter(s => s.ended_at).length;
      const averageDuration = completedSessions > 0 
        ? data.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / completedSessions
        : 0;
      
      const sessionsWithBets = data.filter(s => (s.total_bets || 0) > 0).length;
      const conversionRate = totalSessions > 0 ? (sessionsWithBets / totalSessions) * 100 : 0;

      return {
        activeSessions: this.activeSessions.size,
        averageDuration,
        totalSessions,
        conversionRate
      };
    } catch (error) {
      console.error('Error calculating session metrics:', error);
      return {
        activeSessions: this.activeSessions.size,
        averageDuration: 0,
        totalSessions: 0,
        conversionRate: 0
      };
    }
  }

  // Cleanup abandoned sessions
  async cleanupAbandonedSessions(): Promise<void> {
    const now = Date.now();
    const abandonnedSessions: string[] = [];

    for (const [sessionId, session] of this.activeSessions.entries()) {
      const sessionAge = now - new Date(session.startedAt).getTime();
      
      if (sessionAge > this.sessionTimeout) {
        abandonnedSessions.push(sessionId);
      }
    }

    // End abandoned sessions
    for (const sessionId of abandonnedSessions) {
      await this.endSession(sessionId);
    }

    if (abandonnedSessions.length > 0) {
      console.log(`Cleaned up ${abandonnedSessions.length} abandoned sessions`);
    }
  }

  // Initialize cleanup interval
  startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupAbandonedSessions();
    }, 5 * 60 * 1000); // Every 5 minutes
  }
}

export const sessionManagementService = new SessionManagementService();
export default sessionManagementService;
