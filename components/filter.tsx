import { font } from "@/utils/constant";
import { Plus } from "lucide-react-native";
import { Pressable, TouchableOpacity, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useFilterTabStore } from "@/utils/store/store";
import { useModeToggle } from "@/hooks/useModeToggler";
import { Colors } from "@/theme/colors";
import { useMemo } from "react";

const TABS = [
    { label: "All", value: "all" },
    { label: "Income", value: "income" },
    { label: "Expense", value: "expense" },
] as const;

export default function Filter() {
    const { tabs, setTabs } = useFilterTabStore();
    const { isDark } = useModeToggle();
    const activeColors = isDark ? Colors.dark : Colors.light;
    const styles = useMemo(() => createStyles(activeColors, isDark), [activeColors, isDark]);

    const getActiveTabStyle = (value: string) => {
        if (tabs !== value) return null;
        switch (value) {
            case 'expense': return { backgroundColor: activeColors.red + '20' };
            case 'income': return { backgroundColor: activeColors.green + '20' };
            case 'all': return { backgroundColor: activeColors.blue + '20' };
            default: return styles.activeTab;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.tabWrapper}>
                {TABS.map((tab) => (
                    <Pressable
                        key={tab.value}
                        style={[
                            styles.tab,
                            getActiveTabStyle(tab.value)
                        ]}
                        onPress={() => setTabs(tab.value)}
                    >
                        <Text style={[styles.tabText, tabs === tab.value && styles.activeTabText]}>
                            {tab.label}
                        </Text>
                    </Pressable>
                ))}
            </View>

            <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => router.navigate("/transaction/create")}
                style={styles.addButton}
            >
                <Text style={styles.addButtonText}>Add</Text>
                <Plus strokeWidth={1.5} size={20} color={activeColors.text} />
            </TouchableOpacity>
        </View>
    );
}

const createStyles = (activeColors: typeof Colors.light, isDark: boolean) => StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        gap: 16,
    },
    tabWrapper: {
        flexDirection: "row",
        gap: 8,
        backgroundColor: activeColors.card,
        borderRadius: 12,
        padding: 4,
        flexShrink: 1,
        flexGrow: 1,
        justifyContent: "space-between",
        alignItems: "center",
        borderColor: activeColors.border,
        borderWidth: 1,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    activeTab: {
        backgroundColor: activeColors.background,
    },
    tabText: {
        fontFamily: font.HindSiliguri,
        textAlign: "center",
        fontWeight: "500",
        fontSize: 14,
        color: activeColors.textMuted,
    },
    activeTabText: {
        color: activeColors.text,
        fontWeight: "700",
    },
    addButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: activeColors.card,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        borderColor: activeColors.border,
        borderWidth: 1,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    addButtonText: {
        fontFamily: font.HindSiliguri,
        fontWeight: "600",
        fontSize: 14,
        color: activeColors.text,
    },
});