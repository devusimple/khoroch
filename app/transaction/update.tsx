import DateTimePicker from "@/components/date-time-picker";
import { Dropdown, DropdownItem } from "@/components/dropdown";
import { Transaction, Wallet } from "@/types";
import { font } from "@/utils/constant";
import { useTransactionStore } from "@/utils/store/transaction.store";
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import {
    Calendar,
    ChevronDown,
    Paperclip,
    X
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
    Image,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    ToastAndroid,
    View
} from "react-native";
import {
    KeyboardAvoidingView,
    KeyboardAwareScrollView,
} from "react-native-keyboard-controller";

type TransactionType = "Income" | "Expense" | "Transfer";

export default function UpdateTransaction() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [type, setType] = useState<TransactionType>("Expense");
    const [wallet, setWallet] = useState("1");
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const { updateTransaction } = useTransactionStore();

    const [wallets, setWallets] = useState<DropdownItem<string>[]>([])


    const db = useSQLiteContext();

    const getWallets = useCallback(async () => {
        try {
            const res = await db.getAllAsync<Wallet>("SELECT * FROM wallets")
            let wall: DropdownItem<string>[] = []
            res.forEach(w => {
                wall.push({ label: w.name, value: w.id.toString() })
            })
            setWallets(wall)
        } catch (error) {
            console.log(error);
        }
    }, [db])

    useEffect(() => {
        if (id) {
            // In a real app, fetch transaction by ID here
            console.log(`Fetching transaction ${id}...`);
            // Mock data

            (async () => {
                const [res] = await db.getAllAsync<Transaction>(`SELECT * FROM transactions where id = ?`, parseInt(id as string))
                setAmount(res.amount.toString());
                setNote(res.note ?? "");
                setType(
                    res.type === "income" ? "Income" : res.type === "expense" ? "Expense" : "Transfer"
                );
                setWallet(res.wallet_id.toString());
                setDate(new Date(res.date));
                setImage(res.attachment ?? null);
            })()


        }
        getWallets();
    }, [db, id]);

    const handleUpdate = () => {
        try {
            updateTransaction({
                id: parseInt(id as string),
                amount: parseFloat(amount),
                note: note,
                type: type === "Income" ? "income" : type === "Expense" ? "expense" : "transfer",
                wallet_id: parseInt(wallet),
                date: date.getTime() / 1000,
                attachment: image,
                db
            });
            ToastAndroid.show("Transaction updated successfully", ToastAndroid.SHORT);
            router.back();
        } catch (error) {
            console.log(error);
            ToastAndroid.show("Failed to update transaction", ToastAndroid.SHORT);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    return (
        <View style={styles.container}>
            <KeyboardAwareScrollView
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
                                type === t && styles.typeButtonActive,
                                type === "Expense" && t === "Expense" && { backgroundColor: "#ffebee" },
                                type === "Income" && t === "Income" && { backgroundColor: "#e8f5e9" },
                                type === "Transfer" && t === "Transfer" && { backgroundColor: "#e3f2fd" },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.typeText,
                                    type === t && styles.typeTextActive,
                                    type === "Expense" && t === "Expense" && { color: "#d32f2f" },
                                    type === "Income" && t === "Income" && { color: "#388e3c" },
                                    type === "Transfer" && t === "Transfer" && { color: "#1976d2" },
                                ]}
                            >
                                {t}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* Amount Input */}
                <View style={styles.amountContainer}>
                    <TextInput
                        style={styles.amountInput}
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="৳ 0.00"
                        keyboardType="numeric"
                        autoFocus
                        placeholderTextColor="#bdbdbd"
                    />
                </View>

                {/* Form Fields */}
                <View style={[styles.formSection, { paddingVertical: 12 }]}>

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
                            <Calendar size={20} color="#555" />
                        </View>
                        <View style={styles.inputContent}>
                            <Text style={styles.label}>Date</Text>
                            <Text style={styles.valueText}>
                                {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                        <ChevronDown size={20} color="#999" />
                    </Pressable>

                    {/* Note Input */}
                    <View style={[styles.inputRow, { borderBottomWidth: 0 }]}>
                        <TextInput
                            style={styles.noteInput}
                            value={note}
                            onChangeText={setNote}
                            placeholder="Add a note..."
                            placeholderTextColor="#999"
                            multiline
                        />
                    </View>

                    {/* Attachment Picker */}
                    <View style={styles.inputRow}>
                        <View style={styles.iconContainer}>
                            <Paperclip size={20} color="#555" />
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
                                    <Text style={[styles.valueText, { color: "#007AFF" }]}>Add Receipt</Text>
                                </Pressable>
                            )}
                        </View>
                    </View>
                </View>
            </KeyboardAwareScrollView>

            {/* Submit Button */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
                style={styles.footer}
            >
                <Pressable style={styles.submitButton} onPress={handleUpdate}>
                    <Text style={styles.submitButtonText}>Update Transaction</Text>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9f9f9",
    },
    scrollContent: {
        padding: 20,
    },
    typeSelectorContainer: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#eee",
    },
    typeButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        borderRadius: 8,
    },
    typeButtonActive: {
        // Background color handled dynamically
    },
    typeText: {
        fontFamily: font.HindSiliguri,
        fontSize: 14,
        color: "#666",
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
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "#eee",
    },
    amountInput: {
        fontSize: 48,
        fontFamily: font.HindSiliguri,
        color: "#333",
        fontWeight: "bold",
        minWidth: 100,
        textAlign: "center",
    },
    formSection: {
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "#eee",
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f5f5f5",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    inputContent: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        color: "#888",
        fontFamily: font.HindSiliguri,
        marginBottom: 2,
    },
    valueText: {
        fontSize: 16,
        color: "#333",
        fontFamily: font.HindSiliguri,
        fontWeight: "500",
    },
    noteInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: font.HindSiliguri,
        color: "#333",
        minHeight: 40,
    },
    footer: {
        padding: 16,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#eee",
    },
    submitButton: {
        backgroundColor: "#000", // Update button color if needed, keep black for consistency for now
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
    },
    submitButtonText: {
        color: "#fff",
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