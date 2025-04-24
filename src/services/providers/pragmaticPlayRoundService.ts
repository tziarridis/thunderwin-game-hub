
import { v4 as uuidv4 } from 'uuid';

export interface PPRound {
  id: string;
  roundId: string;
  playerId: string;
  gameCode?: string;
  betAmount: number;
  winAmount?: number;
  totalWin?: number;
  jackpotWin?: number;
  currency: string;
  status: 'in_progress' | 'completed' | 'voided' | 'recovered';
  startTime: number;
  endTime?: number;
  sessionId?: string;
}

/**
 * Service for managing Pragmatic Play game rounds
 */
export const pragmaticPlayRoundService = {
  /**
   * Track or start a game round
   */
  trackRound: async (roundData: {
    roundId: string,
    playerId: string,
    gameCode?: string,
    betAmount: number,
    status: PPRound['status'],
    sessionId?: string,
    currency: string
  }): Promise<PPRound> => {
    // In a real implementation, this would store in the database
    const round: PPRound = {
      id: uuidv4(),
      roundId: roundData.roundId,
      playerId: roundData.playerId,
      gameCode: roundData.gameCode,
      betAmount: roundData.betAmount,
      currency: roundData.currency,
      status: roundData.status,
      startTime: Date.now(),
      sessionId: roundData.sessionId
    };
    
    await pragmaticPlayRoundService.storeRound(round);
    
    console.log(`Round ${roundData.roundId} started for player ${roundData.playerId}`);
    return round;
  },
  
  /**
   * Update a round with win information
   */
  updateRoundWithWin: async (
    roundId: string,
    winAmount: number,
    totalWin: number = winAmount,
    jackpotWin: number = 0
  ): Promise<boolean> => {
    try {
      const rounds = localStorage.getItem('pp_rounds');
      if (!rounds) {
        console.error(`No rounds found when updating round ${roundId}`);
        return false;
      }
      
      const roundsData = JSON.parse(rounds) as PPRound[];
      const roundIndex = roundsData.findIndex(r => r.roundId === roundId);
      
      if (roundIndex === -1) {
        console.error(`Round ${roundId} not found when updating with win`);
        return false;
      }
      
      roundsData[roundIndex].winAmount = winAmount;
      roundsData[roundIndex].totalWin = totalWin;
      
      if (jackpotWin > 0) {
        roundsData[roundIndex].jackpotWin = jackpotWin;
      }
      
      localStorage.setItem('pp_rounds', JSON.stringify(roundsData));
      
      console.log(`Round ${roundId} updated with win amount ${winAmount}`);
      return true;
    } catch (error) {
      console.error('Error updating round with win:', error);
      return false;
    }
  },
  
  /**
   * Complete a round
   */
  completeRound: async (roundId: string, status: PPRound['status'] = 'completed'): Promise<boolean> => {
    try {
      const rounds = localStorage.getItem('pp_rounds');
      if (!rounds) {
        console.error(`No rounds found when completing round ${roundId}`);
        return false;
      }
      
      const roundsData = JSON.parse(rounds) as PPRound[];
      const roundIndex = roundsData.findIndex(r => r.roundId === roundId);
      
      if (roundIndex === -1) {
        console.error(`Round ${roundId} not found when completing`);
        return false;
      }
      
      roundsData[roundIndex].status = status;
      roundsData[roundIndex].endTime = Date.now();
      
      localStorage.setItem('pp_rounds', JSON.stringify(roundsData));
      
      console.log(`Round ${roundId} completed with status ${status}`);
      return true;
    } catch (error) {
      console.error('Error completing round:', error);
      return false;
    }
  },
  
  /**
   * Get a round by ID
   */
  getRound: async (roundId: string): Promise<PPRound | null> => {
    try {
      const rounds = localStorage.getItem('pp_rounds');
      if (!rounds) return null;
      
      const roundsData = JSON.parse(rounds) as PPRound[];
      const round = roundsData.find(r => r.roundId === roundId);
      
      return round || null;
    } catch (error) {
      console.error('Error getting round:', error);
      return null;
    }
  },
  
  /**
   * Get rounds for a player
   */
  getPlayerRounds: async (playerId: string, limit = 20): Promise<PPRound[]> => {
    try {
      const rounds = localStorage.getItem('pp_rounds');
      if (!rounds) return [];
      
      const roundsData = JSON.parse(rounds) as PPRound[];
      
      return roundsData
        .filter(r => r.playerId === playerId)
        .sort((a, b) => (b.startTime || 0) - (a.startTime || 0))
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting player rounds:', error);
      return [];
    }
  },
  
  /**
   * Get incomplete rounds for a player
   */
  getIncompleteRounds: async (playerId: string): Promise<PPRound[]> => {
    try {
      const rounds = localStorage.getItem('pp_rounds');
      if (!rounds) return [];
      
      const roundsData = JSON.parse(rounds) as PPRound[];
      
      // Consider rounds that are in progress for more than 30 minutes as incomplete
      const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
      
      return roundsData.filter(r => 
        r.playerId === playerId && 
        r.status === 'in_progress' && 
        r.startTime < thirtyMinutesAgo
      );
    } catch (error) {
      console.error('Error getting incomplete rounds:', error);
      return [];
    }
  },
  
  /**
   * Store a round
   */
  storeRound: async (round: PPRound): Promise<void> => {
    try {
      const rounds = localStorage.getItem('pp_rounds');
      let roundsData: PPRound[] = [];
      
      if (rounds) {
        roundsData = JSON.parse(rounds);
      }
      
      // Check if the round already exists
      const existingIndex = roundsData.findIndex(r => r.roundId === round.roundId);
      
      if (existingIndex !== -1) {
        // Update existing round
        roundsData[existingIndex] = {
          ...roundsData[existingIndex],
          ...round
        };
      } else {
        // Add new round
        roundsData.push(round);
      }
      
      localStorage.setItem('pp_rounds', JSON.stringify(roundsData));
    } catch (error) {
      console.error('Error storing round:', error);
    }
  },
  
  /**
   * Clean up old rounds (older than 90 days)
   */
  cleanupOldRounds: async (): Promise<number> => {
    try {
      const rounds = localStorage.getItem('pp_rounds');
      if (!rounds) return 0;
      
      const roundsData = JSON.parse(rounds) as PPRound[];
      const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
      
      const newRoundsData = roundsData.filter(r => r.startTime >= ninetyDaysAgo);
      const removedCount = roundsData.length - newRoundsData.length;
      
      localStorage.setItem('pp_rounds', JSON.stringify(newRoundsData));
      
      return removedCount;
    } catch (error) {
      console.error('Error cleaning up old rounds:', error);
      return 0;
    }
  }
};

export default pragmaticPlayRoundService;
