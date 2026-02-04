import TransactionCard from "@/components/list-item";
import { Transaction, Wallet } from "@/types";
import { font } from "@/utils/constant";
import { useWalletStore } from "@/utils/store/wallet.store";
import { router, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { Trash2, TrendingUpIcon } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, ToastAndroid, View } from "react-native";

export default function WalletDetails() {
    const { id } = useLocalSearchParams()
    const db = useSQLiteContext();
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const { getWalletById } = useWalletStore()
    const [wallet, setWallet] = useState<Wallet | null>(null);

    const getWalletTransactions = async () => {
        const res = await db.getAllAsync<Transaction>(`
                SELECT * FROM transactions
                    WHERE wallet_id = ?
            `, id.toString())

        setTransactions([...transactions, ...res]);
    };

    const totalIncomes = useMemo(() => {
        const incomes = transactions.filter((t) => t.type === "income")
        return incomes.reduce((acc, transaction) => acc + (transaction.amount || 0), 0);
    }, [transactions]);

    const totalExpense = useMemo(() => {
        const incomes = transactions.filter((t) => t.type === "expense")
        return incomes.reduce((acc, transaction) => acc + (transaction.amount || 0), 0);
    }, [transactions]);

    useEffect(() => {
        getWalletTransactions();
        (async () => {
            const res = await getWalletById({ id: parseInt(id.toString()), db })
            setWallet(res);
        })()
    }, [id])
    return (
        <View style={styles.container}>
            {/* Summary Header */}
            <View style={styles.header}>
                <View style={[styles.summaryCard, { flexDirection: 'row', justifyContent: 'space-between' }]}>
                    <View style={{}}>
                        <View style={styles.summaryIconText}>
                            <TrendingUpIcon size={24} color="rgba(255,255,255,0.8)" />
                            <Text style={styles.summaryLabel}>Total Net Worth</Text>
                        </View>
                        <Text style={styles.totalAmount}>৳{(totalIncomes - totalExpense).toString()}</Text>
                    </View>
                    <View style={{ justifyContent: 'space-between' }}>
                        <View style={{ backgroundColor: "#db0000ff", padding: 6, borderRadius: 8 }}>
                            <Text style={{ fontSize: 16, fontFamily: font.HindSiliguri, color: "#fff" }}>৳{(totalExpense).toString()}</Text>
                        </View>
                        <View style={{ backgroundColor: "#00990dff", padding: 6, borderRadius: 8 }}>
                            <Text style={{ fontSize: 16, fontFamily: font.HindSiliguri, color: '#fff' }}>৳{(totalIncomes).toString()}</Text>
                        </View>
                    </View>
                </View>

            </View>

            <View style={styles.listContainer}>
                <View style={styles.listHeader}>
                    <View>
                        <Text style={styles.listTitle}>{wallet?.name}</Text>
                        <Text style={styles.listSubtitle}>Total {transactions.length} transactions make this wallet</Text>
                    </View>
                    <Pressable style={{ padding: 6 }} onPress={() => {
                        Alert.alert("Are you sure?", "This action will permanently delete the wallet and  wallet transactions", [
                            {
                                text: "Continue", isPreferred: false, style: "destructive", onPress: async () => {
                                    const ress = await db.runAsync(`DELETE FROM wallets WHERE id = ?`, wallet?.id!);
                                    if (ress.changes > 0) {
                                        ToastAndroid.show('Wallet deleted!', ToastAndroid.SHORT)
                                    }
                                    // for (let index = 0; index < transactions.length; index++) {
                                    const res = await db.runAsync(`DELETE FROM transactions WHERE wallet_id = ? `, wallet?.id!);
                                    if (res.changes > 0) {
                                        ToastAndroid.show('Transactions deleted!', ToastAndroid.SHORT)
                                    }
                                    router.navigate("/")

                                    // }

                                }
                            },
                            { text: "Cancel", isPreferred: true, style: 'cancel' }
                        ], { cancelable: true })
                    }}>
                        <Trash2 color={"#f13434ff"} size={18} />
                    </Pressable>
                </View>
                <FlatList
                    showsVerticalScrollIndicator={false}
                    data={transactions}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => <TransactionCard item={item} />}
                    ListEmptyComponent={
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
                            <Text>No transaction to the wallet</Text>
                        </View>}
                />
            </View>
        </View>
    )

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FA",
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    summaryCard: {
        backgroundColor: "#2D3436", // Sleek dark aesthetic
        borderRadius: 24,
        padding: 24,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    summaryIconText: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    summaryLabel: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 14,
        fontFamily: font.HindSiliguri,
        letterSpacing: 0.5,
    },
    totalAmount: {
        color: "#fff",
        fontSize: 32,
        fontWeight: "bold",
        fontFamily: font.HindSiliguri,
    },
    listContainer: {
        flex: 1,
        backgroundColor: "#fff",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingTop: 24,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    listHeader: {
        marginBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    listTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#2D3436",
        fontFamily: font.HindSiliguri,
    },
    listSubtitle: {
        fontSize: 14,
        color: "#999",
        fontFamily: font.HindSiliguri,
    },
})