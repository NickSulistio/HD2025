// forms.js - Form component styles
import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontSizes, fonts } from './theme';

export const forms = StyleSheet.create({
    // Input field
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.medium,
        paddingHorizontal: 16,
        fontFamily: fonts.body,
        fontSize: fontSizes.bodyMedium,
        color: colors.darkGray,
        backgroundColor: colors.white,
    },

    // Input field with focus state
    inputFocused: {
        borderColor: colors.primary,
        borderWidth: 2,
    },

    // Input with error
    inputError: {
        borderColor: colors.danger,
    },

    // Disabled input
    inputDisabled: {
        backgroundColor: colors.backgroundLight,
        color: colors.mediumGray,
    },

    // Text area for multiline input
    textArea: {
        minHeight: 100,
        paddingTop: 12,
        paddingBottom: 12,
        textAlignVertical: 'top',
    },

    // Labels for form inputs
    label: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodyMedium,
        fontWeight: '600',
        color: colors.darkGray,
        marginBottom: spacing.small,
    },

    // Field containers
    fieldContainer: {
        marginBottom: spacing.large,
    },

    // Helper text below inputs
    helperText: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodySmall,
        color: colors.mediumGray,
        marginTop: spacing.tiny,
    },

    // Error message below inputs
    errorText: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodySmall,
        color: colors.danger,
        marginTop: spacing.tiny,
    },

    // Switch toggle
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.medium,
    },

    switchLabel: {
        flex: 1,
        fontFamily: fonts.body,
        fontSize: fontSizes.bodyMedium,
        color: colors.darkGray,
    },

    // Counter controls (for number inputs)
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: spacing.medium,
    },

    counterButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
    },

    counterText: {
        fontFamily: fonts.headline,
        fontSize: fontSizes.title,
        fontWeight: 'bold',
        paddingHorizontal: spacing.large,
    },

    // Radio buttons
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.medium,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },

    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.medium,
    },

    radioCircleSelected: {
        borderColor: colors.primary,
    },

    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary,
    },

    radioLabel: {
        flex: 1,
        fontFamily: fonts.body,
        fontSize: fontSizes.bodyMedium,
        color: colors.darkGray,
    },

    // Checkbox
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.medium,
    },

    checkbox: {
        width: 24,
        height: 24,
        borderRadius: borderRadius.small,
        borderWidth: 2,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.medium,
    },

    checkboxSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },

    checkboxLabel: {
        flex: 1,
        fontFamily: fonts.body,
        fontSize: fontSizes.bodyMedium,
        color: colors.darkGray,
    },
});

export default forms;