import DateTimePicker from "@/components/date-time-picker";
import DefaultWalletSelector from "@/components/default-wallet";
import { font } from "@/utils/constant";
import { useTransactionStore } from "@/utils/store/transaction.store";
import { useWalletStore } from "@/utils/store/wallet.store";
import * as Print from 'expo-print';
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import {
    Calendar,
    ChevronRight,
    Download,
    FileText,
    HelpCircle,
    Info,
    Moon,
    Settings as SettingsIcon,
    User,
    Wallet,
    Sun,
    Monitor,
    Database,
    Upload
} from "lucide-react-native";
import { useEffect, useState, useMemo } from "react";
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { exportDatabaseToJson, restoreDatabaseFromJson } from "@/utils/db/database.backup";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    ActivityIndicator
} from "react-native";
import { useModeToggle } from "@/hooks/useModeToggler";
import { Colors } from "@/theme/colors";

export default function Settings() {
    const db = useSQLiteContext();
    const { isDark, mode, toggleMode } = useModeToggle();
    const activeColors = isDark ? Colors.dark : Colors.light;
    const styles = useMemo(() => createStyles(activeColors, isDark), [activeColors, isDark]);

    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const { getTransactions, transactions } = useTransactionStore();
    const { wallets, getWallets } = useWalletStore();

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const html = createHTML(date);
            const { uri } = await Print.printToFileAsync({ html });
            // await Print.printAsync({ html, width: 595, height: 842 });
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
            } else {
                Alert.alert("Success", "PDF generated at: " + uri);
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to export PDF.");
        } finally {
            setIsExporting(false);
        }
    };

    const handleBackup = async () => {
        try {
            const data = await exportDatabaseToJson(db);
            const jsonString = JSON.stringify(data, null, 2);
            const filename = `khoroch_backup_${new Date().getTime()}.json`;
            const fileUri = `${FileSystem.documentDirectory}${filename}`;

            await FileSystem.writeAsStringAsync(fileUri, jsonString);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            } else {
                Alert.alert("Success", "Backup saved at: " + fileUri);
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to create backup.");
        }
    };

    const handleRestore = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true
            });

            if (result.canceled) return;

            const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
            const backupData = JSON.parse(fileContent);

            Alert.alert(
                "Restore Backup",
                "This will replace all your current data with the backup data. Are you sure?",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Restore",
                        style: "destructive",
                        onPress: async () => {
                            try {
                                await restoreDatabaseFromJson(db, backupData);
                                // Refresh Stores
                                await getWallets(db);
                                await getTransactions({ date, db, limit: 10000 });
                                Alert.alert("Success", "Database restored successfully!");
                            } catch (e) {
                                console.error(e);
                                Alert.alert("Error", "Failed to restore database. Invalid format.");
                            }
                        }
                    }
                ]
            );
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to import backup.");
        }
    };

    const createHTML = (selectedDate: Date) => {
        const monthYear = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        getWallets(db);
        const rows = transactions.map(t => `
            <tr>
                <td>${new Date(t.date * 1000).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td>${t.note}</td>
                <td style="color: ${t.type === 'income' ? 'green' : 'red'}">${t.type}</td>
                <td style="text-align: right;">${wallets.find(w => w.id === t.wallet_id)?.name}</td>
                <td style="text-align: right;">${t.amount}</td>
            </tr>
        `).join('');

        return `
            <html>
            <head>
                <style>
                    body { font-family: 'Helvetica', sans-serif; padding: 20px; }
                    h1 { text-align: center; color: #333; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background-color: #f2f2f2; color: #333; }
                    .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #888; }
                </style>
            </head>
            <body>
                    <h1>Transaction Report</h1>
                    <h3 style="text-align: center;">${monthYear}</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Note</th>
                            <th>Type</th>
                            <th>Wallet</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>

                <div class="footer">
                    Generated by KHOROCH APP
                    <p>Print Date: ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
            </body>
            </html>
        `;
    }

    useEffect(() => {
        getTransactions({ date, db, limit: 10000 });
    }, [date]);

    const getThemeIcon = () => {
        switch (mode) {
            case 'light': return <Sun size={20} color={activeColors.orange} />;
            case 'dark': return <Moon size={20} color={activeColors.indigo} />;
            default: return <Monitor size={20} color={activeColors.blue} />;
        }
    };

    const getThemeLabel = () => {
        return mode.charAt(0).toUpperCase() + mode.slice(1);
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Profile Header */}
                <View style={styles.header}>
                    <View style={styles.profileSection}>
                        <View style={styles.avatarContainer}>
                            <User size={40} color={activeColors.textMuted} />
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.userName}>Khoroch User</Text>
                            <Text style={styles.userSub}>Free Account</Text>
                        </View>
                        <Pressable style={styles.premiumBadge}>
                            <Text style={styles.premiumText}>Go Pro</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Backup & Restore Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Data Management</Text>
                    <View style={styles.cardGroup}>
                        <SettingsItem
                            icon={<Download size={20} color={activeColors.indigo} />}
                            label="Export as JSON"
                            subLabel="Local backup of all your data"
                            onPress={handleBackup}
                            activeColors={activeColors}
                        />
                        <SettingsItem
                            icon={<Upload size={20} color={activeColors.orange} />}
                            label="Import from JSON"
                            subLabel="Restore from local backup"
                            onPress={handleRestore}
                            activeColors={activeColors}
                        />
                        <SettingsItem
                            icon={<FileText size={20} color={activeColors.green} />}
                            label="Transaction PDF"
                            subLabel="Download monthly report"
                            onPress={() => setShowDatePicker(true)}
                            activeColors={activeColors}
                        />
                    </View>
                </View>

                {/* Management Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Asset Management</Text>
                    <View style={styles.cardGroup}>
                        <SettingsItem
                            icon={<Wallet size={20} color={activeColors.blue} />}
                            label="Wallets"
                            subLabel="Manage your accounts"
                            onPress={() => router.navigate('/wallet')}
                            activeColors={activeColors}
                        />
                    </View>
                </View>

                {/* Preferences Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>
                    <View style={styles.cardGroup}>
                        <View style={styles.settingItem}>
                            <View style={styles.itemIconLabel}>
                                <View style={styles.iconBox}>
                                    <Wallet size={20} color={activeColors.indigo} />
                                </View>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={styles.itemLabel}>Default Wallet</Text>
                                    <DefaultWalletSelector />
                                </View>
                            </View>
                        </View>
                        <SettingsItem
                            icon={getThemeIcon()}
                            label="Theme Mode"
                            subLabel={getThemeLabel()}
                            onPress={toggleMode}
                            showArrow={false}
                            activeColors={activeColors}
                        />
                    </View>
                </View>

                {/* Resources Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Resources</Text>
                    <View style={styles.cardGroup}>
                        <SettingsItem
                            icon={<HelpCircle size={20} color={activeColors.orange} />}
                            label="Help & Support"
                            onPress={() => { }}
                            activeColors={activeColors}
                        />
                        <SettingsItem
                            icon={<Info size={20} color={activeColors.textMuted} />}
                            label="About"
                            onPress={() => { }}
                            activeColors={activeColors}
                        />
                    </View>
                </View>

                <View style={styles.footerInfo}>
                    <Text style={styles.versionText}>Khoroch v1.2.0</Text>
                    <Text style={styles.footerNote}>Made with ❤️ for financial freedom</Text>
                    <Text style={styles.footerNote}>Privacy Policy | Terms of Service</Text>
                </View>
            </ScrollView>

            <DateTimePicker
                isVisible={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                onConfirm={(selectedDate) => {
                    setDate(selectedDate);
                    setTimeout(() => handleExport(), 500);
                }}
                initialDate={date}
                mode="date"
            />

            {isExporting && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={activeColors.blue} />
                    <Text style={[styles.loadingText, { color: activeColors.blue }]}>Preparing Report...</Text>
                </View>
            )}
        </View>
    );
}

function SettingsItem({ icon, label, subLabel, onPress, showArrow = true, activeColors }: any) {
    const itemStyles = createItemStyles(activeColors);
    return (
        <Pressable style={({ pressed }) => [itemStyles.settingItem, pressed && itemStyles.itemPressed]} onPress={onPress}>
            <View style={itemStyles.itemIconLabel}>
                <View style={itemStyles.iconBox}>
                    {icon}
                </View>
                <View style={itemStyles.itemTextContent}>
                    <Text style={itemStyles.itemLabel}>{label}</Text>
                    {subLabel && <Text style={itemStyles.itemSubLabel}>{subLabel}</Text>}
                </View>
            </View>
            {showArrow && <ChevronRight size={18} color={activeColors.border} />}
        </Pressable>
    );
}

const createItemStyles = (activeColors: any) => StyleSheet.create({
    settingItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: activeColors.card,
        borderBottomWidth: 1,
        borderBottomColor: activeColors.background,
    },
    itemPressed: {
        backgroundColor: activeColors.background,
    },
    itemIconLabel: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: activeColors.background,
        justifyContent: "center",
        alignItems: "center",
    },
    itemTextContent: {
        marginLeft: 12,
    },
    itemLabel: {
        fontSize: 16,
        color: activeColors.text,
        fontFamily: font.HindSiliguri,
    },
    itemSubLabel: {
        fontSize: 12,
        color: activeColors.textMuted,
        fontFamily: font.HindSiliguri,
        marginTop: 1,
    },
});

const createStyles = (activeColors: typeof Colors.light, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: activeColors.background,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        backgroundColor: activeColors.card,
        paddingTop: 36,
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomWidth: 0,
        borderBottomColor: activeColors.border,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    profileSection: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatarContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: activeColors.background,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: activeColors.border,
    },
    profileInfo: {
        flex: 1,
        marginLeft: 16,
    },
    userName: {
        fontSize: 22,
        fontWeight: "bold",
        fontFamily: font.HindSiliguri,
        color: activeColors.text,
    },
    userSub: {
        fontSize: 14,
        color: activeColors.textMuted,
        fontFamily: font.HindSiliguri,
        marginTop: 2,
    },
    premiumBadge: {
        backgroundColor: activeColors.yellow,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    premiumText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#000",
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 20,
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
    cardGroup: {
        backgroundColor: activeColors.card,
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: activeColors.border,
    },
    settingItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: activeColors.card,
        borderBottomWidth: 1,
        borderBottomColor: activeColors.background,
    },
    itemIconLabel: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: activeColors.background,
        justifyContent: "center",
        alignItems: "center",
    },
    itemLabel: {
        fontSize: 16,
        color: activeColors.text,
        fontFamily: font.HindSiliguri,
    },
    footerInfo: {
        marginTop: 40,
        alignItems: "center",
    },
    versionText: {
        fontSize: 14,
        color: activeColors.border,
        fontWeight: "600",
    },
    footerNote: {
        fontSize: 12,
        color: activeColors.textMuted,
        marginTop: 4,
        fontFamily: font.HindSiliguri,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        fontFamily: font.HindSiliguri,
        fontWeight: '500',
    },
});