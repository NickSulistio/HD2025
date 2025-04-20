// onboarding.js - Styles specifically for the onboarding screens
import { StyleSheet, Platform } from 'react-native';
import { colors, fonts, fontSizes, spacing, borderRadius } from './theme';

export const onboardingStyles = StyleSheet.create({
    // Container styles - updated with dark background
    container: {
        flex: 1,
        backgroundColor: colors.black,
    },

    scrollView: {
        flex: 1,
    },

    // Add more padding to the progress container
    progressContainer: {
        paddingTop: spacing.medium, // Increased from 16
        paddingBottom: spacing.medium, // Added padding below
        paddingHorizontal: spacing.large,
        marginBottom: spacing.medium, // Increased from 16
        backgroundColor: colors.black,
    },

    // Also update the scroll view content padding
    scrollViewContent: {
        paddingHorizontal: spacing.large,
        paddingBottom: spacing.extraLarge,
        // paddingTop: spacing.large, // Add top padding to push content down
    },

    // And update the step container to have more space at the top
    stepContainer: {
        // paddingTop: spacing.tiny, // Increased from medium
    },

    progressBar: {
        height: 4,
        backgroundColor: colors.darkGray,
        borderRadius: 2,
        marginBottom: 12,
    },

    progressFill: {
        height: 4,
        backgroundColor: colors.white,
        borderRadius: 2,
    },

    // New style for step text indicator
    stepText: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodySmall,
        color: colors.white,
        textAlign: 'right',
        marginTop: 4,
    },

    // Back button - updated for dark theme
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.large,
        paddingVertical: spacing.small,
    },

    backButtonText: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodyMedium,
        color: colors.white,
        marginLeft: 4,
    },

    // Typography for onboarding steps - updated for dark theme
    headline: {
        fontFamily: fonts.headline,
        fontSize: fontSizes.headline,
        fontWeight: '400',
        marginBottom: spacing.medium,
        color: colors.white,
    },

    bodyLarge: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodyLarge,
        lineHeight: fontSizes.bodyLarge * 1.5,
        marginBottom: spacing.large,
        color: colors.white,
    },

    label: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodyMedium,
        fontWeight: '600',
        marginBottom: spacing.small,
        color: colors.white,
    },

    // Input elements - updated for dark theme
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: colors.mediumGray,
        borderRadius: borderRadius.medium,
        paddingHorizontal: 16,
        fontSize: fontSizes.bodyMedium,
        fontFamily: fonts.body,
        backgroundColor: colors.darkGray,
        color: colors.white,
    },

    textArea: {
        height: 100,
        paddingTop: 12,
        paddingBottom: 12,
        textAlignVertical: 'top',
    },

    inputDisabled: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: colors.lightGray,
    },

    // Field spacing
    fieldContainer: {
        marginBottom: spacing.large,
    },

    // Separator - updated for dark theme
    separator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.large,
    },

    separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.mediumGray,
    },

    separatorText: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodySmall,
        color: colors.white,
        paddingHorizontal: 16,
    },

    // Location button - updated for dark theme
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
        borderWidth: 1,
        borderColor: colors.white,
        borderRadius: borderRadius.medium,
        backgroundColor: 'transparent',
        marginBottom: spacing.medium,
    },

    locationButtonActive: {
        backgroundColor: colors.white,
    },

    locationButtonText: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodyMedium,
        color: colors.white,
        marginLeft: 8,
    },

    locationButtonTextActive: {
        color: colors.black,
    },

    // Location confirmation - updated for dark theme
    locationConfirmation: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(76, 217, 100, 0.2)',
        padding: 12,
        borderRadius: borderRadius.medium,
        marginBottom: spacing.medium,
    },

    locationConfirmationText: {
        flex: 1,
        marginLeft: 8,
        fontFamily: fonts.body,
        fontSize: fontSizes.bodySmall,
        color: colors.success,
    },

    // Counter for household size - updated for dark theme
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.medium,
        marginBottom: spacing.medium,
    },

    counterButton: {
        width: 40,
        height: 40,
        borderWidth: 1,
        borderColor: colors.mediumGray,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.darkGray,
    },

    counterText: {
        fontFamily: fonts.headline,
        fontSize: fontSizes.title,
        fontWeight: 'bold',
        paddingHorizontal: spacing.large,
        color: colors.white,
    },

    // Toggle switches
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.large,
    },

    // Notification option cards - updated for dark theme
    notificationOptions: {
        marginTop: spacing.medium,
        marginBottom: spacing.large,
    },

    notificationOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.medium,
        borderWidth: 1,
        borderColor: colors.mediumGray,
        borderRadius: borderRadius.medium,
        marginBottom: spacing.medium,
        backgroundColor: colors.darkGray,
    },

    activeNotificationOption: {
        borderColor: colors.white,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },

    notificationContent: {
        flex: 1,
    },

    notificationTitle: {
        fontFamily: fonts.headline,
        fontSize: fontSizes.bodyLarge,
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 4,
        color: colors.white,
    },

    activeNotificationTitle: {
        color: colors.white,
    },

    notificationDescription: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodySmall,
        color: colors.lightGray,
    },

    activeNotificationDescription: {
        color: colors.white,
    },

    // Radio buttons - updated for dark theme
    radioButton: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: colors.mediumGray,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: spacing.medium,
    },

    radioButtonActive: {
        borderColor: colors.white,
    },

    radioButtonInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.white,
    },

    // Footer with continue button - updated for dark theme
    footer: {
        padding: spacing.large,
        borderTopWidth: 1,
        borderTopColor: colors.darkGray,
        backgroundColor: colors.black,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -3 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
            },
            android: {
                elevation: 4,
            },
        }),
    },

    // Button updated with white background and black text
    continueButton: {
        height: 48,
        backgroundColor: colors.white,
        borderRadius: borderRadius.medium,
        alignItems: 'center',
        justifyContent: 'center',
    },

    continueButtonText: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodyMedium,
        fontWeight: 'bold',
        color: colors.black,
    },

    // Privacy note - updated for dark theme
    privacyNote: {
        textAlign: 'center',
        marginTop: spacing.medium,
        fontFamily: fonts.body,
        fontSize: fontSizes.bodySmall,
        color: colors.lightGray,
    },

    // Loading state - updated for dark theme
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.black,
    },

    loadingText: {
        marginTop: spacing.medium,
        fontFamily: fonts.body,
        fontSize: fontSizes.bodyMedium,
        color: colors.white,
    },
});

export default onboardingStyles;