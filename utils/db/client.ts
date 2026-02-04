import { type SQLiteDatabase } from 'expo-sqlite';
import { schemaV1 } from './schema';

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
    const DATABASE_VERSION = 2;

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
    }

    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
    console.log(`Database migrated to version ${DATABASE_VERSION}`);
}
