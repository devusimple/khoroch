import { Wallet } from "@/types";
import { font } from "@/utils/constant";
import { useWalletStore } from "@/utils/store/wallet.store";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import {
    ArrowDownLeft,
    ArrowUpRight,
    Banknote,
    ChevronRight,
    CreditCard,
    Landmark,
    Plus,
    Wallet as WalletIcon
} from "lucide-react-native";
import { useEffect, useState, useMemo } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/theme/colors";
import { useModeToggle } from "@/hooks/useModeToggler";


export default function WalletIndex() {
    const { wallets, getWallets } = useWalletStore();
    const db = useSQLiteContext();
    const { isDark } = useModeToggle();
    const activeColors = isDark ? Colors.dark : Colors.light;
    const styles = useMemo(() => createStyles(activeColors, isDark), [activeColors, isDark]);

    const [totalIncomes, setTotalIncomes] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);

    const getIncomes = async () => {
        const incomes = await db.getAllAsync<{ total_income: number }>(
            'SELECT SUM(amount) as total_income FROM transactions WHERE type = "income"'
        );
        setTotalIncomes(incomes[0].total_income ?? 0);
    };

    const getExpenses = async () => {
        const expenses = await db.getAllAsync<{ total_expense: number }>(
            'SELECT SUM(amount) as total_expense FROM transactions WHERE type = "expense"'
        );
        setTotalExpenses(expenses[0].total_expense ?? 0);
    };

    useEffect(() => {
        getIncomes();
        getExpenses();
    }, [db]);

    useEffect(() => {
        getWallets(db);
    }, [db]);

    const renderWalletItem = ({ item }: { item: Wallet }) => {
        const Icon = getWalletIcon(item.type);
        const color = getWalletColor(item.type, activeColors);

        return (
            <Pressable
                style={({ pressed }) => [styles.walletCard, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
                onPress={() => router.push({ pathname: "/wallet/[id]", params: { id: item.id } })}
            >
                <View style={[styles.walletIconContainer, { backgroundColor: color + '15' }]}>
                    {item.avatar ? (
                        <Image source={{ uri: item.avatar }} style={styles.walletAvatar} />
                    ) : (
                        <Icon size={24} color={color} />
                    )}
                </View>
                <View style={styles.walletInfo}>
                    <Text style={styles.walletName}>{item.name}</Text>
                    <Text style={styles.walletUpdated}>
                        Last used {new Date(item.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                </View>
                <View style={styles.balanceInfo}>
                    <Text style={styles.walletBalanceText}>৳ {item.current_amount.toLocaleString()}</Text>
                    <ChevronRight size={18} color={activeColors.border} />
                </View>
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            {/* Net Worth Dashboard */}
            <View style={styles.dashboard}>
                <View style={styles.netWorthCard}>
                    <Text style={styles.netWorthLabel}>Estimated Net Worth</Text>
                    <Text style={styles.netWorthAmount}>৳ {(totalIncomes - totalExpenses).toLocaleString()}</Text>
                </View>

                <View style={styles.summaryRow}>
                    <View style={styles.miniSummaryCard}>
                        <View style={[styles.miniIconBox, { backgroundColor: activeColors.green + '20' }]}>
                            <ArrowDownLeft size={16} color={activeColors.green} />
                        </View>
                        <View>
                            <Text style={styles.miniLabel}>Total Income</Text>
                            <Text style={[styles.miniValue, { color: activeColors.green }]}>+ ৳ {totalIncomes.toLocaleString()}</Text>
                        </View>
                    </View>

                    <View style={styles.miniSummaryCard}>
                        <View style={[styles.miniIconBox, { backgroundColor: activeColors.red + '20' }]}>
                            <ArrowUpRight size={16} color={activeColors.red} />
                        </View>
                        <View>
                            <Text style={styles.miniLabel}>Total Expense</Text>
                            <Text style={[styles.miniValue, { color: activeColors.red }]}>- ৳ {totalExpenses.toLocaleString()}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Wallet List Section */}
            <View style={styles.listContainer}>
                <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>Portfolio</Text>
                    <Text style={styles.listSubtitle}>{wallets.length} accounts tracking</Text>
                </View>

                <FlatList
                    data={wallets}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderWalletItem}
                    contentContainerStyle={styles.listContent}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <WalletIcon size={48} color={activeColors.textMuted} />
                            <Text style={styles.emptyText}>No accounts added yet</Text>
                        </View>
                    }
                />
            </View>

            {/* Floating Action Button */}
            <Pressable
                style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.9 }] }]}
                onPress={() => router.navigate('/wallet/create')}
            >
                <Plus size={32} color={activeColors.primaryForeground} />
            </Pressable>
        </View>
    );
}

function getWalletIcon(type: string) {
    switch (type?.toLowerCase()) {
        case 'bank': return Landmark;
        case 'credit': return CreditCard;
        default: return Banknote;
    }
}

function getWalletColor(type: string, activeColors: any) {
    switch (type?.toLowerCase()) {
        case 'bank': return activeColors.blue;
        case 'credit': return activeColors.orange;
        default: return activeColors.purple;
    }
}

const createStyles = (activeColors: typeof Colors.light, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: activeColors.background,
    },
    dashboard: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 24,
        backgroundColor: activeColors.background,
    },
    netWorthCard: {
        backgroundColor: isDark ? activeColors.card : "#1C1C1E",
        borderRadius: 24,
        padding: 24,
        marginBottom: 16,
        elevation: 4,
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
    miniSummaryCard: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: activeColors.card,
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: activeColors.border,
    },
    miniIconBox: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
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
        paddingBottom: 100,
    },
    walletCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: activeColors.card,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: activeColors.border,
    },
    walletIconContainer: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    walletAvatar: {
        width: 52,
        height: 52,
        borderRadius: 16,
    },
    walletInfo: {
        flex: 1,
        marginLeft: 16,
    },
    walletName: {
        fontSize: 17,
        fontWeight: "bold",
        color: activeColors.text,
        fontFamily: font.HindSiliguri,
    },
    walletUpdated: {
        fontSize: 13,
        color: activeColors.textMuted,
        marginTop: 2,
        fontFamily: font.HindSiliguri,
    },
    balanceInfo: {
        alignItems: "center",
        flexDirection: "row",
        gap: 8,
    },
    walletBalanceText: {
        fontSize: 17,
        fontWeight: "700",
        color: activeColors.text,
        fontFamily: font.HindSiliguri,
    },
    separator: {
        height: 12,
    },
    fab: {
        position: "absolute",
        bottom: 30,
        right: 24,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: activeColors.primary,
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
        shadowColor: activeColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
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
    },
});