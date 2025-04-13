
import axios from 'axios';
import { Game as APIGame, GameListParams, GameResponse } from '@/types/game';
import { getProviderConfig } from '@/config/gameProviders';

// Game API client for admin operations
export const clientGamesApi = {
  getAllGames: async (): Promise<APIGame[]> => {
    try {
      // This would normally be an API call to fetch games from your backend
      // For now, we return a mock response
      return [
        {
          id: '1',
          provider_id: 1,
          game_id: 'vs20fruitsw',
          game_name: 'Sweet Bonanza',
          game_code: 'vs20fruitsw',
          game_type: 'slot',
          description: 'A sweet slot game with multiplier symbols',
          cover: '/lovable-uploads/sweet-bonanza.jpg',
          status: 'active',
          technology: 'html5',
          has_lobby: false,
          is_mobile: true,
          has_freespins: true,
          has_tables: false,
          rtp: 96,
          distribution: 'Pragmatic Play',
          views: 1000,
          is_featured: true,
          show_home: true
        }
      ];
    } catch (error) {
      console.error('Error fetching games:', error);
      throw error;
    }
  },

  // Get game by ID
  getGame: async (id: string): Promise<APIGame> => {
    try {
      // Mock response
      return {
        id,
        provider_id: 1,
        game_id: 'vs20fruitsw',
        game_name: 'Sweet Bonanza',
        game_code: 'vs20fruitsw',
        game_type: 'slot',
        description: 'A sweet slot game with multiplier symbols',
        cover: '/lovable-uploads/sweet-bonanza.jpg',
        status: 'active',
        technology: 'html5',
        has_lobby: false,
        is_mobile: true,
        has_freespins: true,
        has_tables: false,
        rtp: 96,
        distribution: 'Pragmatic Play',
        views: 1000,
        is_featured: true,
        show_home: true
      };
    } catch (error) {
      console.error(`Error fetching game ${id}:`, error);
      throw error;
    }
  },

  // Add a new game
  addGame: async (game: Omit<APIGame, 'id'>): Promise<APIGame> => {
    try {
      // This would normally be an API call to add a game
      // For now, we return a mock response
      return {
        ...game,
        id: Math.floor(Math.random() * 10000).toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error adding game:', error);
      throw error;
    }
  },

  // Update a game
  updateGame: async (game: APIGame): Promise<APIGame> => {
    try {
      // This would normally be an API call to update a game
      // For now, we return a mock response
      return {
        ...game,
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error updating game ${game.id}:`, error);
      throw error;
    }
  },

  // Delete a game
  deleteGame: async (id: string): Promise<boolean> => {
    try {
      // This would normally be an API call to delete a game
      // For now, we return a mock success response
      return true;
    } catch (error) {
      console.error(`Error deleting game ${id}:`, error);
      throw error;
    }
  },

  // Toggle game feature (popular/new)
  toggleGameFeature: async (
    id: string,
    feature: 'is_featured' | 'show_home',
    value: boolean
  ): Promise<APIGame> => {
    try {
      // This would normally be an API call to toggle a game feature
      // For now, we return a mock response
      const game = await clientGamesApi.getGame(id);
      return {
        ...game,
        [feature]: value,
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error toggling feature for game ${id}:`, error);
      throw error;
    }
  },

  // Fetch games from a provider API
  fetchGamesFromProvider: async (providerId: string): Promise<APIGame[]> => {
    try {
      const config = getProviderConfig(providerId);
      if (!config) {
        throw new Error(`No configuration found for provider ${providerId}`);
      }

      // This would normally be an API call to fetch games from a provider
      // For now, we return a mock response
      return [
        {
          id: '1001',
          provider_id: parseInt(providerId),
          game_id: 'vs20fruitsw',
          game_name: 'Sweet Bonanza',
          game_code: 'vs20fruitsw',
          game_type: 'slot',
          description: 'A sweet slot game with multiplier symbols',
          cover: '/lovable-uploads/sweet-bonanza.jpg',
          status: 'active',
          technology: 'html5',
          has_lobby: false,
          is_mobile: true,
          has_freespins: true,
          has_tables: false,
          rtp: 96,
          distribution: 'Pragmatic Play',
          views: 0,
          is_featured: false,
          show_home: false
        }
      ];
    } catch (error) {
      console.error(`Error fetching games from provider ${providerId}:`, error);
      throw error;
    }
  }
};

// Functions for getting game data (used by components)
export const getAllGames = async () => {
  // This function would normally call your API to fetch games
  // For now, we'll return mock data
  const apiGames = await clientGamesApi.getAllGames();
  return apiGames.map(game => ({
    id: game.id.toString(),
    title: game.game_name,
    provider: game.distribution,
    category: game.game_type || 'slot',
    image: game.cover,
    rtp: game.rtp,
    volatility: 'medium', // Default since API doesn't provide this
    minBet: 0.1, // Default since API doesn't provide this
    maxBet: 100, // Default since API doesn't provide this
    isPopular: game.is_featured || false,
    isNew: game.show_home || false,
    isFavorite: false,
    releaseDate: game.created_at || new Date().toISOString(),
    jackpot: false,
    description: game.description || ''
  }));
};

export const createGame = async (gameData) => {
  // Implementation would call your API
  return { id: 'new-game-id', ...gameData };
};

export const updateGame = async (id, gameData) => {
  // Implementation would call your API
  return { id, ...gameData };
};

export const deleteGame = async (id) => {
  // Implementation would call your API
  return true;
};
