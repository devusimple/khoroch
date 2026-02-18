import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    Modal,
    Pressable,
    FlatList,
    TextInput,
    StyleSheet,
    Platform,
    TouchableWithoutFeedback,
    KeyboardAvoidingView
} from 'react-native';
import { ChevronDown, Search, X, Check } from 'lucide-react-native';
import { font } from '@/utils/constant';
import { useModeToggle } from '@/hooks/useModeToggler';
import { Colors } from '@/theme/colors';

export interface DropdownItem<T> {
    label: string;
    value: T;
    icon?: React.ReactNode;
}

interface DropdownProps<T> {
    /** Label displayed above the dropdown */
    label?: string;
    /** Placeholder text when no item is selected */
    placeholder?: string;
    /** Array of items to display */
    data: DropdownItem<T>[];
    /** Currently selected value */
    value?: T;
    /** Callback when an item is selected */
    onChange: (value: T) => void;
    /** If true, shows a search bar in the modal */
    searchable?: boolean;
    /** Error message string */
    error?: string;
    /** Custom container style */
    style?: object;
    /** Disable the dropdown */
    disabled?: boolean;
}

/**
 * A reusable, production-ready Dropdown component.
 * Supports generics, search, and custom styling.
 */
export function Dropdown<T>({
    label,
    placeholder = 'Select an option',
    data,
    value,
    onChange,
    searchable = false,
    error,
    style,
    disabled = false,
}: DropdownProps<T>) {
    const { isDark } = useModeToggle();
    const activeColors = isDark ? Colors.dark : Colors.light;
    const styles = useMemo(() => createStyles(activeColors, isDark), [activeColors, isDark]);

    const [visible, setVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Find the selected item object based on value
    const selectedItem = useMemo(() =>
        data.find((item) => item.value === value),
        [data, value]
    );

    // Filter data based on search query
    const filteredData = useMemo(() => {
        if (!searchQuery) return data;
        return data.filter((item) =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [data, searchQuery]);

    const handleSelect = (item: DropdownItem<T>) => {
        onChange(item.value);
        setVisible(false);
        setSearchQuery('');
    };

    const closeModal = () => {
        setVisible(false);
        setSearchQuery('');
    };

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <Pressable
                onPress={() => !disabled && setVisible(true)}
                style={[
                    styles.trigger,
                    error ? styles.triggerError : null,
                    disabled ? styles.triggerDisabled : null,
                ]}
            >
                <View style={styles.triggerContent}>
                    {selectedItem?.icon && <View style={styles.selectedIcon}>{selectedItem.icon}</View>}
                    <Text style={[styles.valueText, !selectedItem && styles.placeholderText]}>
                        {selectedItem ? selectedItem.label : placeholder}
                    </Text>
                </View>
                <ChevronDown size={20} color={error ? activeColors.red : activeColors.textMuted} />
            </Pressable>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Modal
                visible={visible}
                transparent
                animationType="slide"
                onRequestClose={closeModal}
            >
                <TouchableWithoutFeedback onPress={closeModal}>
                    <View style={styles.modalOverlay}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === "ios" ? "padding" : undefined}
                            style={styles.modalKeyboardContainer}
                        >
                            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                                <View style={styles.modalContent}>
                                    {/* Header */}
                                    <View style={styles.modalHeader}>
                                        <Text style={styles.modalTitle}>{label || 'Select'}</Text>
                                        <Pressable onPress={closeModal} style={styles.closeButton}>
                                            <X size={24} color={activeColors.text} />
                                        </Pressable>
                                    </View>

                                    {/* Search Bar */}
                                    {searchable && (
                                        <View style={styles.searchContainer}>
                                            <Search size={18} color={activeColors.textMuted} style={styles.searchIcon} />
                                            <TextInput
                                                style={styles.searchInput}
                                                placeholder="Search..."
                                                placeholderTextColor={activeColors.textMuted}
                                                value={searchQuery}
                                                onChangeText={setSearchQuery}
                                                autoCorrect={false}
                                            />
                                            {searchQuery.length > 0 && (
                                                <Pressable onPress={() => setSearchQuery('')}>
                                                    <X size={16} color={activeColors.textMuted} />
                                                </Pressable>
                                            )}
                                        </View>
                                    )}

                                    {/* List */}
                                    <FlatList
                                        data={filteredData}
                                        keyExtractor={(_, index) => index.toString()}
                                        contentContainerStyle={styles.listContent}
                                        ListEmptyComponent={
                                            <View style={styles.emptyContainer}>
                                                <Text style={styles.emptyText}>No options found</Text>
                                            </View>
                                        }
                                        renderItem={({ item }) => {
                                            const isSelected = item.value === value;
                                            return (
                                                <Pressable
                                                    style={[
                                                        styles.item,
                                                        isSelected && styles.itemSelected,
                                                    ]}
                                                    onPress={() => handleSelect(item)}
                                                >
                                                    <View style={styles.itemLeft}>
                                                        {item.icon && <View style={styles.itemIcon}>{item.icon}</View>}
                                                        <Text
                                                            style={[
                                                                styles.itemText,
                                                                isSelected && styles.itemTextSelected,
                                                            ]}
                                                        >
                                                            {item.label}
                                                        </Text>
                                                    </View>
                                                    {isSelected && <Check size={18} color={activeColors.text} />}
                                                </Pressable>
                                            );
                                        }}
                                    />
                                </View>
                            </TouchableWithoutFeedback>
                        </KeyboardAvoidingView>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}

const createStyles = (activeColors: typeof Colors.light, isDark: boolean) => StyleSheet.create({
    container: {
        width: '100%',
    },
    label: {
        fontSize: 14,
        color: activeColors.textMuted,
        fontFamily: font.HindSiliguri,
        marginBottom: 8,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: activeColors.card,
        borderWidth: 1,
        borderColor: activeColors.border,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        minHeight: 56,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    triggerError: {
        borderColor: activeColors.red,
    },
    triggerDisabled: {
        backgroundColor: activeColors.background,
        borderColor: activeColors.border,
        opacity: 0.6,
    },
    triggerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    selectedIcon: {
        marginRight: 8,
    },
    valueText: {
        fontSize: 16,
        color: activeColors.text,
        fontFamily: font.HindSiliguri,
        fontWeight: '500',
    },
    placeholderText: {
        color: activeColors.textMuted,
    },
    errorText: {
        fontSize: 12,
        color: activeColors.red,
        marginTop: 4,
        fontFamily: font.HindSiliguri,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    modalKeyboardContainer: {
        justifyContent: 'flex-end',
        flex: 1,
    },
    modalContent: {
        backgroundColor: activeColors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: activeColors.border,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        fontFamily: font.HindSiliguri,
        color: activeColors.text,
    },
    closeButton: {
        padding: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: activeColors.card,
        margin: 16,
        marginTop: 16,
        marginBottom: 8,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        borderWidth: 1,
        borderColor: activeColors.border,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: font.HindSiliguri,
        color: activeColors.text,
        height: '100%',
    },
    listContent: {
        padding: 16,
        paddingTop: 8,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 4,
    },
    itemSelected: {
        backgroundColor: activeColors.card,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemIcon: {
        marginRight: 12,
    },
    itemText: {
        fontSize: 16,
        color: activeColors.text,
        fontFamily: font.HindSiliguri,
        fontWeight: '500',
    },
    itemTextSelected: {
        fontWeight: '700',
        color: activeColors.primary,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontFamily: font.HindSiliguri,
        color: activeColors.textMuted,
        fontSize: 16,
    }
});
