import { SQLiteDatabase } from "expo-sqlite";

const walletseed = async (db: SQLiteDatabase) => {
    // add 100 wallets
    for (let i = 0; i < 100; i++) {
        const name = `Wallet ${i}`;
        const type = i % 2 === 0 ? 'cash' : 'bank';
        const icon = i % 2 === 0 ? '💰' : '🏦';
        const color = i % 2 === 0 ? '#000000' : '#000000';
        await db.runAsync(`
            INSERT INTO wallets (name, type, initial_amount, current_amount, icon, color, is_active, created_at, updated_at)
            VALUES ('${name}', '${type}', 0, 0, '${icon}', '${color}', 1, strftime('%s','now'), strftime('%s','now'))
        `)
    }
    console.log('100 wallets added')
}

const categoryseed = async (db: SQLiteDatabase) => {
    // add 100 categories
    for (let i = 0; i < 100; i++) {
        const name = `Category ${i}`;
        const type = i % 2 === 0 ? 'expense' : 'income';
        const icon = i % 2 === 0 ? '🍔' : '💰';
        const color = i % 2 === 0 ? '#000000' : '#000000';
        await db.runAsync(`
            INSERT INTO categories (name, type, icon, color, is_active, created_at, updated_at)
            VALUES ('${name}', '${type}', '${icon}', '${color}', 1, strftime('%s','now'), strftime('%s','now'))
        `)
    }
    console.log('100 categories added')
}

const transactionseed = async (db: SQLiteDatabase) => {
    // add 100 transactions
    for (let i = 0; i < 100; i++) {
        const amount = Math.floor(Math.random() * 1000) + 1;
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).getTime() / 1000;
        const type = i % 2 === 0 ? 'expense' : 'income';
        const note = i % 2 === 0 ? 'Food' : 'Salary';
        const wallet_id = i % 2 === 0 ? 1 : 2;
        const category_id = i % 2 === 0 ? 1 : 2;
        await db.runAsync(`
            INSERT INTO transactions (type, amount, wallet_id, category_id, date, note, attachment, created_at, updated_at)
            VALUES ('${type}', ${amount}, ${wallet_id}, ${category_id}, ${date}, '${note}', '', ${date}, ${date})
        `)
    }
    console.log('100 transactions added')
}

export { walletseed, categoryseed, transactionseed }