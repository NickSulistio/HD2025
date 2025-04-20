// IncidentBottomSheet.js
import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Platform,
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSizes, fonts, spacing, borderRadius } from '../styles'; // Adjust path as needed

// Sheet dimensions
const SHEET_HEIGHT = 500; // Default height for the expanded sheet

const IncidentBottomSheet = ({ incidents, onIncidentSelect }) => {
    const [expanded, setExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

    // Animated value for sheet position
    const slideAnim = useRef(new Animated.Value(1)).current; // Start hidden (1)

    // Toggle between expanded and collapsed states for bottom sheet
    const toggleExpanded = () => {
        // When opening, set the start position
        if (!expanded) {
            slideAnim.setValue(1); // Start fully off screen (1 = hidden)
        }

        Animated.spring(slideAnim, {
            toValue: expanded ? 1 : 0, // 0 = visible, 1 = hidden
            useNativeDriver: true,
            friction: 8,
            tension: 40
        }).start();

        setExpanded(!expanded);
    };

    // Calculate the transform based on animation value
    const translateY = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, SHEET_HEIGHT] // 0 = fully visible, SHEET_HEIGHT = fully hidden
    });

    // Filter incidents based on active tab
    const getFilteredIncidents = () => {
        if (!incidents) return [];

        switch (activeTab) {
            case 'fires':
                return incidents.fires || [];
            case 'evacuations':
                return incidents.evacuations || [];
            case 'shelters':
                return incidents.reliefCenters || [];
            case 'floods':
                return incidents.floods || [];
            case 'earthquakes':
                return incidents.earthquakes || [];
            case 'all':
            default:
                // Combine all incident types for 'all' tab
                return [
                    ...(incidents.fires || []),
                    ...(incidents.evacuations || []),
                    ...(incidents.floods || []),
                    ...(incidents.earthquakes || []),
                    ...(incidents.reliefCenters || [])
                ].sort((a, b) => b.timestamp - a.timestamp); // Sort by most recent
        }
    };

    // Get the number of incidents by type for the badge count
    const getIncidentCount = (type) => {
        if (!incidents) return 0;

        switch (type) {
            case 'fires':
                return incidents.fires?.length || 0;
            case 'evacuations':
                return incidents.evacuations?.length || 0;
            case 'shelters':
                return incidents.reliefCenters?.length || 0;
            case 'floods':
                return incidents.floods?.length || 0;
            case 'earthquakes':
                return incidents.earthquakes?.length || 0;
            case 'all':
                return (
                    (incidents.fires?.length || 0) +
                    (incidents.evacuations?.length || 0) +
                    (incidents.floods?.length || 0) +
                    (incidents.earthquakes?.length || 0) +
                    (incidents.reliefCenters?.length || 0)
                );
        }
    };

    // Format timestamp in a readable way
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'Unknown time';

        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffHrs = diffMs / (1000 * 60 * 60);

        if (diffHrs < 1) {
            return `${Math.floor(diffMs / (1000 * 60))} min ago`;
        } else if (diffHrs < 24) {
            return `${Math.floor(diffHrs)} hr ago`;
        } else {
            return `${Math.floor(diffHrs / 24)} days ago`;
        }
    };

    // Handle click on an incident item in the bottom sheet
    const handleIncidentPress = (incident) => {
        // Close the bottom sheet
        toggleExpanded();

        // Notify parent component
        if (onIncidentSelect) {
            onIncidentSelect(incident);
        }
    };

    // Render filter tab buttons
    const renderFilterTabs = () => {
        const tabs = [
            { id: 'all', label: 'All' },
            { id: 'fires', label: 'Fires' },
            { id: 'evacuations', label: 'Evacuations' },
            { id: 'shelters', label: 'Shelters' },
            { id: 'floods', label: 'Floods' },
            { id: 'earthquakes', label: 'Earthquakes' }
        ];

        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterTabsContainer}
            >
                {tabs.map(tab => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[
                            styles.filterTab,
                            activeTab === tab.id && styles.activeFilterTab
                        ]}
                        onPress={() => setActiveTab(tab.id)}
                    >
                        <Text
                            style={[
                                styles.filterTabText,
                                activeTab === tab.id && styles.activeFilterTabText
                            ]}
                        >
                            {tab.label}
                        </Text>
                        {getIncidentCount(tab.id) > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{getIncidentCount(tab.id)}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        );
    };

    // Render an individual incident item
    const renderIncidentItems = () => {
        const filteredIncidents = getFilteredIncidents();

        if (filteredIncidents.length === 0) {
            return (
                <Text style={styles.emptyListText}>
                    No {activeTab === 'all' ? '' : activeTab} incidents to display
                </Text>
            );
        }

        return filteredIncidents.map(item => {
            // Determine the icon based on incident type
            let iconName = 'alert-circle';
            let iconColor = colors.warning;

            if (item.description?.includes('Fire') || item.title?.includes('Fire')) {
                iconName = 'flame';
                iconColor = colors.danger;
            } else if (item.description?.includes('Evacuation') || item.title?.includes('Evacuation')) {
                iconName = 'exit';
                iconColor = colors.danger;
            } else if (item.description?.includes('Shelter') || item.title?.includes('Shelter') ||
                item.description?.includes('Relief') || item.title?.includes('Relief')) {
                iconName = 'home';
                iconColor = colors.secondary;
            } else if (item.description?.includes('Flood') || item.title?.includes('Flood')) {
                iconName = 'water';
                iconColor = colors.info;
            } else if (item.description?.includes('Earthquake') || item.title?.includes('Earthquake') ||
                item.title?.includes('M') && item.description?.includes('Magnitude')) {
                iconName = 'pulse';
                iconColor = colors.warning;
            }

            return (
                <TouchableOpacity
                    key={item.id}
                    style={styles.incidentItem}
                    onPress={() => handleIncidentPress(item)}
                >
                    <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
                        <Ionicons name={iconName} size={24} color={iconColor} />
                    </View>
                    <View style={styles.incidentContent}>
                        <Text style={styles.incidentTitle}>{item.title}</Text>
                        <Text style={styles.incidentDescription}>{item.description}</Text>
                        <Text style={styles.incidentSource}>
                            Source: {item.source} • {formatTimestamp(item.timestamp)}
                        </Text>
                    </View>
                </TouchableOpacity>
            );
        });
    };

    return (
        <>
            {/* Circular Incident Button */}
            <TouchableOpacity
                style={styles.incidentButton}
                onPress={toggleExpanded}
                activeOpacity={0.8}
            >
                <View style={styles.incidentButtonContent}>
                    <Ionicons name="alert-circle" size={24} color="#FFFFFF" />
                    {incidents && getIncidentCount('all') > 0 && (
                        <View style={styles.incidentButtonBadge}>
                            <Text style={styles.incidentButtonBadgeText}>
                                {getIncidentCount('all')}
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>

            {/* Bottom Sheet for Incidents */}
            <Animated.View
                style={[
                    styles.sheetContainer,
                    { transform: [{ translateY }] }
                ]}
            >
                {/* Sheet header */}
                <View style={styles.sheetHeader}>
                    <View style={styles.headerContent}>
                        <View style={styles.handleBar} />
                        <Text style={styles.headerTitle}>
                            Live Incidents {incidents && ` (${getIncidentCount('all')})`}
                        </Text>
                        <TouchableOpacity onPress={toggleExpanded}>
                            <Ionicons name="close" size={24} color={colors.white} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Sheet content */}
                <View style={styles.sheetContent}>
                    {/* Filter tabs */}
                    {renderFilterTabs()}

                    {/* Incidents list */}
                    <ScrollView style={styles.incidentList}>
                        {renderIncidentItems()}
                    </ScrollView>
                </View>
            </Animated.View>
        </>
    );
};

