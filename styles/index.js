// index.js - Export all styles for easy importing
import { colors, fonts, fontSizes, spacing, borderRadius, shadows } from './theme';
import { text } from './typography';
import { containers, header, footer, divider } from './layout';
import { buttons } from './buttons';
import { forms } from './forms';
import onboardingStyles from './onboarding';
import mapStyles from './map';
import cardStyles from './cards';
import notificationStyles from './notifications';

// Re-export everything
export {
    // Theme elements
    colors,
    fonts,
    fontSizes,
    spacing,
    borderRadius,
    shadows,

    // Typography styles
    text,

    // Layout styles
    containers,
    header,
    footer,
    divider,

    // Component styles
    buttons,
    forms,

    // Screen-specific styles
    onboardingStyles,
    mapStyles,
    cardStyles,
    notificationStyles,
};

// Export default object with all styles
export default {
    theme: {
        colors,
        fonts,
        fontSizes,
        spacing,
        borderRadius,
        shadows,
    },
    text,
    layout: {
        containers,
        header,
        footer,
        divider,
    },
    buttons,
    forms,
    onboarding: onboardingStyles,
    map: mapStyles,
    cards: cardStyles,
    notifications: notificationStyles,
};