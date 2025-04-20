import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
    TextInput,
    ActivityIndicator,
    Share,
    ViewShot,
    Platform,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import IncidentService from '../components/IncidentService';

const POSTCARD_TYPES = [
    { id: 'safe', title: "I'm Safe", icon: 'checkmark-circle', color: '#4CAF50', message: "I'm safe during the current emergency. Stay updated and take care!" },
    { id: 'help', title: "I Need Help", icon: 'help-circle', color: '#F44336', message: "I need assistance during this emergency. Please reach out if you can help." },
    { id: 'donating', title: "I'm Donating", icon: 'heart', color: '#E91E63', message: "I'm donating to support those affected by this emergency. Join me if you can!" },
    { id: 'volunteering', title: "I'm Volunteering", icon: 'megaphone', color: '#2196F3', message: "I'm volunteering to help during this emergency. Contact me to get involved!" }
];

// Vulnerable area messages for social justice integration
const VULNERABLE_AREA_MESSAGES = [
    "Checking in from a high-risk zone — resources are limited here.",
    "This area often receives less attention during disasters but needs support too.",
    "Your donations support communities often overlooked in disaster aid.",
    "This neighborhood has limited evacuation options and needs additional resources.",
    "Areas like this one face disproportionate impacts during emergencies."
];

