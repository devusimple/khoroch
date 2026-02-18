import { AreaChart } from "@/components/charts/area-chart";
import SuspenseFallback from "@/components/suspense";
import { useColor } from "@/hooks/useColor";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState, useMemo } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";

interface MonthlyData {
    month: string;
    income: number;
    expense: number;
}

export default function Analysis() {
    const db = useSQLiteContext();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<MonthlyData[]>([]);

    const primaryColor = useColor('primary');
    const mutedColor = useColor('mutedForeground');
    const destructiveColor = useColor('destructive');
    const successColor = '#22c55e'; // Green for income

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Get data for the last 12 months
            const twelveMonthsAgo = new Date();
            twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
            twelveMonthsAgo.setDate(1);
            twelveMonthsAgo.setHours(0, 0, 0, 0);
            const startTimestamp = Math.floor(twelveMonthsAgo.getTime() / 1000);

            const result = await db.getAllAsync<MonthlyData>(`
                SELECT 
                    strftime('%Y-%m', date, 'unixepoch') as month,
                    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
                FROM transactions
                WHERE date >= ?
                GROUP BY month
                ORDER BY month ASC
            `, startTimestamp);

            setData(result);
        } catch (error) {
            console.error("Error fetching analysis data:", error);
        } finally {
            setLoading(false);
        }
    };

    const totalIncome = useMemo(() => data.reduce((acc, curr) => acc + curr.income, 0), [data]);
    const totalExpense = useMemo(() => data.reduce((acc, curr) => acc + curr.expense, 0), [data]);
    const balance = totalIncome - totalExpense;

    const chartData = useMemo(() => {
        if (data.length === 0) return [];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return data.map((d, index) => {
            const monthIdx = parseInt(d.month.split('-')[1]) - 1;
            return {
                x: index,
                y: d.expense,
                label: monthNames[monthIdx]
            };
        });
    }, [data]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <SuspenseFallback iconSize={16} textSize={14} />
            </View>
        );
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#f8f9fa' }} contentContainerStyle={{ padding: 16, gap: 20 }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }}>
                    <Text style={{ fontSize: 12, color: mutedColor, marginBottom: 4 }}>Total Income</Text>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: successColor }}>${totalIncome.toLocaleString()}</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }}>
                    <Text style={{ fontSize: 12, color: mutedColor, marginBottom: 4 }}>Total Expense</Text>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: destructiveColor }}>${totalExpense.toLocaleString()}</Text>
                </View>
            </View>

            <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }}>
                <Text style={{ fontSize: 12, color: mutedColor, marginBottom: 4 }}>Net Balance</Text>
                <Text style={{ fontSize: 24, fontWeight: '800', color: balance >= 0 ? primaryColor : destructiveColor }}>
                    ${balance.toLocaleString()}
                </Text>
            </View>

            {/* Chart Section */}
            <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 16 }}>Expense Trend (Last 12 Months)</Text>
                {chartData.length > 0 ? (
                    <AreaChart
                        data={chartData}
                        config={{
                            height: 220,
                            padding: 20,
                            showGrid: true,
                            showLabels: true,
                            interactive: true,
                            showYLabels: true,
                            yLabelCount: 5,
                        }}
                    />
                ) : (
                    <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: mutedColor }}>No data available for the selected period</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}