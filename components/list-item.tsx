import { Transaction, Wallet } from "@/types";
import { font } from "@/utils/constant";
import { router } from "expo-router";
import { Calendar, Edit2, Eye, MoreVertical, Share2, Trash2, WalletIcon } from "lucide-react-native";
import { useEffect, useRef, useState, useMemo } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import Popover, { PopoverItem } from "./popover";

import { useTransactionStore } from "@/utils/store/transaction.store";
import { useWalletStore } from "@/utils/store/wallet.store";
import { useSQLiteContext } from "expo-sqlite";
import { useModeToggle } from "@/hooks/useModeToggler";
import { Colors } from "@/theme/colors";


export default function TransactionCard({ item }: { item: Transaction }) {
    const db = useSQLiteContext()
    const { isDark } = useModeToggle();
    const activeColors = isDark ? Colors.dark : Colors.light;
    const styles = useMemo(() => createStyles(activeColors, isDark), [activeColors, isDark]);

    const [popoverVisible, setPopoverVisible] = useState(false);
    const [popoverAnchor, setPopoverAnchor] = useState<{ x: number, y: number, width: number, height: number, pageX: number, pageY: number } | null>(null);
    const iconRef = useRef<View>(null);
    const { getWalletById } = useWalletStore();
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const { deleteTransaction } = useTransactionStore();

    const loadWallet = async () => {
        const res = await getWalletById({ id: item.wallet_id, db })
        setWallet(res)
    }

    useEffect(() => {
        loadWallet()
    }, [db, item.wallet_id])

    const handleOptionsPress = () => {
        iconRef.current?.measure((x, y, width, height, pageX, pageY) => {
            setPopoverAnchor({ x, y, width, height, pageX, pageY });
            setPopoverVisible(true);
        });
    };

    const handleDelete = async () => {
        Alert.alert("Are you sure?", "This action will permanently delete the transaction.",
            [
                {
                    style: 'destructive', text: "Delete", isPreferred: false,
                    onPress: async () => {
                        await deleteTransaction({ id: item.id, db });
                    }
                },
                {
                    style: 'cancel', text: "Cancel", isPreferred: true
                }
            ], { cancelable: true })
        setPopoverVisible(false);
    }

    const getCardBackground = () => {
        if (item.type === "expense") return activeColors.red + '10';
        if (item.type === "income") return activeColors.green + '10';
        return activeColors.card;
    };

    return (
        <View style={styles.container}>
            <View style={[styles.card, { backgroundColor: getCardBackground() }]}>
                <View style={styles.header}>
                    <View style={styles.titleWrapper}>
                        <Text style={styles.titleText} numberOfLines={2}>
                            {item.note}
                        </Text>
                    </View>
                    <Text style={[styles.amountText, { color: item.type === "income" ? activeColors.green : activeColors.red }]}>
                        {item.type === "income" ? '+' : '-'} ৳ {item.amount.toLocaleString()}
                    </Text>
                    <View ref={iconRef} collapsable={false}>
                        <Pressable onPress={handleOptionsPress} hitSlop={10}>
                            <MoreVertical size={20} color={activeColors.textMuted} strokeWidth={1.5} />
                        </Pressable>
                    </View>
                </View>

                <View style={styles.footer}>
                    <View style={styles.metaItem}>
                        <Calendar strokeWidth={1.5} size={12} color={activeColors.textMuted} />
                        <Text style={styles.metaText}>{new Date(item.date * 1000).toLocaleDateString("en", { day: "2-digit", month: "short", year: "numeric" })}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <WalletIcon strokeWidth={1.5} size={12} color={activeColors.textMuted} />
                        <Text style={styles.metaText}>{wallet?.name}</Text>
                    </View>
                </View>
            </View>

            <Popover
                isVisible={popoverVisible}
                onClose={() => setPopoverVisible(false)}
                fromRect={popoverAnchor}
            >
                <PopoverItem
                    label="Edit"
                    icon={Edit2}
                    onPress={() => {
                        setPopoverVisible(false);
                        router.push({
                            pathname: "/transaction/update",
                            params: {
                                id: item.id
                            }
                        });
                    }}
                />
                <PopoverItem
                    label="Share"
                    icon={Share2}
                    onPress={() => {
                        setPopoverVisible(false);
                        console.log("Share pressed");
                    }}
                />
                <PopoverItem
                    label="View"
                    icon={Eye}
                    variant="default"
                    onPress={() => {
                        setPopoverVisible(false);
                        router.push({
                            pathname: "/transaction/[id]",
                            params: {
                                id: item.id
                            }
                        });
                    }}
                />
                <PopoverItem
                    label="Delete"
                    icon={Trash2}
                    variant="danger"
                    onPress={handleDelete}
                />
            </Popover>
        </View>
    );
}

const createStyles = (activeColors: typeof Colors.light, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        marginVertical: 4,
    },
    card: {
        padding: 12,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: activeColors.border,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    titleWrapper: {
        flexGrow: 1,
        flexShrink: 1,
    },
    titleText: {
        fontSize: 14,
        fontFamily: font.HindSiliguri,
        color: activeColors.text,
        fontWeight: "500",
    },
    amountText: {
        fontSize: 16,
        paddingHorizontal: 8,
        fontWeight: "700",
        fontFamily: font.HindSiliguri,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 4,
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    metaText: {
        fontSize: 11,
        color: activeColors.textMuted,
        fontFamily: font.HindSiliguri,
    },
});
