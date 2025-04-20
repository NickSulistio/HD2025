import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    FlatList,
    TextInput,
    ActivityIndicator,
    Modal,
    ScrollView,
    Linking,
    Image,
    Platform,
    SafeAreaView
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

// Import the ResourceService (make sure the path is correct)
// Since we don't have the actual file yet, we'll create a placeholder
const ResourceService = {
    getResources: async (location) => {
        // Return mock data for now
        return [
            {
                id: 1,
                name: "Davis Community Shelter",
                type: "shelter",
                description: "Emergency shelter providing temporary housing and support services for individuals and families affected by floods and other disasters in Davis.",
                latitude: 38.5449,
                longitude: -121.7405,
                services: [
                    "Emergency housing",
                    "Food services",
                    "Counseling support",
                    "Pet accommodation"
                ],
                accessibility: true,
                openNow: true,
                distance: 1.4
            },
            {
                id: 2,
                name: "UC Davis Food Pantry",
                type: "foodBank",
                description: "Providing emergency food supplies to students and community members affected by emergencies in the Davis area.",
                latitude: 38.5382,
                longitude: -121.7617,
                services: [
                    "Emergency food boxes",
                    "Fresh produce distribution",
                    "Hygiene supplies"
                ],
                accessibility: true,
                openNow: false,
                distance: 2.2
            }
        ];
    },
    getCampaigns: async () => {
        // Return mock campaign data
        return [
            {
                id: 1,
                title: "Putah Creek Flood Relief Fund",
                organizer: "Davis Community Foundation",
                description: "Supporting families affected by the recent Putah Creek flooding in the Davis area.",
                amountRaised: 42500,
                goal: 75000,
                donors: 318,
                verified: true
            },
            {
                id: 2,
                title: "UC Davis Student Emergency Fund",
                organizer: "UC Davis Alumni Association",
                description: "Providing emergency financial assistance to students impacted by natural disasters and emergencies.",
                amountRaised: 28750,
                goal: 50000,
                donors: 205,
                verified: true
            }
        ];
    }
};

