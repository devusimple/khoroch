import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import { StyleSheet, ToastAndroid, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useLocalSearchParams } from "expo-router";
import { useWalletStore } from "@/utils/store/wallet.store";

export default function UpdateWallet() {
    const [name, setName] = useState("");
    const [initial_amount, setInitialAmount] = useState<number | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const db = useSQLiteContext()
    const { updateWallet } = useWalletStore();
    const { id: walletId } = useLocalSearchParams();

    const handleUpdate = async () => {
        setLoading(true);
        if (!name || !initial_amount) {
            ToastAndroid.show("Please fill all the fields", ToastAndroid.SHORT);
            return;
        }
        try {
            await updateWallet({ db, id: parseInt(walletId as string), initial_amount, name, type: "Cash", icon: "" });
            ToastAndroid.show("Wallet updated successfully", ToastAndroid.SHORT);
        } catch (error) {
            console.log(error)
            ToastAndroid.show("Somthing went wrong!", ToastAndroid.SHORT)
        } finally {
            setLoading(false);
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
                    onChangeText={(text) => setInitialAmount(parseInt(text))}
                />
            </View>

            <View style={styles.footer}>
                <Button
                    onPress={handleUpdate}
                    loading={loading}
                    disabled={!name || !initial_amount}
                >
                    Update Wallet
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