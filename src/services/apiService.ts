import axios, { AxiosResponse } from "axios";
import { User, Game, Transaction, GameBet, Log, GameProvider } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Function to set the JWT token in the request headers
const setAuthHeader = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Initialize the API service with the JWT token from localStorage
const initializeApi = () => {
  const token = localStorage.getItem('jwtToken');
  setAuthHeader(token);
};

// Call initializeApi when the module is loaded
initializeApi();

// Function to update the JWT token in localStorage and set the auth header
const updateToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('jwtToken', token);
    setAuthHeader(token);
  } else {
    localStorage.removeItem('jwtToken');
    setAuthHeader(null);
  }
};

// Function to handle API errors
const handleApiError = (error: any) => {
  console.error("API Error:", error);
  if (axios.isAxiosError(error)) {
    console.error("Axios Error Details:", error.toJSON());
    if (error.response) {
      console.error("Response Data:", error.response.data);
      console.error("Response Status:", error.response.status);
      console.error("Response Headers:", error.response.headers);
    } else if (error.request) {
      console.error("Request:", error.request);
    } else {
      console.error("Error Message:", error.message);
    }
  }
  throw error;
};

// Authentication Endpoints
const registerUser = async (userData: any) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
    updateToken(response.data.token);
    return response.data;
  } catch (error: any) {
    handleApiError(error);
  }
};

const loginUser = async (credentials: any) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    updateToken(response.data.token);
    return response.data;
  } catch (error: any) {
    handleApiError(error);
  }
};

const adminLogin = async (credentials: any) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/admin/login`, credentials);
        updateToken(response.data.token);
        return response.data;
    } catch (error: any) {
        handleApiError(error);
    }
};

const logoutUser = () => {
  updateToken(null);
};

// User Endpoints
const fetchUser = async (userId: string): Promise<User> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
    return response.data;
  } catch (error: any) {
    handleApiError(error);
  }
};

const updateUser = async (userId: string, userData: any): Promise<User> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/users/${userId}`, userData);
    return response.data;
  } catch (error: any) {
    handleApiError(error);
  }
};

const deleteUser = async (userId: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/users/${userId}`);
  } catch (error: any) {
    handleApiError(error);
  }
};

const fetchAllUsers = async (): Promise<User[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users`);
    return response.data;
  } catch (error: any) {
    handleApiError(error);
  }
};

const createUser = async (userData: any): Promise<User> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users`, userData);
    return response.data;
  } catch (error: any) {
    handleApiError(error);
  }
};

// Game Endpoints
const fetchGame = async (gameId: string): Promise<Game> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/games/${gameId}`);
    return response.data;
  } catch (error: any) {
    handleApiError(error);
  }
};

const updateGame = async (gameId: string, gameData: any): Promise<Game> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/games/${gameId}`, gameData);
    return response.data;
  } catch (error: any) {
    handleApiError(error);
  }
};

const deleteGame = async (gameId: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/games/${gameId}`);
  } catch (error: any) {
    handleApiError(error);
  }
};

const fetchAllGames = async (): Promise<Game[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/games`);
    return response.data;
  } catch (error: any) {
    handleApiError(error);
  }
};

const createGame = async (gameData: any): Promise<Game> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/games`, gameData);
    return response.data;
  } catch (error: any) {
    handleApiError(error);
  }
};

const fetchGamesByCategory = async (category: string): Promise<Game[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/games?category=${category}`);
    return response.data;
  } catch (error: any) {
    handleApiError(error);
  }
};

const fetchGamesByProvider = async (provider: string): Promise<Game[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/games?provider=${provider}`);
        return response.data;
    } catch (error: any) {
        handleApiError(error);
    }
};

const searchGames = async (query: string): Promise<Game[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/games?search=${query}`);
        return response.data;
    } catch (error: any) {
        handleApiError(error);
    }
};

// Transaction Endpoints
const fetchTransaction = async (transactionId: string): Promise<Transaction> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/transactions/${transactionId}`);
    return response.data;
  } catch (error: any) {
    handleApiError(error);
  }
};

