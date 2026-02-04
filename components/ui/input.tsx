import { font } from "@/utils/constant";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
}

export default function Input({ label, error, style, ...props }: InputProps) {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[styles.input, error ? styles.inputError : null, style]}
                placeholderTextColor="#9ca3af"
                {...props}
            />
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 6,
    },
    label: {
        fontSize: 14,
        fontFamily: font.HindSiliguri,
        color: "#374151",
        fontWeight: "500",
    },
    input: {
        backgroundColor: "#FBF3F1",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        fontFamily: font.HindSiliguri,
        color: "#1f2937",
        borderWidth: 1,
        borderColor: "transparent",
    },
    inputError: {
        borderColor: "#ef4444",
    },
    error: {
        fontSize: 12,
        color: "#ef4444",
        fontFamily: font.HindSiliguri,
    },
});