const SafetyPostcardScreen = ({ navigation }) => {
    const [selectedType, setSelectedType] = useState(null);
    const [customMessage, setCustomMessage] = useState('');
    const [userLocation, setUserLocation] = useState(null);
    const [locationName, setLocationName] = useState('');
    const [isVulnerableArea, setIsVulnerableArea] = useState(false);
    const [vulnerableMessage, setVulnerableMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [incidents, setIncidents] = useState(null);
    const postcardRef = useRef();

    // Load user location and incident data
    useEffect(() => {
        const loadLocationAndData = async () => {
            setIsLoading(true);
            try {
                // Get user location
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const location = await Location.getCurrentPositionAsync({});
                    setUserLocation(location.coords);

                    // Get address from coordinates
                    const address = await Location.reverseGeocodeAsync({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude
                    });

                    if (address && address.length > 0) {
                        const loc = address[0];
                        setLocationName(
                            [loc.city, loc.region].filter(Boolean).join(', ') ||
                            'Current Location'
                        );
                    }

                    // Check if in a vulnerable area (this would be a more complex check in a real app)
                    // For demo purposes, we'll randomly determine if the area is vulnerable
                    const isVulnerable = Math.random() > 0.5;
                    setIsVulnerableArea(isVulnerable);

                    if (isVulnerable) {
                        // Select a random vulnerable area message
                        const randomIndex = Math.floor(Math.random() * VULNERABLE_AREA_MESSAGES.length);
                        setVulnerableMessage(VULNERABLE_AREA_MESSAGES[randomIndex]);
                    }
                }

                // Get incident data to show relevant emergencies
                const incidentData = await IncidentService.getAllIncidents();
                setIncidents(incidentData);
            } catch (error) {
                console.error('Error loading location or incident data:', error);
                Alert.alert(
                    'Location Error',
                    'Unable to access your location. Some features may be limited.'
                );
            } finally {
                setIsLoading(false);
            }
        };

        loadLocationAndData();
    }, []);

    // When a postcard type is selected, set the default message
    useEffect(() => {
        if (selectedType) {
            const postcardType = POSTCARD_TYPES.find(type => type.id === selectedType);
            if (postcardType) {
                setCustomMessage(postcardType.message);
            }
        }
    }, [selectedType]);

    // Generate the postcard image and share it
    const sharePostcard = async () => {
        if (!selectedType) {
            Alert.alert('Select Type', 'Please select a safety status type');
            return;
        }

        setIsProcessing(true);

        try {
            // Capture the postcard view as an image
            const uri = await captureRef(postcardRef, {
                format: 'png',
                quality: 0.8,
            });

            // Save to media library for sharing
            await MediaLibrary.requestPermissionsAsync();
            await MediaLibrary.saveToLibraryAsync(uri);

            // Share the image
            if (Platform.OS === 'ios') {
                // iOS sharing
                await Sharing.shareAsync(uri);
            } else {
                // Android sharing
                await Share.share({
                    message: customMessage,
                    url: uri
                });
            }

            // Show success message
            Alert.alert(
                'Postcard Shared',
                'Your safety postcard has been shared successfully!',
                [{ text: 'OK', onPress: () => navigation.navigate('Map') }]
            );
        } catch (error) {
            console.error('Error sharing postcard:', error);
            Alert.alert('Sharing Error', 'Unable to share your safety postcard. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size={48} color="#007AFF" />
                <Text style={styles.loadingText}>Preparing your safety postcard...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Safety Postcard</Text>
            <Text style={styles.subtitle}>Share your status with friends, family and community</Text>

            <View style={styles.typeSection}>
                <Text style={styles.sectionTitle}>1. Choose your status:</Text>
                <View style={styles.typeGrid}>
                    {POSTCARD_TYPES.map((type) => (
                        <TouchableOpacity
                            key={type.id}
                            style={[
                                styles.typeButton,
                                selectedType === type.id && { borderColor: type.color, borderWidth: 3 }
                            ]}
                            onPress={() => setSelectedType(type.id)}
                        >
                            <Ionicons name={type.icon} size={32} color={type.color} />
                            <Text style={[styles.typeTitle, { color: type.color }]}>{type.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.messageSection}>
                <Text style={styles.sectionTitle}>2. Customize your message:</Text>
                <TextInput
                    style={styles.messageInput}
                    multiline
                    numberOfLines={4}
                    value={customMessage}
                    onChangeText={setCustomMessage}
                    placeholder="Enter your message here..."
                />
            </View>

            {isVulnerableArea && (
                <View style={styles.vulnerableBanner}>
                    <Ionicons name="alert-circle" size={24} color="#FF9800" />
                    <Text style={styles.vulnerableText}>{vulnerableMessage}</Text>
                </View>
            )}

            <Text style={styles.sectionTitle}>3. Preview your postcard:</Text>

            <View style={styles.postcardContainer}>
                <View ref={postcardRef} style={styles.postcard}>
                    <View style={styles.postcardHeader}>
                        <Text style={styles.postcardTitle}>Emergency Status Update</Text>
                        {selectedType && (
                            <View style={styles.selectedTypeContainer}>
                                <Ionicons
                                    name={POSTCARD_TYPES.find(t => t.id === selectedType).icon}
                                    size={24}
                                    color={POSTCARD_TYPES.find(t => t.id === selectedType).color}
                                />
                                <Text style={[
                                    styles.selectedTypeText,
                                    { color: POSTCARD_TYPES.find(t => t.id === selectedType).color }
                                ]}>
                                    {POSTCARD_TYPES.find(t => t.id === selectedType).title}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.postcardBody}>
                        <Text style={styles.postcardMessage}>{customMessage}</Text>

                        {incidents && incidents.fires && incidents.fires.length > 0 && (
                            <Text style={styles.activeIncidentsText}>
                                Active incidents: {incidents.fires.map(fire => fire.title).join(', ')}
                            </Text>
                        )}

                        {isVulnerableArea && (
                            <Text style={styles.postcardVulnerableMessage}>{vulnerableMessage}</Text>
                        )}
                    </View>

                    <View style={styles.postcardFooter}>
                        <Ionicons name="location" size={16} color="#666" />
                        <Text style={styles.locationText}>{locationName}</Text>
                        <Text style={styles.timestampText}>{new Date().toLocaleString()}</Text>
                    </View>

                    <View style={styles.postcardBranding}>
                        <Text style={styles.brandingText}>Emergency Incident Map</Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity
                style={styles.shareButton}
                onPress={sharePostcard}
                disabled={isProcessing}
            >
                {isProcessing ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <>
                        <Ionicons name="share-social" size={24} color="#fff" />
                        <Text style={styles.shareButtonText}>Share Postcard</Text>
                    </>
                )}
            </TouchableOpacity>

            <View style={styles.shareInfo}>
                <Text style={styles.shareInfoText}>
                    Your postcard can be shared to Instagram stories, Facebook, Messages, and more.
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#555',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 24,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    typeSection: {
        marginBottom: 24,
    },
    typeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    typeButton: {
        width: '48%',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    typeTitle: {
        marginTop: 8,
        fontWeight: 'bold',
        fontSize: 16,
    },
    messageSection: {
        marginBottom: 24,
    },
    messageInput: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        minHeight: 100,
        textAlignVertical: 'top',
        fontSize: 16,
    },
    vulnerableBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF8E1',
        borderRadius: 8,
        padding: 16,
        marginBottom: 24,
        borderLeftWidth: 4,
        borderLeftColor: '#FF9800',
    },
    vulnerableText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: '#FF6F00',
    },
    postcardContainer: {
        alignItems: 'center',
        marginVertical: 16,
    },
    postcard: {
        width: '100%',
        maxWidth: 380,
        borderRadius: 16,
        backgroundColor: 'white',
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    postcardHeader: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    postcardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    selectedTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
    },
    selectedTypeText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    postcardBody: {
        padding: 20,
        backgroundColor: '#fcfcfc',
    },
    postcardMessage: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
        marginBottom: 16,
    },
    activeIncidentsText: {
        fontSize: 14,
        color: '#D32F2F',
        marginBottom: 12,
    },
    postcardVulnerableMessage: {
        fontSize: 14,
        color: '#FF6F00',
        fontStyle: 'italic',
        marginTop: 8,
        borderLeftWidth: 2,
        borderLeftColor: '#FF9800',
        paddingLeft: 8,
    },
    postcardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        backgroundColor: '#fafafa',
    },
    locationText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 6,
        flex: 1,
    },
    timestampText: {
        fontSize: 12,
        color: '#999',
    },
    postcardBranding: {
        backgroundColor: '#007AFF',
        padding: 8,
        alignItems: 'center',
    },
    brandingText: {
        color: 'white',
        fontWeight: 'bold',
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        padding: 16,
        marginTop: 24,
        marginBottom: 16,
    },
    shareButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 12,
    },
    shareInfo: {
        padding: 16,
        alignItems: 'center',
        marginBottom: 24,
    },
    shareInfoText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    }
});

export default SafetyPostcardScreen;