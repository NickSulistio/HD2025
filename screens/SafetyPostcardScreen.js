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

// NEW: Postcard options for step 4
const POSTCARD_OPTIONS = [
    { id: 'awareness', title: "Awareness Postcard", icon: 'megaphone-outline', color: '#3F51B5', message: "Let people know about your situation and invite others offer support " },
    { id: 'priority', title: "High Priority Alert", icon: 'warning-outline', color: '#FF5722', message: "Let people know about a missing person or pet from your household." },
    { id: 'anonymous', title: "Anonymous", icon: 'eye-off-outline', color: '#91f296', message: "For those who want to share your story, while protecting your identity." },
    { id: 'support', title: "Offer Support", icon: 'help-buoy-outline', color: '#009688', message: "Let others know you're open to volunteering or providing resources." }
];

// Vulnerable area messages for social justice integration
const VULNERABLE_AREA_MESSAGES = [
    "Checking in from a high-risk zone — resources are limited here.",
    "This area often receives less attention during disasters but needs support too.",
    "Your donations support communities often overlooked in disaster aid.",
    "This neighborhood has limited evacuation options and needs additional resources.",
    "Areas like this one face disproportionate impacts during emergencies."
];

// NEW: Resources options for step 1
const RESOURCES_OPTIONS = [
    { id: 'shelters', title: "Shelters", icon: 'home-outline', color: '#FF6F00', bgColor: 'rgba(255,111,0,0.2)' },
    { id: 'reliefCenters', title: "Relief Centers", icon: 'medical-outline', color: '#00CE0A', bgColor: 'rgba(0,206,10,0.2)' },
    { id: 'evacuations', title: "Evacuations", icon: 'exit-outline', color: '#FFD400', bgColor: 'rgba(255,214,12,0.2)' }
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

    // Step 4: Create a Postcard - NEW
    const [selectedPostcardOption, setSelectedPostcardOption] = useState(null);

    // Sharing preferences (moved from step 4)
    const [incidents, setIncidents] = useState(null);
    const [includeIncidents, setIncludeIncidents] = useState(true);
    const [includeVulnerableInfo, setIncludeVulnerableInfo] = useState(true);
    const [includeTimestamp, setIncludeTimestamp] = useState(true);

    // NEW: Selected resource
    const [selectedResource, setSelectedResource] = useState(null);

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
        if (step === 1 && !selectedResource) {
            Alert.alert('Selection Required', 'Please select a resource option');
            return;
        }

        if (step === 2 && !customMessage) {
            Alert.alert('Message Required', 'Please enter a message for your postcard');
            return;
        }

        if (step === 4 && !selectedPostcardOption) {
            Alert.alert('Selection Required', 'Please select a postcard type');
            return;
        }

        if (step < 4) {
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
                Step {step} of 4
            </Text>
        </View>
    );

    // UPDATED: Render step 1 with Resources title and buttons
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

            {/* NEW Resources Section */}
            <View style={styles.fieldContainer}>
                <Text style={[typography.title, { marginTop: 24, marginBottom: 16 }]}>Resources</Text>

                {/* Resources Buttons */}
                <View style={styles.resourceOptionsContainer}>
                    {RESOURCES_OPTIONS.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.resourceButton,
                                { backgroundColor: option.bgColor },
                                selectedResource === option.id && styles.selectedResourceButton
                            ]}
                            onPress={() => setSelectedResource(option.id)}
                        >
                            <Ionicons name={option.icon} size={24} color={option.color} style={styles.resourceIcon} />
                            <Text style={[styles.resourceButtonText, { color: option.color }]}>{option.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
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
                        Red badges indicate high priority alerts such as areas of danger and missing people or pets.
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
                        Green badges let friends and family know you're safe.
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
                        Purple badges help identify underserved communities.
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
                        Special Badges are earned when you help out your community.
                    </Text>
                </View>
            </View>
        </Animated.View>
    );

    // NEW Step 4: Create a Postcard with selectable options
    const renderCreatePostcardStep = () => (
        <Animated.View
            style={[
                onboardingStyles.stepContainer,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
        >
            <Text style={onboardingStyles.headline}>Create a Postcard</Text>
            <Text style={{...typography.bodyMedium, marginBottom: 24}}>
                What kind of update are you sharing?
            </Text>

            {/* Postcard Options */}
            <View style={styles.postcardOptionsContainer}>
                {POSTCARD_OPTIONS.map((option) => (
                    <TouchableOpacity
                        key={option.id}
                        style={[
                            styles.postcardOption,
                            selectedPostcardOption === option.id && {
                                borderColor: option.color,
                                borderWidth: 2
                            }
                        ]}
                        onPress={() => {
                            setSelectedPostcardOption(option.id);
                            setCustomMessage(option.message);
                        }}
                    >
                        <View style={styles.postcardOptionContent}>
                            <View style={styles.postcardOptionHeader}>
                                <View style={[styles.postcardOptionIcon, { backgroundColor: `${option.color}20` }]}>
                                    <Ionicons name={option.icon} size={24} color={option.color} />
                                </View>
                                <Text style={styles.postcardOptionTitle}>{option.title}</Text>
                            </View>
                            <Text style={styles.postcardOptionMessage}>{option.message}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Hidden reference for capturing */}
            <View style={{ position: 'absolute', opacity: 0, width: 1, height: 1, overflow: 'hidden' }}>
                <View ref={postcardRef} style={{ width: 380, height: 350 }}>
                    {/* Empty invisible view for reference */}
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
                            {step === 4 && renderCreatePostcardStep()}

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
    fieldContainer: {
        width: '100%',
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
    // NEW Resource Button Styles
    resourceOptionsContainer: {
        flexDirection: 'column',
        marginBottom: 16,
        gap: 12,
    },
    resourceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: '#202020',
    },
    selectedResourceButton: {
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    resourceIcon: {
        marginRight: 12,
    },
    resourceButtonText: {
        fontSize: 18,
        fontWeight: '500',
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
    // Badge styles
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
    // Postcard Option Styles
    sharingOptionsContainer: {
        marginTop: 16,
        marginBottom: 24,
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

    postcardOptionsContainer: {
        flexDirection: 'column',
        marginTop: 0,
    },
    postcardOption: {
        flexDirection: 'column',
        padding: 12, // Reduced padding to make card smaller
        borderRadius: 10, // Slightly reduced border radius
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 14, // Reduced margin to make cards closer together
        backgroundColor: '#202020',
    },
    postcardOptionContent: {
        width: '100%',
    },
    postcardOptionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6, // Reduced margin
    },
    postcardOptionIcon: {
        width: 34, // Smaller icon
        height: 34, // Smaller icon
        borderRadius: 20, // Half the width
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12, // Reduced margin
    },
    postcardOptionTitle: {
        fontSize: 20, // Slightly smaller font
        fontWeight: '400',
        color: '#FFFFFF',
    },
    postcardOptionMessage: {
        fontSize: 12, // Smaller message text
        fontFamily:'OpenSans',
        color: '#FFFFFF',
        marginTop: 0,
        marginLeft: 0, // Removed left margin so text aligns with card edge
    },
};

export default SafetyPostcardScreen;