import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Dropdown, DropdownItem } from "@/components/dropdown";
import { font } from "@/utils/constant";
import { useWalletStore } from "@/utils/store/wallet.store";
import * as ImagePicker from 'expo-image-picker';
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import {
    Banknote,
    CreditCard,
    Image as ImageIcon,
    Landmark,
    X
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    ToastAndroid,
    View,
    Platform,
    Alert
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useModeToggle } from "@/hooks/useModeToggler";
import { Colors } from "@/theme/colors";

export default function CreateWallet() {
    const { isDark } = useModeToggle();
    const activeColors = isDark ? Colors.dark : Colors.light;
    const styles = useMemo(() => createStyles(activeColors, isDark), [activeColors, isDark]);

    const walletTypes: DropdownItem<string>[] = useMemo(() => [
        { label: 'Cash', value: 'Cash', icon: <Banknote size={20} color={activeColors.purple} /> },
        { label: 'Bank Account', value: 'Bank', icon: <Landmark size={20} color={activeColors.blue} /> },
        { label: 'Credit Card', value: 'Credit', icon: <CreditCard size={20} color={activeColors.orange} /> },
    ], [activeColors]);

    const [name, setName] = useState("");
    const [type, setType] = useState("Cash");
    const [initialBalance, setInitialBalance] = useState("0");
    const [avatar, setAvatar] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const db = useSQLiteContext();
    const { addWallet } = useWalletStore();

    const showToast = (message: string) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            Alert.alert(message);
        }
    };

    const handleCreate = async () => {
        if (!name.trim()) {
            showToast("Please provide a wallet name");
            return;
        }

        setLoading(true);
        try {
            await addWallet({
                name: name.trim(),
                avatar: avatar ?? undefined,
                type,
                initial_amount: parseFloat(initialBalance) || 0,
                db
            });
            showToast("Wallet created successfully");
            router.back();
        } catch (error) {
            console.log(error);
            showToast("Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setAvatar(result.assets[0].uri);
        }
    };

    return (
        <View style={styles.container}>
            <KeyboardAwareScrollView
                contentContainerStyle={styles.scrollContent}
                bottomOffset={40}
                showsVerticalScrollIndicator={false}
            >
                {/* Visuals Selection (Avatar) */}
                <View style={styles.avatarSection}>
                    <Pressable onPress={pickImage} style={styles.avatarPicker}>
                        {avatar ? (
                            <View style={styles.avatarWrapper}>
                                <Image source={{ uri: avatar }} style={styles.avatarImage} />
                                <Pressable
                                    style={styles.removeAvatar}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        setAvatar(null);
                                    }}
                                >
                                    <X size={16} color="#fff" />
                                </Pressable>
                            </View>
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <ImageIcon size={32} color={activeColors.blue} />
                                <Text style={styles.avatarPlaceholderText}>Add Photo</Text>
                            </View>
                        )}
                    </Pressable>
                </View>

                {/* Identity Group */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Identity</Text>
                    <View style={styles.card}>
                        <Input
                            label="Wallet Name"
                            placeholder="e.g. Salary Account"
                            value={name}
                            onChangeText={setName}
                            style={styles.input}
                        />
                        <View style={{ marginTop: 16 }}>
                            <Dropdown
                                label="Wallet Type"
                                data={walletTypes}
                                value={type}
                                onChange={setType}
                                style={styles.input}
                            />
                        </View>
                    </View>
                </View>

                {/* Financial Status Group */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Financial Status</Text>
                    <View style={styles.card}>
                        <Input
                            label="Initial Balance (৳)"
                            placeholder="0.00"
                            value={initialBalance}
                            onChangeText={setInitialBalance}
                            keyboardType="numeric"
                            style={styles.input}
                        />
                        <Text style={styles.helperText}>
                            This is the starting amount in your wallet.
                        </Text>
                    </View>
                </View>

                <View style={styles.spacer} />
            </KeyboardAwareScrollView>

            {/* Fixed Footer Button */}
            <View style={styles.footer}>
                <Button
                    onPress={handleCreate}
                    loading={loading}
                    disabled={!name.trim()}
                    style={styles.createButton}
                >
                    <Text style={styles.createButtonText}>
                        Create Wallet
                    </Text>
                </Button>
            </View>
        </View>
    );
}

const createStyles = (activeColors: typeof Colors.light, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    avatarSection: {
        alignItems: "center",
        marginBottom: 24,
    },
    avatarPicker: {
        width: 100,
        height: 100,
        borderRadius: 24,
        backgroundColor: activeColors.card,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: activeColors.border,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    avatarWrapper: {
        width: "100%",
        height: "100%",
        borderRadius: 24,
        overflow: "hidden",
    },
    avatarImage: {
        width: "100%",
        height: "100%",
    },
    removeAvatar: {
        position: "absolute",
        top: 6,
        right: 6,
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: 12,
        padding: 4,
    },
    avatarPlaceholder: {
        alignItems: "center",
    },
    avatarPlaceholderText: {
        fontSize: 12,
        color: activeColors.blue,
        fontWeight: "600",
        marginTop: 4,
        fontFamily: font.HindSiliguri,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: "600",
        color: activeColors.textMuted,
        textTransform: "uppercase",
        marginBottom: 8,
        marginLeft: 4,
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: activeColors.card,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: activeColors.border,
    },
    helperText: {
        fontSize: 13,
        color: activeColors.textMuted,
        marginTop: 10,
        fontFamily: font.HindSiliguri,
        lineHeight: 18,
    },
    spacer: {
        height: 40,
    },
    input: {
        fontFamily: font.HindSiliguri,
        borderWidth: 1,
        borderColor: activeColors.border,
        borderRadius: 12,
        padding: 12,
        backgroundColor: activeColors.background,
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: isDark ? 'rgba(28, 28, 30, 0.9)' : "rgba(242, 242, 247, 0.9)",
        borderTopWidth: 1,
        borderTopColor: activeColors.border,
    },
    createButton: {
        borderRadius: 16,
        height: 56,
        backgroundColor: activeColors.indigo,
        alignItems: "center",
        justifyContent: "center",
    },
    createButtonText: {
        color: activeColors.foreground,
        fontSize: 16,
        fontWeight: "600",
        fontFamily: font.HindSiliguri,
    },
});