const updateTransaction = async (transactionId: string, transactionData: any): Promise<Transaction> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/transactions/${transactionId}`, transactionData);
    return response.data;
  } catch (error: any) {
    handleApiError(error);
  }
};

const deleteTransaction = async (transactionId: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/transactions/${transactionId}`);
  } catch (error: any) {
    handleApiError(error);
  }
};

const fetchAllTransactions = async (): Promise<Transaction[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/transactions`);
    return response.data;
  } catch (error: any) {
    handleApiError(error);
  }
};

const createTransaction = async (transactionData: any): Promise<Transaction> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/transactions`, transactionData);
    return response.data;
  } catch (error: any) {
    handleApiError(error);
  }
};

const fetchTransactionsByUser = async (userId: string): Promise<Transaction[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/transactions?userId=${userId}`);
        return response.data;
    } catch (error: any) {
        handleApiError(error);
    }
};

// GameBet Endpoints
const fetchGameBet = async (gameBetId: string): Promise<GameBet> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/game-bets/${gameBetId}`);
    return response.data;
  } catch (error: any) {
    handleApiError(error);
  }
};

const updateGameBet = async (gameBetId: string, gameBetData: any): Promise<GameBet> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/game-bets/${gameBetId}`, gameBetData);
    return response.data;
  } catch (error: any) {
    handleApiError(error);
  }
};

const deleteGameBet = async (gameBetId: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/game-bets/${gameBetId}`);
  } catch (error: any) {
    handleApiError(error);
  }
};

const fetchAllGameBets = async (): Promise<GameBet[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/game-bets`);
    return response.data;
  } catch (error: any) {
    handleApiError(error);
  }
};

const createGameBet = async (gameBetData: any): Promise<GameBet> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/game-bets`, gameBetData);
    return response.data;
  } catch (error: any) {
    handleApiError(error);
  }
};

const fetchGameBetsByUser = async (userId: string): Promise<GameBet[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/game-bets?userId=${userId}`);
        return response.data;
    } catch (error: any) {
        handleApiError(error);
    }
};

const placeBet = async (userId: string, gameId: string, betAmount: number, multiplier: number, payout: number, result?: string): Promise<GameBet> => {
  try {
    const bet: GameBet = {
      id: `bet-${Date.now()}`,
      userId: userId,
      gameId: gameId,
      amount: betAmount, // This was using winAmount incorrectly
      multiplier: multiplier,
      payout: payout, // Changed from winAmount to payout to match the type
      timestamp: new Date().toISOString(),
      result: result || "unknown"
    };
    const response = await axios.post(`${API_BASE_URL}/game-bets`, bet);
    return response.data;
  } catch (error: any) {
    handleApiError(error);
    throw error; // Make sure we throw the error after handling it
  }
};

// Log Endpoints
const fetchLog = async (logId: string): Promise<Log> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/logs/${logId}`);
    return response.data;
  } catch (error: any) {
    handleApiError(error);
  }
};

const updateLog = async (logId: string, logData: any): Promise<Log> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/logs/${logId}`, logData);
    return response.data;
  } catch (error: any) {
    handleApiError(error);
  }
};

const deleteLog = async (logId: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/logs/${logId}`);
  } catch (error: any) {
    handleApiError(error);
  }
};

const fetchAllLogs = async (): Promise<Log[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/logs`);
    return response.data;
  } catch (error: any) {
    handleApiError(error);
  }
};

const createLog = async (logData: any): Promise<Log> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/logs`, logData);
    return response.data;
  } catch (error: any) {
    handleApiError(error);
  }
};

// GameProvider Endpoints
const fetchGameProvider = async (providerId: string): Promise<GameProvider> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/game-providers/${providerId}`);
        return response.data;
    } catch (error: any) {
        handleApiError(error);
    }
};

const updateGameProvider = async (providerId: string, providerData: any): Promise<GameProvider> => {
    try {
        const response = await axios.put(`${API_BASE_URL}/game-providers/${providerId}`, providerData);
        return response.data;
    } catch (error: any) {
        handleApiError(error);
    }
};

const deleteGameProvider = async (providerId: string): Promise<void> => {
    try {
        await axios.delete(`${API_BASE_URL}/game-providers/${providerId}`);
    } catch (error: any) {
        handleApiError(error);
    }
};

const fetchAllGameProviders = async (): Promise<GameProvider[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/game-providers`);
        return response.data;
    } catch (error: any) {
        handleApiError(error);
    }
};

