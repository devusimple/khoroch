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
import React, { useEffect, useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";

export default function Home() {
    const db = useSQLiteContext();
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
        if (!loadingMore) return <View style={{ height: 20 }} />;
        return (
            <View style={{ paddingVertical: 20 }}>
                {/* <ActivityIndicator size="small" color="#000" /> */}
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
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
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
                        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                        ListHeaderComponent={() => <View style={{ height: 10 }} />}
                        ListFooterComponent={renderFooter}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 48 }}>
                                <ListMinusIcon size={36} color={'#999'} strokeWidth={1} />
                                <Text style={{ fontFamily: font.HindSiliguri, color: '#999', fontSize: 14 }}>
                                    No Transactions Found
                                </Text>
                                <Text style={{ fontFamily: font.HindSiliguri, color: '#999', fontSize: 14 }}>
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
                            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
                        }
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                    />
            }
        </View>
    );
}
