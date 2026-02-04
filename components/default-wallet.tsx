import { Dropdown, DropdownItem } from "./dropdown";
import { useEffect, useState } from "react";
import { Wallet } from "@/types";
import { useSQLiteContext } from "expo-sqlite";
import AsyncStorage from 'expo-sqlite/kv-store';

export default function DefaultWalletSelector() {
    const [wallets, setWallets] = useState<DropdownItem<string>[]>([]);
    const [wallet, setWallet] = useState('1')
    const db = useSQLiteContext();

    const getWallets = async () => {
        try {
            const result = await db.getAllAsync<Wallet>("SELECT * FROM wallets");
            let wall: DropdownItem<string>[] = []
            result.forEach(w => {
                wall.push({ label: w.name, value: w.id.toString() })
            })
            setWallets(wall)
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getWallets();
        (async () => {
            const res = await AsyncStorage.getItemAsync('default-wallet-id');
            if (!res) {
                setWallet('1');
            } else {
                setWallet(res!);
            }
        })()
    }, [wallet]);
    return (
        <Dropdown data={wallets} label="Default Wallet" value={wallet} searchable placeholder="Choose a default wallet" onChange={async (v) => {
            await AsyncStorage.setItemAsync("default-wallet-id", v);
            setWallet(v);
        }} />
    )
}
