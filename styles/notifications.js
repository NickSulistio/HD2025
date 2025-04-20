// notifications.js - Styles for notification components, toasts, and alerts
import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, borderRadius, shadows, fonts, fontSizes } from './theme';

export const notificationStyles = StyleSheet.create({
    // Toast notifications that appear at top/bottom of screen
    toast: {
        position: 'absolute',
        left: spacing.medium,
        right: spacing.medium,
        padding: spacing.medium,
        borderRadius: borderRadius.medium,
        flexDirection: 'row',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 3,
            },
            android: {
                elevation: 4,
            },
        }),
    },

    toastTop: {
        top: Platform.OS === 'ios' ? 50 : 20,
    },

    toastBottom: {
        bottom: Platform.OS === 'ios' ? 20 : 20,
    },

    // Toast variants by type
    successToast: {
        backgroundColor: colors.success,
    },

    errorToast: {
        backgroundColor: colors.danger,
    },

    warningToast: {
        backgroundColor: colors.warning,
    },

    infoToast: {
        backgroundColor: colors.info,
    },

    toastIcon: {
        marginRight: spacing.small,
    },

    toastContent: {
        flex: 1,
    },

    toastTitle: {
        fontFamily: fonts.headline,
        fontSize: fontSizes.bodyMedium,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 2,
    },

    toastMessage: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodySmall,
        color: colors.white,
    },

    toastCloseButton: {
        marginLeft: spacing.small,
        padding: spacing.tiny,
    },

    // Banner notifications that span the width of the screen
    banner: {
        width: '100%',
        padding: spacing.medium,
        flexDirection: 'row',
        alignItems: 'center',
    },

    // Banner variants by type
    successBanner: {
        backgroundColor: 'rgba(76, 217, 100, 0.1)',
        borderBottomWidth: 1,
        borderBottomColor: colors.success,
    },

    errorBanner: {
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        borderBottomWidth: 1,
        borderBottomColor: colors.danger,
    },

    warningBanner: {
        backgroundColor: 'rgba(255, 149, 0, 0.1)',
        borderBottomWidth: 1,
        borderBottomColor: colors.warning,
    },

    infoBanner: {
        backgroundColor: 'rgba(90, 200, 250, 0.1)',
        borderBottomWidth: 1,
        borderBottomColor: colors.info,
    },

    bannerIcon: {
        marginRight: spacing.small,
    },

    bannerContent: {
        flex: 1,
    },

    bannerTitle: {
        fontFamily: fonts.headline,
        fontSize: fontSizes.bodyMedium,
        fontWeight: 'bold',
        marginBottom: 2,
    },

    bannerMessage: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodySmall,
    },

    bannerCloseButton: {
        padding: spacing.tiny,
    },

    // Success banner text colors
    successTitle: {
        color: colors.success,
    },

    successMessage: {
        color: colors.darkGray,
    },

    // Error banner text colors
    errorTitle: {
        color: colors.danger,
    },

    errorMessage: {
        color: colors.darkGray,
    },

    // Warning banner text colors
    warningTitle: {
        color: colors.warning,
    },

    warningMessage: {
        color: colors.darkGray,
    },

    // Info banner text colors
    infoTitle: {
        color: colors.info,
    },

    infoMessage: {
        color: colors.darkGray,
    },

    // In-app notification list item
    notificationItem: {
        flexDirection: 'row',
        padding: spacing.medium,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.white,
    },

    notificationItemUnread: {
        backgroundColor: 'rgba(0, 122, 255, 0.05)',
    },

    notificationIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.medium,
    },

    // Icon containers by notification type
    emergencyIconContainer: {
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
    },

    warningIconContainer: {
        backgroundColor: 'rgba(255, 149, 0, 0.1)',
    },

    infoIconContainer: {
        backgroundColor: 'rgba(90, 200, 250, 0.1)',
    },

    successIconContainer: {
        backgroundColor: 'rgba(76, 217, 100, 0.1)',
    },

    notificationContent: {
        flex: 1,
    },

    notificationTitle: {
        fontFamily: fonts.headline,
        fontSize: fontSizes.bodyMedium,
        fontWeight: 'bold',
        color: colors.darkGray,
        marginBottom: 4,
    },

    notificationMessage: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodySmall,
        color: colors.darkGray,
        marginBottom: spacing.small,
    },

    notificationTime: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodySmall,
        color: colors.mediumGray,
    },

    // Notification actions
    notificationActions: {
        flexDirection: 'row',
        marginTop: spacing.small,
    },

    notificationAction: {
        paddingVertical: spacing.tiny,
        paddingHorizontal: spacing.small,
        backgroundColor: colors.backgroundLight,
        borderRadius: borderRadius.small,
        marginRight: spacing.small,
    },

    notificationActionText: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodySmall,
        color: colors.primary,
        fontWeight: '500',
    },

    // Alert modal
    alertModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.medium,
    },

    alertModalContainer: {
        width: '90%',
        backgroundColor: colors.white,
        borderRadius: borderRadius.medium,
        overflow: 'hidden',
    },

    alertModalHeader: {
        padding: spacing.medium,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },

    alertModalIcon: {
        marginBottom: spacing.small,
    },

    alertModalTitle: {
        fontFamily: fonts.headline,
        fontSize: fontSizes.title,
        fontWeight: 'bold',
        color: colors.darkGray,
        textAlign: 'center',
    },

    alertModalBody: {
        padding: spacing.large,
    },

    alertModalMessage: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodyMedium,
        color: colors.darkGray,
        textAlign: 'center',
        lineHeight: spacing.large,
    },

    alertModalActions: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },

    alertModalAction: {
        flex: 1,
        paddingVertical: spacing.medium,
        alignItems: 'center',
        justifyContent: 'center',
    },

    alertModalActionSeparator: {
        width: 1,
        backgroundColor: colors.border,
    },

    alertModalActionText: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodyMedium,
        fontWeight: 'bold',
    },

    alertModalCancelText: {
        color: colors.mediumGray,
    },

    alertModalConfirmText: {
        color: colors.primary,
    },

    alertModalDestructiveText: {
        color: colors.danger,
    },

    // Emergency alert specific styles
    emergencyAlertHeader: {
        backgroundColor: colors.danger,
        padding: spacing.medium,
    },

    emergencyAlertTitle: {
        fontFamily: fonts.headline,
        fontSize: fontSizes.title,
        fontWeight: 'bold',
        color: colors.white,
        textAlign: 'center',
    },

    emergencyAlertTime: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodySmall,
        color: colors.white,
        textAlign: 'center',
        marginTop: spacing.tiny,
    },

    // Notification center empty state
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.large,
    },

    emptyIcon: {
        marginBottom: spacing.medium,
    },

    emptyTitle: {
        fontFamily: fonts.headline,
        fontSize: fontSizes.bodyLarge,
        fontWeight: 'bold',
        color: colors.darkGray,
        marginBottom: spacing.small,
        textAlign: 'center',
    },

    emptyMessage: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodyMedium,
        color: colors.mediumGray,
        textAlign: 'center',
        lineHeight: spacing.large,
    },
});

export default notificationStyles;