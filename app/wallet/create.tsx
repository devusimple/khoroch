import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { font } from "@/utils/constant";
import { useWalletStore } from "@/utils/store/wallet.store";
import * as ImagePicker from 'expo-image-picker';
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { Paperclip, X } from "lucide-react-native";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, ToastAndroid, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

export default function CreateWallet() {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [avatar, setAvatar] = useState<string | null>(null);
    const db = useSQLiteContext()
    const { addWallet } = useWalletStore()

    const handleCreate = async () => {
        setLoading(true);
        if (!name) {
            ToastAndroid.show("Please fill all the fields", ToastAndroid.SHORT);
            return;
        }
        try {
            await addWallet({ name, avatar: avatar ?? undefined, db })
            ToastAndroid.show("Wallet created successfully", ToastAndroid.SHORT);
            router.back();
        } catch (error) {
            console.log(error)
            ToastAndroid.show("Somthing went wrong!", ToastAndroid.SHORT)
        } finally {
            setLoading(false);
            setName("")
            setAvatar(null);
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
            setAvatar(result.assets[0].uri);
        }
    };

    return (
        <KeyboardAwareScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            bottomOffset={20}
        >
            <View style={styles.form}>
                <Input
                    label="Wallet Name"
                    placeholder="e.g. Personal Savings"
                    value={name}
                    onChangeText={setName}
                />
                {/* Attachment Picker */}
                <View style={styles.inputRow}>
                    <View style={styles.iconContainer}>
                        <Paperclip size={20} color="#555" />
                    </View>
                    <View style={styles.inputContent}>
                        <Text style={styles.label}>Wallet Avatar (Optional)</Text>
                        {avatar ? (
                            <View style={styles.attachmentPreview}>
                                <Pressable onPress={() => setAvatar(null)} style={styles.removeAttachment}>
                                    <X size={14} color="#fff" />
                                </Pressable>
                                <Image source={{ uri: avatar }} style={styles.attachmentImage} />
                            </View>
                        ) : (
                            <Pressable onPress={pickImage}>
                                <Text style={[styles.valueText, { color: "#007AFF" }]}>Open Gallery</Text>
                            </Pressable>
                        )}
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <Button
                    onPress={handleCreate}
                    loading={loading}
                    disabled={!name}
                >
                    Create Wallet
                </Button>
            </View>
        </KeyboardAwareScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    content: {
        flexGrow: 1,
        padding: 20,
    },
    form: {
        gap: 20,
        flex: 1,
    },
    footer: {
        marginTop: 20,
        marginBottom: 20,
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