import sqlite3 from 'sqlite3';
import path from 'path';
import { logger } from './logger';

let db: sqlite3.Database;

export const initializeDatabase = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const dbPath = process.env.DB_PATH || './data/ebay_manager.db';
    
    // Ensure data directory exists
    const dataDir = path.dirname(dbPath);
    const fs = require('fs');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        logger.error('Error opening database:', err);
        reject(err);
        return;
      }
      
      logger.info('Connected to SQLite database');
      createTables()
        .then(() => resolve())
        .catch(reject);
    });
  });
};

const createTables = async (): Promise<void> => {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      email TEXT UNIQUE,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS ebay_listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ebay_item_id TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      quantity INTEGER DEFAULT 1,
      status TEXT DEFAULT 'active',
      category_id TEXT,
      condition TEXT,
      images TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ebay_order_id TEXT UNIQUE NOT NULL,
      buyer_username TEXT NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      shipping_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS api_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      endpoint TEXT NOT NULL,
      method TEXT NOT NULL,
      status_code INTEGER,
      response_time INTEGER,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`
  ];
  
  for (const table of tables) {
    await new Promise<void>((resolve, reject) => {
      db.run(table, (err) => {
        if (err) {
          logger.error('Error creating table:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
  
  logger.info('Database tables created successfully');
};

export const getDatabase = (): sqlite3.Database => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
};

export const closeDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          logger.error('Error closing database:', err);
          reject(err);
        } else {
          logger.info('Database connection closed');
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}; 