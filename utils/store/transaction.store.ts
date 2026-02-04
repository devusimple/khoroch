import { Transaction } from "@/types";
import { SQLiteDatabase } from "expo-sqlite";
import { create } from "zustand";
import { useBalanceStore } from "./balance.store";


export interface TransactionParams {
    date: Date;
    db: SQLiteDatabase;
    page?: number;
    limit?: number;
    wallet_id?: number;
    category_id?: number;
    type?: "income" | "expense" | "all";
    search?: string;
}

export interface TransactionStore {
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    transactions: Transaction[];
    getTransactions: (params: TransactionParams) => Promise<void>;
    getTransaction: (params: { id: number, db: SQLiteDatabase }) => Promise<Transaction | null>;
    addTransaction: ({ amount, note, type, wallet_id, date, attachment, db }: { amount: number, note: string, type: string, wallet_id: number, date: Date, attachment: string | null, db: SQLiteDatabase }) => Promise<void>;
    updateTransaction: (params: Partial<Transaction> & { db: SQLiteDatabase, id: number }) => Promise<void>;
    deleteTransaction: (params: { id: number, db: SQLiteDatabase }) => Promise<void>;
}



export const useTransactionStore = create<TransactionStore>()((set) => ({
    loading: false,
    loadingMore: false,
    hasMore: true,
    transactions: [],
    getTransactions: async ({ date, db, page = 1, limit = 10, wallet_id, category_id, type, search }) => {
        if (page === 1) {
            set({ loading: true });
        } else {
            set({ loadingMore: true });
        }

        const unixStartDate = new Date(date.getFullYear(), date.getMonth(), 1).getTime() / 1000;
        const unixEndDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).getTime() / 1000;

        const result = await db.getAllAsync<Transaction>(`
            SELECT * FROM transactions
            WHERE date >= ? AND date < ?
            ${wallet_id ? `AND wallet_id = ${wallet_id}` : ''}
            ${category_id ? `AND category_id = ${category_id}` : ''}
            ${type ? type === 'all' ? '' : `AND type = '${type}'` : ''}
            ${search ? `AND note LIKE '%${search}%'` : ''}
            ORDER BY date DESC
            LIMIT ? OFFSET ?
        `,
            unixStartDate,
            unixEndDate,
            limit,
            (page - 1) * limit
        )

        set((state) => ({
            transactions: page === 1 ? result : [...state.transactions, ...result],
            loading: false,
            loadingMore: false,
            hasMore: result.length === limit
        }))
    },
    getTransaction: async ({ id, db }) => {
        const transaction = await db.getFirstAsync<Transaction>(
            "SELECT * FROM transactions WHERE id = ?",
            id
        )
        return transaction
    },
    addTransaction: async ({ amount, note, type, wallet_id, date, attachment, db }) => {
        const { getSummary } = useBalanceStore.getState()
        const res = await db.runAsync(
            "INSERT INTO transactions (amount, note, type, wallet_id, date, attachment) VALUES (?, ?, ?, ?, ?, ?)",
            amount, note, type.toLowerCase(), wallet_id, date.getTime() / 1000, attachment
        )

        const transaction = await db.getFirstAsync<Transaction>(
            "SELECT * FROM transactions WHERE id = ?",
            res.lastInsertRowId
        )
        set((state) => ({
            transactions: [transaction!, ...state.transactions],
        }))
        getSummary(db)
    },
    updateTransaction: async ({ id, amount, note, type, wallet_id, date, attachment, db }) => {
        const { getSummary } = useBalanceStore.getState()
        await db.runAsync(
            "UPDATE transactions SET amount = ?, note = ?, type = ?, wallet_id = ?, date = ?, attachment = ? WHERE id = ?",
            amount!, note!, type!.toLowerCase(), wallet_id!, date!, attachment ?? null, id
        )

        const transaction = await db.getFirstAsync<Transaction>(
            "SELECT * FROM transactions WHERE id = ?",
            id
        )
        set((state) => ({
            transactions: state.transactions.map((t) => t.id === id ? transaction! : t),
        }))
        getSummary(db)
    },
    deleteTransaction: async ({ id, db }) => {
        const { getSummary } = useBalanceStore.getState()
        await db.runAsync(
            "DELETE FROM transactions WHERE id = ?",
            id
        )
        set((state) => ({
            transactions: state.transactions.filter((t) => t.id !== id),
        }))
        getSummary(db)
    }
}));