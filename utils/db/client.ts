import { type SQLiteDatabase } from 'expo-sqlite';
import { schemaV1 } from './schema';

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
    const DATABASE_VERSION = 3;

    const result = await db.getFirstAsync<{ user_version: number }>(
        'PRAGMA user_version'
    );
    let currentDbVersion = result?.user_version ?? 0;

    console.log(`Current DB version: ${currentDbVersion}`);

    if (currentDbVersion >= DATABASE_VERSION) {
        return;
    }

    if (currentDbVersion === 0) {
        console.log("Initializing database...");
        await db.execAsync(schemaV1);
    } else if (currentDbVersion === 1) {
        console.log("Migrating database from version 1 to 2 (Clean Reset)...");
        // For development, we can drop and recreate or just run the NEW schema
        // Since schemaV1 now contains EVERYTHING, we can just run it
        await db.execAsync(`
            PRAGMA foreign_keys = OFF;
            DROP TABLE IF EXISTS transactions;
            DROP TABLE IF EXISTS wallets;
            DROP TABLE IF EXISTS categories;
            PRAGMA foreign_keys = ON;
            ${schemaV1}
        `);
    } else if (currentDbVersion === 2) {
        console.log("Migrating database from version 2 to 3...");
        await db.execAsync(`
            ALTER TABLE wallets ADD COLUMN type TEXT NOT NULL DEFAULT 'Cash';
            ALTER TABLE wallets ADD COLUMN icon TEXT;
            ALTER TABLE wallets ADD COLUMN initial_amount REAL NOT NULL DEFAULT 0;
            ALTER TABLE wallets ADD COLUMN current_amount REAL NOT NULL DEFAULT 0;
            ALTER TABLE wallets ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;
        `);
    }

    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
    console.log(`Database migrated to version ${DATABASE_VERSION}`);
}
