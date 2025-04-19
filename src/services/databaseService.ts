
// Check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

// Browser-safe variable declarations
let mysql: any = null;
let pool: any = null;

// Only try to import MySQL if we're in a Node.js environment
if (!isBrowser) {
  try {
    // This import will only execute in Node.js
    mysql = require('mysql2/promise');
  } catch (err) {
    console.error('mysql2 module is not available in this environment');
  }
} 

// Configuration for the database connection
// Use a browser-safe approach to configuration
const dbConfig = {
  host: isBrowser ? 'localhost' : (process.env.DB_HOST || 'localhost'),
  user: isBrowser ? 'root' : (process.env.DB_USER || 'root'),
  password: isBrowser ? '' : (process.env.DB_PASSWORD || ''),
  database: isBrowser ? 'casino' : (process.env.DB_NAME || 'casino'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create a connection pool
export const initDatabase = () => {
  try {
    if (isBrowser) {
      console.log('Browser environment detected, using mock database');
      return { 
        query: mockQuery,
        // Add other mock functions as needed
        getConnection: () => Promise.resolve({
          query: () => Promise.resolve([[]]),
          release: () => {},
          beginTransaction: () => Promise.resolve({}),
          commit: () => Promise.resolve({}),
          rollback: () => Promise.resolve({})
        })
      };
    }
    
    if (!mysql) {
      console.error('mysql2 module is not available');
      return {
        query: mockQuery,
        getConnection: () => Promise.resolve({
          query: () => Promise.resolve([[]]),
          release: () => {},
          beginTransaction: () => Promise.resolve({}),
          commit: () => Promise.resolve({}),
          rollback: () => Promise.resolve({})
        })
      };
    }
    
    pool = mysql.createPool(dbConfig);
    console.log('Database pool created successfully');
    return pool;
  } catch (error) {
    console.error('Failed to create database pool:', error);
    // Return a mock implementation as fallback
    return {
      query: mockQuery,
      getConnection: () => Promise.resolve({
        query: () => Promise.resolve([[]]),
        release: () => {},
        beginTransaction: () => Promise.resolve({}),
        commit: () => Promise.resolve({}),
        rollback: () => Promise.resolve({})
      })
    };
  }
};

export const getConnection = async () => {
  if (isBrowser) {
    return {
      query: (sql: string, params: any[]) => Promise.resolve([[]]),
      release: () => {},
      beginTransaction: () => Promise.resolve({}),
      commit: () => Promise.resolve({}),
      rollback: () => Promise.resolve({})
    };
  }
  
  if (!pool) {
    pool = initDatabase();
  }
  return pool.getConnection();
};

export const query = async (sql: string, params?: any[]) => {
  if (isBrowser) {
    return mockQuery({ sql, params });
  }
  
  try {
    if (!pool) {
      pool = initDatabase();
    }
    const connection = await pool.getConnection();
    try {
      const [results] = await connection.query(sql, params);
      return results;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Database query error:', error);
    return [];
  }
};

// Execute transactions with multiple queries
export const transaction = async (queries: { sql: string; params?: any[] }[]) => {
  if (isBrowser) {
    return mockTransaction(queries);
  }
  
  if (!pool) {
    pool = initDatabase();
  }
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const q of queries) {
      const [result] = await connection.query(q.sql, q.params);
      results.push(result);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    console.error('Transaction error:', error);
    return [];
  } finally {
    connection.release();
  }
};

// For development/testing only
export const mockQuery = (data: any) => {
  console.log('Executing mock query with:', data);
  return Promise.resolve([]);
};

// For development/testing only
export const mockTransaction = (queries: { sql: string; params?: any[] }[]) => {
  console.log('Executing mock transaction with:', queries);
  return Promise.resolve(queries.map(() => ({})));
};
