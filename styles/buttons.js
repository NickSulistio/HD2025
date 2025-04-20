// buttons.js - Button styles
import { StyleSheet } from 'react-native';
import { colors, fontSizes, borderRadius, spacing } from './theme';

// Common button properties based on your design system
// Buttons: 48 Height, 32pt padding, 15 pt font
const baseButton = {
    height: 48,
    paddingHorizontal: 32,
    borderRadius: borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
};

const baseButtonText = {
    fontSize: fontSizes.button,
    fontWeight: 'bold',
    textAlign: 'center',
};

export const buttons = StyleSheet.create({
    // Primary button - filled with brand color
    primary: {
        ...baseButton,
        backgroundColor: colors.primary,
    },

    primaryText: {
        ...baseButtonText,
        color: colors.white,
    },

    // Secondary button - outline style
    secondary: {
        ...baseButton,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.primary,
    },

    secondaryText: {
        ...baseButtonText,
        color: colors.primary,
    },

    // Danger button - for critical actions
    danger: {
        ...baseButton,
        backgroundColor: colors.danger,
    },

    dangerText: {
        ...baseButtonText,
        color: colors.white,
    },

    // Success button - for positive actions
    success: {
        ...baseButton,
        backgroundColor: colors.success,
    },

    successText: {
        ...baseButtonText,
        color: colors.white,
    },

    // Link button - text only
    link: {
        paddingVertical: spacing.small,
        paddingHorizontal: spacing.small,
    },

    linkText: {
        fontSize: fontSizes.bodyMedium,
        fontWeight: 'bold',
        color: colors.primary,
        textAlign: 'center',
    },

    // Icon button - with icon
    icon: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Small button variant
    small: {
        height: 36,
        paddingHorizontal: spacing.medium,
        borderRadius: borderRadius.small,
    },

    smallText: {
        fontSize: fontSizes.bodySmall,
        fontWeight: 'bold',
    },

    // Large button variant
    large: {
        height: 56,
        paddingHorizontal: 40,
        borderRadius: borderRadius.medium,
    },

    largeText: {
        fontSize: fontSizes.bodyLarge,
        fontWeight: 'bold',
    },

    // Disabled state
    disabled: {
        backgroundColor: colors.backgroundDark,
        borderColor: colors.backgroundDark,
    },

    disabledText: {
        color: colors.mediumGray,
    },
});

export default buttons;