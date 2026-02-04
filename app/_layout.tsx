import { router, Stack } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SQLiteProvider } from 'expo-sqlite';
import { migrateDbIfNeeded } from '@/utils/db/client';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from "expo-font"
import { Suspense, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Pressable, StatusBar, Text } from "react-native";
import { font } from "@/utils/constant";
import { ChevronLeft, Info, MoreVertical } from "lucide-react-native";
import SuspenseFallback from "@/components/suspense";

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
        <GestureHandlerRootView>
            <StatusBar barStyle={'dark-content'} />
            <KeyboardProvider>
                <Suspense fallback={<SuspenseFallback />}>
                    <SQLiteProvider
                        databaseName="khoroch.db"
                        onInit={migrateDbIfNeeded}
                        useSuspense
                    >
                        <Stack>
                            <Stack.Screen name="index" options={{ headerShown: false }} />
                            <Stack.Screen name="transaction/create" options={{
                                title: "Create Transaction", headerShadowVisible: false, headerTitleStyle: { fontFamily: font.HindSiliguri }, headerTitleAlign: "center", headerLeft(props) {
                                    return <Pressable onPress={() => {
                                        router.back()
                                    }}>
                                        <ChevronLeft strokeWidth={1} />
                                    </Pressable>
                                },
                                headerRight(props) {
                                    return <Pressable onPress={() => {
                                        router.back()
                                    }}>
                                        <Info strokeWidth={1} size={22} />
                                    </Pressable>
                                },
                            }} />
                            <Stack.Screen name="transaction/update" options={{
                                title: "Update Transaction", headerShadowVisible: false, headerTitleStyle: { fontFamily: font.HindSiliguri }, headerTitleAlign: "center", headerLeft(props) {
                                    return <Pressable onPress={() => {
                                        router.back()
                                    }}>
                                        <ChevronLeft strokeWidth={1} />
                                    </Pressable>
                                },
                                headerRight(props) {
                                    return <Pressable onPress={() => {
                                        router.back()
                                    }}>
                                        <MoreVertical strokeWidth={1} size={22} />
                                    </Pressable>
                                },
                            }} />
                            <Stack.Screen name="wallet/create" options={{
                                title: "Create Wallet", headerShadowVisible: false, headerTitleStyle: { fontFamily: font.HindSiliguri }, headerTitleAlign: "center", headerLeft(props) {
                                    return <Pressable onPress={() => {
                                        router.back()
                                    }}>
                                        <ChevronLeft strokeWidth={1} />
                                    </Pressable>
                                },
                                headerRight(props) {
                                    return <Pressable onPress={() => {
                                        router.back()
                                    }}>
                                        <MoreVertical strokeWidth={1} size={22} />
                                    </Pressable>
                                },
                            }} />
                            <Stack.Screen name="wallet/index" options={{
                                title: "Wallets", headerShadowVisible: false, headerTitleStyle: { fontFamily: font.HindSiliguri }, headerTitleAlign: "center", headerLeft(props) {
                                    return <Pressable onPress={() => {
                                        router.back()
                                    }}>
                                        <ChevronLeft strokeWidth={1} />
                                    </Pressable>
                                },
                                headerRight(props) {
                                    return <Pressable onPress={() => {
                                        router.back()
                                    }}>
                                        <MoreVertical strokeWidth={1} size={22} />
                                    </Pressable>
                                },
                            }} />
                            <Stack.Screen name="settings/index" options={{
                                title: "Settings", headerShadowVisible: false, headerTitleStyle: { fontFamily: font.HindSiliguri }, headerTitleAlign: "center", headerLeft(props) {
                                    return <Pressable onPress={() => {
                                        router.back()
                                    }}>
                                        <ChevronLeft strokeWidth={1} />
                                    </Pressable>
                                },
                                headerRight(props) {
                                    return <Pressable onPress={() => {
                                        router.back()
                                    }}>
                                        <MoreVertical strokeWidth={1} size={22} />
                                    </Pressable>
                                },
                            }} />
                            <Stack.Screen name="transaction/[id]/index" options={{
                                title: "Transaction", headerShadowVisible: false, headerTitleStyle: { fontFamily: font.HindSiliguri }, headerTitleAlign: "center", headerLeft(props) {
                                    return <Pressable onPress={() => {
                                        router.back()
                                    }}>
                                        <ChevronLeft strokeWidth={1} />
                                    </Pressable>
                                },
                                headerRight(props) {
                                    return <Pressable onPress={() => {
                                        router.back()
                                    }}>
                                        <MoreVertical strokeWidth={1} size={22} />
                                    </Pressable>
                                },
                            }} />
                        </Stack>
                    </SQLiteProvider>
                </Suspense>
            </KeyboardProvider>
        </GestureHandlerRootView>
    )
}