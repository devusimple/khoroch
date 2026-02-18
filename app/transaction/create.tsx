import { Dropdown, DropdownItem } from "@/components/dropdown";
import { font } from "@/utils/constant";
import * as ImagePicker from 'expo-image-picker';
import {
    Calendar,
    ChevronDown,
    Paperclip,
    X,
} from "lucide-react-native";
import { useEffect, useState, useMemo } from "react";
import {
    Image,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    ToastAndroid,
    View,
    Alert,
} from "react-native";
import {
    KeyboardAvoidingView,
    KeyboardAwareScrollView,
} from "react-native-keyboard-controller";

import DateTimePicker from "@/components/date-time-picker";
import { Wallet } from "@/types";
import { useTransactionStore } from "@/utils/store/transaction.store";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useModeToggle } from "@/hooks/useModeToggler";
import { Colors } from "@/theme/colors";

type TransactionType = "Income" | "Expense" | "Transfer";

export default function CreateTransaction() {
    const db = useSQLiteContext();
    const { isDark } = useModeToggle();
    const activeColors = isDark ? Colors.dark : Colors.light;
    const styles = useMemo(() => createStyles(activeColors, isDark), [activeColors, isDark]);

    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [type, setType] = useState<TransactionType>("Expense");
    const [wallet, setWallet] = useState("1"); // Default to Main Wallet ID
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [wallets, setWallets] = useState<DropdownItem<string>[]>([])
    const { addTransaction } = useTransactionStore()


    const getWallets = async () => {
        try {
            const result = await db.getAllAsync<Wallet>("SELECT * FROM wallets");
            let wall: DropdownItem<string>[] = []
            result.forEach(w => {
                wall.push({ label: w.name, value: w.id.toString() })
            })
            setWallets(wall)
        } catch (error) {
            console.log(error);
        }
    };

    const handleCreate = async () => {
        if (!amount || !wallet || !date || !type) {
            if (Platform.OS === 'android') {
                ToastAndroid.show("Please fill all the fields", ToastAndroid.SHORT);
            } else {
                Alert.alert("Error", "Please fill all the fields");
            }
            return;
        }
        try {
            await addTransaction({ amount: parseFloat(amount), note, type: type.toLowerCase(), wallet_id: parseInt(wallet), date, attachment: image, db })
            if (Platform.OS === 'android') {
                ToastAndroid.show("Transaction created successfully", ToastAndroid.SHORT);
            }
            router.back();
        } catch (error) {
            console.log(error)
            if (Platform.OS === 'android') {
                ToastAndroid.show("Failed to create transaction", ToastAndroid.SHORT);
            }
        }
    };

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    useEffect(() => { getWallets() }, [db])

    const getTypeHighlight = (t: TransactionType) => {
        if (type !== t) return {};

        switch (t) {
            case "Expense": return { backgroundColor: isDark ? 'rgba(255, 69, 58, 0.2)' : "#ffebee" };
            case "Income": return { backgroundColor: isDark ? 'rgba(48, 209, 88, 0.2)' : "#e8f5e9" };
            case "Transfer": return { backgroundColor: isDark ? 'rgba(10, 132, 255, 0.2)' : "#e3f2fd" };
            default: return {};
        }
    };

    const getTypeTextHighlight = (t: TransactionType) => {
        if (type !== t) return {};

        switch (t) {
            case "Expense": return { color: activeColors.red };
            case "Income": return { color: activeColors.green };
            case "Transfer": return { color: activeColors.blue };
            default: return {};
        }
    };

    return (
        <View style={styles.container}>
            <KeyboardAwareScrollView
                showsVerticalScrollIndicator={false}
                bottomOffset={62}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Type Selector */}
                <View style={styles.typeSelectorContainer}>
                    {(["Expense", "Income", "Transfer"] as TransactionType[]).map((t) => (
                        <Pressable
                            key={t}
                            onPress={() => setType(t)}
                            style={[
                                styles.typeButton,
                                getTypeHighlight(t)
                            ]}
                        >
                            <Text
                                style={[
                                    styles.typeText,
                                    getTypeTextHighlight(t),
                                    type === t && styles.typeTextActive,
                                ]}
                            >
                                {t}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* Amount Input */}
                <View style={styles.amountContainer}>
                    {/* <Text style={styles.currencySymbol}>৳</Text> */}
                    <TextInput
                        style={styles.amountInput}
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="৳ 0.00"
                        keyboardType="numeric"
                        autoFocus
                        placeholderTextColor={activeColors.textMuted}
                    />
                </View>

                {/* Form Fields */}
                <View style={styles.formSection}>

                    <Dropdown
                        label="Wallet"
                        placeholder="Select Wallet"
                        data={wallets}
                        value={wallet}
                        onChange={setWallet}
                        searchable
                        style={{ marginBottom: 16 }}
                    />

                    {/* Date Selector */}
                    <Pressable style={styles.inputRow} onPress={() => setShowDatePicker(true)}>
                        <View style={styles.iconContainer}>
                            <Calendar size={20} color={activeColors.textMuted} />
                        </View>
                        <View style={styles.inputContent}>
                            <Text style={styles.label}>Date</Text>
                            <Text style={styles.valueText}>
                                {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                        <ChevronDown size={20} color={activeColors.border} />
                    </Pressable>

                    {/* Note Input */}
                    <View style={[styles.inputRow, { borderBottomWidth: 0 }]}>
                        <TextInput
                            style={styles.noteInput}
                            value={note}
                            onChangeText={setNote}
                            placeholder="Add a note..."
                            placeholderTextColor={activeColors.textMuted}
                            multiline
                        />
                    </View>

                    {/* Attachment Picker */}
                    <View style={styles.inputRow}>
                        <View style={styles.iconContainer}>
                            <Paperclip size={20} color={activeColors.textMuted} />
                        </View>
                        <View style={styles.inputContent}>
                            <Text style={styles.label}>Attachment (Optional)</Text>
                            {image ? (
                                <View style={styles.attachmentPreview}>
                                    <Pressable onPress={() => setImage(null)} style={styles.removeAttachment}>
                                        <X size={14} color="#fff" />
                                    </Pressable>
                                    <Image source={{ uri: image }} style={styles.attachmentImage} />
                                </View>
                            ) : (
                                <Pressable onPress={pickImage}>
                                    <Text style={[styles.valueText, { color: activeColors.blue }]}>Add Receipt</Text>
                                </Pressable>
                            )}
                        </View>
                    </View>
                </View>
            </KeyboardAwareScrollView>

            {/* Submit Button */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0} // Adjust based on header height
                style={styles.footer}
            >
                <Pressable style={styles.submitButton} onPress={handleCreate}>
                    <Text style={styles.submitButtonText}>Save Transaction</Text>
                </Pressable>
            </KeyboardAvoidingView>
            {/* Date Picker Modal */}
            <DateTimePicker
                isVisible={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                onConfirm={(selectedDate) => {
                    setDate(selectedDate);
                }}
                initialDate={date}
                mode="datetime"
            />
        </View>
    );
}

const createStyles = (activeColors: typeof Colors.light, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: activeColors.background,
    },
    scrollContent: {
        padding: 20,
    },
    typeSelectorContainer: {
        flexDirection: "row",
        backgroundColor: activeColors.card,
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: activeColors.border,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        borderRadius: 8,
    },
    typeText: {
        fontFamily: font.HindSiliguri,
        fontSize: 14,
        color: activeColors.textMuted,
        fontWeight: "500",
    },
    typeTextActive: {
        fontWeight: "bold",
    },
    amountContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 32,
        // 
        backgroundColor: activeColors.card,
        borderRadius: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: activeColors.border,

    },
    currencySymbol: {
        fontSize: 48,
        fontFamily: font.HindSiliguri,
        color: "#333",
        marginRight: 4,
        fontWeight: '600'
    },
    amountInput: {
        fontSize: 48,
        fontFamily: font.HindSiliguri,
        color: activeColors.text,
        fontWeight: "bold",
        minWidth: 100,
        textAlign: "center",
        paddingVertical: 8,
    },
    formSection: {
        backgroundColor: activeColors.card,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: activeColors.border,
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: activeColors.background,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: activeColors.background,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    inputContent: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        color: activeColors.textMuted,
        fontFamily: font.HindSiliguri,
        marginBottom: 2,
    },
    valueText: {
        fontSize: 16,
        color: activeColors.text,
        fontFamily: font.HindSiliguri,
        fontWeight: "500",
    },
    noteInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: font.HindSiliguri,
        color: activeColors.text,
        minHeight: 40,
    },
    footer: {
        padding: 16,
        backgroundColor: activeColors.card,
        borderTopWidth: 1,
        borderTopColor: activeColors.border,
    },
    submitButton: {
        backgroundColor: activeColors.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
    },
    submitButtonText: {
        color: activeColors.primaryForeground,
        fontSize: 16,
        fontWeight: "600",
        fontFamily: font.HindSiliguri,
    },
    attachmentPreview: {
        marginTop: 8,
        width: 100,
        height: 100,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
    },
    attachmentImage: {
        width: '100%',
        height: '100%',
    },
    removeAttachment: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 10,
        padding: 4,
        zIndex: 1,
    },
});