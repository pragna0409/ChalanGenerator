import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create database file in backend directory
const dbPath = join(__dirname, '..', 'creative_prints.db');

// Initialize database
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Read and execute schema if database is new
const schemaPath = join(__dirname, '..', 'database', 'init.sql');
if (!fs.existsSync(dbPath) || fs.statSync(dbPath).size === 0) {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  // Execute schema (split by semicolon and execute each statement)
  const statements = schema.split(';').filter(stmt => stmt.trim());
  statements.forEach(stmt => {
    if (stmt.trim()) {
      db.exec(stmt);
    }
  });
  console.log('✅ SQLite database initialized at:', dbPath);
}

// Helper function to convert SQLite rows to match MySQL pool format
const pool = {
  query: function (sql, params = []) {
    return new Promise((resolve, reject) => {
      try {
        // Convert boolean values to integers (SQLite doesn't support boolean)
        const convertedParams = params.map(param => {
          if (typeof param === 'boolean') {
            return param ? 1 : 0;
          }
          return param;
        });

        if (sql.trim().toUpperCase().startsWith('SELECT')) {
          const stmt = db.prepare(sql);
          const rows = convertedParams.length > 0 ? stmt.all(...convertedParams) : stmt.all();
          resolve([rows]); // Return in MySQL format [rows, fields]
        } else if (sql.trim().toUpperCase().startsWith('INSERT')) {
          const stmt = db.prepare(sql);
          const info = convertedParams.length > 0 ? stmt.run(...convertedParams) : stmt.run();
          resolve([{ insertId: info.lastInsertRowid, affectedRows: info.changes }]);
        } else {
          const stmt = db.prepare(sql);
          const info = convertedParams.length > 0 ? stmt.run(...convertedParams) : stmt.run();
          resolve([{ affectedRows: info.changes }]);
        }
      } catch (error) {
        console.error('Database query error:', error);
        reject(error);
      }
    });
  }
};

export default pool; 