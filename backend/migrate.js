import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Open the database
const dbPath = join(__dirname, 'creative_prints.db');
const db = new Database(dbPath);

console.log('🔧 Running database migration...\n');

try {
    // Add columns to clients table
    console.log('Adding columns to clients table...');
    db.exec(`
    ALTER TABLE clients ADD COLUMN pincode TEXT;
  `);
    console.log('✅ Added pincode column');

    db.exec(`
    ALTER TABLE clients ADD COLUMN gstin TEXT;
  `);
    console.log('✅ Added gstin column');

    db.exec(`
    ALTER TABLE clients ADD COLUMN arn TEXT;
  `);
    console.log('✅ Added arn column');

    // Add column to chalans table
    console.log('\nAdding column to chalans table...');
    db.exec(`
    ALTER TABLE chalans ADD COLUMN arn TEXT;
  `);
    console.log('✅ Added arn column to chalans');

    console.log('\n✅ Migration completed successfully!');
    console.log('\nVerifying changes...\n');

    // Verify clients table
    const clientsInfo = db.prepare("PRAGMA table_info(clients)").all();
    console.log('Clients table columns:');
    clientsInfo.forEach(col => {
        console.log(`  - ${col.name} (${col.type})`);
    });

    // Verify chalans table
    const chalansInfo = db.prepare("PRAGMA table_info(chalans)").all();
    console.log('\nChalans table columns:');
    chalansInfo.forEach(col => {
        console.log(`  - ${col.name} (${col.type})`);
    });

} catch (error) {
    if (error.message.includes('duplicate column name')) {
        console.log('⚠️  Columns already exist - migration already applied!');
    } else {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
} finally {
    db.close();
}
