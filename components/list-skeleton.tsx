import { useEffect } from "react";
import { View } from "react-native";
import Animated, { Easing, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

export default function ListSkeleton({ length = 3 }: { length?: number }) {
    // aminated background
    const opacity = useSharedValue(0.5)
    const animatedStyle = {
        opacity: opacity,
    };

    useEffect(() => {
        opacity.value = withRepeat(
            withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
            Infinity,
            true
        )
    }, [opacity])

    return (
        <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingHorizontal: 16, gap: 12 }}>
            {Array.from({ length }).map((_, index) => (
                <Animated.View key={index} style={{ height: 64, width: '100%', backgroundColor: '#e9e7e7ff', borderRadius: 4, ...animatedStyle }} />
            ))}
        </View>
    )
}