// Main component - renamed from ResourceDirectoryScreen to AlertsScreen
const AlertsScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('resources');
    const [resources, setResources] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load resources and campaigns
        const loadData = async () => {
            try {
                // Get user location for sorting by proximity
                let { status } = await Location.requestForegroundPermissionsAsync();
                let location = null;

                if (status === 'granted') {
                    location = await Location.getCurrentPositionAsync({});
                }

                // Fetch resources and campaigns
                const resourcesData = await ResourceService.getResources(location);
                const campaignsData = await ResourceService.getCampaigns();

                setResources(resourcesData);
                setCampaigns(campaignsData);
                setLoading(false);
            } catch (error) {
                console.error('Error loading resources:', error);
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size={48} color="#007AFF" />
                <Text style={styles.loadingText}>Loading resources...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>{activeTab === 'resources' ? 'Resource Directory' : 'Donation Hub'}</Text>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'resources' && styles.activeTab]}
                        onPress={() => setActiveTab('resources')}
                    >
                        <Text style={[styles.tabText, activeTab === 'resources' && styles.activeTabText]}>Resource Directory</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'donations' && styles.activeTab]}
                        onPress={() => setActiveTab('donations')}
                    >
                        <Text style={[styles.tabText, activeTab === 'donations' && styles.activeTabText]}>Donation Hub</Text>
                    </TouchableOpacity>
                </View>

                {/* Content based on active tab */}
                {activeTab === 'resources' ? (
                    resources.map(item => (
                        <View key={item.id.toString()} style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons
                                    name={item.type === 'shelter' ? 'home' : 'basket'}
                                    size={24}
                                    color="#FFFFFF"
                                />
                                <Text style={styles.sectionTitle}>{item.name}</Text>
                            </View>
                            <Text style={styles.sectionContent}>{item.description}</Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Distance:</Text>
                                <Text style={styles.distanceText}>{item.distance} miles away</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Open Now:</Text>
                                <Text style={styles.infoValue}>
                                    {item.openNow ? 'Yes' : 'No'}
                                </Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Accessibility:</Text>
                                <Text style={styles.infoValue}>
                                    {item.accessibility ? 'Yes' : 'No'}
                                </Text>
                            </View>

                            {item.services && (
                                <View style={styles.servicesContainer}>
                                    <Text style={styles.servicesTitle}>Services Available:</Text>
                                    {item.services.map((service, index) => (
                                        <View key={index} style={styles.serviceItem}>
                                            <Ionicons name="checkmark-circle" size={18} color="#28a745" />
                                            <Text style={styles.serviceText}>{service}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    ))
                ) : (
                    campaigns.map(item => (
                        <View key={item.id.toString()} style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="heart" size={24} color="#FFFFFF" />
                                <Text style={styles.sectionTitle}>{item.title}</Text>
                                {item.verified && (
                                    <Ionicons name="checkmark-circle" size={20} color="#28a745" />
                                )}
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Organizer:</Text>
                                <Text style={styles.infoValue}>{item.organizer}</Text>
                            </View>
                            <Text style={styles.sectionContent}>{item.description}</Text>

                            <View style={styles.campaignProgress}>
                                <View style={styles.progressBar}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            {width: `${(item.amountRaised / item.goal) * 100}%`}
                                        ]}
                                    />
                                </View>
                                <View style={styles.progressInfo}>
                                    <Text style={styles.raisedAmount}>${item.amountRaised.toLocaleString()}</Text>
                                    <Text style={styles.goalAmount}>of ${item.goal.toLocaleString()}</Text>
                                </View>
                                <Text style={styles.donorsText}>{item.donors} donors</Text>
                            </View>

                            <TouchableOpacity style={styles.donateButton}>
                                <Text style={styles.donateButtonText}>Donate Now</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}

                <Text style={styles.disclaimer}>
                    This information is updated in real-time. Always follow official instructions during emergencies.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
};

// Updated styles to match InfoScreen dark theme
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000', // Black background
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 16, // Equivalent to spacing.medium
    },
    title: {
        fontSize: 28,
        fontWeight: '400',
        color: '#FFFFFF',
        marginBottom: 24, // Equivalent to spacing.large
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: '#202020',
        borderRadius: 8,
        overflow: 'hidden',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#202020',
    },
    activeTab: {
        backgroundColor: '#1A3A5A',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '400',
        color: '#6c757d',
    },
    activeTabText: {
        color: '#007AFF',
        fontWeight: '400',
    },
    section: {
        marginBottom: 14, // Reduced spacing between cards to 14
        backgroundColor: '#202020', // Dark card background
        padding: 16, // Equivalent to spacing.medium
        borderRadius: 8, // Equivalent to borderRadius.medium
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16, // Equivalent to spacing.medium
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '400',
        color: '#FFFFFF',
        marginLeft: 8, // Equivalent to spacing.small
        flex: 1,
    },
    sectionContent: {
        fontSize: 16,
        lineHeight: 22,
        color: '#FFFFFF',
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8, // Equivalent to spacing.small
        paddingBottom: 8, // Equivalent to spacing.small
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    infoLabel: {
        fontSize: 16,
        color: '#AAAAAA', // Light gray for labels
    },
    infoValue: {
        fontSize: 16,
        color: '#FFFFFF',
    },
    distanceText: {
        fontSize: 16,
        color: '#28a745', // Green for distance
        fontWeight: '500',
    },
    servicesContainer: {
        marginTop: 12,
        backgroundColor: '#333333',
        padding: 12,
        borderRadius: 6,
    },
    servicesTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    serviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    serviceText: {
        fontSize: 14,
        color: '#FFFFFF',
        marginLeft: 8,
    },
    campaignProgress: {
        marginTop: 16,
        marginBottom: 16,
    },
    progressBar: {
        height: 12,
        backgroundColor: '#333333',
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#28a745',
    },
    progressInfo: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 4,
    },
    raisedAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    goalAmount: {
        fontSize: 14,
        color: '#AAAAAA',
        marginLeft: 6,
    },
    donorsText: {
        fontSize: 14,
        color: '#AAAAAA',
    },
    donateButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    donateButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#AAAAAA',
    },
    disclaimer: {
        marginTop: 16,
        marginBottom: 24,
        textAlign: 'center',
        fontStyle: 'italic',
        color: '#AAAAAA',
        fontSize: 14,
    },
});

export default AlertsScreen;