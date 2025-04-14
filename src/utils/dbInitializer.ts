
// Database initializer for browser environments
// This ensures the app can run without a real database connection

/**
 * Initialize the browser-safe database for development and testing
 */
const initializeDatabase = async () => {
  console.log("Initializing browser-safe database environment");
  
  // In a browser environment, we use mock implementations
  if (typeof window !== 'undefined') {
    console.log("Browser environment detected, using mock database");
    return true;
  }
  
  // For server environments (not used in the Lovable preview)
  try {
    const { db } = await import('../lib/db');
    await db.connect();
    console.log("Database connection established successfully");
    return true;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    return false;
  }
};

export default initializeDatabase;
