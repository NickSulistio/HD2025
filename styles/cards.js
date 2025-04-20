// cards.js - Styles for various card components (resources, alerts, postcard, etc.)
import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, borderRadius, shadows, fonts, fontSizes } from './theme';

export const cardStyles = StyleSheet.create({
    // Base card styles
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.medium,
        marginBottom: spacing.medium,
        padding: spacing.medium,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },

    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.small,
    },

    cardTitle: {
        fontFamily: fonts.headline,
        fontSize: fontSizes.title,
        fontWeight: 'bold',
        color: colors.black,
    },

    cardSubtitle: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodyMedium,
        color: colors.mediumGray,
        marginBottom: spacing.small,
    },

    cardBody: {
        marginVertical: spacing.small,
    },

    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.medium,
    },

    // Resource directory cards
    resourceCard: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
        backgroundColor: colors.white,
        borderRadius: borderRadius.medium,
        padding: spacing.medium,
        marginBottom: spacing.medium,
    },

    resourceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.small,
    },

    resourceTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    resourceType: {
        marginLeft: spacing.small,
        fontFamily: fonts.body,
        fontSize: fontSizes.bodyMedium,
        color: colors.primary,
        fontWeight: '500',
    },

    distanceContainer: {
        backgroundColor: colors.backgroundLight,
        paddingHorizontal: spacing.small,
        paddingVertical: 4,
        borderRadius: 12,
    },

    distanceText: {
        fontSize: fontSizes.bodySmall,
        color: colors.mediumGray,
    },

    resourceName: {
        fontFamily: fonts.headline,
        fontSize: fontSizes.bodyLarge,
        fontWeight: 'bold',
        marginBottom: spacing.tiny,
    },

    resourceDescription: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodyMedium,
        color: colors.darkGray,
        marginBottom: spacing.small,
    },

    resourceFooter: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: spacing.small,
    },

    tagContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(46, 204, 113, 0.1)',
        paddingHorizontal: spacing.small,
        paddingVertical: 4,
        borderRadius: borderRadius.small,
        marginRight: spacing.small,
        marginBottom: spacing.tiny,
    },

    tagText: {
        marginLeft: spacing.tiny,
        fontFamily: fonts.body,
        fontSize: fontSizes.bodySmall,
        color: colors.secondary,
    },

    // Donation campaign cards
    campaignCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.medium,
        marginBottom: spacing.medium,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
            },
            android: {
                elevation: 3,
            },
        }),
    },

    campaignImage: {
        width: '100%',
        height: 180,
    },

    campaignContent: {
        padding: spacing.medium,
    },

    campaignTitle: {
        fontFamily: fonts.headline,
        fontSize: fontSizes.bodyLarge,
        fontWeight: 'bold',
        marginBottom: spacing.tiny,
    },

    campaignOrganizer: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodySmall,
        color: colors.mediumGray,
        marginBottom: spacing.small,
    },

    campaignDescription: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodyMedium,
        color: colors.darkGray,
        marginBottom: spacing.medium,
        lineHeight: spacing.large,
    },

    campaignStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.medium,
    },

    campaignStatItem: {
        alignItems: 'center',
    },

    campaignStatValue: {
        fontFamily: fonts.headline,
        fontSize: fontSizes.bodyMedium,
        fontWeight: 'bold',
        color: colors.darkGray,
    },

    campaignStatLabel: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodySmall,
        color: colors.mediumGray,
    },

    campaignFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.small,
        paddingVertical: 4,
        borderRadius: 12,
    },

    verifiedText: {
        marginLeft: spacing.tiny,
        fontFamily: fonts.body,
        fontSize: fontSizes.bodySmall,
        fontWeight: '500',
    },

    donateButton: {
        backgroundColor: colors.danger,
        paddingHorizontal: spacing.medium,
        paddingVertical: spacing.small,
        borderRadius: borderRadius.small,
    },

    donateButtonText: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodySmall,
        fontWeight: 'bold',
        color: colors.white,
    },

    // Safety postcard styles
    postcard: {
        width: '100%',
        backgroundColor: colors.white,
        borderRadius: borderRadius.medium,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },

    postcardHeader: {
        padding: spacing.medium,
        borderBottomWidth: 1,
        borderBottomColor: colors.backgroundLight,
    },

    postcardTitle: {
        fontFamily: fonts.headline,
        fontSize: fontSizes.title,
        fontWeight: 'bold',
        color: colors.darkGray,
        textAlign: 'center',
    },

    selectedTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.small,
    },

    selectedTypeText: {
        fontSize: fontSizes.bodyLarge,
        fontWeight: 'bold',
        marginLeft: spacing.small,
    },

    postcardBody: {
        padding: spacing.large,
        backgroundColor: colors.backgroundLight,
    },

    postcardMessage: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodyMedium,
        lineHeight: spacing.large,
        color: colors.darkGray,
        marginBottom: spacing.medium,
    },

    activeIncidentsText: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodySmall,
        color: colors.danger,
        marginBottom: spacing.medium,
    },

    postcardVulnerableMessage: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodySmall,
        fontStyle: 'italic',
        color: colors.warning,
        marginTop: spacing.small,
        borderLeftWidth: 2,
        borderLeftColor: colors.warning,
        paddingLeft: spacing.small,
    },

    postcardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.medium,
        borderTopWidth: 1,
        borderTopColor: colors.backgroundLight,
        backgroundColor: colors.backgroundLight,
    },

    locationText: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodySmall,
        color: colors.mediumGray,
        marginLeft: spacing.tiny,
        flex: 1,
    },

    timestampText: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodySmall,
        color: colors.mediumGray,
    },

    postcardBranding: {
        backgroundColor: colors.primary,
        padding: spacing.small,
        alignItems: 'center',
    },

    brandingText: {
        fontFamily: fonts.headline,
        fontSize: fontSizes.bodySmall,
        fontWeight: 'bold',
        color: colors.white,
    },

    // Alert cards
    alertCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.medium,
        borderLeftWidth: 4,
        padding: spacing.medium,
        marginBottom: spacing.medium,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },

    alertCardDanger: {
        borderLeftColor: colors.danger,
    },

    alertCardWarning: {
        borderLeftColor: colors.warning,
    },

    alertCardInfo: {
        borderLeftColor: colors.info,
    },

    alertCardSuccess: {
        borderLeftColor: colors.success,
    },

    alertTitle: {
        fontFamily: fonts.headline,
        fontSize: fontSizes.bodyLarge,
        fontWeight: 'bold',
        marginBottom: spacing.tiny,
    },

    alertTime: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodySmall,
        color: colors.mediumGray,
        marginBottom: spacing.small,
    },

    alertMessage: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodyMedium,
        color: colors.darkGray,
        marginBottom: spacing.small,
    },

    alertActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: spacing.small,
    },

    alertActionButton: {
        paddingHorizontal: spacing.medium,
        paddingVertical: spacing.small,
        borderRadius: borderRadius.small,
        marginLeft: spacing.small,
    },

    alertActionText: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodySmall,
        fontWeight: 'bold',
    },
});

export default cardStyles;