import { font } from "@/utils/constant";
import React, { useEffect, useState, useMemo } from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    View,
    ViewStyle,
    Dimensions, Text
} from "react-native";
import { useModeToggle } from "@/hooks/useModeToggler";
import { Colors } from "@/theme/colors";

interface PopoverProps {
    isVisible: boolean;
    onClose: () => void;
    // The rectangle of the element triggering the popover {x, y, width, height, pageX, pageY}
    fromRect?: { x: number; y: number; width: number; height: number; pageX: number; pageY: number } | null;
    children: React.ReactNode;
    contentStyle?: ViewStyle;
}

export default function Popover({ isVisible, onClose, fromRect, children, contentStyle }: PopoverProps) {
    const { isDark } = useModeToggle();
    const activeColors = isDark ? Colors.dark : Colors.light;
    const styles = useMemo(() => createStyles(activeColors, isDark), [activeColors, isDark]);

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

        let top = pageY + height + spacing;
        let left: number | undefined = pageX;
        let right: number | undefined = undefined;

        if (pageX + 180 > screenWidth) {
            left = undefined;
            right = screenWidth - (pageX + width);
        }

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
    const { isDark } = useModeToggle();
    const activeColors = isDark ? Colors.dark : Colors.light;
    const styles = useMemo(() => createStyles(activeColors, isDark), [activeColors, isDark]);

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed
            ]}
        >
            {Icon && <Icon size={18} color={variant === 'danger' ? activeColors.red : activeColors.text} style={styles.menuIcon} />}
            <Text style={[
                styles.menuLabel,
                variant === 'danger' && styles.menuLabelDanger
            ]}>
                {label}
            </Text>
        </Pressable>
    )
}


const createStyles = (activeColors: typeof Colors.light, isDark: boolean) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)',
    },
    popoverContent: {
        position: 'absolute',
        backgroundColor: activeColors.card,
        borderRadius: 12,
        paddingVertical: 6,
        minWidth: 180,
        borderWidth: 1,
        borderColor: activeColors.border,
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 8,
        zIndex: 1000,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    menuItemPressed: {
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f5f5f5',
    },
    menuIcon: {
        marginRight: 12,
    },
    menuLabel: {
        fontSize: 15,
        color: activeColors.text,
        fontFamily: font.HindSiliguri,
        fontWeight: '500',
    },
    menuLabelDanger: {
        color: activeColors.red,
        fontWeight: '600',
    }
});
