import { font } from "@/utils/constant";
import React, { useEffect, useState } from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    View,
    ViewStyle,
    Dimensions, Text
} from "react-native";

interface PopoverProps {
    isVisible: boolean;
    onClose: () => void;
    // The rectangle of the element triggering the popover {x, y, width, height, pageX, pageY}
    // We typically get this from ref.current.measure((x, y, width, height, pageX, pageY) => ...)
    fromRect?: { x: number; y: number; width: number; height: number; pageX: number; pageY: number } | null;
    children: React.ReactNode;
    contentStyle?: ViewStyle;
}

export default function Popover({ isVisible, onClose, fromRect, children, contentStyle }: PopoverProps) {
    const [position, setPosition] = useState<{ top?: number; left?: number; right?: number; bottom?: number }>({});
    const { width: screenWidth } = Dimensions.get('window');

    useEffect(() => {
        if (isVisible && fromRect) {
            calculatePosition();
        }
    }, [isVisible, fromRect]);

    const calculatePosition = () => {
        if (!fromRect) return;

        const { pageX, pageY, width, height } = fromRect;
        const spacing = 4;

        // Simple logic: prefer bottom-right alignment relative to trigger
        // If too close to bottom, flip to top
        // If too close to right, flip alignment to right edge

        let top = pageY + height + spacing;
        let left: number | undefined = pageX;
        let right: number | undefined = undefined;

        // Check right edge
        // Assuming popover width might be around 150-200.
        // If trigger is far right, align right edge of popover with right edge of trigger
        if (pageX + 150 > screenWidth) {
            left = undefined;
            right = screenWidth - (pageX + width);
        }

        // Check bottom edge (simplified)
        // If we are very low, possibly flip up (not implemented fully for simplicity, just clamping)

        setPosition({ top, left, right });
    };

    if (!isVisible) return null;

    return (
        <Modal transparent visible={isVisible} animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.overlay} onPress={onClose}>
                <View
                    style={[
                        styles.popoverContent,
                        {
                            top: position.top,
                            left: position.left,
                            right: position.right,
                        },
                        contentStyle
                    ]}
                    // Stop propagation to prevent closing when clicking inside content
                    onStartShouldSetResponder={() => true}
                >
                    {children}
                </View>
            </Pressable>
        </Modal>
    );
}

// Reusable Menu Item Component for Popover
export const PopoverItem = ({
    icon: Icon,
    label,
    onPress,
    variant = 'default'
}: {
    icon?: any,
    label: string,
    onPress: () => void,
    variant?: 'default' | 'danger'
}) => {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed
            ]}
        >
            {Icon && <Icon size={18} color={variant === 'danger' ? '#d32f2f' : '#333'} style={styles.menuIcon} />}
            <Text style={[
                styles.menuLabel,
                variant === 'danger' && styles.menuLabelDanger
            ]}>
                {label}
            </Text>
        </Pressable>
    )
}


const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.1)', // Subtle dim
    },
    popoverContent: {
        position: 'absolute',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 4,
        minWidth: 160,
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
        zIndex: 1000,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    menuItemPressed: {
        backgroundColor: '#f5f5f5',
    },
    menuIcon: {
        marginRight: 10,
    },
    menuLabel: {
        fontSize: 14,
        color: '#333',
        fontFamily: font.HindSiliguri,
    },
    menuLabelDanger: {
        color: '#d32f2f',
    }
});
