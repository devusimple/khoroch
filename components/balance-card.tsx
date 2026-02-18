import { font } from "@/utils/constant";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useMonthYearStore } from "@/utils/store/store";
import { useEffect, useMemo } from "react";
import { useBalanceStore } from "@/utils/store/balance.store";
import { useSQLiteContext } from "expo-sqlite";
import { useModeToggle } from "@/hooks/useModeToggler";
import { Colors } from "@/theme/colors";

export default function BalanceCard() {
    const db = useSQLiteContext();
    const { isDark } = useModeToggle();
    const activeColors = isDark ? Colors.dark : Colors.light;
    const styles = useMemo(() => createStyles(activeColors, isDark), [activeColors, isDark]);

    const { date, setDate } = useMonthYearStore();
    const { getSummary, summary } = useBalanceStore()

    const handleMonthChange = (direction: "prev" | "next") => {
        if (direction === "prev") {
            setDate(new Date(date.getFullYear(), date.getMonth() - 1));
        } else {
            setDate(new Date(date.getFullYear(), date.getMonth() + 1));
        }
    };

    useEffect(() => {
        getSummary(db)
    }, [date, db]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable style={styles.headerButton} aria-label="Previous" onPress={() => handleMonthChange("prev")}>
                    <ChevronLeft strokeWidth={1.5} color={activeColors.text} />
                </Pressable>
                <Text style={styles.headerText}>{date.toLocaleString("default", { month: "long", year: "numeric" })}</Text>
                <Pressable style={[styles.headerButton, {
                    opacity: date.getMonth() === new Date().getMonth() ? 0.3 : 1
                }]} disabled={date.getMonth() === new Date().getMonth()} onPress={() => handleMonthChange("next")} aria-label="Next">
                    <ChevronRight strokeWidth={1.5} color={activeColors.text} />
                </Pressable>
            </View>

            <View style={styles.row}>
                <View style={styles.column}>
                    <Text style={styles.label}>Income</Text>
                    <Text style={[styles.value, styles.incomeColor]}>{summary.income}</Text>
                </View>
                <View style={styles.column}>
                    <Text style={styles.label}>Expenses</Text>
                    <Text style={[styles.value, styles.expenseColor]}>{summary.expense}</Text>
                </View>
                <View style={styles.column}>
                    <Text style={styles.label}>Balance</Text>
                    <Text style={[styles.value, styles.balanceColor]}>{summary.balance}</Text>
                </View>
            </View>
        </View>
    );
}

const createStyles = (activeColors: typeof Colors.light, isDark: boolean) => StyleSheet.create({
    container: {
        backgroundColor: activeColors.card,
        borderRadius: 16,
        margin: 16,
        borderWidth: 1,
        borderColor: activeColors.border,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: activeColors.border,
        padding: 8,
    },
    headerButton: {
        paddingVertical: 10,
        paddingHorizontal: 24,
    },
    headerText: {
        fontSize: 16,
        fontWeight: "bold",
        fontFamily: font.HindSiliguri,
        color: activeColors.text,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    column: {
        alignItems: "center",
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        fontFamily: font.HindSiliguri,
        color: activeColors.textMuted,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    value: {
        fontSize: 18,
        fontWeight: "700",
        fontFamily: font.HindSiliguri,
    },
    incomeColor: {
        color: activeColors.green,
    },
    expenseColor: {
        color: activeColors.red,
    },
    balanceColor: {
        color: activeColors.text,
    },
});