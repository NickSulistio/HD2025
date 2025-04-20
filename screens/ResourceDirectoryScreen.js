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
    Platform
} from 'react-native';
import * as Location from 'expo-location';

// Import the ResourceService (make sure the path is correct)
// Since we don't have the actual file yet, we'll create a placeholder
const ResourceService = {
    getResources: async (location) => {
        // Return mock data for now
        return [
            {
                id: 1,
                name: "Westside Community Shelter",
                type: "shelter",
                description: "Emergency shelter providing temporary housing and support services for individuals and families affected by disasters.",
                latitude: 34.0512,
                longitude: -118.4228,
                services: [
                    "Emergency housing",
                    "Food services",
                    "Clothing distribution"
                ],
                accessibility: true,
                openNow: true,
                distance: 2.3
            },
            {
                id: 2,
                name: "Santa Monica Food Bank",
                type: "foodBank",
                description: "Providing emergency food supplies to those affected by fires and other emergencies.",
                latitude: 34.0195,
                longitude: -118.4912,
                services: [
                    "Emergency food boxes",
                    "Fresh produce distribution"
                ],
                accessibility: true,
                openNow: false,
                distance: 3.1
            }
        ];
    },
    getCampaigns: async () => {
        // Return mock campaign data
        return [
            {
                id: 1,
                title: "Palisades Fire Relief Fund",
                organizer: "LA Community Foundation",
                description: "Supporting families who lost their homes in the recent Palisades Fire.",
                amountRaised: 57500,
                goal: 100000,
                donors: 423,
                verified: true
            }
        ];
    }
};

// Main component
const ResourceDirectoryScreen = ({ navigation }) => {
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
            <View style={styles.container}>
                <ActivityIndicator size={48} color="#007AFF" />
                <Text style={styles.loadingText}>Loading resources...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
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
                <FlatList
                    data={resources}
                    renderItem={({ item }) => (
                        <View style={styles.resourceCard}>
                            <Text style={styles.resourceName}>{item.name}</Text>
                            <Text style={styles.resourceDescription}>{item.description}</Text>
                            <Text style={styles.resourceDistance}>{item.distance} miles away</Text>
                        </View>
                    )}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                />
            ) : (
                <FlatList
                    data={campaigns}
                    renderItem={({ item }) => (
                        <View style={styles.campaignCard}>
                            <Text style={styles.campaignTitle}>{item.title}</Text>
                            <Text style={styles.campaignOrganizer}>By {item.organizer}</Text>
                            <Text style={styles.campaignDescription}>{item.description}</Text>
                            <View style={styles.campaignProgress}>
                                <Text>${item.amountRaised} raised of ${item.goal} goal</Text>
                            </View>
                        </View>
                    )}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#555',
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginVertical: 16,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#e0e0e0',
    },
    activeTab: {
        borderBottomColor: '#007AFF',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#6c757d',
    },
    activeTabText: {
        color: '#007AFF',
        fontWeight: 'bold',
    },
    listContent: {
        padding: 16,
    },
    resourceCard: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    resourceName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    resourceDescription: {
        color: '#6c757d',
        marginBottom: 8,
    },
    resourceDistance: {
        fontSize: 14,
        color: '#28a745',
        fontWeight: '500',
    },
    campaignCard: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    campaignTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    campaignOrganizer: {
        fontSize: 14,
        color: '#6c757d',
        marginBottom: 8,
    },
    campaignDescription: {
        color: '#333',
        marginBottom: 12,
    },
    campaignProgress: {
        marginTop: 8,
    }
});

export default ResourceDirectoryScreen;