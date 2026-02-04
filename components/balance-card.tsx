import { font } from "@/utils/constant";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useMonthYearStore } from "@/utils/store/store";
import { useEffect } from "react";
import { useBalanceStore } from "@/utils/store/balance.store";
import { useSQLiteContext } from "expo-sqlite";

export default function BalanceCard() {
    const { date, setDate } = useMonthYearStore();
    const db = useSQLiteContext();

    const handleMonthChange = (direction: "prev" | "next") => {
        if (direction === "prev") {
            setDate(new Date(date.getFullYear(), date.getMonth() - 1));
        } else {
            setDate(new Date(date.getFullYear(), date.getMonth() + 1));
        }
    };
    const { getSummary, summary } = useBalanceStore()

    useEffect(() => {
        getSummary(db)
    }, [date, db])

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable style={styles.headerButton} onPress={() => handleMonthChange("prev")}>
                    <ChevronLeft strokeWidth={1} />
                </Pressable>
                <Text style={styles.headerText}>{date.toLocaleString("default", { month: "long", year: "numeric" })}</Text>
                <Pressable style={styles.headerButton} disabled={date.getMonth() === new Date().getMonth()} onPress={() => handleMonthChange("next")}>
                    <ChevronRight strokeWidth={1} />
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

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        borderRadius: 12,
        margin: 16,
        borderWidth: 0.5,
        borderColor: "lightgrey",
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
        borderBottomWidth: 0.5,
        borderBottomColor: "lightgrey",
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
        color: "#1a1a1aff",
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
    },
    column: {
        alignItems: "center",
    },
    label: {
        fontSize: 16,
        fontWeight: "500",
        fontFamily: font.HindSiliguri,
    },
    value: {
        fontSize: 20,
        fontWeight: "600",
        fontFamily: font.HindSiliguri,
    },
    incomeColor: {
        color: "#0026ffff",
    },
    expenseColor: {
        color: "#ff0f0fff",
    },
    balanceColor: {
        color: "#32a328ff",
    },
});