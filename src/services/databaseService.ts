
// Check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

// Only import mysql2 if we're in a Node.js environment
let mysql: any;
let pool: any;

if (!isBrowser) {
  // Server-side only imports
  mysql = require('mysql2/promise');
} else {
  // Import browser-safe mock
  const { browserDb } = require('./browserSafeDatabaseService');
  mysql = null;
  pool = browserDb;
}

// Configuration for the database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'casino',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create a connection pool
export const initDatabase = () => {
  try {
    if (isBrowser) {
      console.log('Browser environment detected, using mock database');
      return require('./browserSafeDatabaseService').browserDb;
    }
    
    pool = mysql.createPool(dbConfig);
    console.log('Database pool created successfully');
    return pool;
  } catch (error) {
    console.error('Failed to create database pool:', error);
    throw error;
  }
};

export const getConnection = async () => {
  if (isBrowser) {
    return require('./browserSafeDatabaseService').browserDb.getConnection();
  }
  
  if (!pool) {
    initDatabase();
  }
  return pool.getConnection();
};

export const query = async (sql: string, params?: any[]) => {
  if (isBrowser) {
    return require('./browserSafeDatabaseService').mockQuery({ sql, params });
  }
  
  try {
    const connection = await getConnection();
    try {
      const [results] = await connection.query(sql, params);
      return results;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Execute transactions with multiple queries
export const transaction = async (queries: { sql: string; params?: any[] }[]) => {
  if (isBrowser) {
    return require('./browserSafeDatabaseService').mockTransaction(queries);
  }
  
  const connection = await getConnection();
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
    throw error;
  } finally {
    connection.release();
  }
};

// For development/testing only
export const mockQuery = (data: any) => {
  console.log('Executing mock query with:', data);
  return Promise.resolve(data);
};
