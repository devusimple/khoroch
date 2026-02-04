import { create } from "zustand";
import { SQLiteDatabase } from "expo-sqlite";
import { useMonthYearStore } from "./store";

export interface Balance {
    summary: {
        income: number;
        expense: number;
        balance: number;
    },
    getSummary: (db: SQLiteDatabase) => Promise<void>,
}

export const useBalanceStore = create<Balance>()((set) => {
    return {
        summary: {
            income: 0,
            expense: 0,
            balance: 0,
        },
        getSummary: async (db) => {
            const { date: monthDate } = useMonthYearStore.getState()
            const unixDate = monthDate.getTime() / 1000
            const nextMonthUnixDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getTime() / 1000

            const result = await db.getAllAsync<{ income: number, expense: number }>(`
                SELECT 
                    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
                FROM transactions
                WHERE date >= ? AND date < ?
            `, [unixDate, nextMonthUnixDate])
            set({
                summary: {
                    income: result[0].income,
                    expense: result[0].expense,
                    balance: result[0].income - result[0].expense,
                }
            })
        }

    }
})