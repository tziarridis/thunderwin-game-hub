
import { v4 as uuidv4 } from 'uuid';
import { PPGameConfig } from './pragmaticPlayConfig';

interface PPSession {
  sessionId: string;
  playerId: string;
  gameCode?: string;
  currency: string;
  startTime: number;
  lastActivity: number;
  active: boolean;
  token?: string;
  balance?: number;
  roundId?: string;
}

/**
 * Service for managing Pragmatic Play game sessions
 */
export const pragmaticPlaySessionService = {
  /**
   * Create a new session for a player
   */
  createSession: async (
    playerId: string, 
    gameCode: string | undefined,
    currency: string
  ): Promise<PPSession> => {
    const session: PPSession = {
      sessionId: `pp_${uuidv4()}`,
      playerId,
      gameCode,
      currency,
      startTime: Date.now(),
      lastActivity: Date.now(),
      active: true,
      token: uuidv4().replace(/-/g, '')
    };
    
    // Store the session (in a real implementation, this would be in a database)
    await pragmaticPlaySessionService.storeSession(session);
    
    return session;
  },
  
  /**
   * Get a session by ID
   */
  getSession: async (sessionId: string): Promise<PPSession | null> => {
    // In a real implementation, this would fetch from the database
    const sessions = localStorage.getItem('pp_sessions');
    if (!sessions) return null;
    
    try {
      const sessionData = JSON.parse(sessions) as PPSession[];
      const session = sessionData.find(s => s.sessionId === sessionId);
      return session || null;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  },
  
  /**
   * Get a session by player ID and game code
   */
  getSessionByPlayerAndGame: async (playerId: string, gameCode?: string): Promise<PPSession | null> => {
    // In a real implementation, this would fetch from the database
    const sessions = localStorage.getItem('pp_sessions');
    if (!sessions) return null;
    
    try {
      const sessionData = JSON.parse(sessions) as PPSession[];
      const session = sessionData.find(s => 
        s.playerId === playerId && 
        (gameCode ? s.gameCode === gameCode : true) && 
        s.active
      );
      return session || null;
    } catch (error) {
      console.error('Error getting session by player and game:', error);
      return null;
    }
  },
  
  /**
   * Update a session's activity timestamp
   */
  updateSessionActivity: async (sessionId: string): Promise<boolean> => {
    // In a real implementation, this would update the database
    const sessions = localStorage.getItem('pp_sessions');
    if (!sessions) return false;
    
    try {
      const sessionData = JSON.parse(sessions) as PPSession[];
      const sessionIndex = sessionData.findIndex(s => s.sessionId === sessionId);
      
      if (sessionIndex === -1) return false;
      
      sessionData[sessionIndex].lastActivity = Date.now();
      localStorage.setItem('pp_sessions', JSON.stringify(sessionData));
      
      return true;
    } catch (error) {
      console.error('Error updating session activity:', error);
      return false;
    }
  },
  
  /**
   * End a session
   */
  endSession: async (sessionId: string): Promise<boolean> => {
    // In a real implementation, this would update the database
    const sessions = localStorage.getItem('pp_sessions');
    if (!sessions) return false;
    
    try {
      const sessionData = JSON.parse(sessions) as PPSession[];
      const sessionIndex = sessionData.findIndex(s => s.sessionId === sessionId);
      
      if (sessionIndex === -1) return false;
      
      sessionData[sessionIndex].active = false;
      localStorage.setItem('pp_sessions', JSON.stringify(sessionData));
      
      return true;
    } catch (error) {
      console.error('Error ending session:', error);
      return false;
    }
  },
  
  /**
   * Store a session
   */
  storeSession: async (session: PPSession): Promise<void> => {
    // In a real implementation, this would store in the database
    const sessions = localStorage.getItem('pp_sessions');
    let sessionData: PPSession[] = [];
    
    if (sessions) {
      sessionData = JSON.parse(sessions);
    }
    
    sessionData.push(session);
    localStorage.setItem('pp_sessions', JSON.stringify(sessionData));
  },
  
  /**
   * Clean up expired sessions (older than 24 hours)
   */
  cleanupExpiredSessions: async (): Promise<void> => {
    // In a real implementation, this would run as a cron job
    const sessions = localStorage.getItem('pp_sessions');
    if (!sessions) return;
    
    try {
      const sessionData = JSON.parse(sessions) as PPSession[];
      const currentTime = Date.now();
      const expireTime = 24 * 60 * 60 * 1000; // 24 hours
      
      const activeSessions = sessionData.filter(session => {
        const isExpired = currentTime - session.lastActivity > expireTime;
        return !isExpired;
      });
      
      localStorage.setItem('pp_sessions', JSON.stringify(activeSessions));
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
    }
  }
};

export default pragmaticPlaySessionService;
