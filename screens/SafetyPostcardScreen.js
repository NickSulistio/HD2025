// SafetyPostcardScreen.js - Updated with Personal Info Step
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
import * as ImagePicker from 'expo-image-picker';
import IncidentService from '../components/IncidentService';

// Import the styles from onboarding - assuming they're in a shared location
import { onboardingStyles } from '../styles/onboarding';
import typography from "../styles/typography";

// All constant data remains the same
const POSTCARD_TYPES = [
    { id: 'safe', title: "I'm Safe", icon: 'checkmark-circle', color: '#4CAF50', message: "I'm safe during the current emergency. Stay updated and take care!" },
    { id: 'help', title: "I Need Help", icon: 'help-circle', color: '#F44336', message: "I need assistance during this emergency. Please reach out if you can help." },
    { id: 'donating', title: "I'm Donating", icon: 'heart', color: '#E91E63', message: "I'm donating to support those affected by this emergency. Join me if you can!" },
    { id: 'volunteering', title: "I'm Volunteering", icon: 'megaphone', color: '#2196F3', message: "I'm volunteering to help during this emergency. Contact me to get involved!" }
];

const POSTCARD_OPTIONS = [
    { id: 'awareness', title: "Awareness Postcard", icon: 'megaphone-outline', color: '#3F51B5', message: "Let people know about your situation and invite others offer support " },
    { id: 'priority', title: "High Priority Alert", icon: 'warning-outline', color: '#FF5722', message: "Let people know about a missing person or pet from your household." },
    { id: 'anonymous', title: "Anonymous", icon: 'eye-off-outline', color: '#91f296', message: "For those who want to share your story, while protecting your identity." },
    { id: 'support', title: "Offer Support", icon: 'help-buoy-outline', color: '#009688', message: "Let others know you're open to volunteering or providing resources." }
];

// New Siren Badges options
const SIREN_BADGES = [
    { id: 'language', title: "I struggle with a language barrier", image: require('../assets/language.png'), color: '#3F51B5', bgColor: 'rgba(63,81,181,0.2)' },
    { id: 'resources', title: "My community lacks resources", image: require('../assets/resources.png'), color: '#FF9800', bgColor: 'rgba(255,152,0,0.2)' },
    { id: 'disability', title: "I have a disability", image: require('../assets/disability.png'), color: '#2196F3', bgColor: 'rgba(33,150,243,0.2)' },
    { id: 'danger', title: "My home is a danger zone", image: require('../assets/danger.png'), color: '#F44336', bgColor: 'rgba(244,67,54,0.2)' }
];

const VULNERABLE_AREA_MESSAGES = [
    "Checking in from a high-risk zone — resources are limited here.",
    "This area often receives less attention during disasters but needs support too.",
    "Your donations support communities often overlooked in disaster aid.",
    "This neighborhood has limited evacuation options and needs additional resources.",
    "Areas like this one face disproportionate impacts during emergencies."
];

const RESOURCES_OPTIONS = [
    { id: 'shelters', title: "Shelters", icon: 'home-outline', color: '#FF6F00', bgColor: 'rgba(255,111,0,0.2)' },
    { id: 'reliefCenters', title: "Relief Centers", icon: 'medical-outline', color: '#00CE0A', bgColor: 'rgba(0,206,10,0.2)' },
    { id: 'evacuations', title: "Evacuations", icon: 'exit-outline', color: '#FFD400', bgColor: 'rgba(255,214,12,0.2)' }
];

