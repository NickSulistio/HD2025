// layout.js - Common layout styles
import { StyleSheet, Platform } from 'react-native';
import { spacing, colors, borderRadius, shadows } from './theme';

export const containers = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: colors.white,
    },

    safeArea: {
        flex: 1,
        backgroundColor: colors.white,
    },

    scrollViewContainer: {
        flexGrow: 1,
    },

    contentPadding: {
        paddingHorizontal: spacing.large,
        paddingTop: spacing.medium,
        paddingBottom: spacing.large,
    },

    section: {
        marginBottom: spacing.large,
    },

    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.medium,
        padding: spacing.medium,
        marginBottom: spacing.medium,
        ...shadows.small,
    },

    cardElevated: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.medium,
        padding: spacing.medium,
        marginBottom: spacing.medium,
        ...shadows.medium,
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    rowSpaceBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    column: {
        flexDirection: 'column',
    },

    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export const header = StyleSheet.create({
    container: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.medium,
    },

    title: {
        fontFamily: 'Helvetica',
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.white,
    },

    leftButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },

    rightButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export const footer = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        padding: spacing.large,
    },
});

export const divider = StyleSheet.create({
    horizontal: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: spacing.medium,
    },

    vertical: {
        width: 1,
        backgroundColor: colors.border,
        marginHorizontal: spacing.medium,
    },
});

export default {
    containers,
    header,
    footer,
    divider,
};