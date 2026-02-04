import { Wallet } from "@/types";
import { SQLiteDatabase } from "expo-sqlite";
import { create } from "zustand";
import AsyncStorage from 'expo-sqlite/kv-store'

export interface WalletStore {
    wallets: Wallet[];
    defaultWallet: number;
    setDefaultWallet: (id: number) => Promise<void>;
    getWallets: (db: SQLiteDatabase) => Promise<void>;
    addWallet: ({ name, avatar, db }: { name: string, avatar?: string, db: SQLiteDatabase }) => Promise<void>;
    deleteWallet: ({ id, db }: { id: number, db: SQLiteDatabase }) => Promise<void>;
    updateWallet: ({ id, name, type, icon, initial_amount, db }: { id: number, name: string, type: string, icon?: string, initial_amount: number, db: SQLiteDatabase }) => Promise<void>;
    getWalletById: ({ id, db }: { id: number, db: SQLiteDatabase }) => Promise<Wallet | null>;
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
    addWallet: async ({ name, avatar, db }) => {
        const res = await db.runAsync(
            "INSERT INTO wallets (name, avatar) VALUES (?, ?)",
            name, avatar ?? null
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
        const res = await db.runAsync(
            "UPDATE wallets SET name = ?, type = ?, icon = ?, initial_amount = ? WHERE id = ?",
            name, type, icon ?? null, initial_amount, id
        )
        set((state) => ({
            wallets: state.wallets.map((wallet) => wallet.id === id ? { ...wallet, name, type, icon, initial_amount } : wallet),
        }))
    },
    getWalletById: async ({ id, db }) => {
        const res = await db.getFirstAsync<Wallet>("SELECT * FROM wallets WHERE id = ?", id)
        return res || null
    }
}))