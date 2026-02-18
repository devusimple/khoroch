import { AreaChart } from "@/components/charts/area-chart";
import { RadialBarChart } from "@/components/charts/radial-bar-chart";
import { BarChart } from "@/components/charts/bar-chart";
import SuspenseFallback from "@/components/suspense";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState, useMemo } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, Platform } from "react-native";
import { useModeToggle } from "@/hooks/useModeToggler";
import { Colors } from "@/theme/colors";
import { font } from "@/utils/constant";
import { useMonthYearStore } from "@/utils/store/store";
import { ArrowDownRight, ArrowUpRight, PieChart as PieIcon, TrendingUp, Wallet as WalletIcon, ChevronLeft, ChevronRight } from "lucide-react-native";

interface SummaryData {
    total_income: number;
    total_expense: number;
}

interface CategoryData {
    label: string;
    value: number;
    color: string;
}

interface TrendData {
    month: string;
    income: number;
    expense: number;
}

export default function Analysis() {
    const db = useSQLiteContext();
    const { isDark } = useModeToggle();
    const activeColors = isDark ? Colors.dark : Colors.light;
    const styles = useMemo(() => createStyles(activeColors, isDark), [activeColors, isDark]);

    const { date, setDate } = useMonthYearStore();
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<SummaryData>({ total_income: 0, total_expense: 0 });
    const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
    const [trendData, setTrendData] = useState<TrendData[]>([]);

    const fetchData = async (targetDate: Date) => {
        try {
            setLoading(true);

            // 1. Fetch Monthly Summary
            const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
            const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);
            const startTimestamp = Math.floor(startOfMonth.getTime() / 1000);
            const endTimestamp = Math.floor(endOfMonth.getTime() / 1000);

            const summaryResult = await db.getFirstAsync<{ total_income: number | null; total_expense: number | null }>(`
                SELECT 
                    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
                    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
                FROM transactions
                WHERE date >= ? AND date <= ?
            `, startTimestamp, endTimestamp);

            setSummary({
                total_income: summaryResult?.total_income ?? 0,
                total_expense: summaryResult?.total_expense ?? 0
            });

            // 2. Fetch Category Breakdown (Expenses)
            const categoryResult = await db.getAllAsync<{ name: string; total: number; color: string }>(`
                SELECT c.name, SUM(t.amount) as total, c.color
                FROM transactions t
                JOIN categories c ON t.category_id = c.id
                WHERE t.type = 'expense' AND t.date >= ? AND t.date <= ?
                GROUP BY c.id
                ORDER BY total DESC
            `, startTimestamp, endTimestamp);

            setCategoryData(categoryResult.map(c => ({
                label: c.name,
                value: c.total,
                color: c.color || activeColors.primary
            })));

            // 3. Fetch Monthly Trends (Income & Expenses - Last 6 Months)
            const sixMonthsAgo = new Date(targetDate.getFullYear(), targetDate.getMonth() - 5, 1);
            const trendStartTimestamp = Math.floor(sixMonthsAgo.getTime() / 1000);

            const trendResult = await db.getAllAsync<{ month_idx: string; income: number; expense: number }>(`
                SELECT 
                    strftime('%m', date, 'unixepoch') as month_idx,
                    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
                FROM transactions
                WHERE date >= ? AND date <= ?
                GROUP BY month_idx
                ORDER BY date ASC
            `, trendStartTimestamp, endTimestamp);

            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            setTrendData(trendResult.map(t => ({
                month: monthNames[Number(t.month_idx) - 1] || 'N/A',
                income: t.income,
                expense: t.expense
            })));

        } catch (error) {
            console.error("Error fetching analysis data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(date);
    }, [date]);

    const changeMonth = (offset: number) => {
        const newDate = new Date(date);
        newDate.setMonth(newDate.getMonth() + offset);
        setDate(newDate);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <SuspenseFallback iconSize={32} textSize={16} />
            </View>
        );
    }

    const netSavings = summary.total_income - summary.total_expense;

    // Prepare AreaChart Datasets
    const areaChartDatasets = trendData.length > 0 ? [
        {
            data: trendData.map(t => ({ x: t.month, y: t.income, label: t.month })),
            color: activeColors.green,
            label: 'Income'
        },
        {
            data: trendData.map(t => ({ x: t.month, y: t.expense, label: t.month })),
            color: activeColors.red,
            label: 'Expenses'
        }
    ] : [];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Period Selector */}
            <View style={styles.periodSelector}>
                <Pressable onPress={() => changeMonth(-1)} style={styles.navButton}>
                    <ChevronLeft size={24} color={activeColors.text} />
                </Pressable>
                <View style={styles.dateLabelContainer}>
                    <Text style={styles.dateText}>
                        {(date ?? new Date()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </Text>
                </View>
                <Pressable onPress={() => changeMonth(1)} style={styles.navButton}>
                    <ChevronRight size={24} color={activeColors.text} />
                </Pressable>
            </View>

            {/* Main Stats Card */}
            <View style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                    <Text style={styles.summaryTitle}>Net Balance</Text>
                    <View style={[styles.balanceBadge, { backgroundColor: netSavings >= 0 ? activeColors.green + '20' : activeColors.red + '20' }]}>
                        <Text style={[styles.balanceBadgeText, { color: netSavings >= 0 ? activeColors.green : activeColors.red }]}>
                            {netSavings >= 0 ? 'Surplus' : 'Deficit'}
                        </Text>
                    </View>
                </View>
                <Text style={[styles.summaryAmount, { color: netSavings >= 0 ? activeColors.text : activeColors.red }]}>
                    ৳ {(netSavings ?? 0).toLocaleString()}
                </Text>
                <View style={styles.summaryFooter}>
                    <View style={styles.footerItem}>
                        <View style={[styles.footerIcon, { backgroundColor: activeColors.green + '15' }]}>
                            <ArrowUpRight size={16} color={activeColors.green} />
                        </View>
                        <View>
                            <Text style={styles.footerLabel}>Income</Text>
                            <Text style={[styles.footerValue, { color: activeColors.green }]}>৳ {(summary.total_income ?? 0).toLocaleString()}</Text>
                        </View>
                    </View>
                    <View style={styles.footerDivider} />
                    <View style={styles.footerItem}>
                        <View style={[styles.footerIcon, { backgroundColor: activeColors.red + '15' }]}>
                            <ArrowDownRight size={16} color={activeColors.red} />
                        </View>
                        <View>
                            <Text style={styles.footerLabel}>Expense</Text>
                            <Text style={[styles.footerValue, { color: activeColors.red }]}>৳ {(summary.total_expense ?? 0).toLocaleString()}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Category Breakdown */}
            <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                    <PieIcon size={18} color={activeColors.primary} strokeWidth={2} />
                    <Text style={styles.sectionTitle}>Spending Breakdown</Text>
                </View>
                {categoryData.length > 0 ? (
                    <View style={styles.chartWrapper}>
                        <RadialBarChart
                            data={categoryData}
                            config={{
                                gradient: true,
                                duration: 1200,
                                padding: 30
                            }}
                        />
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No spending data for this period</Text>
                    </View>
                )}
            </View>

            {/* Income vs Expenses Trends */}
            <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                    <TrendingUp size={18} color={activeColors.primary} strokeWidth={2} />
                    <Text style={styles.sectionTitle}>Income vs Expenses</Text>
                </View>
                {trendData.length > 0 ? (
                    <View>
                        <View style={styles.legendContainer}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: activeColors.green }]} />
                                <Text style={styles.legendText}>Income</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: activeColors.red }]} />
                                <Text style={styles.legendText}>Expenses</Text>
                            </View>
                        </View>
                        <View style={styles.chartWrapper}>
                            <AreaChart
                                datasets={areaChartDatasets}
                                config={{
                                    height: 220,
                                    padding: 20,
                                    showLabels: true,
                                    duration: 1000,
                                    showGrid: true,
                                    showYLabels: true,
                                    yAxisWidth: 35
                                }}
                            />
                        </View>
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>Insufficient data for trends</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const createStyles = (activeColors: typeof Colors.light, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: activeColors.background,
    },
    content: {
        padding: 16,
        paddingBottom: 40,
        gap: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: activeColors.background,
    },
    periodSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: activeColors.card,
        borderRadius: 16,
        padding: 8,
        borderWidth: 1,
        borderColor: activeColors.border,
    },
    navButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: activeColors.background,
    },
    dateLabelContainer: {
        flex: 1,
        alignItems: 'center',
    },
    dateText: {
        fontSize: 16,
        fontFamily: font.HindSiliguri,
        fontWeight: '700',
        color: activeColors.text,
    },
    summaryCard: {
        backgroundColor: activeColors.card,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: activeColors.border,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
            },
            android: {
                elevation: 4,
            }
        })
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    summaryTitle: {
        fontSize: 14,
        fontFamily: font.HindSiliguri,
        color: activeColors.textMuted,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    balanceBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    balanceBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    summaryAmount: {
        fontSize: 32,
        fontFamily: font.HindSiliguri,
        fontWeight: '800',
        marginBottom: 20,
    },
    summaryFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: activeColors.border,
    },
    footerItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    footerIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerLabel: {
        fontSize: 11,
        color: activeColors.textMuted,
        fontFamily: font.HindSiliguri,
        fontWeight: '500',
    },
    footerValue: {
        fontSize: 14,
        fontFamily: font.HindSiliguri,
        fontWeight: '700',
    },
    footerDivider: {
        width: 1,
        height: 30,
        backgroundColor: activeColors.border,
        marginHorizontal: 16,
    },
    sectionCard: {
        backgroundColor: activeColors.card,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: activeColors.border,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: font.HindSiliguri,
        fontWeight: '700',
        color: activeColors.text,
    },
    chartWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 220,
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        fontSize: 12,
        fontFamily: font.HindSiliguri,
        color: activeColors.text,
        fontWeight: '600',
    },
    emptyState: {
        height: 150,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: activeColors.textMuted,
        fontFamily: font.HindSiliguri,
        fontStyle: 'italic',
    }
});