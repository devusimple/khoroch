import { font } from "@/utils/constant";
import { WalletMinimalIcon } from "lucide-react-native";
import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

const AnimatedWalletIcon = Animated.createAnimatedComponent(WalletMinimalIcon);

export default function SuspenseFallback({ iconSize = 24, textSize = 18 }: { iconSize?: number, textSize?: number }) {
    const spinValue = useSharedValue(0);
    const spin = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${spinValue.value * 360}deg` }],
        };
    });
    useEffect(() => {
        spinValue.value = withRepeat(withTiming(1, { duration: 1000, easing: Easing.exp }), -1, false);
    }, [spinValue]);
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <AnimatedWalletIcon size={iconSize} strokeWidth={1} style={spin} />
            <Text style={{ fontFamily: font.HindSiliguri, fontSize: textSize, marginTop: 10, textAlign: "center" }}>KHOROCH</Text>
        </View>
    )
}