// theme.js - Core style variables

// Colors
import {Platform} from "react-native";

export const colors = {
    // Primary brand colors
    primary: '#007AFF',
    primaryLight: '#BFDEFF',
    primaryDark: '#0055B3',

    // Secondary colors
    secondary: '#4CAF50',
    secondaryLight: '#80E884',
    secondaryDark: '#087f23',

    // Alert/notification colors
    danger: '#FF3B30',
    warning: '#FF9500',
    success: '#4CD964',
    info: '#5AC8FA',

    // Emergency zone colors
    evacMandatory: 'rgba(255, 0, 0, 0.3)',
    evacMandatoryBorder: '#FF0000',
    evacVoluntary: 'rgba(255, 165, 0, 0.3)',
    evacVoluntaryBorder: '#FFA500',
    fireZone: 'rgba(255, 87, 51, 0.3)',
    fireZoneBorder: '#FF5733',
    floodZone: 'rgba(52, 152, 219, 0.3)',
    floodZoneBorder: '#3498DB',
    shelterZone: 'rgba(142, 68, 173, 0.3)',
    shelterZoneBorder: '#8E44AD',

    // Grayscale
    black: '#000000',
    darkGray: '#333333',
    mediumGray: '#666666',
    lightGray: '#999999',
    border: '#DDDDDD',
    backgroundLight: '#F8F9FA',
    backgroundDark: '#E0E0E0',
    white: '#FFFFFF',
};

// Typography
export const fonts = {
    display: 'Helvetica Neue',
    headline: 'Helvetica Neue',
    title: 'Helvetica Neue',
    body: 'OpenSans',
};

// Font Sizes (based on your design system)
export const fontSizes = {
    display: 34,
    headline: 28,
    title: 22,
    bodyLarge: 17,
    bodyMedium: 15,
    bodySmall: 13,
    button: 15,
};

// Spacing
export const spacing = {
    tiny: 4,
    small: 8,
    medium: 16,
    large: 24,
    extraLarge: 32,
    huge: 48,
};

// Border Radius
export const borderRadius = {
    small: 4,
    medium: 8,
    large: 16,
    extraLarge: 24,
    full: 9999,
};

// Shadows (for both iOS and Android)
export const shadows = {
    small: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 1,
            },
            shadowOpacity: 0.18,
            shadowRadius: 1.0,
        },
        android: {
            elevation: 1,
        },
    }),
    medium: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.23,
            shadowRadius: 2.62,
        },
        android: {
            elevation: 4,
        },
    }),
    large: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
        },
        android: {
            elevation: 8,
        },
    }),
};

export default {
    colors,
    fonts,
    fontSizes,
    spacing,
    borderRadius,
    shadows,
};