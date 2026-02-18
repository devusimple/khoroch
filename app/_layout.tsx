import SuspenseFallback from "@/components/suspense";
import { Icon } from "@/components/ui/icon";
import { ThemeProvider } from "@/theme/theme-provider";
import { font } from "@/utils/constant";
import { migrateDbIfNeeded } from "@/utils/db/client";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from "expo-status-bar";
import { ChevronLeft } from "lucide-react-native";
import { Suspense, useEffect } from "react";
import { Pressable } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded] = useFonts({
        HindSiliguri: require("@/assets/fonts/HindSiliguri-Regular.ttf"),
    });

    useEffect(() => {
        if (loaded) {
            SplashScreen.hide();
        }
    }, [loaded]);

    if (!loaded) return null;
    return (
        <ThemeProvider>
            <GestureHandlerRootView>
                <StatusBar style="auto" animated />
                <KeyboardProvider>
                    <Suspense fallback={<SuspenseFallback />}>
                        <SQLiteProvider
                            databaseName="khoroch.db"
                            onInit={migrateDbIfNeeded}
                            useSuspense
                        >
                            <Stack
                                screenOptions={{
                                    headerShadowVisible: false,
                                    headerTitleStyle: {
                                        fontFamily: font.HindSiliguri,
                                        fontSize: 18,
                                    },
                                    headerTitleAlign: "center",
                                    headerLeft: () => (
                                        <Pressable
                                            onPress={() => router.back()}
                                            style={({ pressed }) => ({
                                                opacity: pressed ? 0.5 : 1,
                                                padding: 8,
                                                marginLeft: -8,
                                            })}
                                        >
                                            <Icon name={ChevronLeft} lightColor="#000" darkColor="#fff" size={24} />
                                        </Pressable>
                                    ),
                                }}
                            >
                                <Stack.Screen name="index" options={{ headerShown: false }} />
                                <Stack.Screen name="transaction/create" options={{ title: "Create Transaction" }} />
                                <Stack.Screen name="transaction/update" options={{ title: "Update Transaction" }} />
                                <Stack.Screen name="settings/index" options={{ title: "Settings" }} />
                                <Stack.Screen name="transaction/[id]/index" options={{ title: "Transaction Details" }} />
                                <Stack.Screen name="wallet/create" options={{ title: "Create Wallet" }} />
                                <Stack.Screen name="wallet/index" options={{ title: "Wallets" }} />
                                <Stack.Screen name="wallet/[id]/index" options={{ title: "Wallet Details" }} />
                                <Stack.Screen name="wallet/update" options={{ title: "Update Wallet" }} />
                                <Stack.Screen name="analysis" options={{ title: "Financial Analysis" }} />
                                <Stack.Screen name="notifications" options={{ title: "Notifications" }} />
                            </Stack>
                        </SQLiteProvider>
                    </Suspense>
                </KeyboardProvider>
            </GestureHandlerRootView>
        </ThemeProvider>
    )
}