import { SQLiteDatabase } from "expo-sqlite";

export interface BackupData {
    version: number;
    timestamp: number;
    data: {
        wallets: any[];
        categories: any[];
        transactions: any[];
    };
}

/**
 * Exports all database records to a JSON-compatible object.
 */
export async function exportDatabaseToJson(db: SQLiteDatabase): Promise<BackupData> {
    const wallets = await db.getAllAsync("SELECT * FROM wallets");
    const categories = await db.getAllAsync("SELECT * FROM categories");
    const transactions = await db.getAllAsync("SELECT * FROM transactions");

    return {
        version: 1,
        timestamp: Date.now(),
        data: {
            wallets,
            categories,
            transactions
        }
    };
}

/**
 * Restores the database from a JSON-compatible object.
 * WARNING: This clears existing data before inserting new data.
 */
export async function restoreDatabaseFromJson(db: SQLiteDatabase, backup: BackupData): Promise<void> {
    if (!backup || backup.version !== 1 || !backup.data) {
        throw new Error("Invalid backup data format.");
    }

    const { wallets, categories, transactions } = backup.data;

    // Use a transaction for safety and performance
    await db.withTransactionAsync(async () => {
        // 1. Clear existing data
        await db.runAsync("DELETE FROM transactions");
        await db.runAsync("DELETE FROM categories");
        await db.runAsync("DELETE FROM wallets");

        // 2. Insert Wallets
        for (const wallet of wallets) {
            await db.runAsync(
                `INSERT INTO wallets (id, name, avatar, type, icon, initial_amount, current_amount, is_active, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [wallet.id, wallet.name, wallet.avatar, wallet.type, wallet.icon, wallet.initial_amount, wallet.current_amount, wallet.is_active, wallet.created_at, wallet.updated_at]
            );
        }

        // 3. Insert Categories
        for (const category of categories) {
            await db.runAsync(
                `INSERT INTO categories (id, name, type, icon, color, is_active, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [category.id, category.name, category.type, category.icon, category.color, category.is_active, category.created_at, category.updated_at]
            );
        }

        // 4. Insert Transactions
        for (const transaction of transactions) {
            await db.runAsync(
                `INSERT INTO transactions (id, type, amount, wallet_id, to_wallet_id, category_id, date, note, attachment, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    transaction.id,
                    transaction.type,
                    transaction.amount,
                    transaction.wallet_id,
                    transaction.to_wallet_id,
                    transaction.category_id,
                    transaction.date,
                    transaction.note,
                    transaction.attachment,
                    transaction.created_at,
                    transaction.updated_at
                ]
            );
        }
    });
}
