import BalanceCard from "@/components/balance-card";
import Filter from "@/components/filter";
import Header from "@/components/header";
import TransactionCard from "@/components/list-item";
import SuspenseFallback from "@/components/suspense";
import { font } from "@/utils/constant";
import { useFilterTabStore, useMonthYearStore } from "@/utils/store/store";
import { useTransactionStore } from "@/utils/store/transaction.store";
import { useSQLiteContext } from "expo-sqlite";
import { ListMinusIcon } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useModeToggle } from "@/hooks/useModeToggler";
import { Colors } from "@/theme/colors";

export default function Home() {
    const db = useSQLiteContext();
    const { isDark } = useModeToggle();
    const activeColors = isDark ? Colors.dark : Colors.light;
    const styles = useMemo(() => createStyles(activeColors, isDark), [activeColors, isDark]);

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const { tabs } = useFilterTabStore();
    const { date } = useMonthYearStore()
    const { getTransactions, transactions, loading, loadingMore, hasMore } = useTransactionStore()

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await getTransactions({ date, db, type: tabs, page: 1, limit })
        setPage(1);
        setIsRefreshing(false);
    };

    const handleLoadMore = () => {
        if (!loading && !loadingMore && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    const renderFooter = () => {
        if (!loadingMore) return <View style={styles.footerSpacer} />;
        return (
            <View style={styles.footerLoader}>
                <SuspenseFallback iconSize={18} textSize={14} />
            </View>
        );
    };

    // Reset pagination when filter or date changes
    useEffect(() => {
        getTransactions({ date, db, type: tabs, page: 1, limit })
        setPage(1);
    }, [date, tabs])

    // Load more when page changes (only for page > 1)
    useEffect(() => {
        if (page > 1) {
            getTransactions({ date, db, type: tabs, page, limit })
        }
    }, [page])

    return (
        <View style={styles.container}>
            <Header />
            <BalanceCard />
            <Filter />

            {
                loading ?
                    <SuspenseFallback />
                    :
                    <FlatList
                        data={transactions}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => <TransactionCard item={item} />}
                        // Layout & Spacing
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        ListHeaderComponent={() => <View style={styles.separator} />}
                        ListFooterComponent={renderFooter}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <ListMinusIcon size={36} color={activeColors.textMuted} strokeWidth={1} />
                                <Text style={styles.emptyText}>
                                    No Transactions Found
                                </Text>
                                <Text style={styles.emptyTextMuted}>
                                    Add your first transaction to get started
                                </Text>
                            </View>
                        }

                        // Performance Optimization
                        initialNumToRender={10}
                        maxToRenderPerBatch={10}
                        windowSize={5}
                        removeClippedSubviews={true}

                        // Refresh & Infinite Scroll
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefreshing}
                                onRefresh={handleRefresh}
                                tintColor={activeColors.primary}
                                colors={[activeColors.primary]}
                            />
                        }
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                    />
            }
        </View>
    );
}

const createStyles = (activeColors: typeof Colors.light, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: activeColors.background,
    },
    separator: {
        height: 10,
    },
    footerSpacer: {
        height: 20,
    },
    footerLoader: {
        paddingVertical: 20,
    },
    listContent: {
        paddingBottom: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 48,
    },
    emptyText: {
        fontFamily: font.HindSiliguri,
        color: activeColors.textMuted,
        fontSize: 14,
        marginTop: 8,
    },
    emptyTextMuted: {
        fontFamily: font.HindSiliguri,
        color: activeColors.textMuted,
        fontSize: 14,
    },
});
