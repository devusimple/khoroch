import { Transaction, Wallet } from "@/types";
import { font } from "@/utils/constant";
import { useTransactionStore } from "@/utils/store/transaction.store";
import { useWalletStore } from "@/utils/store/wallet.store";
import { useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { ArrowDownCircle, ArrowUpCircle, Calendar, FileText, Tag, Wallet as WalletIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

export default function TransactionDetails() {
    const { id } = useLocalSearchParams();
    const db = useSQLiteContext();
    const { getTransaction } = useTransactionStore();
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const { getWalletById } = useWalletStore();

    useEffect(() => {
        if (id) {
            getTransaction({ id: Number(id), db }).then(async (res) => {
                setTransaction(res);
                if (res?.wallet_id) {
                    const w = await getWalletById({ db, id: res.wallet_id });
                    setWallet(w);
                }
            });
        }
    }, [db, id]);

    if (!transaction) return null;

    const isExpense = transaction.type === "expense";
    const isIncome = transaction.type === "income";
    const date = new Date(transaction.date * 1000);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
            {/* Amount Card */}
            <View style={[styles.amountCard, isExpense ? styles.expenseBg : styles.incomeBg]}>
                <View style={styles.typeIconContainer}>
                    {isExpense ? (
                        <ArrowDownCircle color="#fff" size={32} strokeWidth={1.5} />
                    ) : (
                        <ArrowUpCircle color="#fff" size={32} strokeWidth={1.5} />
                    )}
                </View>
                <Text style={styles.amountLabel}>{transaction.type.toUpperCase()}</Text>
                <Text style={styles.amountText}>
                    {isExpense ? "-" : "+"} ৳{transaction.amount.toLocaleString()}
                </Text>
            </View>

            {/* Details Section */}
            <View style={styles.detailsContainer}>
                <DetailItem
                    icon={<WalletIcon size={20} color="#666" strokeWidth={1.5} />}
                    label="Wallet"
                    value={wallet?.name || "Unknown Wallet"}
                />
                <DetailItem
                    icon={<Calendar size={20} color="#666" strokeWidth={1.5} />}
                    label="Date"
                    value={date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                />
                <DetailItem
                    icon={<Tag size={20} color="#666" strokeWidth={1.5} />}
                    label="Category"
                    value={"General"} // Placeholder until category fetching is implemented
                />
                {transaction.note && (
                    <View style={styles.noteSection}>
                        <View style={styles.noteHeader}>
                            <FileText size={20} color="#666" strokeWidth={1.5} />
                            <Text style={styles.noteLabel}>Note</Text>
                        </View>
                        <Text style={styles.noteText}>{transaction.note}</Text>
                    </View>
                )}

                {transaction.attachment && (
                    <View style={styles.attachmentSection}>
                        <Text style={styles.attachmentLabel}>Attachment</Text>
                        <Image source={{ uri: transaction.attachment }} style={styles.attachmentImage} resizeMode="cover" />
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

function DetailItem({ icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <View style={styles.detailItem}>
            <View style={styles.detailIconLabel}>
                {icon}
                <Text style={styles.detailLabel}>{label}</Text>
            </View>
            <Text style={styles.detailValue}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FA",
    },
    contentContainer: {
        padding: 20,
    },
    amountCard: {
        borderRadius: 24,
        padding: 30,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    expenseBg: {
        backgroundColor: "#FF4B4B",
    },
    incomeBg: {
        backgroundColor: "#00C853",
    },
    typeIconContainer: {
        marginBottom: 12,
    },
    amountLabel: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 12,
        fontFamily: font.HindSiliguri,
        letterSpacing: 1,
        marginBottom: 4,
    },
    amountText: {
        color: "#fff",
        fontSize: 36,
        fontFamily: font.HindSiliguri,
        fontWeight: "bold",
    },
    detailsContainer: {
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 20,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    detailItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F3F5",
    },
    detailIconLabel: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    detailLabel: {
        fontSize: 16,
        color: "#495057",
        fontFamily: font.HindSiliguri,
    },
    detailValue: {
        fontSize: 16,
        color: "#212529",
        fontWeight: "600",
        fontFamily: font.HindSiliguri,
    },
    noteSection: {
        marginTop: 20,
    },
    noteHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 8,
    },
    noteLabel: {
        fontSize: 16,
        color: "#495057",
        fontFamily: font.HindSiliguri,
    },
    noteText: {
        fontSize: 15,
        color: "#666",
        lineHeight: 22,
        fontFamily: font.HindSiliguri,
        backgroundColor: "#F8F9FA",
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#E9ECEF",
    },
    attachmentSection: {
        marginTop: 24,
    },
    attachmentLabel: {
        fontSize: 16,
        color: "#495057",
        fontFamily: font.HindSiliguri,
        marginBottom: 12,
    },
    attachmentImage: {
        width: "100%",
        height: 200,
        borderRadius: 16,
    },
});