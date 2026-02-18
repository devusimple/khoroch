import { font } from "@/utils/constant";
import { router } from "expo-router";
import { AreaChartIcon, Bell, Settings2, SunDim, Moon, Wallet2 } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useModeToggle } from "@/hooks/useModeToggler";
import { Colors } from "@/theme/colors";
import { useMemo } from "react";

export default function Header() {
    const { top } = useSafeAreaInsets();
    const { isDark, toggleMode } = useModeToggle();
    const activeColors = isDark ? Colors.dark : Colors.light;
    const styles = useMemo(() => createStyles(activeColors, isDark), [activeColors, isDark]);

    const ThemeIcon = isDark ? SunDim : Moon;

    return (
        <GestureHandlerRootView style={[styles.container, { paddingTop: top + 6 }]}>
            <Pressable onPress={() => { }} style={styles.logoContainer}>
                <Wallet2 size={20} strokeWidth={1.5} color={activeColors.text} />
                <Text style={styles.logoText}>KHOROCH</Text>
            </Pressable>
            <View style={styles.actionsContainer}>
                <Pressable onPress={() => { router.push('/analysis') }} style={styles.headerButton}>
                    <AreaChartIcon size={20} strokeWidth={1.5} color={activeColors.text} />
                </Pressable>
                <Pressable onPress={toggleMode} style={styles.headerButton}>
                    <ThemeIcon size={20} strokeWidth={1.5} color={activeColors.text} />
                </Pressable>
                <Pressable onPress={() => {
                    router.push("/notifications")
                }} style={styles.headerButton}>
                    <Bell size={20} strokeWidth={1.5} color={activeColors.text} />
                </Pressable>
                <Pressable onPress={() => { router.push("/settings") }} style={styles.headerButton}>
                    <Settings2 size={20} strokeWidth={1.5} color={activeColors.text} />
                </Pressable>
            </View>
        </GestureHandlerRootView>
    )
}

const createStyles = (activeColors: typeof Colors.light, isDark: boolean) => StyleSheet.create({
    container: {
        backgroundColor: activeColors.background,
        padding: 12,
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
        fontWeight: "600",
        color: activeColors.text
    },
    actionsContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8
    },
    headerButton: {
        padding: 6
    }
});