const styles = StyleSheet.create({
    // Bottom Sheet Styles
    sheetContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: SHEET_HEIGHT,
        backgroundColor: colors.black,
        borderTopLeftRadius: borderRadius.large,
        borderTopRightRadius: borderRadius.large,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -3 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
            },
            android: {
                elevation: 8,
            },
        }),
        zIndex: 1000,
    },
    sheetHeader: {
        height: 60,
        borderTopLeftRadius: borderRadius.large,
        borderTopRightRadius: borderRadius.large,
        backgroundColor: colors.primary,
        justifyContent: 'center',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.medium,
    },
    handleBar: {
        position: 'absolute',
        top: 10,
        left: 0,
        right: 0,
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        alignSelf: 'center',
    },
    headerTitle: {
        flex: 1,
        fontSize: fontSizes.bodyLarge,
        fontFamily: fonts.headline,
        color: colors.white,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    sheetContent: {
        flex: 1,
        backgroundColor: colors.black,
    },
    filterTabsContainer: {
        paddingHorizontal: spacing.medium,
        paddingVertical: spacing.small,
        backgroundColor: colors.darkGray,
    },
    filterTab: {
        paddingHorizontal: spacing.medium,
        paddingVertical: spacing.small,
        marginRight: spacing.small,
        marginBottom: spacing.small,
        borderRadius: borderRadius.medium,
        backgroundColor: colors.mediumGray,
        flexDirection: 'row',
        alignItems: 'center',
    },
    activeFilterTab: {
        backgroundColor: colors.primaryLight,
    },
    filterTabText: {
        fontSize: fontSizes.bodySmall,
        fontFamily: fonts.body,
        color: colors.white,
    },
    activeFilterTabText: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    badge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.danger,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: spacing.tiny,
        paddingHorizontal: 4,
    },
    badgeText: {
        fontSize: 10,
        color: colors.white,
        fontWeight: 'bold',
    },
    incidentList: {
        padding: spacing.medium,
        flex: 1,
    },
    incidentItem: {
        flexDirection: 'row',
        padding: spacing.medium,
        backgroundColor: colors.darkGray,
        borderRadius: borderRadius.medium,
        marginBottom: spacing.medium,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.medium,
    },
    incidentContent: {
        flex: 1,
    },
    incidentTitle: {
        fontSize: fontSizes.bodyMedium,
        fontFamily: fonts.headline,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: spacing.tiny,
    },
    incidentDescription: {
        fontSize: fontSizes.bodySmall,
        fontFamily: fonts.body,
        color: colors.lightGray,
        marginBottom: spacing.tiny,
    },
    incidentSource: {
        fontSize: fontSizes.bodySmall,
        fontFamily: fonts.body,
        color: colors.lightGray,
        fontStyle: 'italic',
    },
    emptyListText: {
        textAlign: 'center',
        fontSize: fontSizes.bodyMedium,
        fontFamily: fonts.body,
        color: colors.lightGray,
        marginTop: spacing.extraLarge,
    },

    // Circular Incident Button Styles
    incidentButton: {
        position: 'absolute',
        bottom: 30,
        right: 16,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.danger,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
            },
            android: {
                elevation: 6,
            },
        }),
        zIndex: 1000,
    },
    incidentButtonContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    incidentButtonBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
        borderWidth: 1,
        borderColor: colors.danger,
    },
    incidentButtonBadgeText: {
        fontSize: 10,
        color: colors.danger,
        fontWeight: 'bold',
    },
});

export default IncidentBottomSheet;