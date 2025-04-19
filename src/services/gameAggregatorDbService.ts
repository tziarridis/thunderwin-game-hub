
import { query, transaction } from './databaseService';
import { GameDBModel, ProviderDBModel, TransactionDBModel } from '@/types/database';
import { toast } from 'sonner';

/**
 * Game Aggregator Database Service
 * Provides database operations for game aggregator functionality
 */
export const gameAggregatorDbService = {
  /**
   * Create a new game in the database
   * @param gameData The game data to insert
   * @returns The inserted game with ID
   */
  createGame: async (gameData: Omit<GameDBModel, 'id'>): Promise<GameDBModel | null> => {
    try {
      const fields = Object.keys(gameData).join(', ');
      const placeholders = Object.keys(gameData).map(() => '?').join(', ');
      const values = Object.values(gameData);
      
      // Convert boolean values to 0/1 for MySQL
      const processedValues = values.map(val => 
        typeof val === 'boolean' ? (val ? 1 : 0) : val
      );
      
      const query_sql = `INSERT INTO games (${fields}) VALUES (${placeholders})`;
      const result = await query(query_sql, processedValues);
      
      if (result && result.insertId) {
        return { 
          id: BigInt(result.insertId), 
          ...gameData 
        };
      }
      
      return null;
    } catch (error: any) {
      console.error('Error creating game:', error);
      toast.error(`Failed to create game: ${error.message}`);
      return null;
    }
  },
  
  /**
   * Get all games with optional filtering
   * @param filters Optional filters for the query
   * @param page Page number
   * @param limit Results per page
   * @returns Array of games and total count
   */
  getAllGames: async (
    filters: Partial<GameDBModel> = {}, 
    page = 1, 
    limit = 50
  ): Promise<{ data: GameDBModel[], total: number }> => {
    try {
      const offset = (page - 1) * limit;
      
      // Build where clause from filters
      let whereClause = '';
      const queryParams: any[] = [];
      
      if (Object.keys(filters).length > 0) {
        const filterClauses = [];
        
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (typeof value === 'string' && value.includes('%')) {
              // Handle LIKE queries
              filterClauses.push(`${key} LIKE ?`);
            } else {
              filterClauses.push(`${key} = ?`);
            }
            queryParams.push(value);
          }
        });
        
        if (filterClauses.length > 0) {
          whereClause = `WHERE ${filterClauses.join(' AND ')}`;
        }
      }
      
      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM games ${whereClause}`;
      const countResult = await query(countQuery, queryParams);
      const total = countResult[0]?.total || 0;
      
      // Get paginated results
      const dataQuery = `
        SELECT * FROM games 
        ${whereClause} 
        ORDER BY id DESC 
        LIMIT ? OFFSET ?
      `;
      
      const dataResult = await query(dataQuery, [...queryParams, limit, offset]);
      
      return {
        data: dataResult || [],
        total
      };
    } catch (error: any) {
      console.error('Error getting games:', error);
      toast.error(`Failed to fetch games: ${error.message}`);
      return { data: [], total: 0 };
    }
  },
  
  /**
   * Get a game by ID
   * @param id The game ID
   * @returns The game or null if not found
   */
  getGameById: async (id: number | bigint): Promise<GameDBModel | null> => {
    try {
      const result = await query('SELECT * FROM games WHERE id = ? LIMIT 1', [id]);
      return result && result.length > 0 ? result[0] : null;
    } catch (error: any) {
      console.error('Error getting game by ID:', error);
      return null;
    }
  },
  
  /**
   * Get a game by game_id (provider's ID)
   * @param gameId The provider's game ID
   * @returns The game or null if not found
   */
  getGameByGameId: async (gameId: string): Promise<GameDBModel | null> => {
    try {
      const result = await query('SELECT * FROM games WHERE game_id = ? LIMIT 1', [gameId]);
      return result && result.length > 0 ? result[0] : null;
    } catch (error: any) {
      console.error('Error getting game by game_id:', error);
      return null;
    }
  },
  
  /**
   * Update a game
   * @param id The game ID
   * @param gameData The updated game data
   * @returns The updated game or null on failure
   */
  updateGame: async (id: number | bigint, gameData: Partial<GameDBModel>): Promise<GameDBModel | null> => {
    try {
      // Remove id from update data if present
      const { id: _, ...updateData } = gameData as any;
      
      const updates = Object.entries(updateData)
        .map(([key, _]) => `${key} = ?`)
        .join(', ');
      
      // Convert boolean values to 0/1 for MySQL
      const values = Object.values(updateData).map(val => 
        typeof val === 'boolean' ? (val ? 1 : 0) : val
      );
      
      const result = await query(
        `UPDATE games SET ${updates} WHERE id = ?`,
        [...values, id]
      );
      
      if (result && result.affectedRows > 0) {
        // Get the updated record
        return await gameAggregatorDbService.getGameById(id);
      }
      
      return null;
    } catch (error: any) {
      console.error('Error updating game:', error);
      toast.error(`Failed to update game: ${error.message}`);
      return null;
    }
  },
  
  /**
   * Delete a game
   * @param id The game ID
   * @returns Success status
   */
  deleteGame: async (id: number | bigint): Promise<boolean> => {
    try {
      const result = await query('DELETE FROM games WHERE id = ?', [id]);
      return result && result.affectedRows > 0;
    } catch (error: any) {
      console.error('Error deleting game:', error);
      toast.error(`Failed to delete game: ${error.message}`);
      return false;
    }
  },
  
  /**
   * Create a new transaction in the database
   * @param transactionData The transaction data
   * @returns The created transaction
   */
  createTransaction: async (transactionData: Omit<TransactionDBModel, 'id'>): Promise<TransactionDBModel | null> => {
    try {
      const fields = Object.keys(transactionData).join(', ');
      const placeholders = Object.keys(transactionData).map(() => '?').join(', ');
      const values = Object.values(transactionData);
      
      const result = await query(
        `INSERT INTO transactions (${fields}) VALUES (${placeholders})`,
        values
      );
      
      if (result && result.insertId) {
        return { 
          id: BigInt(result.insertId), 
          ...transactionData 
        };
      }
      
      return null;
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      return null;
    }
  },
  
  /**
   * Get all providers
   * @returns Array of providers
   */
  getAllProviders: async (): Promise<ProviderDBModel[]> => {
    try {
      return await query('SELECT * FROM providers ORDER BY name');
    } catch (error: any) {
      console.error('Error getting providers:', error);
      return [];
    }
  },
  
  /**
   * Get a provider by ID
   * @param id The provider ID
   * @returns The provider or null if not found
   */
  getProviderById: async (id: number): Promise<ProviderDBModel | null> => {
    try {
      const result = await query('SELECT * FROM providers WHERE id = ? LIMIT 1', [id]);
      return result && result.length > 0 ? result[0] : null;
    } catch (error: any) {
      console.error('Error getting provider by ID:', error);
      return null;
    }
  },
  
  /**
   * Create DB tables if they don't exist
   * This ensures the database has the required structure
   * @returns Success status
   */
  ensureTables: async (): Promise<boolean> => {
    try {
      // Create games table
      await query(`
        CREATE TABLE IF NOT EXISTS games (
          id bigint UNSIGNED NOT NULL AUTO_INCREMENT,
          provider_id int UNSIGNED NOT NULL,
          game_server_url varchar(191) NULL,
          game_id varchar(191) NOT NULL,
          game_name varchar(191) NOT NULL,
          game_code varchar(191) NOT NULL,
          game_type varchar(191) NULL,
          description varchar(191) NULL,
          cover varchar(191) NULL,
          status varchar(191) NOT NULL,
          technology varchar(191) NULL,
          has_lobby tinyint NOT NULL DEFAULT 0,
          is_mobile tinyint NOT NULL DEFAULT 0,
          has_freespins tinyint NOT NULL DEFAULT 0,
          has_tables tinyint NOT NULL DEFAULT 0,
          only_demo tinyint NULL DEFAULT 0,
          rtp bigint NOT NULL,
          distribution varchar(191) NOT NULL,
          views bigint NOT NULL DEFAULT 0,
          is_featured tinyint(1) NULL DEFAULT 0,
          show_home tinyint(1) NULL DEFAULT 0,
          created_at timestamp NULL DEFAULT NULL,
          updated_at timestamp NULL DEFAULT NULL,
          PRIMARY KEY (id),
          INDEX games_provider_id_index (provider_id),
          INDEX games_game_code_index (game_code)
        )
      `);
      
      // Create providers table
      await query(`
        CREATE TABLE IF NOT EXISTS providers (
          id int UNSIGNED NOT NULL AUTO_INCREMENT,
          name varchar(191) NOT NULL,
          code varchar(191) NOT NULL,
          description varchar(191) NULL,
          status varchar(20) NOT NULL DEFAULT 'active',
          api_url varchar(191) NULL,
          api_key varchar(191) NULL,
          api_secret varchar(191) NULL,
          callback_url varchar(191) NULL,
          supports_seamless tinyint NOT NULL DEFAULT 0,
          created_at timestamp NULL DEFAULT NULL,
          updated_at timestamp NULL DEFAULT NULL,
          PRIMARY KEY (id),
          UNIQUE INDEX providers_code_unique (code)
        )
      `);
      
      // Create transactions table
      await query(`
        CREATE TABLE IF NOT EXISTS transactions (
          id bigint UNSIGNED NOT NULL AUTO_INCREMENT,
          player_id varchar(191) NOT NULL,
          transaction_id varchar(191) NOT NULL,
          round_id varchar(191) NOT NULL,
          game_id varchar(191) NOT NULL,
          provider_id int UNSIGNED NOT NULL,
          type varchar(20) NOT NULL,
          amount decimal(12,2) NOT NULL,
          currency varchar(3) NOT NULL,
          before_balance decimal(12,2) NOT NULL,
          after_balance decimal(12,2) NOT NULL,
          status int NOT NULL DEFAULT 0,
          created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at timestamp NULL DEFAULT NULL,
          PRIMARY KEY (id),
          UNIQUE INDEX transactions_transaction_id_unique (transaction_id)
        )
      `);
      
      // Create wallets table
      await query(`
        CREATE TABLE IF NOT EXISTS player_wallets (
          id bigint UNSIGNED NOT NULL AUTO_INCREMENT,
          player_id varchar(191) NOT NULL,
          currency varchar(3) NOT NULL,
          balance decimal(12,2) NOT NULL DEFAULT 0.00,
          bonus_balance decimal(12,2) NOT NULL DEFAULT 0.00,
          is_locked tinyint NOT NULL DEFAULT 0,
          last_transaction_id varchar(191) NULL,
          created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at timestamp NULL DEFAULT NULL,
          PRIMARY KEY (id),
          UNIQUE INDEX player_wallets_player_id_currency_unique (player_id, currency)
        )
      `);
      
      return true;
    } catch (error: any) {
      console.error('Error creating tables:', error);
      return false;
    }
  }
};

export default gameAggregatorDbService;
