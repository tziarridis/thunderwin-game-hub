
import mysql from 'mysql2/promise';
import { initDatabase } from '@/services/databaseService';

// Initialize the database connection once at startup
export const initializeDatabase = async () => {
  try {
    const pool = initDatabase();
    console.log("Database connection initialized successfully");
    
    // Test the connection
    const connection = await pool.getConnection();
    connection.release();
    
    return true;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    return false;
  }
};

// Export a function to get the database status
export const getDatabaseStatus = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'casino'
    });
    
    // Test the connection
    await connection.ping();
    await connection.end();
    
    return { connected: true, message: "Database connection successful" };
  } catch (error) {
    return { 
      connected: false, 
      message: `Database connection failed: ${(error as Error).message}` 
    };
  }
};

// For development and testing purposes only
export const db = {
  connect: initializeDatabase,
  status: getDatabaseStatus,
  disconnect: () => {
    console.log("Disconnected from database");
    return true;
  }
};
