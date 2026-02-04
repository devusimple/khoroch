import { font } from "@/utils/constant";
import { WalletMinimalIcon } from "lucide-react-native";
import { Text, View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from "react-native-reanimated";
import { useEffect } from "react";

const AnimatedWalletIcon = Animated.createAnimatedComponent(WalletMinimalIcon);

export default function SuspenseFallback() {
    const spinValue = useSharedValue(0);
    const spin = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${spinValue.value * 360}deg` }],
        };
    });
    useEffect(() => {
        spinValue.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
    }, [spinValue]);
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <AnimatedWalletIcon size={24} strokeWidth={1} style={spin} />
            <Text style={{ fontFamily: font.HindSiliguri, fontSize: 24, marginTop: 10, textAlign: "center" }}>KHOROCH</Text>
        </View>
    )
}