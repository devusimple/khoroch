import { font } from '@/utils/constant';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
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
const { width } = Dimensions.get('window');

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
};

const WheelPicker = ({ items, selectedIndex, onChange, width = 100, align = 'center' }: WheelProps) => {
    const scrollViewRef = useRef<ScrollView>(null);

    // Helper to snap to index
    useEffect(() => {
        if (scrollViewRef.current) {
            // setTimeout to ensure layout is ready or if visible toggles
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({
                    y: selectedIndex * ITEM_HEIGHT,
                    animated: false, // Initial snap usually instant
                });
            }, 50);
        }
    }, [selectedIndex]);
    // Actually, we should probably just rely on local state or parent passing selectedIndex changes.
    // If selectedIndex changes from outside (e.g. month change affecting day count), we might want to animate or snap.

    // Map alignment to FlexAlignType
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

    // Initial padding to center the first and last items
    const paddingVertical = (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2;

    return (
        <View style={{ height: CONTAINER_HEIGHT, width: width as any, overflow: 'hidden' }}>
            {/* Selection Highlight (Lines) */}
            <View style={[styles.selectionOverlay, { top: paddingVertical, height: ITEM_HEIGHT }]} pointerEvents="none">
                <View style={styles.selectionLine} />
                <View style={[styles.selectionLine, { position: 'absolute', bottom: 0 }]} />
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
                                isSelected ? styles.wheelTextSelected : styles.wheelTextUnselected,
                                // Special alignment tweaks if needed
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

// Wrapper to handle scroll ref and imperative scrolling
// Ideally we keep it simple.

export default function DateTimePicker({
    isVisible,
    mode = 'datetime',
    onConfirm,
    onClose,
    initialDate,
    primaryColor = '#000',
}: DateTimePickerProps) {
    const [activeTab, setActiveTab] = useState<'date' | 'time'>(mode === 'time' ? 'time' : 'date');

    // Internal state components
    const [date, setDate] = useState(initialDate || new Date());

    useEffect(() => {
        if (isVisible) {
            const start = initialDate || new Date();
            setDate(start);
            setActiveTab(mode === 'time' ? 'time' : 'date');
        }
    }, [isVisible]);

    // Derived values for date wheels
    const years = Array.from({ length: 101 }, (_, i) => (new Date().getFullYear() - 50) + i); // 1974 - 2074
    // We need to find index of current year
    const selectedYearIndex = years.indexOf(date.getFullYear());

    const selectedMonthIndex = date.getMonth(); // 0-11

    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const selectedDayIndex = date.getDate() - 1; // 0-indexed

    // Derived values for time wheels
    const hours = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12
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

    // --- Date Change Handlers ---
    const onChangeYear = (index: number) => {
        const newYear = years[index];
        const newDate = new Date(date);
        newDate.setFullYear(newYear);
        // Correct for day overflow (e.g. Feb 29 -> Feb 28 if non-leap)
        if (newDate.getMonth() !== date.getMonth()) {
            newDate.setDate(0); // Last day of previous month (which is our target month)
        }
        setDate(newDate);
    };

    const onChangeMonth = (index: number) => {
        const newDate = new Date(date);
        // We set date to 1 first to avoid month scrolling issues (e.g. Jan 31 -> Feb 28)
        // Actually, we want to keep the day if possible.
        // If we just setMonth(1) on Jan 31, it becomes Mar 3 (or 2).
        // Best approach: set month, if day changes (month mismatch), clamp day.
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

    // --- Time Change Handlers ---
    const onChangeHour = (index: number) => {
        const newHour12 = hours[index]; // 1-12
        const newDate = new Date(date);
        let h = newHour12;
        if (isPM && h !== 12) h += 12;
        if (!isPM && h === 12) h = 0;
        newDate.setHours(h);
        setDate(newDate);
    };

    const onChangeMinute = (index: number) => {
        const newDate = new Date(date);
        newDate.setMinutes(index); // 0-59
        setDate(newDate);
    };

    const onChangeAmPm = (index: number) => {
        const newIsPM = index === 1;
        if (newIsPM === isPM) return; // No change

        const newDate = new Date(date);
        let h = newDate.getHours();
        if (newIsPM) { // AM -> PM
            if (h < 12) h += 12;
        } else { // PM -> AM
            if (h >= 12) h -= 12;
        }
        newDate.setHours(h);
        setDate(newDate);
    };


    if (!isVisible) return null;

    return (
        <Modal transparent visible={isVisible} animationType="slide" onRequestClose={onClose}>
            <View style={styles.backdrop}>
                <Pressable style={styles.backdropPressable} onPress={onClose} />

                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Pressable onPress={onClose} style={styles.closeBtn}>
                            <Text style={styles.closeBtnText}>Cancel</Text>
                        </Pressable>

                        <View style={styles.tabs}>
                            {mode === 'datetime' ? (
                                <>
                                    <Pressable
                                        onPress={() => setActiveTab('date')}
                                        style={[styles.tabBtn, activeTab === 'date' && styles.tabBtnActive]}
                                    >
                                        <Text style={[styles.tabText, activeTab === 'date' && styles.tabTextActive]}>Date</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => setActiveTab('time')}
                                        style={[styles.tabBtn, activeTab === 'time' && styles.tabBtnActive]}
                                    >
                                        <Text style={[styles.tabText, activeTab === 'time' && styles.tabTextActive]}>Time</Text>
                                    </Pressable>
                                </>
                            ) : (
                                <Text style={styles.singleModeTitle}>{mode === 'date' ? 'Select Date' : 'Select Time'}</Text>
                            )}
                        </View>

                        <Pressable onPress={handleConfirm} style={styles.confirmBtn}>
                            <Text style={[styles.confirmBtnText, { color: primaryColor }]}>Done</Text>
                        </Pressable>
                    </View>

                    {/* Wheel Content */}
                    <View style={styles.pickerBody}>
                        {activeTab === 'date' && (
                            <View style={styles.wheelContainer}>
                                {/* Month */}
                                <WheelPicker
                                    items={MONTHS}
                                    selectedIndex={selectedMonthIndex}
                                    onChange={onChangeMonth}
                                    width="40%"
                                    align='center'
                                />
                                {/* Day */}
                                <WheelPicker
                                    items={days.map(d => d.toString())}
                                    selectedIndex={selectedDayIndex}
                                    onChange={onChangeDay}
                                    width="25%"
                                    align='center'
                                />
                                {/* Year */}
                                <WheelPicker
                                    items={years.map(y => y.toString())}
                                    selectedIndex={selectedYearIndex}
                                    onChange={onChangeYear}
                                    width="35%"
                                    align='center'
                                />
                            </View>
                        )}

                        {activeTab === 'time' && (
                            <View style={styles.wheelContainer}>
                                {/* Hour */}
                                <WheelPicker
                                    items={hours.map(h => h.toString())}
                                    selectedIndex={selectedHourIndex}
                                    onChange={onChangeHour}
                                    width="30%"
                                    align='center'
                                />
                                {/* Minute */}
                                <WheelPicker
                                    items={minutes.map(m => m.toString().padStart(2, '0'))}
                                    selectedIndex={selectedMinuteIndex}
                                    onChange={onChangeMinute}
                                    width="30%"
                                    align='center'
                                />
                                {/* AM/PM */}
                                <WheelPicker
                                    items={amPm}
                                    selectedIndex={selectedAmPmIndex}
                                    onChange={onChangeAmPm}
                                    width="30%"
                                    align='center'
                                />
                            </View>
                        )}
                    </View>

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end',
    },
    backdropPressable: {
        flex: 1,
    },
    modalContent: {
        // IOS-like date picker look
        backgroundColor: '#fff',
        paddingBottom: Platform.OS === 'ios' ? 30 : 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#f9f9f9'
    },
    closeBtn: {
        padding: 8,
    },
    closeBtnText: {
        fontSize: 16,
        color: '#666',
        fontFamily: font.HindSiliguri,
    },
    confirmBtn: {
        padding: 8,
    },
    confirmBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: font.HindSiliguri,
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: '#eaeaea',
        borderRadius: 8,
        padding: 2,
    },
    tabBtn: {
        paddingVertical: 4,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    tabBtnActive: {
        backgroundColor: '#fff',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    },
    tabText: {
        fontSize: 14,
        color: '#666',
        fontFamily: font.HindSiliguri,
        fontWeight: '500',
    },
    tabTextActive: {
        color: '#000',
        fontWeight: '600',
    },
    singleModeTitle: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: font.HindSiliguri,
    },

    // Picker Body
    pickerBody: {
        height: 250, // 5 items * 50
        backgroundColor: '#fff',
    },
    wheelContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        height: '100%',
    },
    // Wheel Styles
    wheelItem: {
        // height: ITEM_HEIGHT set inline
    },
    wheelText: {
        fontSize: 20,
        fontFamily: font.HindSiliguri,
        textAlign: 'center',
    },
    wheelTextSelected: {
        color: '#000',
        fontSize: 22,
        fontWeight: '600',
    },
    wheelTextUnselected: {
        color: '#bbb', // Faded look
    },
    selectionOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        // top/bottom borders handled in inline style to match content inset
        // But here we want the lines.
        zIndex: 10,
    },
    selectionLine: {
        height: 1,
        backgroundColor: '#e0e0e0',
        width: '100%',
    },
});
