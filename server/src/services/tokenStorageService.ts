import { Database } from 'sqlite3';
import { logger } from '../utils/logger';
import { EbayTokens, EbayUser } from './ebayOAuthService';

export interface StoredTokens {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredUser {
  id: string;
  ebayUserId: string;
  username: string;
  email?: string;
  accountType: string;
  createdAt: Date;
  updatedAt: Date;
}

class TokenStorageService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
    this.initializeTables();
  }

  private initializeTables(): void {
    // Create tokens table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS ebay_tokens (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create users table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS ebay_users (
        id TEXT PRIMARY KEY,
        ebay_user_id TEXT UNIQUE NOT NULL,
        username TEXT NOT NULL,
        email TEXT,
        account_type TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    logger.info('Token storage tables initialized');
  }

  /**
   * Store tokens for a user
   */
  async storeTokens(userId: string, tokens: EbayTokens): Promise<void> {
    return new Promise((resolve, reject) => {
      const id = `tokens_${userId}`;
      const now = new Date().toISOString();

      this.db.run(`
        INSERT OR REPLACE INTO ebay_tokens 
        (id, user_id, access_token, refresh_token, expires_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        id,
        userId,
        tokens.accessToken,
        tokens.refreshToken,
        tokens.expiresAt.toISOString(),
        now
      ], (err) => {
        if (err) {
          logger.error('Failed to store tokens:', err);
          reject(err);
        } else {
          logger.info(`Stored tokens for user: ${userId}`);
          resolve();
        }
      });
    });
  }

  /**
   * Retrieve tokens for a user
   */
  async getTokens(userId: string): Promise<StoredTokens | null> {
    return new Promise((resolve, reject) => {
      this.db.get(`
        SELECT * FROM ebay_tokens 
        WHERE user_id = ?
        ORDER BY updated_at DESC 
        LIMIT 1
      `, [userId], (err, row: any) => {
        if (err) {
          logger.error('Failed to retrieve tokens:', err);
          reject(err);
        } else if (row) {
          const tokens: StoredTokens = {
            id: row.id,
            userId: row.user_id,
            accessToken: row.access_token,
            refreshToken: row.refresh_token,
            expiresAt: new Date(row.expires_at),
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
          };
          resolve(tokens);
        } else {
          resolve(null);
        }
      });
    });
  }

  /**
   * Store user information
   */
  async storeUser(user: EbayUser): Promise<void> {
    return new Promise((resolve, reject) => {
      const id = `user_${user.userId}`;
      const now = new Date().toISOString();

      this.db.run(`
        INSERT OR REPLACE INTO ebay_users 
        (id, ebay_user_id, username, email, account_type, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        id,
        user.userId,
        user.username,
        user.email,
        user.accountType,
        now
      ], (err) => {
        if (err) {
          logger.error('Failed to store user:', err);
          reject(err);
        } else {
          logger.info(`Stored user: ${user.username}`);
          resolve();
        }
      });
    });
  }

  /**
   * Retrieve user information
   */
  async getUser(ebayUserId: string): Promise<StoredUser | null> {
    return new Promise((resolve, reject) => {
      this.db.get(`
        SELECT * FROM ebay_users 
        WHERE ebay_user_id = ?
      `, [ebayUserId], (err, row: any) => {
        if (err) {
          logger.error('Failed to retrieve user:', err);
          reject(err);
        } else if (row) {
          const user: StoredUser = {
            id: row.id,
            ebayUserId: row.ebay_user_id,
            username: row.username,
            email: row.email,
            accountType: row.account_type,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
          };
          resolve(user);
        } else {
          resolve(null);
        }
      });
    });
  }

  /**
   * Delete tokens for a user (logout)
   */
  async deleteTokens(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(`
        DELETE FROM ebay_tokens 
        WHERE user_id = ?
      `, [userId], (err) => {
        if (err) {
          logger.error('Failed to delete tokens:', err);
          reject(err);
        } else {
          logger.info(`Deleted tokens for user: ${userId}`);
          resolve();
        }
      });
    });
  }

  /**
   * Check if tokens are expired
   */
  isTokenExpired(expiresAt: Date): boolean {
    // Refresh token 5 minutes before expiry
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    return new Date() > new Date(expiresAt.getTime() - bufferTime);
  }

  /**
   * Clean up expired tokens
   */
  async cleanupExpiredTokens(): Promise<void> {
    return new Promise((resolve, reject) => {
      const cutoffTime = new Date(Date.now() - (5 * 60 * 1000)).toISOString(); // 5 minutes ago

      this.db.run(`
        DELETE FROM ebay_tokens 
        WHERE expires_at < ?
      `, [cutoffTime], (err) => {
        if (err) {
          logger.error('Failed to cleanup expired tokens:', err);
          reject(err);
        } else {
          logger.info('Cleaned up expired tokens');
          resolve();
        }
      });
    });
  }
}

export default TokenStorageService; 