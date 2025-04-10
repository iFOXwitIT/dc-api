const mysql = require('mysql2/promise');
require('dotenv').config();

// Create pool with more fault tolerance in production
const createConnectionPool = () => {
  try {
    const sslConfig = process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } // Less strict in production
      : { rejectUnauthorized: true };
    
    console.log('Creating database connection pool');
    
    return mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: sslConfig
    });
  } catch (error) {
    console.error('Error creating connection pool:', error.message);
    // Return a dummy pool in case of configuration errors
    return {
      getConnection: async () => {
        throw new Error('Database connection not available');
      },
      query: async () => {
        throw new Error('Database connection not available');
      }
    };
  }
};

const pool = createConnectionPool();

// Test database connection
async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log(`Host: ${process.env.DB_HOST}, Database: ${process.env.DB_NAME}`);
    
    const connection = await pool.getConnection();
    console.log('Database connection established successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('Failed to connect to database:', error.message);
    console.error('Database connection details:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      database: process.env.DB_NAME
    });
    
    return false;
  }
}

module.exports = {
  pool,
  testConnection
}; 