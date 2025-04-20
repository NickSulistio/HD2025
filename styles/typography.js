// typography.js - Text styles based on design system
import { StyleSheet } from 'react-native';
import { fonts, fontSizes, colors } from './theme';

export const text = StyleSheet.create({
    display: {
        fontFamily: fonts.display,
        fontSize: fontSizes.display,
        fontWeight: 'bold',
        color: colors.black,
    },

    headline: {
        fontFamily: fonts.headline,
        fontSize: fontSizes.headline,
        fontWeight: '400',
        color: colors.black,
    },

    title: {
        fontFamily: fonts.title,
        fontSize: fontSizes.title,
        fontWeight: 'bold',
        color: colors.black,
    },

    bodyLarge: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodyLarge,
        fontWeight: 'normal',
        color: colors.darkGray,
        lineHeight: fontSizes.bodyLarge * 1.5,
    },

    bodyMedium: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodyMedium,
        fontWeight: 'normal',
        color: colors.darkGray,
        lineHeight: fontSizes.bodyMedium * 1.5,
    },

    bodySmall: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodySmall,
        fontWeight: 'normal',
        color: colors.mediumGray,
        lineHeight: fontSizes.bodySmall * 1.5,
    },

    // Variations for different contexts
    bodyLargeBold: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodyLarge,
        fontWeight: 'bold',
        color: colors.darkGray,
        lineHeight: fontSizes.bodyLarge * 1.5,
    },

    bodyMediumBold: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodyMedium,
        fontWeight: 'bold',
        color: colors.darkGray,
        lineHeight: fontSizes.bodyMedium * 1.5,
    },

    caption: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodySmall,
        fontWeight: 'normal',
        color: colors.mediumGray,
        lineHeight: fontSizes.bodySmall * 1.3,
    },
});

export default text;