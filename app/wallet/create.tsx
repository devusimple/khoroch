import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import { StyleSheet, ToastAndroid, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useWalletStore } from "@/utils/store/wallet.store";
import { router } from "expo-router";

export default function CreateWallet() {
    const [name, setName] = useState("");
    const [balance, setBalance] = useState<number | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const db = useSQLiteContext()
    const { addWallet } = useWalletStore()

    const handleCreate = async () => {
        setLoading(true);
        if (!name || !balance) {
            ToastAndroid.show("Please fill all the fields", ToastAndroid.SHORT);
            return;
        }
        try {
            await addWallet({ name, type: "cash", icon: "💰", initial_amount: balance, db })
            ToastAndroid.show("Wallet created successfully", ToastAndroid.SHORT);
            router.back();
        } catch (error) {
            console.log(error)
            ToastAndroid.show("Somthing went wrong!", ToastAndroid.SHORT)
        } finally {
            setLoading(false);
            setBalance(0);
            setName("")
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
                <Input
                    label="Initial Balance"
                    placeholder="0.00"
                    keyboardType="numeric"
                    onChangeText={(text) => setBalance(parseInt(text))}
                />
            </View>

            <View style={styles.footer}>
                <Button
                    onPress={handleCreate}
                    loading={loading}
                    disabled={!name || !balance}
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
});