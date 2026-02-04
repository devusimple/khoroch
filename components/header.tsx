import { font } from "@/utils/constant";
import { router } from "expo-router";
import { Bell, Settings2, SunDim, Wallet2 } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Header() {
    const { top } = useSafeAreaInsets();
    return (
        <GestureHandlerRootView style={[styles.container, { paddingTop: top + 6 }]}>
            <Pressable onPress={() => { }} style={styles.logoContainer}>
                <Wallet2 size={20} strokeWidth={1} color={"#000"} />
                <Text style={styles.logoText}>KHOROCH</Text>
            </Pressable>
            <View style={styles.actionsContainer}>
                <Pressable onPress={() => { }}>
                    <SunDim size={20} strokeWidth={1} color={"#000"} />
                </Pressable>
                <Pressable onPress={() => { }}>
                    <Bell size={20} strokeWidth={1} color={"#000"} />
                </Pressable>
                <Pressable onPress={() => { router.push("/settings") }}>
                    <Settings2 size={20} strokeWidth={1} color={"#000"} />
                </Pressable>
            </View>
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        zIndex: 1
    },
    logoContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6
    },
    logoText: {
        fontFamily: font.HindSiliguri,
        fontSize: 16,
        fontWeight: "600"
    },
    actionsContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16
    }
});