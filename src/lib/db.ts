
// Check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

// Only import mysql2 if we're in a Node.js environment
let mysql: any;
let initDatabase: any;

if (!isBrowser) {
  // Server-side only imports
  const serverImports = require('@/services/databaseService');
  mysql = require('mysql2/promise');
  initDatabase = serverImports.initDatabase;
} else {
  // Browser-safe mock imports
  const { browserDb } = require('@/services/browserSafeDatabaseService');
  mysql = null;
  initDatabase = () => browserDb;
}

// Initialize the database connection once at startup
export const initializeDatabase = async () => {
  try {
    if (isBrowser) {
      console.log("Running in browser environment, using mock database");
      return true;
    }
    
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
  if (isBrowser) {
    return { connected: true, message: "Mock database connected (browser environment)" };
  }
  
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
export const db = isBrowser 
  ? require('@/services/browserSafeDatabaseService').browserDb
  : {
      connect: initializeDatabase,
      status: getDatabaseStatus,
      disconnect: () => {
        console.log("Disconnected from database");
        return true;
      }
    };
