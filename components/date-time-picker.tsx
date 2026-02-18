import { font } from '@/utils/constant';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Dimensions,
    Modal,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useModeToggle } from '@/hooks/useModeToggler';
import { Colors } from '@/theme/colors';

// --- Types ---
type DateTimePickerProps = {
    isVisible: boolean;
    mode?: 'date' | 'time' | 'datetime';
    onConfirm: (date: Date) => void;
    onClose: () => void;
    initialDate?: Date;
    primaryColor?: string;
};

// --- Constants ---
const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5; // e.g. 2 above, 1 center, 2 below
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// --- Helper Components ---

type WheelProps = {
    items: string[];
    selectedIndex: number;
    onChange: (index: number) => void;
    width?: number | string;
    align?: 'left' | 'center' | 'right';
    activeColors: typeof Colors.light;
};

const WheelPicker = ({ items, selectedIndex, onChange, width = 100, align = 'center', activeColors }: WheelProps) => {
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        if (scrollViewRef.current) {
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({
                    y: selectedIndex * ITEM_HEIGHT,
                    animated: false,
                });
            }, 50);
        }
    }, [selectedIndex]);

    const alignItems: 'flex-start' | 'center' | 'flex-end' =
        align === 'left' ? 'flex-start' :
            align === 'right' ? 'flex-end' :
                'center';

    const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const y = e.nativeEvent.contentOffset.y;
        const index = Math.round(y / ITEM_HEIGHT);
        const clampedIndex = Math.max(0, Math.min(index, items.length - 1));

        if (clampedIndex !== selectedIndex) {
            Haptics.selectionAsync();
            onChange(clampedIndex);
        }
    };

    const paddingVertical = (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2;

    return (
        <View style={{ height: CONTAINER_HEIGHT, width: width as any, overflow: 'hidden' }}>
            <View style={[styles.selectionOverlay, { top: paddingVertical, height: ITEM_HEIGHT, borderColor: activeColors.border }]} pointerEvents="none">
                <View style={[styles.selectionLine, { backgroundColor: activeColors.border }]} />
                <View style={[styles.selectionLine, { position: 'absolute', bottom: 0, backgroundColor: activeColors.border }]} />
            </View>

            <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onMomentumScrollEnd={handleScrollEnd}
                onScrollEndDrag={handleScrollEnd}
                contentContainerStyle={{ paddingVertical: paddingVertical }}
            >
                {items.map((item, index) => {
                    const isSelected = index === selectedIndex;
                    return (
                        <View key={index} style={[styles.wheelItem, { height: ITEM_HEIGHT, justifyContent: 'center', alignItems }]}>
                            <Text style={[
                                styles.wheelText,
                                isSelected
                                    ? [styles.wheelTextSelected, { color: activeColors.text }]
                                    : [styles.wheelTextUnselected, { color: activeColors.textMuted }],
                            ]}>
                                {item}
                            </Text>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
};

export default function DateTimePicker({
    isVisible,
    mode = 'datetime',
    onConfirm,
    onClose,
    initialDate,
    primaryColor,
}: DateTimePickerProps) {
    const { isDark } = useModeToggle();
    const activeColors = isDark ? Colors.dark : Colors.light;
    const themePrimary = primaryColor || activeColors.primary;
    const themedStyles = useMemo(() => createStyles(activeColors, isDark), [activeColors, isDark]);

    const [activeTab, setActiveTab] = useState<'date' | 'time'>(mode === 'time' ? 'time' : 'date');
    const [date, setDate] = useState(initialDate || new Date());

    useEffect(() => {
        if (isVisible) {
            const start = initialDate || new Date();
            setDate(start);
            setActiveTab(mode === 'time' ? 'time' : 'date');
        }
    }, [isVisible]);

    const years = Array.from({ length: 101 }, (_, i) => (new Date().getFullYear() - 50) + i);
    const selectedYearIndex = years.indexOf(date.getFullYear());
    const selectedMonthIndex = date.getMonth();
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const selectedDayIndex = date.getDate() - 1;

    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const currentHour24 = date.getHours();
    const currentHour12 = currentHour24 % 12 === 0 ? 12 : currentHour24 % 12;
    const isPM = currentHour24 >= 12;
    const selectedHourIndex = hours.indexOf(currentHour12);
    const minutes = Array.from({ length: 60 }, (_, i) => i);
    const selectedMinuteIndex = date.getMinutes();
    const amPm = ['AM', 'PM'];
    const selectedAmPmIndex = isPM ? 1 : 0;

    const handleConfirm = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onConfirm(date);
        onClose();
    };

    const onChangeYear = (index: number) => {
        const newYear = years[index];
        const newDate = new Date(date);
        newDate.setFullYear(newYear);
        if (newDate.getMonth() !== date.getMonth()) {
            newDate.setDate(0);
        }
        setDate(newDate);
    };

    const onChangeMonth = (index: number) => {
        const newDate = new Date(date);
        const currentDay = newDate.getDate();
        newDate.setDate(1);
        newDate.setMonth(index);
        const daysInNewMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
        newDate.setDate(Math.min(currentDay, daysInNewMonth));
        setDate(newDate);
    };

    const onChangeDay = (index: number) => {
        const newDay = index + 1;
        const newDate = new Date(date);
        newDate.setDate(newDay);
        setDate(newDate);
    };

    const onChangeHour = (index: number) => {
        const newHour12 = hours[index];
        const newDate = new Date(date);
        let h = newHour12;
        if (isPM && h !== 12) h += 12;
        if (!isPM && h === 12) h = 0;
        newDate.setHours(h);
        setDate(newDate);
    };

    const onChangeMinute = (index: number) => {
        const newDate = new Date(date);
        newDate.setMinutes(index);
        setDate(newDate);
    };

    const onChangeAmPm = (index: number) => {
        const newIsPM = index === 1;
        if (newIsPM === isPM) return;
        const newDate = new Date(date);
        let h = newDate.getHours();
        if (newIsPM) {
            if (h < 12) h += 12;
        } else {
            if (h >= 12) h -= 12;
        }
        newDate.setHours(h);
        setDate(newDate);
    };

    if (!isVisible) return null;

    return (
        <Modal transparent visible={isVisible} animationType="slide" onRequestClose={onClose}>
            <View style={themedStyles.backdrop}>
                <Pressable style={styles.backdropPressable} onPress={onClose} />

                <View style={themedStyles.modalContent}>
                    {/* Header */}
                    <View style={themedStyles.header}>
                        <Pressable onPress={onClose} style={styles.closeBtn}>
                            <Text style={themedStyles.closeBtnText}>Cancel</Text>
                        </Pressable>

                        <View style={themedStyles.tabs}>
                            {mode === 'datetime' ? (
                                <>
                                    <Pressable
                                        onPress={() => setActiveTab('date')}
                                        style={[themedStyles.tabBtn, activeTab === 'date' && themedStyles.tabBtnActive]}
                                    >
                                        <Text style={[themedStyles.tabText, activeTab === 'date' && themedStyles.tabTextActive]}>Date</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => setActiveTab('time')}
                                        style={[themedStyles.tabBtn, activeTab === 'time' && themedStyles.tabBtnActive]}
                                    >
                                        <Text style={[themedStyles.tabText, activeTab === 'time' && themedStyles.tabTextActive]}>Time</Text>
                                    </Pressable>
                                </>
                            ) : (
                                <Text style={themedStyles.singleModeTitle}>{mode === 'date' ? 'Select Date' : 'Select Time'}</Text>
                            )}
                        </View>

                        <Pressable onPress={handleConfirm} style={styles.confirmBtn}>
                            <Text style={[themedStyles.confirmBtnText, { color: themePrimary }]}>Done</Text>
                        </Pressable>
                    </View>

                    {/* Wheel Content */}
                    <View style={themedStyles.pickerBody}>
                        {activeTab === 'date' && (
                            <View style={styles.wheelContainer}>
                                <WheelPicker
                                    items={MONTHS}
                                    selectedIndex={selectedMonthIndex}
                                    onChange={onChangeMonth}
                                    width="40%"
                                    align='center'
                                    activeColors={activeColors}
                                />
                                <WheelPicker
                                    items={days.map(d => d.toString())}
                                    selectedIndex={selectedDayIndex}
                                    onChange={onChangeDay}
                                    width="25%"
                                    align='center'
                                    activeColors={activeColors}
                                />
                                <WheelPicker
                                    items={years.map(y => y.toString())}
                                    selectedIndex={selectedYearIndex}
                                    onChange={onChangeYear}
                                    width="35%"
                                    align='center'
                                    activeColors={activeColors}
                                />
                            </View>
                        )}

                        {activeTab === 'time' && (
                            <View style={styles.wheelContainer}>
                                <WheelPicker
                                    items={hours.map(h => h.toString())}
                                    selectedIndex={selectedHourIndex}
                                    onChange={onChangeHour}
                                    width="30%"
                                    align='center'
                                    activeColors={activeColors}
                                />
                                <WheelPicker
                                    items={minutes.map(m => m.toString().padStart(2, '0'))}
                                    selectedIndex={selectedMinuteIndex}
                                    onChange={onChangeMinute}
                                    width="30%"
                                    align='center'
                                    activeColors={activeColors}
                                />
                                <WheelPicker
                                    items={amPm}
                                    selectedIndex={selectedAmPmIndex}
                                    onChange={onChangeAmPm}
                                    width="30%"
                                    align='center'
                                    activeColors={activeColors}
                                />
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const createStyles = (activeColors: typeof Colors.light, isDark: boolean) => StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: activeColors.background,
        paddingBottom: Platform.OS === 'ios' ? 30 : 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: activeColors.border,
        backgroundColor: activeColors.card,
    },
    closeBtnText: {
        fontSize: 16,
        color: activeColors.textMuted,
        fontFamily: font.HindSiliguri,
    },
    confirmBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: font.HindSiliguri,
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: activeColors.background,
        borderRadius: 10,
        padding: 4,
    },
    tabBtn: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    tabBtnActive: {
        backgroundColor: activeColors.card,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    tabText: {
        fontSize: 14,
        color: activeColors.textMuted,
        fontFamily: font.HindSiliguri,
        fontWeight: '500',
    },
    tabTextActive: {
        color: activeColors.text,
        fontWeight: '700',
    },
    singleModeTitle: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: font.HindSiliguri,
        color: activeColors.text,
    },
    pickerBody: {
        height: 250,
        backgroundColor: activeColors.background,
    },
});

const styles = StyleSheet.create({
    backdropPressable: {
        flex: 1,
    },
    closeBtn: {
        padding: 8,
    },
    confirmBtn: {
        padding: 8,
    },
    wheelContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        height: '100%',
    },
    wheelItem: {
    },
    wheelText: {
        fontSize: 20,
        fontFamily: font.HindSiliguri,
        textAlign: 'center',
    },
    wheelTextSelected: {
        fontSize: 22,
        fontWeight: '700',
    },
    wheelTextUnselected: {
    },
    selectionOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 10,
    },
    selectionLine: {
        height: 1,
        width: '100%',
    },
});