const SafetyPostcardScreen = ({ navigation }) => {
    const scrollViewRef = useRef(null);
    const [inPostcardFlow, setInPostcardFlow] = useState(false);
    const [step, setStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Animation refs
    const slideAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const progressAnim = useRef(new Animated.Value(0)).current; // Start at 0

    // Step 1: Location and message
    const [selectedType, setSelectedType] = useState('safe');
    const [customMessage, setCustomMessage] = useState('');
    const [userLocation, setUserLocation] = useState(null);
    const [locationName, setLocationName] = useState('');
    const [isVulnerableArea, setIsVulnerableArea] = useState(false);
    const [vulnerableMessage, setVulnerableMessage] = useState('');
    const [useCurrentLocation, setUseCurrentLocation] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);

    // Step 2: Badges
    const [selectedBadge, setSelectedBadge] = useState(null);

    // Step 3: Create a Postcard
    const [selectedPostcardOption, setSelectedPostcardOption] = useState(null);

    // Step 4: Siren Badges (NEW STEP)
    const [selectedSirenBadges, setSelectedSirenBadges] = useState([]);

    // Step 5: Personal Information (moved to step 5)
    const [userName, setUserName] = useState('');
    const [shareZipCode, setShareZipCode] = useState(false);
    const [zipCode, setZipCode] = useState('');
    const [personalNote, setPersonalNote] = useState('');
    const [photo, setPhoto] = useState(null);

    // Sharing preferences
    const [incidents, setIncidents] = useState(null);
    const [includeIncidents, setIncludeIncidents] = useState(true);
    const [includeVulnerableInfo, setIncludeVulnerableInfo] = useState(true);
    const [includeTimestamp, setIncludeTimestamp] = useState(true);

    // Selected resource
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

    // Update progress animation when step or inPostcardFlow changes
    useEffect(() => {
        if (inPostcardFlow) {
            // Calculate the correct progress value (1/6, 2/6, 3/6, 4/6, 5/6, 6/6) - updated for 6 steps
            const newProgressValue = step / 6;

            // Use timing animation for smooth progress transition
            Animated.timing(progressAnim, {
                toValue: newProgressValue,
                duration: 250,
                easing: Easing.ease,
                useNativeDriver: false,
            }).start();
        } else {
            // Reset progress to 0 when not in postcard flow
            progressAnim.setValue(0);
        }
    }, [step, inPostcardFlow]);

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
        // Location-related code remains the same
        setLocationLoading(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const location = await Location.getCurrentPositionAsync({});
                setUserLocation(location.coords);

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

                const isVulnerable = Math.random() > 0.5;
                setIsVulnerableArea(isVulnerable);

                if (isVulnerable) {
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

    // Function to toggle a Siren Badge selection
    const toggleSirenBadge = (badgeId) => {
        setSelectedSirenBadges(prevSelected => {
            if (prevSelected.includes(badgeId)) {
                return prevSelected.filter(id => id !== badgeId);
            } else {
                return [...prevSelected, badgeId];
            }
        });
    };

    // Function to pick an image from the device gallery
    const pickImage = async () => {
        try {
            // Request permission to access media library
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Please allow access to your photo library to add a photo.',
                    [{ text: 'OK' }]
                );
                return;
            }

            // Launch the image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setPhoto(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to select photo. Please try again.');
        }
    };

    // Function to take a photo with the camera
    const takePhoto = async () => {
        try {
            // Request camera permissions
            const { status } = await ImagePicker.requestCameraPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Camera Permission Required',
                    'Please allow camera access to take a photo.',
                    [{ text: 'OK' }]
                );
                return;
            }

            // Launch the camera
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setPhoto(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'Failed to take photo. Please try again.');
        }
    };

    // Improved animation transition function
    const animateTransition = (nextStep) => {
        // Fade out current content
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: -20,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => {
            // Update the step state
            setStep(nextStep);

            // Reset position for slide in animation
            slideAnim.setValue(30);
            fadeAnim.setValue(0);

            // Small delay before fading in new content
            setTimeout(() => {
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

    // Modified startPostcardFlow function
    const startPostcardFlow = () => {
        // First, set the postcard flow state to true
        setInPostcardFlow(true);

        // Then, after a small delay to let the progress bar initialize,
        // animate to step 1
        setTimeout(() => {
            animateTransition(1);
        }, 50);
    };

    // Simplified sharePostcard function that doesn't use react-native-view-shot
    const simpleSharePostcard = () => {
        setIsProcessing(true);

        try {
            // Create a simple text message to share
            const message =
                `Siren Relief Postcard from ${userName}\n\n` +
                `${personalNote || customMessage}\n\n` +
                (locationName ? `Location: ${locationName}\n` : '') +
                (shareZipCode && zipCode ? `ZIP: ${zipCode}\n` : '') +
                `Created with Siren Relief App`;

            // Use the basic Share API
            Share.share({
                message: message,
                title: 'Siren Relief Postcard'
            }).then(result => {
                if (result.action === Share.sharedAction) {
                    // Show success message
                    Alert.alert(
                        'Postcard Shared',
                        'Your safety postcard has been shared successfully!',
                        [{ text: 'OK', onPress: () => navigation.navigate('Map') }]
                    );
                }
            });
        } catch (error) {
            console.error('Error sharing postcard:', error);
            Alert.alert('Sharing Error', 'Unable to share your safety postcard. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const goToNextStep = () => {
        // Validate input based on current step
        if (step === 1 && !customMessage) {
            Alert.alert('Message Required', 'Please enter a message for your postcard');
            return;
        }

        if (step === 3 && !selectedPostcardOption) {
            Alert.alert('Selection Required', 'Please select a postcard type');
            return;
        }

        if (step === 5 && !userName) {
            Alert.alert('Name Required', 'Please enter your name for the postcard');
            return;
        }

        // If we're at step 5, proceed to the postcard display step (6)
        // instead of immediately sharing
        if (step < 6) {
            animateTransition(step + 1);
        } else {
            // Only when we're at step 6, we actually share the postcard
            simpleSharePostcard();
        }

        // Scroll to top after step change
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: false });
        }
    };

    const goToPreviousStep = () => {
        if (step > 1) {
            animateTransition(step - 1);
        } else if (step === 1) {
            // If at step 1, go back to landing page
            animateTransition(0);

            // After a short delay to let animation finish, set inPostcardFlow to false
            setTimeout(() => {
                setInPostcardFlow(false);
            }, 200);
        }
    };

    // Modified progress bar with fixed positioning and better transitions
    const renderProgressBar = () => {
        return (
            <View style={[onboardingStyles.progressContainer]}>
                <Animated.View
                    style={[
                        onboardingStyles.progressBar,
                        { opacity: inPostcardFlow ? 1 : 0 } // Hide with opacity when not in flow
                    ]}
                >
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
                </Animated.View>
                <Text
                    style={[
                        onboardingStyles.stepText,
                        {
                            textAlign: 'right',
                            opacity: inPostcardFlow ? 1 : 0 // Hide with opacity when not in flow
                        }
                    ]}
                >
                    {`Step ${step} of 6`} {/* Updated to use template literal for 6 steps */}
                </Text>
            </View>
        );
    };

    // Render landing page (not part of step flow)
    const renderLandingPage = () => {
        return (
            <Animated.View
                style={[
                    onboardingStyles.stepContainer,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] } // Removed paddingTop: 30
                ]}
            >
                <Text style={onboardingStyles.headline}>Siren Relief</Text>
                <Text style={{...typography.title, marginBottom:16}}>Postcards</Text>
                <Text style={{...typography.bodyMedium, marginBottom:16}}>
                    Support your community by sharing an update on what you need or how you can help.
                </Text>

                {/* Create a Postcard button */}
                <TouchableOpacity
                    style={[onboardingStyles.continueButton, styles.createPostcardButton]}
                    onPress={startPostcardFlow}
                >
                    <Text style={onboardingStyles.continueButtonText}>
                        Create a Postcard
                    </Text>
                </TouchableOpacity>

                {/* Resources Section */}
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
    };

    // Render step 1: Location and message with centered image
    const renderLocationMessageStep = () => {
        return (
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
                    Siren will generate a shareable postcard based on your specific situation, whether you're seeking assistance or offering support.
                </Text>
            </Animated.View>
        );
    };

    // Step 2: Siren Badges
    const renderSirenBadgesStep = () => {
        return (
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
    };

    // Step 3: Create a Postcard with selectable options
    const renderCreatePostcardStep = () => {
        return (
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
            </Animated.View>
        );
    };

    // Step 4: Select Siren Badges (NEW STEP)
    const renderSelectSirenBadgesStep = () => {
        return (
            <Animated.View
                style={[
                    onboardingStyles.stepContainer,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                ]}
            >
                <Text style={onboardingStyles.headline}>Create a Postcard</Text>
                <Text style={{...typography.bodyMedium, marginBottom: 24}}>
                    Select your Siren Badges
                </Text>

                {/* Siren Badges Options */}
                <View style={styles.sirenBadgesContainer}>
                    {SIREN_BADGES.map((badge) => (
                        <TouchableOpacity
                            key={badge.id}
                            style={[
                                styles.sirenBadgeOption,
                                selectedSirenBadges.includes(badge.id) && {
                                    borderColor: badge.color,
                                    borderWidth: 2
                                }
                            ]}
                            onPress={() => toggleSirenBadge(badge.id)}
                        >
                            <View style={styles.sirenBadgeContent}>
                                <View style={[styles.sirenBadgeIcon, { backgroundColor: badge.bgColor }]}>
                                    <Image
                                        source={badge.image}
                                        style={styles.badgeImage}
                                        resizeMode="contain"
                                    />
                                </View>
                                <Text style={styles.sirenBadgeTitle}>{badge.title}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Selected badges count */}
                <Text style={styles.selectedBadgesText}>
                    {`${selectedSirenBadges.length} ${selectedSirenBadges.length === 1 ? 'badge' : 'badges'} selected`}
                </Text>
            </Animated.View>
        );
    };


    // Step 5: Personal Information (moved to step 5)
    const renderPersonalInfoStep = () => {
        return (
            <Animated.View
                style={[
                    onboardingStyles.stepContainer,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                ]}
            >
                <Text style={onboardingStyles.headline}>Create a Postcard</Text>
                <Text style={{...typography.bodyMedium, marginBottom: 24}}>
                    Let us know about your situation.
                </Text>

                {/* Name Input */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Your Name</Text>
                    <TextInput
                        style={[styles.textInput, { backgroundColor: 'white', color: '#333333' }]}
                        placeholder="Enter your name"
                        placeholderTextColor="#999999"
                        value={userName}
                        onChangeText={setUserName}
                    />
                </View>

                {/* Zip Code Option */}
                <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>Share your ZIP code?</Text>
                    <Switch
                        value={shareZipCode}
                        onValueChange={setShareZipCode}
                        trackColor={{ false: '#767577', true: '#4CAF50' }}
                        thumbColor={shareZipCode ? '#fff' : '#f4f3f4'}
                    />
                </View>

                {/* Zip Code Input (conditional) */}
                {shareZipCode && (
                    <View style={styles.fieldContainer}>
                        <TextInput
                            style={[styles.textInput, { backgroundColor: 'white', color: '#333333' }]}
                            placeholder="Enter ZIP code"
                            placeholderTextColor="#999999"
                            value={zipCode}
                            onChangeText={setZipCode}
                            keyboardType="numeric"
                            maxLength={10}
                        />
                    </View>
                )}

                {/* Personal Note */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Personal Note</Text>
                    <TextInput
                        style={[styles.textInput, styles.textArea, { backgroundColor: 'white', color: '#333333' }]}
                        placeholder="Add a personal note to your postcard..."
                        placeholderTextColor="#999999"
                        value={personalNote}
                        onChangeText={setPersonalNote}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                {/* Photo Upload */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Add a Photo (Optional)</Text>

                    {/* Photo action buttons */}
                    <View style={styles.photoActions}>
                        <TouchableOpacity
                            style={[styles.photoButton, { flex: 1, marginRight: 8 }]}
                            onPress={pickImage}
                        >
                            <Ionicons name="images-outline" size={22} color="#fff" />
                            <Text style={styles.photoButtonText}>
                                Gallery
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.photoButton, { flex: 1, marginLeft: 8 }]}
                            onPress={takePhoto}
                        >
                            <Ionicons name="camera-outline" size={22} color="#fff" />
                            <Text style={styles.photoButtonText}>
                                Camera
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {photo && (
                        <View style={styles.photoPreviewContainer}>
                            <Image source={{ uri: photo }} style={styles.photoPreview} />
                            <TouchableOpacity
                                style={styles.removePhotoButton}
                                onPress={() => setPhoto(null)}
                            >
                                <Ionicons name="close-circle" size={24} color="#F44336" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Removed the hidden reference for capturing as we're no longer using react-native-view-shot */}
            </Animated.View>
        );
    };

    // Step 6: Generated Postcard Display (NEW STEP)
    const renderGeneratedPostcardStep = () => {
        return (
            <Animated.View
                style={[
                    onboardingStyles.stepContainer,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                ]}
            >
                {/* Display user's name as headline */}
                <Text style={onboardingStyles.headline}>{userName}</Text>

                {/* The Generated Postcard */}
                <View style={styles.generatedPostcardContainer}>
                    <View style={styles.generatedPostcard}>
                        {/* Postcard Header */}
                        <View style={styles.generatedPostcardHeader}>
                            <Text style={styles.generatedPostcardTitle}>Siren Postcard</Text>
                        </View>

                        {/* Postcard Image (if provided) */}
                        {photo && (
                            <Image
                                source={{ uri: photo }}
                                style={styles.generatedPostcardImage}
                                resizeMode="cover"
                            />
                        )}

                        {/* Postcard Content */}
                        <View style={styles.generatedPostcardContent}>
                            {/* Personal message */}
                            <Text style={styles.generatedPostcardMessage}>
                                {personalNote || customMessage}
                            </Text>

                            {/* Display selected Siren Badges */}
                            {selectedSirenBadges.length > 0 && (
                                <View style={styles.generatedBadgesContainer}>
                                    <Text style={styles.generatedBadgesTitle}>My Situation:</Text>
                                    <View style={styles.generatedBadgesList}>
                                        {selectedSirenBadges.map(badgeId => {
                                            const badge = SIREN_BADGES.find(b => b.id === badgeId);
                                            return (
                                                <View key={badgeId} style={[styles.generatedBadge, { backgroundColor: badge.bgColor }]}>
                                                    <Image
                                                        source={badge.image}
                                                        style={styles.generatedBadgeIcon}
                                                        resizeMode="contain"
                                                    />
                                                    <Text style={[styles.generatedBadgeText, { color: badge.color }]}>
                                                        {badge.title}
                                                    </Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                </View>
                            )}

                            {/* Location info if available */}
                            {locationName && (
                                <View style={styles.generatedLocationContainer}>
                                    <Ionicons name="location" size={16} color="#666666" />
                                    <Text style={styles.generatedLocationText}>{locationName}</Text>
                                </View>
                            )}

                            {/* Display ZIP code if shared */}
                            {shareZipCode && zipCode && (
                                <Text style={styles.generatedZipText}>ZIP: {zipCode}</Text>
                            )}

                            {/* Timestamp */}
                            <Text style={styles.generatedTimestampText}>
                                {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </Text>
                        </View>

                        {/* Postcard Footer */}
                        <View style={styles.generatedPostcardFooter}>
                            <Text style={styles.generatedFooterText}>
                                Created with Siren Relief
                            </Text>
                        </View>
                    </View>

                    {/* Share Button */}
                    <TouchableOpacity
                        style={styles.shareButton}
                        onPress={simpleSharePostcard}
                    >
                        <Ionicons name="share-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.shareButtonText}>Share Postcard</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        );
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
        <KeyboardAvoidingView
            style={[onboardingStyles.container, { flex: 1 }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            {/* Dismiss keyboard when tapping outside of TextInput */}
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={{ flex: 1 }}>
                    {/* Progress bar - always rendered but with controlled opacity */}
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
                            <View>
                                {step === 0 ? renderLandingPage() : null}
                                {step === 1 ? renderLocationMessageStep() : null}
                                {step === 2 ? renderSirenBadgesStep() : null}
                                {step === 3 ? renderCreatePostcardStep() : null}
                                {step === 4 ? renderSelectSirenBadgesStep() : null}
                                {step === 5 ? renderPersonalInfoStep() : null}
                                {step === 6 ? renderGeneratedPostcardStep() : null}

                                {/* Add extra padding at the bottom to ensure scrolling works well */}
                                <View style={{ height: 80 }} />
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </TouchableWithoutFeedback>

            {/* Footer with continue button and back button - positioned absolutely */}
            <View style={[onboardingStyles.footer, {
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                borderTopWidth: 0,
                paddingTop: 0,
            }]}>
                {/* Back button (only shown when in postcard flow) */}
                {inPostcardFlow && (
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

                {/* Continue button - Only show when in postcard flow */}
                {inPostcardFlow && (
                    <TouchableOpacity
                        style={onboardingStyles.continueButton}
                        onPress={goToNextStep}
                        disabled={isProcessing}
                    >
                        {isProcessing && step === 6 ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={onboardingStyles.continueButtonText}>
                                {step < 6 ? 'Continue' : 'Share Postcard'}
                            </Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </KeyboardAvoidingView>
    );
};

// Extended styles with new elements for Siren Badges step
const styles = {
    badgeImage: {
        width: 40,
        height: 40,
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
    fieldContainer: {
        width: '100%',
        marginBottom: 16,
    },
    fieldLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#444',
        borderRadius: 8,
        padding: 14,
        fontSize: 16,
        color: '#333333',
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 16,
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
    },
    photoActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    photoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#007AFF',
        borderRadius: 8,
        padding: 12,
    },
    photoButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 8,
    },
    photoPreviewContainer: {
        marginTop: 16,
        position: 'relative',
        alignItems: 'center',
    },
    photoPreview: {
        width: '100%',
        height: 200,
        borderRadius: 8,
    },
    removePhotoButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 16,
    },
    createPostcardButton: {
        marginTop: 16,
        marginBottom: 16,
    },
    exampleImageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 0,
        width: '100%',
    },
    exampleImage: {
        width: '100%',
        height: undefined,
        marginBottom: 24,
        aspectRatio: 1,
    },
    exampleCaption: {
        textAlign: 'center',
        color: '#666',
        fontSize: 14,
        marginTop: 8,
        fontStyle: 'italic',
    },
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
        fontWeight: '400',
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
    badgesContainer: {
        marginTop: 12,
        marginBottom: 16,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 27,
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
    // Siren Badges styles
    sirenBadgesContainer: {
        flexDirection: 'column',
        marginTop: 0,
        gap: 12,
    },
    sirenBadgeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: '#202020',
    },
    sirenBadgeContent: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    sirenBadgeIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    sirenBadgeTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
    },
    selectedBadgesText: {
        fontSize: 14,
        color: '#BBBBBB',
        marginTop: 16,
        textAlign: 'center',
    },
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
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 14,
        backgroundColor: '#202020',
    },
    postcardOptionContent: {
        width: '100%',
    },
    postcardOptionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    postcardOptionIcon: {
        width: 34,
        height: 34,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    postcardOptionTitle: {
        fontSize: 20,
        fontWeight: '400',
        color: '#FFFFFF',
    },
    postcardOptionMessage: {
        fontSize: 12,
        fontFamily: 'OpenSans',
        color: '#FFFFFF',
        marginTop: 0,
        marginLeft: 0,
    },
    // Generated Postcard styles
    generatedPostcardContainer: {
        alignItems: 'center',
        width: '100%',
        marginVertical: 20,
    },
    generatedPostcard: {
        width: '100%',
        borderRadius: 16,
        backgroundColor: 'white',
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    generatedPostcardHeader: {
        padding: 16,
        backgroundColor: '#FFFFFF',
    },
    generatedPostcardTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#044F00',
    },
    generatedPostcardImage: {
        width: '100%',
        height: 324,
        borderRadius: 8, // Adds curved corners (8px radius)
        // margin: 16,      // Adds 16px margin on all sides
        // OR
        padding: 16,     // Adds 16px padding on all sides
    },
    generatedPostcardContent: {
        padding: 20,
        backgroundColor: 'white',
    },
    generatedPostcardMessage: {
        fontSize: 16,
        lineHeight: 22,
        color: '#333333',
        marginBottom: 16,
    },
    generatedBadgesContainer: {
        marginTop: 8,
        marginBottom: 16,
    },
    generatedBadgesTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#555555',
        marginBottom: 8,
    },
    generatedBadgesList: {
        flexDirection: 'column',
        gap: 8,
    },
    generatedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    generatedBadgeIcon: {
        width: 24,
        height: 24,
        marginRight: 8,
    },
    generatedBadgeText: {
        fontSize: 14,
        fontWeight: '500',
    },
    generatedLocationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 4,
    },
    generatedLocationText: {
        fontSize: 14,
        color: '#666666',
        marginLeft: 4,
    },
    generatedZipText: {
        fontSize: 14,
        color: '#666666',
        marginTop: 4,
    },
    generatedTimestampText: {
        fontSize: 12,
        color: '#999999',
        marginTop: 12,
    },
    generatedPostcardFooter: {
        padding: 12,
        backgroundColor: '#3F51B5',
        alignItems: 'center',
    },
    generatedFooterText: {
        fontSize: 14,
        fontWeight: '500',
        color: 'white',
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginTop: 20,
        width: '100%',
    },
    shareButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 8,
    },
};

export default SafetyPostcardScreen;