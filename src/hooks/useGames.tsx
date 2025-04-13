
import { useState, useEffect, useCallback } from 'react';
import { Game } from '@/types';
import { toast } from 'sonner';
import { gameAggregatorService } from '@/services/gameAggregatorService';
import { convertAPIGamesForAdmin, adminAddGame, adminUpdateGame, adminDeleteGame } from '@/utils/gamesManagementHelper';

export const useGames = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalGames, setTotalGames] = useState(0);
  
  // Fetch games on component mount
  const fetchGames = useCallback(async () => {
    try {
      setLoading(true);
      // Mock data for demonstration (replace with actual API call in production)
      const mockGames = Array.from({ length: 30 }, (_, i) => ({
        id: `game_${i + 1}`,
        title: `Game ${i + 1}`,
        description: 'A fun game to play',
        provider: ['Pragmatic Play', 'NetEnt', 'Evolution', 'Play\'n GO', 'Microgaming'][i % 5],
        category: ['slots', 'table', 'live', 'crash', 'fishing'][i % 5],
        image: `/games/game${i + 1}.jpg`,
        rtp: 95 + (i % 5),
        volatility: ['low', 'medium', 'high'][i % 3],
        minBet: 0.1 + (i % 10) * 0.1,
        maxBet: 100 + (i % 5) * 100,
        isPopular: i % 7 === 0,
        isNew: i % 11 === 0,
        isFavorite: false,
        jackpot: i % 13 === 0,
        releaseDate: new Date(Date.now() - (i * 86400000 * 30)).toISOString(),
        tags: []
      }));
      
      setGames(mockGames);
      setTotalGames(mockGames.length);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch games'));
      setLoading(false);
      toast.error('Failed to load games');
    }
  }, []);
  
  useEffect(() => {
    fetchGames();
  }, [fetchGames]);
  
  // Add a new game
  const addGame = async (gameData: Omit<Game, 'id'>) => {
    try {
      const newId = `game_${Date.now()}`;
      const newGame = { id: newId, ...gameData };
      setGames(prev => [newGame, ...prev]);
      setTotalGames(prev => prev + 1);
      toast.success('Game added successfully');
      return newGame;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add game');
      setError(error);
      toast.error(error.message);
      throw error;
    }
  };
  
  // Update an existing game
  const updateGame = async (gameData: Game) => {
    try {
      setGames(prev => 
        prev.map(game => game.id === gameData.id ? gameData : game)
      );
      toast.success('Game updated successfully');
      return gameData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update game');
      setError(error);
      toast.error(error.message);
      throw error;
    }
  };
  
  // Delete a game
  const deleteGame = async (id: string) => {
    try {
      setGames(prev => prev.filter(game => game.id !== id));
      setTotalGames(prev => prev - 1);
      toast.success('Game deleted successfully');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete game');
      setError(error);
      toast.error(error.message);
      throw error;
    }
  };
  
  // Import games from aggregator to game management
  const importGamesFromAggregator = async () => {
    try {
      setLoading(true);
      toast.info("Importing games from aggregator...");
      
      // In a real implementation, this would fetch the games from the aggregator service
      // and convert them to the format needed by the game management system
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get games from the aggregator service (mocked for now)
      const response = await gameAggregatorService.syncAllProviders();
      
      if (response.success) {
        const providerResults = Object.values(response.results);
        const totalAdded = providerResults.reduce((sum, result) => sum + (result.gamesAdded || 0), 0);
        const totalUpdated = providerResults.reduce((sum, result) => sum + (result.gamesUpdated || 0), 0);
        
        // Update local state with new game count
        setTotalGames(prev => prev + totalAdded);
        
        // Refresh the games list
        await fetchGames();
        
        toast.success(`Successfully imported ${totalAdded} new games and updated ${totalUpdated} existing games`);
      } else {
        throw new Error("Failed to import games from aggregator");
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to import games');
      setError(error);
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    games,
    loading,
    error,
    totalGames,
    addGame,
    updateGame,
    deleteGame,
    importGamesFromAggregator,
    refreshGames: fetchGames
  };
};
