import { font } from "@/utils/constant";
import { ActivityIndicator, Pressable, PressableProps, StyleSheet, Text, ViewStyle } from "react-native";

interface ButtonProps extends PressableProps {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "outline";
    loading?: boolean;
    style?: ViewStyle;
}

export default function Button({
    children,
    variant = "primary",
    loading = false,
    style,
    disabled,
    ...props
}: ButtonProps) {
    const getBackgroundColor = (pressed: boolean) => {
        if (disabled) return "#e5e7eb";
        switch (variant) {
            case "primary": return pressed ? "#1d4ed8" : "#2563eb";
            case "secondary": return pressed ? "#d1d5db" : "#e5e7eb";
            case "outline": return "transparent";
            default: return "#2563eb";
        }
    };

    const getTextColor = () => {
        if (disabled) return "#9ca3af";
        switch (variant) {
            case "primary": return "#ffffff";
            case "secondary": return "#1f2937";
            case "outline": return "#2563eb";
            default: return "#ffffff";
        }
    };

    return (
        <Pressable
            style={({ pressed }) => [
                styles.container,
                { backgroundColor: getBackgroundColor(pressed) },
                variant === "outline" && styles.outline,
                style
            ]}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <Text style={[styles.text, { color: getTextColor() }]}>
                    {children}
                </Text>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 24,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
    },
    outline: {
        borderWidth: 1,
        borderColor: "#2563eb",
    },
    text: {
        fontSize: 16,
        fontWeight: "600",
        fontFamily: font.HindSiliguri,
        textAlign: "center",
    },
});
