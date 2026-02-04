import { Wallet } from "@/types";
import { font } from "@/utils/constant";
import { useWalletStore } from "@/utils/store/wallet.store";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { Banknote, ChevronRight, CreditCard, Landmark, Megaphone, Plus, TrendingUp, Wallet as WalletIcon } from "lucide-react-native";
import { useEffect, useMemo } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";


export default function WalletIndex() {
    const { wallets, getWallets } = useWalletStore();
    const db = useSQLiteContext();

    useEffect(() => {
        getWallets(db);
    }, [db]);

    const totalBalance = useMemo(() => {
        return wallets.reduce((acc, wallet) => acc + (wallet.id || 0), 0);
    }, [wallets]);

    const renderWalletItem = ({ item }: { item: Wallet }) => {
        return (
            <Pressable style={styles.walletCard} onPress={() => { router.push({ pathname: "/wallet/[id]", params: { id: item.id } }) }}>
                <View style={styles.walletIconContainer}>
                    {item.avatar
                        ?
                        <Image source={{ uri: item.avatar! }} style={{ width: 32, height: 32, borderRadius: 14 }} />
                        :
                        <Megaphone size={24} color="#333" strokeWidth={1.5} />
                    }
                </View>
                <View style={styles.walletInfo}>
                    <Text style={styles.walletName}>{item.name}</Text>
                    <Text style={styles.walletType}>{new Date(item.created_at).toLocaleString("en", { month: "long", day: "2-digit", year: 'numeric', hour12: true, hour: 'numeric', minute: 'numeric' })}</Text>
                </View>
                <View style={styles.balanceInfo}>
                    <Text style={[styles.walletBalance, { color: item.id >= 0 ? "#00C853" : "#FF4B4B" }]}>
                        ৳{item.id}
                    </Text>
                    <ChevronRight size={18} color="#CCC" />
                </View>
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            {/* Summary Header */}
            <View style={styles.header}>
                <View style={styles.summaryCard}>
                    <View style={styles.summaryIconText}>
                        <TrendingUp size={24} color="rgba(255,255,255,0.8)" />
                        <Text style={styles.summaryLabel}>Total Net Worth</Text>
                    </View>
                    <Text style={styles.totalAmount}>৳{totalBalance.toLocaleString()}</Text>
                </View>
            </View>

            {/* Wallet List Section */}
            <View style={styles.listContainer}>
                <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>Your Wallets</Text>
                    <Text style={styles.listSubtitle}>{wallets.length} active wallets</Text>
                </View>

                <FlatList
                    data={wallets}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderWalletItem}
                    contentContainerStyle={styles.listContent}
                    ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={10}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <WalletIcon size={48} color="#DDD" />
                            <Text style={styles.emptyText}>No wallets found</Text>
                        </View>
                    }
                />
            </View>

            {/* Floating Action Button */}
            <Pressable style={styles.fab} onPress={() => router.navigate('/wallet/create')}>
                <Plus size={28} color="#fff" />
            </Pressable>
        </View>
    );
}


function getWalletIcon(type: string) {
    if (type === 'bank') return Landmark;
    if (type === 'credit') return CreditCard;
    return Banknote;
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
        paddingHorizontal: 20,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    listHeader: {
        marginBottom: 20,
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
    listContent: {
        paddingBottom: 100,
    },
    walletCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8F9FA",
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#EDF2F7",
    },
    walletIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    walletInfo: {
        flex: 1,
        marginLeft: 16,
    },
    walletName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2D3436",
        fontFamily: font.HindSiliguri,
    },
    walletType: {
        fontSize: 12,
        color: "#636E72",
        marginTop: 2,
        fontFamily: font.HindSiliguri,
    },
    balanceInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    walletBalance: {
        fontSize: 16,
        fontWeight: "bold",
        fontFamily: font.HindSiliguri,
    },
    fab: {
        position: "absolute",
        bottom: 30,
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#2D3436",
        justifyContent: "center",
        alignItems: "center",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 60,
        gap: 12,
    },
    emptyText: {
        fontSize: 16,
        color: "#CCC",
        fontFamily: font.HindSiliguri,
    },
});