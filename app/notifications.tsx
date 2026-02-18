import { font } from "@/utils/constant";
import { router } from "expo-router";
import {
    Bell,
    BellOff,
    CheckCheck,
    Circle,
    Clock,
    CreditCard,
    Info,
    Trash2,
    TrendingUp
} from "lucide-react-native";
import React, { useState, useMemo } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    View,
    SectionList,
    Platform
} from "react-native";
import { useModeToggle } from "@/hooks/useModeToggler";
import { Colors } from "@/theme/colors";

interface Notification {
    id: string;
    type: 'transaction' | 'budget' | 'system' | 'reminder';
    title: string;
    message: string;
    time: string;
    isRead: boolean;
}

const MOCK_NOTIFICATIONS: { title: string; data: Notification[] }[] = [
    {
        title: "Today",
        data: [
            {
                id: "1",
                type: "transaction",
                title: "New Transaction",
                message: "A new expense of ৳1,200 was added to your personal wallet.",
                time: "2 mins ago",
                isRead: false,
            },
            {
                id: "2",
                type: "budget",
                title: "Budget Alert",
                message: "You have spent 80% of your monthly food budget.",
                time: "1 hour ago",
                isRead: false,
            },
        ],
    },
    {
        title: "Yesterday",
        data: [
            {
                id: "3",
                type: "reminder",
                title: "Daily Summary",
                message: "Don't forget to log your evening expenses!",
                time: "Yesterday, 9:00 PM",
                isRead: true,
            },
        ],
    },
    {
        title: "Older",
        data: [
            {
                id: "4",
                type: "system",
                title: "App Update",
                message: "Version 2.0 is now available with new analytics features.",
                time: "3 days ago",
                isRead: true,
            },
        ],
    },
];

export default function Notifications() {
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const { isDark } = useModeToggle();
    const activeColors = isDark ? Colors.dark : Colors.light;

    const styles = useMemo(() => createStyles(activeColors), [activeColors]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'transaction': return <CreditCard size={20} color={activeColors.blue} />;
            case 'budget': return <TrendingUp size={20} color={activeColors.orange} />;
            case 'reminder': return <Clock size={20} color={activeColors.indigo} />;
            case 'system': return <Info size={20} color={activeColors.textMuted} />;
            default: return <Bell size={20} color={activeColors.blue} />;
        }
    };

    const markAllRead = () => {
        const updated = notifications.map(section => ({
            ...section,
            data: section.data.map(item => ({ ...item, isRead: true }))
        }));
        setNotifications(updated);
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const renderItem = ({ item }: { item: Notification }) => (
        <Pressable
            style={[styles.notificationItem, !item.isRead && styles.unreadItem]}
            onPress={() => {
                // Logic to mark single as read
                const updated = notifications.map(section => ({
                    ...section,
                    data: section.data.map(n => n.id === item.id ? { ...n, isRead: true } : n)
                }));
                setNotifications(updated);
            }}
        >
            <View style={styles.iconContainer}>
                {getIcon(item.type)}
            </View>
            <View style={styles.contentContainer}>
                <View style={styles.itemHeader}>
                    <Text style={[styles.itemTitle, !item.isRead && styles.boldText]}>{item.title}</Text>
                    {!item.isRead && <Circle size={8} color={activeColors.blue} fill={activeColors.blue} />}
                </View>
                <Text style={styles.itemMessage} numberOfLines={2}>{item.message}</Text>
                <Text style={styles.itemTime}>{item.time}</Text>
            </View>
        </Pressable>
    );

    const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header Actions */}
            <View style={styles.topActions}>
                <Pressable onPress={markAllRead} style={styles.actionBtn}>
                    <CheckCheck size={18} color={activeColors.blue} />
                    <Text style={[styles.actionText, { color: activeColors.blue }]}>Mark all read</Text>
                </Pressable>
                <Pressable onPress={clearAll} style={styles.actionBtn}>
                    <Trash2 size={18} color={activeColors.red} />
                    <Text style={[styles.actionText, { color: activeColors.red }]}>Clear all</Text>
                </Pressable>
            </View>

            {notifications.length > 0 ? (
                <SectionList
                    sections={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    renderSectionHeader={renderSectionHeader}
                    stickySectionHeadersEnabled={false}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconCircle}>
                        <BellOff size={48} color={activeColors.textMuted} />
                    </View>
                    <Text style={styles.emptyTitle}>All caught up!</Text>
                    <Text style={styles.emptySubtitle}>You have no new notifications at the moment.</Text>
                </View>
            )}
        </View>
    );
}

const createStyles = (activeColors: typeof Colors.light) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: activeColors.background,
    },
    topActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: activeColors.card,
        borderBottomWidth: 1,
        borderBottomColor: activeColors.border,
    },
    actionBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    actionText: {
        fontSize: 13,
        fontWeight: "600",
        fontFamily: font.HindSiliguri,
    },
    listContent: {
        paddingBottom: 40,
    },
    sectionHeader: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: activeColors.background,
    },
    sectionHeaderText: {
        fontSize: 13,
        fontWeight: "700",
        color: activeColors.textMuted,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    notificationItem: {
        flexDirection: "row",
        padding: 16,
        backgroundColor: activeColors.card,
        marginHorizontal: 16,
        borderRadius: 16,
        marginBottom: 10,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    unreadItem: {
        borderLeftWidth: 4,
        borderLeftColor: activeColors.blue,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: activeColors.background,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    contentContainer: {
        flex: 1,
    },
    itemHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    itemTitle: {
        fontSize: 16,
        color: activeColors.text,
        fontFamily: font.HindSiliguri,
    },
    boldText: {
        fontWeight: "700",
    },
    itemMessage: {
        fontSize: 14,
        color: activeColors.text,
        fontFamily: font.HindSiliguri,
        lineHeight: 20,
        marginBottom: 4,
        opacity: 0.8,
    },
    itemTime: {
        fontSize: 12,
        color: activeColors.textMuted,
        fontFamily: font.HindSiliguri,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: activeColors.card,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: activeColors.text,
        fontFamily: font.HindSiliguri,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 15,
        color: activeColors.textMuted,
        fontFamily: font.HindSiliguri,
        textAlign: "center",
    },
});
