import TransactionCard from "@/components/list-item";
import { Transaction, Wallet } from "@/types";
import { font } from "@/utils/constant";
import { useWalletStore } from "@/utils/store/wallet.store";
import { router, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import {
    ArrowDownLeft,
    ArrowUpRight,
    Edit2,
    Trash2,
    WalletIcon,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    ToastAndroid,
    View,
    Platform
} from "react-native";
import { Colors } from "@/theme/colors";
import { useModeToggle } from "@/hooks/useModeToggler";

export default function WalletDetails() {
    const { id } = useLocalSearchParams();
    const db = useSQLiteContext();
    const { isDark } = useModeToggle();
    const activeColors = isDark ? Colors.dark : Colors.light;
    const styles = useMemo(() => createStyles(activeColors, isDark), [activeColors, isDark]);

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const { getWalletById } = useWalletStore();
    const [wallet, setWallet] = useState<Wallet | null>(null);

    const getWalletTransactions = async () => {
        const res = await db.getAllAsync<Transaction>(`
            SELECT * FROM transactions
            WHERE wallet_id = ?
            ORDER BY date DESC
        `, id.toString());
        setTransactions(res);
    };

    const totals = useMemo(() => {
        return transactions.reduce((acc, t) => {
            if (t.type === "income") acc.income += t.amount;
            if (t.type === "expense") acc.expense += t.amount;
            return acc;
        }, { income: 0, expense: 0 });
    }, [transactions]);

    useEffect(() => {
        getWalletTransactions();
        (async () => {
            const res = await getWalletById({ id: parseInt(id.toString()), db });
            setWallet(res);
        })();
    }, [id]);

    const handleDelete = () => {
        Alert.alert(
            "Delete Wallet",
            "This will permanently remove the wallet and all its transaction history. This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await db.runAsync(`DELETE FROM wallets WHERE id = ?`, id.toString());
                            await db.runAsync(`DELETE FROM transactions WHERE wallet_id = ?`, id.toString());
                            if (Platform.OS === 'android') {
                                ToastAndroid.show('Wallet deleted successfully', ToastAndroid.SHORT);
                            }
                            router.replace('/wallet');
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Dashboard Area */}
            <View style={styles.dashboard}>
                <View style={styles.walletHeader}>
                    <View style={styles.walletHeaderLeft}>
                        <Text style={styles.walletTypeLabel}>{wallet?.type || 'Account'}</Text>
                        <Text style={styles.walletName}>{wallet?.name}</Text>
                    </View>
                    <View style={styles.actionGroup}>
                        <Pressable
                            style={styles.iconBtn}
                            onPress={() => router.push({ pathname: '/wallet/update', params: { id } })}
                        >
                            <Edit2 size={20} color={activeColors.blue} />
                        </Pressable>
                        <Pressable style={[styles.iconBtn, { marginLeft: 12 }]} onPress={handleDelete}>
                            <Trash2 size={20} color={activeColors.red} />
                        </Pressable>
                    </View>
                </View>

                <View style={styles.netWorthCard}>
                    <Text style={styles.netWorthLabel}>Current Balance</Text>
                    <Text style={styles.netWorthAmount}>৳ {wallet?.current_amount.toLocaleString()}</Text>
                </View>

                <View style={styles.summaryRow}>
                    <View style={styles.summaryMiniCard}>
                        <ArrowDownLeft size={16} color={activeColors.green} />
                        <View style={styles.summaryMiniText}>
                            <Text style={styles.miniLabel}>Total In</Text>
                            <Text style={[styles.miniValue, { color: activeColors.green }]}>৳ {totals.income.toLocaleString()}</Text>
                        </View>
                    </View>
                    <View style={styles.summaryMiniCard}>
                        <ArrowUpRight size={16} color={activeColors.red} />
                        <View style={styles.summaryMiniText}>
                            <Text style={styles.miniLabel}>Total Out</Text>
                            <Text style={[styles.miniValue, { color: activeColors.red }]}>৳ {totals.expense.toLocaleString()}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* List Container */}
            <View style={styles.listContainer}>
                <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>Recent Activity</Text>
                    <Text style={styles.listSubtitle}>{transactions.length} entries</Text>
                </View>

                <FlatList
                    showsVerticalScrollIndicator={false}
                    data={transactions}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => <TransactionCard item={item} />}
                    contentContainerStyle={styles.listContent}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <WalletIcon size={48} color={activeColors.textMuted} />
                            <Text style={styles.emptyText}>No activity recorded for this wallet</Text>
                        </View>
                    }
                />
            </View>
        </View>
    );
}

const createStyles = (activeColors: typeof Colors.light, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: activeColors.background,
    },
    dashboard: {
        paddingHorizontal: 20,
        paddingBottom: 24,
        backgroundColor: activeColors.background,
    },
    actionGroup: {
        flexDirection: "row",
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: activeColors.card,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: activeColors.border,
    },
    walletHeader: {
        marginBottom: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    walletHeaderLeft: {
        flexDirection: "column",
    },
    walletTypeLabel: {
        fontSize: 12,
        fontWeight: "bold",
        color: activeColors.blue,
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 4,
    },
    walletName: {
        fontSize: 28,
        fontWeight: "bold",
        color: activeColors.text,
        fontFamily: font.HindSiliguri,
    },
    netWorthCard: {
        backgroundColor: isDark ? activeColors.card : "#1C1C1E",
        borderRadius: 24,
        padding: 24,
        marginBottom: 16,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        borderWidth: isDark ? 1 : 0,
        borderColor: activeColors.border,
    },
    netWorthLabel: {
        fontSize: 14,
        color: isDark ? activeColors.textMuted : "#8E8E93",
        fontWeight: "600",
        letterSpacing: 0.5,
        textTransform: "uppercase",
        marginBottom: 8,
    },
    netWorthAmount: {
        fontSize: 34,
        color: "#FFFFFF",
        fontWeight: "bold",
        fontFamily: font.HindSiliguri,
    },
    summaryRow: {
        flexDirection: "row",
        gap: 12,
    },
    summaryMiniCard: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: activeColors.card,
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: activeColors.border,
    },
    summaryMiniText: {
        marginLeft: 10,
    },
    miniLabel: {
        fontSize: 10,
        color: activeColors.textMuted,
        fontWeight: "bold",
        textTransform: "uppercase",
    },
    miniValue: {
        fontSize: 14,
        fontWeight: "700",
        fontFamily: font.HindSiliguri,
    },
    listContainer: {
        flex: 1,
        backgroundColor: isDark ? activeColors.background : activeColors.card,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingTop: 24,
        paddingHorizontal: 20,
        borderTopWidth: isDark ? 1 : 0,
        borderColor: activeColors.border,
    },
    listHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    listTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: activeColors.text,
        fontFamily: font.HindSiliguri,
    },
    listSubtitle: {
        fontSize: 13,
        color: activeColors.textMuted,
        fontFamily: font.HindSiliguri,
        marginBottom: 2,
    },
    listContent: {
        paddingBottom: 40,
    },
    separator: {
        height: 12,
    },
    emptyContainer: {
        paddingTop: 60,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
        color: activeColors.textMuted,
        fontFamily: font.HindSiliguri,
        textAlign: "center",
    },
});