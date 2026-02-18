import { SQLiteDatabase } from "expo-sqlite";

const walletseed = async (db: SQLiteDatabase) => {
    // add 10 wallets (100 is a bit much for a default seed)
    for (let i = 0; i < 10; i++) {
        const name = `Wallet ${i}`;
        const type = i % 2 === 0 ? 'Cash' : 'Bank';
        const icon = i % 2 === 0 ? '💰' : '🏦';
        await db.runAsync(
            "INSERT INTO wallets (name, type, icon, initial_amount, current_amount, is_active) VALUES (?, ?, ?, ?, ?, ?)",
            name, type, icon, 0, 0, 1
        )
    }
    console.log('10 wallets added')
}

const categoryseed = async (db: SQLiteDatabase) => {
    // add 10 categories
    for (let i = 0; i < 10; i++) {
        const name = `Category ${i}`;
        const type = i % 2 === 0 ? 'expense' : 'income';
        const icon = i % 2 === 0 ? '🍔' : '💰';
        const color = i % 2 === 0 ? '#000000' : '#000000';
        await db.runAsync(
            "INSERT INTO categories (name, type, icon, color, is_active) VALUES (?, ?, ?, ?, ?)",
            name, type, icon, color, 1
        )
    }
    console.log('10 categories added')
}

const transactionseed = async (db: SQLiteDatabase) => {
    // add 50 transactions
    for (let i = 0; i < 50; i++) {
        const amount = Math.floor(Math.random() * 1000) + 1;
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).getTime() / 1000;
        const type = i % 2 === 0 ? 'expense' : 'income';
        const note = i % 2 === 0 ? 'Food' : 'Salary';
        const wallet_id = i % 2 === 0 ? 1 : 2;
        const category_id = i % 2 === 0 ? 1 : 2;
        await db.runAsync(
            "INSERT INTO transactions (type, amount, wallet_id, category_id, date, note, attachment) VALUES (?, ?, ?, ?, ?, ?, ?)",
            type, amount, wallet_id, category_id, date, note, ''
        )
    }
    console.log('50 transactions added')
}

export { walletseed, categoryseed, transactionseed }