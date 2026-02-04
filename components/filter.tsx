import { font } from "@/utils/constant";
import { Plus } from "lucide-react-native";
import { Pressable, TouchableOpacity, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useFilterTabStore } from "@/utils/store/store";

const TABS = [
    { label: "All", value: "all" },
    { label: "Income", value: "income" },
    { label: "Expense", value: "expense" },
] as const;

export default function Filter() {
    const { tabs, setTabs } = useFilterTabStore();

    return (
        <View style={styles.container}>
            <View style={styles.tabWrapper}>
                {TABS.map((tab) => (
                    <Pressable
                        key={tab.value}
                        style={[styles.tab, tabs === tab.value && styles.activeTab,
                        tab.value === "expense" && tabs === "expense" && { backgroundColor: "#ffebee" },
                        tab.value === "income" && tabs === "income" && { backgroundColor: "#e8f5e9" },
                        tab.value === "all" && tabs === "all" && { backgroundColor: "#e3f2fd" }
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
                <Plus strokeWidth={1} size={20} color="#000" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        gap: 32,
    },
    tabWrapper: {
        flexDirection: "row",
        gap: 10,
        backgroundColor: "#fff",
        borderRadius: 6,
        padding: 5,
        flexShrink: 1,
        flexGrow: 1,
        justifyContent: "space-between",
        alignItems: "center",
        borderColor: "#ddd",
        borderWidth: 0.5,
    },
    tab: {
        padding: 5,
        borderRadius: 6,
        backgroundColor: "#fff",
        flexGrow: 1,
    },
    activeTab: {
        backgroundColor: "#f0f0f0",
    },
    tabText: {
        fontFamily: font.HindSiliguri,
        textAlign: "center",
        fontWeight: "normal",
        fontSize: 14,
        color: "#666",
    },
    activeTabText: {
        color: "#000",
    },
    addButton: {
        padding: 10,
        borderRadius: 6,
        backgroundColor: "#fff",
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        borderColor: "#ddd",
        borderWidth: 0.5,
    },
    addButtonText: {
        fontFamily: font.HindSiliguri,
        textAlign: "center",
        fontSize: 14,
    },
});