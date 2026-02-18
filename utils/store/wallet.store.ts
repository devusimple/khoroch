import { Wallet } from "@/types";
import { SQLiteDatabase } from "expo-sqlite";
import { create } from "zustand";
import AsyncStorage from 'expo-sqlite/kv-store'

export interface WalletStore {
    wallets: Wallet[];
    defaultWallet: number;
    setDefaultWallet: (id: number) => Promise<void>;
    getWallets: (db: SQLiteDatabase) => Promise<void>;
    addWallet: (params: { name: string, avatar?: string, type?: string, icon?: string, initial_amount?: number, db: SQLiteDatabase }) => Promise<void>;
    deleteWallet: (params: { id: number, db: SQLiteDatabase }) => Promise<void>;
    updateWallet: (params: { id: number, name: string, type?: string, icon?: string, initial_amount?: number, db: SQLiteDatabase }) => Promise<void>;
    getWalletById: (params: { id: number, db: SQLiteDatabase }) => Promise<Wallet | null>;
}

export const useWalletStore = create<WalletStore>((set) => ({
    wallets: [],
    defaultWallet: 1,
    setDefaultWallet: async (id) => {
        await AsyncStorage.setItemAsync("default-wallet-id", id.toString());
        set({ defaultWallet: id });
    },
    getWallets: async (db) => {
        const res = await db.getAllAsync<Wallet>("SELECT * FROM wallets")
        set({ wallets: res })
    },
    addWallet: async ({ name, avatar, type = 'Cash', icon, initial_amount = 0, db }) => {
        const res = await db.runAsync(
            "INSERT INTO wallets (name, avatar, type, icon, initial_amount, current_amount) VALUES (?, ?, ?, ?, ?, ?)",
            name, avatar ?? null, type, icon ?? null, initial_amount, initial_amount
        )
        if (res.changes === 0) {
            throw new Error("Failed to add wallet")
        }
    },
    deleteWallet: async ({ id, db }) => {
        const res = await db.runAsync(
            "DELETE FROM wallets WHERE id = ?",
            id
        )
        set((state) => ({
            wallets: state.wallets.filter((wallet) => wallet.id !== id),
        }))
    },
    updateWallet: async ({ id, name, type, icon, initial_amount, db }) => {
        await db.runAsync(
            "UPDATE wallets SET name = ?, type = ?, icon = ?, initial_amount = ? WHERE id = ?",
            name, type ?? 'Cash', icon ?? null, initial_amount ?? 0, id
        )
        const updatedWallet = await db.getFirstAsync<Wallet>("SELECT * FROM wallets WHERE id = ?", id)
        if (updatedWallet) {
            set((state) => ({
                wallets: state.wallets.map((wallet) => wallet.id === id ? updatedWallet : wallet),
            }))
        }
    },
    getWalletById: async ({ id, db }) => {
        const res = await db.getFirstAsync<Wallet>("SELECT * FROM wallets WHERE id = ?", id)
        return res || null
    }
}))
