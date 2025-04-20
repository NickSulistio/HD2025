// map.js - Styles for map components and overlays
import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, borderRadius, shadows, fonts, fontSizes } from './theme';

export const mapStyles = StyleSheet.create({
    // Main container
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },

    // Map view
    map: {
        ...StyleSheet.absoluteFillObject,
    },

    // Loading state
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.backgroundLight,
    },

    loadingText: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodyMedium,
        color: colors.darkGray,
        marginTop: spacing.medium,
    },

    // Error state
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.backgroundLight,
        padding: spacing.large,
    },

    errorText: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodyMedium,
        color: colors.danger,
        textAlign: 'center',
        marginTop: spacing.medium,
    },

    // Control panel (filter buttons)
    controlPanel: {
        position: 'absolute',
        top: spacing.medium,
        right: spacing.medium,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: borderRadius.medium,
        padding: spacing.medium,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
            },
            android: {
                elevation: 4,
            },
        }),
    },

    controlTitle: {
        fontFamily: fonts.headline,
        fontSize: fontSizes.bodyMedium,
        fontWeight: 'bold',
        marginBottom: spacing.small,
        textAlign: 'center',
    },

    // Map layer toggle buttons
    layerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.small,
        paddingHorizontal: spacing.medium,
        borderRadius: borderRadius.full,
        marginVertical: 4,
    },

    layerButtonInactive: {
        backgroundColor: colors.backgroundLight,
    },

    layerText: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodySmall,
        color: colors.darkGray,
        marginLeft: spacing.small,
    },

    layerTextActive: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodySmall,
        color: colors.white,
        fontWeight: 'bold',
        marginLeft: spacing.small,
    },

    // Legend for map zones
    legendContainer: {
        position: 'absolute',
        bottom: spacing.large,
        left: spacing.medium,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: borderRadius.medium,
        padding: spacing.medium,
        maxWidth: 200,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
            },
            android: {
                elevation: 4,
            },
        }),
    },

    legendTitle: {
        fontFamily: fonts.headline,
        fontSize: fontSizes.bodyMedium,
        fontWeight: 'bold',
        marginBottom: spacing.small,
        textAlign: 'center',
    },

    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 3,
    },

    legendColor: {
        width: 16,
        height: 16,
        borderRadius: 4,
        marginRight: 8,
        borderWidth: 1,
    },

    legendText: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodySmall,
        color: colors.darkGray,
    },

    // Incident info popup
    incidentInfo: {
        position: 'absolute',
        bottom: spacing.large,
        left: spacing.medium,
        right: spacing.medium,
        backgroundColor: colors.white,
        borderRadius: borderRadius.medium,
        padding: spacing.medium,
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

    incidentTitle: {
        fontFamily: fonts.headline,
        fontSize: fontSizes.bodyLarge,
        fontWeight: 'bold',
        marginBottom: spacing.tiny,
    },

    incidentType: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodyMedium,
        color: colors.primary,
        marginBottom: spacing.small,
    },

    incidentDescription: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodyMedium,
        color: colors.darkGray,
        marginBottom: spacing.medium,
    },

    closeButton: {
        position: 'absolute',
        top: spacing.small,
        right: spacing.small,
        padding: spacing.tiny,
    },

    // Action buttons
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.small,
    },

    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        paddingVertical: spacing.small,
        paddingHorizontal: spacing.medium,
        borderRadius: borderRadius.small,
        marginHorizontal: spacing.tiny,
    },

    actionButtonText: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodySmall,
        color: colors.white,
        fontWeight: 'bold',
        marginLeft: spacing.tiny,
    },

    // Location button
    locateButton: {
        position: 'absolute',
        bottom: spacing.extraLarge * 2,
        right: spacing.medium,
        backgroundColor: colors.white,
        borderRadius: borderRadius.full,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
            },
            android: {
                elevation: 4,
            },
        }),
    },

    // User location circle
    userLocationCircle: {
        // Styles for the user location indicator
        opacity: 0.7,
    },

    // Emergency zone styles
    zone: {
        // Base styles for emergency zones (polygons)
        opacity: 0.5,
        borderWidth: 1,
    },

    // Markers
    marker: {
        // Base styles for markers
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },

    markerText: {
        fontFamily: fonts.body,
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.white,
    },

    // Weighted markers (for heatmap alternative)
    weightedMarker: {
        opacity: 0.7,
        borderWidth: 1,
        borderColor: colors.white,
    },

    // Callout styles
    callout: {
        width: 200,
        padding: spacing.small,
        borderRadius: borderRadius.small,
    },

    calloutTitle: {
        fontFamily: fonts.headline,
        fontSize: fontSizes.bodyMedium,
        fontWeight: 'bold',
        marginBottom: spacing.tiny,
    },

    calloutDescription: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodySmall,
        color: colors.darkGray,
    },
});

export default mapStyles;