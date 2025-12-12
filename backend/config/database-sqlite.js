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

// Read and execute schema
const schemaPath = join(__dirname, '..', 'database', 'init.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Execute schema (split by semicolon and execute each statement)
const statements = schema.split(';').filter(stmt => stmt.trim());
statements.forEach(stmt => {
    if (stmt.trim()) {
        db.exec(stmt);
    }
});

console.log('✅ SQLite database initialized at:', dbPath);

// Helper function to convert SQLite rows to match MySQL format
export function query(sql, params = []) {
    try {
        if (sql.trim().toUpperCase().startsWith('SELECT')) {
            const stmt = db.prepare(sql);
            const rows = params.length > 0 ? stmt.all(...params) : stmt.all();
            return [rows]; // Return in MySQL format [rows, fields]
        } else if (sql.trim().toUpperCase().startsWith('INSERT')) {
            const stmt = db.prepare(sql);
            const info = params.length > 0 ? stmt.run(...params) : stmt.run();
            return [{ insertId: info.lastInsertRowid, affectedRows: info.changes }];
        } else {
            const stmt = db.prepare(sql);
            const info = params.length > 0 ? stmt.run(...params) : stmt.run();
            return [{ affectedRows: info.changes }];
        }
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

export default { query };
