
/**
 * Service for tracking Pragmatic Play game rounds
 */
export const pragmaticPlayRoundService = {
  /**
   * Track a game round
   */
  trackRound: async (roundData: {
    roundId: string;
    playerId: string;
    gameCode: string;
    betAmount: number;
    status: string;
    sessionId?: string;
    currency: string;
  }) => {
    try {
      const round = {
        ...roundData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        winAmount: 0,
        totalWin: 0
      };
      
      // In a real implementation, store in a database
      // For this example, we'll use localStorage
      await pragmaticPlayRoundService.storeRound(round);
      
      return round;
    } catch (error) {
      console.error('Error tracking round:', error);
      return null;
    }
  },
  
  /**
   * Store a round
   */
  storeRound: async (round: any) => {
    try {
      // In a real implementation, store in a database
      if (typeof window !== 'undefined') {
        const rounds = JSON.parse(localStorage.getItem('pp_rounds') || '{}');
        rounds[round.roundId] = round;
        localStorage.setItem('pp_rounds', JSON.stringify(rounds));
      }
      return true;
    } catch (error) {
      console.error('Error storing round:', error);
      return false;
    }
  },
  
  /**
   * Get a round by ID
   */
  getRound: async (roundId: string) => {
    try {
      // In a real implementation, get from a database
      if (typeof window !== 'undefined') {
        const rounds = JSON.parse(localStorage.getItem('pp_rounds') || '{}');
        return rounds[roundId] || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting round:', error);
      return null;
    }
  },
  
  /**
   * Update a round with win amount
   */
  updateRoundWithWin: async (roundId: string, winAmount: number, totalWin: number) => {
    try {
      const round = await pragmaticPlayRoundService.getRound(roundId);
      if (round) {
        round.winAmount = winAmount;
        round.totalWin = totalWin;
        round.updatedAt = new Date().toISOString();
        await pragmaticPlayRoundService.storeRound(round);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating round with win:', error);
      return false;
    }
  },
  
  /**
   * Complete a round
   */
  completeRound: async (roundId: string, status: string) => {
    try {
      const round = await pragmaticPlayRoundService.getRound(roundId);
      if (round) {
        round.status = status;
        round.updatedAt = new Date().toISOString();
        round.completedAt = new Date().toISOString();
        await pragmaticPlayRoundService.storeRound(round);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error completing round:', error);
      return false;
    }
  },
  
  /**
   * Get all rounds for a player
   */
  getPlayerRounds: async (playerId: string, limit = 20) => {
    try {
      // In a real implementation, query the database
      if (typeof window !== 'undefined') {
        const allRounds = JSON.parse(localStorage.getItem('pp_rounds') || '{}');
        const playerRounds = Object.values(allRounds)
          .filter((round: any) => round.playerId === playerId)
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit);
        
        return playerRounds;
      }
      return [];
    } catch (error) {
      console.error('Error getting player rounds:', error);
      return [];
    }
  },
  
  /**
   * Get incomplete rounds for a player
   */
  getIncompleteRounds: async (playerId: string) => {
    try {
      // In a real implementation, query the database for incomplete rounds
      if (typeof window !== 'undefined') {
        const allRounds = JSON.parse(localStorage.getItem('pp_rounds') || '{}');
        const incompleteRounds = Object.values(allRounds)
          .filter((round: any) => round.playerId === playerId && round.status === 'in_progress');
        
        return incompleteRounds;
      }
      return [];
    } catch (error) {
      console.error('Error getting incomplete rounds:', error);
      return [];
    }
  }
};

export default pragmaticPlayRoundService;
