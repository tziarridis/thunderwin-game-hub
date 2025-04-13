
import { Game } from '@/types';
import { toast } from 'sonner';

// In a real application, this would interact with your database
// For this demo, we'll use localStorage to simulate a database

/**
 * Get all games
 * @returns Promise with array of games
 */
export const getAllGames = async (): Promise<Game[]> => {
  try {
    // In a real implementation, this would be a database query
    const storedGames = localStorage.getItem('games');
    if (storedGames) {
      return JSON.parse(storedGames);
    }
    return [];
  } catch (error) {
    console.error('Error getting games:', error);
    return [];
  }
};

/**
 * Get a game by ID
 * @param id Game ID
 * @returns Promise with game or null
 */
export const getGameById = async (id: number | string): Promise<Game | null> => {
  try {
    const games = await getAllGames();
    return games.find(game => game.id.toString() === id.toString()) || null;
  } catch (error) {
    console.error('Error getting game:', error);
    return null;
  }
};

/**
 * Get a game by game ID (not database ID)
 * @param gameId Game ID from provider
 * @returns Promise with game or null
 */
export const getGameByGameId = async (gameId: string): Promise<Game | null> => {
  try {
    const games = await getAllGames();
    return games.find(game => game.id === gameId) || null;
  } catch (error) {
    console.error('Error getting game by game ID:', error);
    return null;
  }
};

/**
 * Create a new game
 * @param game Game data
 * @returns Promise with created game
 */
export const createGame = async (game: Omit<Game, 'id'>): Promise<Game> => {
  try {
    const games = await getAllGames();
    const newGame = {
      id: games.length > 0 ? Math.max(...games.map(g => typeof g.id === 'string' ? parseInt(g.id) : 0)) + 1 : 1,
      ...game
    };
    
    const gameWithStringId = {
      ...newGame,
      id: newGame.id.toString()
    };
    
    games.push(gameWithStringId);
    localStorage.setItem('games', JSON.stringify(games));
    
    return gameWithStringId;
  } catch (error) {
    console.error('Error creating game:', error);
    throw error;
  }
};

/**
 * Update a game
 * @param id Game ID
 * @param game Updated game data
 * @returns Promise with updated game
 */
export const updateGame = async (id: number | string, game: Partial<Game>): Promise<Game> => {
  try {
    const games = await getAllGames();
    const index = games.findIndex(g => g.id.toString() === id.toString());
    
    if (index === -1) {
      throw new Error(`Game with ID ${id} not found`);
    }
    
    games[index] = { ...games[index], ...game };
    localStorage.setItem('games', JSON.stringify(games));
    
    return games[index];
  } catch (error) {
    console.error('Error updating game:', error);
    throw error;
  }
};

/**
 * Delete a game
 * @param id Game ID
 * @returns Promise with success status
 */
export const deleteGame = async (id: number | string): Promise<boolean> => {
  try {
    const games = await getAllGames();
    const filteredGames = games.filter(g => g.id.toString() !== id.toString());
    
    if (filteredGames.length === games.length) {
      throw new Error(`Game with ID ${id} not found`);
    }
    
    localStorage.setItem('games', JSON.stringify(filteredGames));
    return true;
  } catch (error) {
    console.error('Error deleting game:', error);
    return false;
  }
};

/**
 * Import games from an external source
 * @param games Array of games to import
 * @returns Promise with count of imported games
 */
export const importGames = async (games: Omit<Game, 'id'>[]): Promise<number> => {
  try {
    const existingGames = await getAllGames();
    let importedCount = 0;
    
    for (const game of games) {
      // Check if game already exists by a unique identifier (using title as example)
      const existingGame = existingGames.find(g => g.title === game.title);
      
      if (existingGame) {
        // Update existing game
        await updateGame(existingGame.id, game);
      } else {
        // Create new game
        await createGame(game);
        importedCount++;
      }
    }
    
    toast.success(`Successfully imported ${importedCount} new games`);
    return importedCount;
  } catch (error) {
    console.error('Error importing games:', error);
    toast.error('Failed to import games');
    return 0;
  }
};

// Create a clientGamesApi object that wraps the functions
export const clientGamesApi = {
  getGames: getAllGames,
  getGameById,
  getGameByGameId,
  addGame: createGame,
  updateGame: (game: Game) => updateGame(game.id, game),
  deleteGame,
  toggleGameFeature: async (id: number | string, feature: string, value: boolean) => {
    return updateGame(id, { [feature]: value });
  },
  getProviders: async () => {
    // Mock function to return providers
    return [
      { id: 1, name: 'Pragmatic Play', logo: '', status: 'active' },
      { id: 2, name: 'Evolution Gaming', logo: '', status: 'active' },
      { id: 3, name: 'NetEnt', logo: '', status: 'active' },
      { id: 4, name: 'Microgaming', logo: '', status: 'active' }
    ];
  }
};

export default {
  getAllGames,
  getGameById,
  getGameByGameId,
  createGame,
  updateGame,
  deleteGame,
  importGames,
  clientGamesApi
};
