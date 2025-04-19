
// Check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

// Only try to import modules if needed, and do so safely for the browser
let mysql: any = null;
let initDatabase: any = null;
let browserDb: any = null;

// Safe imports based on environment
if (!isBrowser) {
  try {
    // Server-side imports
    const serverImports = require('@/services/databaseService');
    mysql = require('mysql2/promise');
    initDatabase = serverImports.initDatabase;
  } catch (err) {
    console.error('Could not import server-side database modules:', err);
  }
} else {
  try {
    // Browser-safe imports
    const { browserDb: browserDbImport } = require('@/services/browserSafeDatabaseService');
    browserDb = browserDbImport;
    initDatabase = () => browserDb;
  } catch (err) {
    console.error('Could not import browser-safe database modules:', err);
    // Create fallback implementation
    browserDb = {
      query: () => Promise.resolve([]),
      getConnection: () => Promise.resolve({
        query: () => Promise.resolve([[]]),
        release: () => {}
      }),
      connect: () => Promise.resolve(true),
      status: () => Promise.resolve({ connected: true, message: "Mock database connected" }),
      disconnect: () => true
    };
    initDatabase = () => browserDb;
  }
}

// Initialize the database connection once at startup
export const initializeDatabase = async () => {
  try {
    if (isBrowser) {
      console.log("Running in browser environment, using mock database");
      return true;
    }
    
    if (!initDatabase) {
      console.warn("Database initialization function not available");
      return false;
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
  
  if (!mysql) {
    return { connected: false, message: "MySQL module not available" };
  }
  
  try {
    const connection = await mysql.createConnection({
      host: isBrowser ? 'localhost' : (process.env.DB_HOST || 'localhost'),
      user: isBrowser ? 'root' : (process.env.DB_USER || 'root'),
      password: isBrowser ? '' : (process.env.DB_PASSWORD || ''),
      database: isBrowser ? 'casino' : (process.env.DB_NAME || 'casino')
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
  ? (browserDb || {
      connect: () => Promise.resolve(true),
      status: () => Promise.resolve({ connected: true, message: "Mock database connected" }),
      disconnect: () => true
    })
  : {
      connect: initializeDatabase,
      status: getDatabaseStatus,
      disconnect: () => {
        console.log("Disconnected from database");
        return true;
      }
    };
