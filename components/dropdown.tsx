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
                <ChevronDown size={20} color={error ? "#d32f2f" : "#666"} />
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
                                            <X size={24} color="#333" />
                                        </Pressable>
                                    </View>

                                    {/* Search Bar */}
                                    {searchable && (
                                        <View style={styles.searchContainer}>
                                            <Search size={18} color="#999" style={styles.searchIcon} />
                                            <TextInput
                                                style={styles.searchInput}
                                                placeholder="Search..."
                                                placeholderTextColor="#999"
                                                value={searchQuery}
                                                onChangeText={setSearchQuery}
                                                autoCorrect={false}
                                            />
                                            {searchQuery.length > 0 && (
                                                <Pressable onPress={() => setSearchQuery('')}>
                                                    <X size={16} color="#999" />
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
                                                    {isSelected && <Check size={18} color="#000" />}
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

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    label: {
        fontSize: 14,
        color: "#666",
        fontFamily: font.HindSiliguri,
        marginBottom: 6,
        fontWeight: '500'
    },
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        minHeight: 50,
    },
    triggerError: {
        borderColor: '#d32f2f',
    },
    triggerDisabled: {
        backgroundColor: '#f5f5f5',
        borderColor: '#eee',
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
        color: '#333',
        fontFamily: font.HindSiliguri,
    },
    placeholderText: {
        color: '#999',
    },
    errorText: {
        fontSize: 12,
        color: '#d32f2f',
        marginTop: 4,
        fontFamily: font.HindSiliguri,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'flex-end',
    },
    modalKeyboardContainer: {
        justifyContent: 'flex-end',
        flex: 1,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
        paddingBottom: 30, // Safe area padding
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        fontFamily: font.HindSiliguri,
        color: '#333',
    },
    closeButton: {
        padding: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        margin: 16,
        marginTop: 10,
        marginBottom: 0,
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 44,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: font.HindSiliguri,
        color: '#333',
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
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    itemSelected: {
        backgroundColor: '#f9f9f9',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemIcon: {
        marginRight: 10,
    },
    itemText: {
        fontSize: 16,
        color: '#333',
        fontFamily: font.HindSiliguri,
    },
    itemTextSelected: {
        fontWeight: '600',
        color: '#000',
    },
    emptyContainer: {
        padding: 24,
        alignItems: 'center',
    },
    emptyText: {
        fontFamily: font.HindSiliguri,
        color: '#999',
        fontSize: 14,
    }
});
