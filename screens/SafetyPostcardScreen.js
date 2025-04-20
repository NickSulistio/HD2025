// SafetyPostcardScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    ActivityIndicator,
    Share,
    Alert,
    Platform,
    KeyboardAvoidingView,
    Keyboard,
    TouchableWithoutFeedback,
    Animated,
    Easing,
    Switch,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import IncidentService from '../components/IncidentService';

// Import the styles from onboarding - assuming they're in a shared location
// You'll need to create similar styles or import from the same file
import { onboardingStyles } from '../styles/onboarding';
import typography from "../styles/typography";

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
    const scrollViewRef = useRef(null);
    const postcardRef = useRef();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Animation refs
    const slideAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const progressAnim = useRef(new Animated.Value(1/4)).current; // Updated for 4 steps

    // Step 1: Choose status type
    const [selectedType, setSelectedType] = useState('safe'); // Default to 'safe' for the example

    // Step 2: Location and message
    const [customMessage, setCustomMessage] = useState('');
    const [userLocation, setUserLocation] = useState(null);
    const [locationName, setLocationName] = useState('');
    const [isVulnerableArea, setIsVulnerableArea] = useState(false);
    const [vulnerableMessage, setVulnerableMessage] = useState('');
    const [useCurrentLocation, setUseCurrentLocation] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);

    // Step 3: Badges (New)
    const [selectedBadge, setSelectedBadge] = useState(null);

    // Step 4: Sharing preferences (formerly Step 3)
    const [incidents, setIncidents] = useState(null);
    const [includeIncidents, setIncludeIncidents] = useState(true);
    const [includeVulnerableInfo, setIncludeVulnerableInfo] = useState(true);
    const [includeTimestamp, setIncludeTimestamp] = useState(true);

    // Load user location and incident data
    useEffect(() => {
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

    // Initialize animations on mount
    useEffect(() => {
        slideAnim.setValue(0);
        fadeAnim.setValue(1);
        progressAnim.setValue(0.25); // Set initial progress (1/4 for step 1)
    }, []);

    const loadLocationAndData = async () => {
        setIsLoading(true);
        try {
            // Get incident data to show relevant emergencies
            const incidentData = await IncidentService.getAllIncidents();
            setIncidents(incidentData);
        } catch (error) {
            console.error('Error loading incident data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getCurrentLocation = async () => {
        setLocationLoading(true);
        try {
            // Request permission first
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

                // Check if in a vulnerable area (random for demo)
                const isVulnerable = Math.random() > 0.5;
                setIsVulnerableArea(isVulnerable);

                if (isVulnerable) {
                    // Select a random vulnerable area message
                    const randomIndex = Math.floor(Math.random() * VULNERABLE_AREA_MESSAGES.length);
                    setVulnerableMessage(VULNERABLE_AREA_MESSAGES[randomIndex]);
                }

                setUseCurrentLocation(true);
            } else {
                Alert.alert(
                    'Location Permission Required',
                    'Please enable location services to continue.',
                    [{ text: 'OK' }]
                );
                setUseCurrentLocation(false);
            }
        } catch (error) {
            console.error('Error loading location:', error);
            Alert.alert(
                'Location Error',
                'Unable to access your location. Some features may be limited.'
            );
            setUseCurrentLocation(false);
        } finally {
            setLocationLoading(false);
        }
    };

    // Animation for smooth transitions between steps
    const animateTransition = (nextStep) => {
        // Calculate the new progress value
        const newProgressValue = nextStep / 4; // Updated for 4 steps

        // First animate the progress bar separately
        Animated.timing(progressAnim, {
            toValue: newProgressValue,
            duration: 250,
            easing: Easing.ease,
            useNativeDriver: false,
        }).start();

        // Then handle content transition
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: -20, // Slide slightly up when exiting
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => {
            // Update step
            setStep(nextStep);

            // Reset position for slide in animation
            slideAnim.setValue(30); // Start from below

            // Immediately restore opacity to 0 before animating in
            fadeAnim.setValue(0);

            // Small delay to ensure state has updated
            setTimeout(() => {
                // Fade and slide in new content
                Animated.parallel([
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 250,
                        useNativeDriver: true,
                    }),
                    Animated.timing(slideAnim, {
                        toValue: 0,
                        duration: 250,
                        useNativeDriver: true,
                    })
                ]).start();
            }, 50);
        });
    };

    const goToNextStep = () => {
        if (step === 1 && !selectedType) {
            Alert.alert('Selection Required', 'Please select a safety status type');
            return;
        }

        if (step === 2 && !customMessage) {
            Alert.alert('Message Required', 'Please enter a message for your postcard');
            return;
        }

        if (step < 4) { // Updated for 4 steps
            animateTransition(step + 1);
        } else {
            // Complete the process and share the postcard
            sharePostcard();
        }

        // Scroll to top after step change
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: false });
        }
    };

    const goToPreviousStep = () => {
        if (step > 1) {
            animateTransition(step - 1);
        }
    };

    // Generate the postcard image and share it
    const sharePostcard = async () => {
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

    // Render progress indicator
    const renderProgressBar = () => (
        <View style={onboardingStyles.progressContainer}>
            <View style={onboardingStyles.progressBar}>
                <Animated.View
                    style={[
                        onboardingStyles.progressFill,
                        {
                            width: progressAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0%', '100%']
                            })
                        }
                    ]}
                />
            </View>
            <Text style={[onboardingStyles.stepText, { textAlign: 'right' }]}>
                Step {step} of 4 {/* Updated for 4 steps */}
            </Text>
        </View>
    );

    // Render step 1: Example Postcard (replacing the status type selection)
    const renderExamplePostcardStep = () => (
        <Animated.View
            style={[
                onboardingStyles.stepContainer,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
        >
            <Text style={onboardingStyles.headline}>Siren Relief</Text>
            <Text style={{...typography.title, marginBottom:16}}>Postcards</Text>
            <Text style={{...typography.bodyMedium, marginBottom:16}}>
                Support your community by sharing an update on what you need or how you can help.
            </Text>

            <View style={onboardingStyles.fieldContainer}>
                <Text style={[onboardingStyles.label, { paddingTop: 24, marginBottom: 5 }]}>Here's an example:</Text>

                {/* Example Postcard Image */}
                <View style={styles.exampleImageContainer}>
                    <Image
                        source={require('../assets/3_kodi.png')}
                        style={styles.exampleImage}
                        resizeMode="contain"
                    />
                </View>

                <Text style={styles.exampleCaption}>
                    Create your own postcard to share your emergency status with others
                </Text>
            </View>
        </Animated.View>
    );

    // Render step 2: Location and message with centered image
    const renderLocationMessageStep = () => (
        <Animated.View
            style={[
                onboardingStyles.stepContainer,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
        >
            {/* Image centered in the middle of the screen */}
            <View style={styles.exampleImageContainer}>
                <Image
                    source={require('../assets/example_postcard.png')}
                    style={styles.exampleImage}
                    resizeMode="contain"
                />
            </View>

            {/* Headline and body text below the image */}
            <Text style={{...onboardingStyles.headline, paddingTop:16, marginBottom: 8}}>
                Postcards
            </Text>
            <Text style={{...typography.bodyMedium, marginBottom: 24}}>
                Siren will generate a shareable postcard based on your specific situation, whether you're seeking assistance or offering support.</Text>
        </Animated.View>
    );

    // NEW Step 3: Siren Badges
    const renderSirenBadgesStep = () => (
        <Animated.View
            style={[
                onboardingStyles.stepContainer,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
        >
            <Text style={onboardingStyles.headline}>Siren Badges</Text>

            {/* Example badges selection */}
            <View style={styles.badgesContainer}>
                <View style={styles.badgeRow}>
                    <Image
                        source={require('../assets/red_badge.png')}
                        style={styles.badgeIcon}
                        resizeMode="contain"
                    />
                    <Text style={{...typography.bodyMedium, flex: 1}}>
                        Red badges indicate high priority alerts such as areas of danger and missing people or pets
                    </Text>
                </View>

                <View style={styles.separatorLine} />

                <View style={styles.badgeRow}>
                    <Image
                        source={require('../assets/green_badge.png')}
                        style={styles.badgeIcon}
                        resizeMode="contain"
                    />
                    <Text style={{...typography.bodyMedium, flex: 1}}>
                        Green badges let friends and family know you're safe
                    </Text>
                </View>

                <View style={styles.separatorLine} />

                <View style={styles.badgeRow}>
                    <Image
                        source={require('../assets/purple_badge.png')}
                        style={styles.badgeIcon}
                        resizeMode="contain"
                    />
                    <Text style={{...typography.bodyMedium, flex: 1}}>
                        Purple badges help identify underserved communities
                    </Text>
                </View>

                <View style={styles.separatorLine} />

                <View style={styles.badgeRow}>
                    <Image
                        source={require('../assets/yellow_badge.png')}
                        style={styles.badgeIcon}
                        resizeMode="contain"
                    />
                    <Text style={{...typography.bodyMedium, flex: 1}}>
                        Special Badges are earned when you help out your community
                    </Text>
                </View>
            </View>
        </Animated.View>
    );

    // Render step 4: Preview and Share (formerly step 3)
    const renderPreviewShareStep = () => (
        <Animated.View
            style={[
                onboardingStyles.stepContainer,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
        >
            <Text style={onboardingStyles.headline}>Preview & Share</Text>
            <Text style={onboardingStyles.bodyLarge}>
                Review your safety postcard and customize sharing options.
            </Text>

            <View style={onboardingStyles.switchContainer}>
                <Text style={onboardingStyles.label}>Include active incidents</Text>
                <Switch
                    value={includeIncidents}
                    onValueChange={setIncludeIncidents}
                    trackColor={{ false: '#555555', true: '#BFDEFF' }}
                    thumbColor={includeIncidents ? '#FFFFFF' : '#F4F4F4'}
                    ios_backgroundColor="#555555"
                />
            </View>

            {isVulnerableArea && (
                <View style={onboardingStyles.switchContainer}>
                    <Text style={onboardingStyles.label}>Include vulnerable area info</Text>
                    <Switch
                        value={includeVulnerableInfo}
                        onValueChange={setIncludeVulnerableInfo}
                        trackColor={{ false: '#555555', true: '#BFDEFF' }}
                        thumbColor={includeVulnerableInfo ? '#FFFFFF' : '#F4F4F4'}
                        ios_backgroundColor="#555555"
                    />
                </View>
            )}

            <View style={onboardingStyles.switchContainer}>
                <Text style={onboardingStyles.label}>Include timestamp</Text>
                <Switch
                    value={includeTimestamp}
                    onValueChange={setIncludeTimestamp}
                    trackColor={{ false: '#555555', true: '#BFDEFF' }}
                    thumbColor={includeTimestamp ? '#FFFFFF' : '#F4F4F4'}
                    ios_backgroundColor="#555555"
                />
            </View>

            <Text style={onboardingStyles.label}>Postcard Preview:</Text>
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

                        {/* Display selected badge if any */}
                        {selectedBadge && (
                            <View style={styles.selectedBadgeContainer}>
                                <Ionicons
                                    name={POSTCARD_TYPES.find(t => t.id === selectedBadge).icon}
                                    size={20}
                                    color={POSTCARD_TYPES.find(t => t.id === selectedBadge).color}
                                />
                                <Text style={[
                                    styles.selectedBadgeText,
                                    { color: POSTCARD_TYPES.find(t => t.id === selectedBadge).color }
                                ]}>
                                    {POSTCARD_TYPES.find(t => t.id === selectedBadge).title}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.postcardBody}>
                        <Text style={styles.postcardMessage}>{customMessage}</Text>

                        {includeIncidents && incidents && incidents.fires && incidents.fires.length > 0 && (
                            <Text style={styles.activeIncidentsText}>
                                Active incidents: {incidents.fires.map(fire => fire.title).join(', ')}
                            </Text>
                        )}

                        {includeVulnerableInfo && isVulnerableArea && (
                            <Text style={styles.postcardVulnerableMessage}>{vulnerableMessage}</Text>
                        )}
                    </View>

                    <View style={styles.postcardFooter}>
                        {useCurrentLocation && (
                            <>
                                <Ionicons name="location" size={16} color="#666" />
                                <Text style={styles.locationText}>{locationName}</Text>
                            </>
                        )}
                        {includeTimestamp && (
                            <Text style={styles.timestampText}>{new Date().toLocaleString()}</Text>
                        )}
                    </View>

                    <View style={styles.postcardBranding}>
                        <Text style={styles.brandingText}>Emergency Incident Map</Text>
                    </View>
                </View>
            </View>
        </Animated.View>
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size={48} color="#007AFF" />
                <Text style={styles.loadingText}>Preparing your safety postcard...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={[onboardingStyles.container, { flex: 1 }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            {/* Dismiss keyboard when tapping outside of TextInput */}
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={{ flex: 1 }}>
                    {/* Progress bar - kept outside the ScrollView to ensure visibility */}
                    <View style={{ paddingTop: Platform.OS === 'ios' ? 30 : 25 }}>
                        {renderProgressBar()}
                    </View>

                    {/* Main Content - Wrap in a flex View */}
                    <View style={{ flex: 1 }}>
                        <ScrollView
                            ref={scrollViewRef}
                            style={onboardingStyles.scrollView}
                            contentContainerStyle={onboardingStyles.scrollViewContent}
                            keyboardShouldPersistTaps="handled"
                        >
                            {step === 1 && renderExamplePostcardStep()}
                            {step === 2 && renderLocationMessageStep()}
                            {step === 3 && renderSirenBadgesStep()}
                            {step === 4 && renderPreviewShareStep()}

                            {/* Add extra padding at the bottom to ensure scrolling works well */}
                            <View style={{ height: 80 }} />
                        </ScrollView>
                    </View>
                </View>
            </TouchableWithoutFeedback>

            {/* Footer with continue button and back button - positioned absolutely */}
            <View style={[onboardingStyles.footer, {
                position: 'absolute',
                bottom:0,
                left: 0,
                right: 0,
                borderTopWidth: 0,
                paddingTop: 0,
            }]}>
                {/* Back button (only shown on steps 2, 3, and 4) */}
                {step > 1 && (
                    <TouchableOpacity
                        style={{
                            alignItems: 'center',
                            paddingVertical: 12,
                            marginBottom: 8,
                        }}
                        onPress={goToPreviousStep}
                    >
                        <Text style={{
                            fontFamily: 'OpenSans',
                            fontSize: 15,
                            color: '#FFFFFF',
                            fontWeight: '500',
                        }}>
                            Back
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Continue button */}
                <TouchableOpacity
                    style={onboardingStyles.continueButton}
                    onPress={goToNextStep}
                    disabled={isProcessing}
                >
                    {isProcessing && step === 4 ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={onboardingStyles.continueButtonText}>
                            {step < 4 ? 'Continue' : 'Share Postcard'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

// Add the styles that aren't in the onboardingStyles
const styles = {
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
    // Updated styles for images
    exampleImageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 0,
        width: '100%',
    },
    exampleImage: {
        width: '100%',
        height: undefined,
        aspectRatio: 1, // Adjust this value if needed to maintain proper aspect ratio
    },
    exampleCaption: {
        textAlign: 'center',
        color: '#666',
        fontSize: 14,
        marginTop: 8,
        fontStyle: 'italic',
    },
    vulnerableBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF8E1',
        borderRadius: 8,
        padding: 16,
        marginTop: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#FF9800',
    },
    vulnerableText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: '#FF6F00',
    },
    // New Badge styles
    badgesContainer: {
        marginTop: 12,
        marginBottom: 16,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 27, // Increased vertical padding
    },
    separatorLine: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 8,
    },
    badgeIcon: {
        width: 48,
        height: 48,
        marginRight: 16,
    },
    badgeOption: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 16,
        backgroundColor: '#F9F9F9',
    },
    badgeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 4,
    },
    badgeDescription: {
        fontSize: 14,
        color: '#666',
    },
    selectedBadgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        padding: 6,
        borderRadius: 16,
        backgroundColor: '#F5F5F5',
    },
    selectedBadgeText: {
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 4,
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
};

export default SafetyPostcardScreen;