const createGameProvider = async (providerData: any): Promise<GameProvider> => {
    try {
        const response = await axios.post(`${API_BASE_URL}/game-providers`, providerData);
        return response.data;
    } catch (error: any) {
        handleApiError(error);
    }
};

// Create API clients for different resources
export const usersApi = {
  getUsers: async (): Promise<User[]> => {
    try {
      const response: AxiosResponse<User[]> = await axios.get(`${API_BASE_URL}/users`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      return [];
    }
  },
  addUser: async (userData: Partial<User>): Promise<User | undefined> => {
    try {
      const response: AxiosResponse<User> = await axios.post(`${API_BASE_URL}/users`, userData);
      return response.data;
    } catch (error) {
      handleApiError(error);
      return undefined;
    }
  },
  updateUser: async (userData: User): Promise<User | undefined> => {
    try {
      const response: AxiosResponse<User> = await axios.put(`${API_BASE_URL}/users/${userData.id}`, userData);
      return response.data;
    } catch (error) {
      handleApiError(error);
      return undefined;
    }
  }
};

export const gamesApi = {
  getGames: async (): Promise<Game[]> => {
    try {
      const response: AxiosResponse<Game[]> = await axios.get(`${API_BASE_URL}/games`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      return [];
    }
  },
  // Add the missing methods
  deleteGame: async (gameId: string): Promise<boolean> => {
    try {
      await axios.delete(`${API_BASE_URL}/games/${gameId}`);
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    }
  },
  addGame: async (gameData: Omit<Game, 'id'>): Promise<Game | undefined> => {
    try {
      const response: AxiosResponse<Game> = await axios.post(`${API_BASE_URL}/games`, gameData);
      return response.data;
    } catch (error) {
      handleApiError(error);
      return undefined;
    }
  },
  updateGame: async (gameData: Game): Promise<Game | undefined> => {
    try {
      const response: AxiosResponse<Game> = await axios.put(`${API_BASE_URL}/games/${gameData.id}`, gameData);
      return response.data;
    } catch (error) {
      handleApiError(error);
      return undefined;
    }
  },
  toggleFavorite: async (gameId: string): Promise<boolean> => {
    try {
      const response: AxiosResponse<{ isFavorite: boolean }> = await axios.post(`${API_BASE_URL}/games/${gameId}/toggle-favorite`);
      return response.data.isFavorite;
    } catch (error) {
      handleApiError(error);
      return false;
    }
  }
};

export const transactionsApi = {
  getTransactions: async (): Promise<Transaction[]> => {
    try {
      const response: AxiosResponse<Transaction[]> = await axios.get(`${API_BASE_URL}/transactions`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      return [];
    }
  }
};

export const apiService = {
  registerUser,
  loginUser,
  adminLogin,
  logoutUser,
  fetchUser,
  updateUser,
  deleteUser,
  fetchAllUsers,
  createUser,
  fetchGame,
  updateGame,
  deleteGame,
  fetchAllGames,
  createGame,
  fetchGamesByCategory,
  fetchGamesByProvider,
  searchGames,
  fetchTransaction,
  updateTransaction,
  deleteTransaction,
  fetchAllTransactions,
  createTransaction,
  fetchTransactionsByUser,
  fetchGameBet,
  updateGameBet,
  deleteGameBet,
  fetchAllGameBets,
  createGameBet,
  fetchGameBetsByUser,
  placeBet,
  fetchLog,
  updateLog,
  deleteLog,
  fetchAllLogs,
  createLog,
  fetchGameProvider,
  updateGameProvider,
  deleteGameProvider,
  fetchAllGameProviders,
  createGameProvider
};

export default apiService;
