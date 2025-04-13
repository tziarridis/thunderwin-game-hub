
import mysql from 'mysql2/promise';

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
let pool: mysql.Pool;

export const initDatabase = () => {
  try {
    pool = mysql.createPool(dbConfig);
    console.log('Database pool created successfully');
    return pool;
  } catch (error) {
    console.error('Failed to create database pool:', error);
    throw error;
  }
};

export const getConnection = async () => {
  if (!pool) {
    initDatabase();
  }
  return pool.getConnection();
};

export const query = async (sql: string, params?: any[]) => {
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

// For development/testing only
export const mockQuery = (data: any) => {
  console.log('Executing mock query with:', data);
  return Promise.resolve(data);
};
