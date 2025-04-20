// OnboardingScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Switch,
    ActivityIndicator,
    Animated,
    Easing,
    Alert,
    Keyboard,
    TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

// Import the styles from our styles folder
import { onboardingStyles } from '../styles/onboarding';


const OnboardingScreen = ({ onComplete }) => {
    // Near the top of your component function, add:
    const scrollViewRef = useRef(null);
    const [step, setStep] = useState(1);
    const [locationLoading, setLocationLoading] = useState(false);

    // Animation refs
    const slideAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;
    // New animated value for progress bar
    const progressAnim = useRef(new Animated.Value(1/3)).current;

    // Step 1: Location data
    const [zipCode, setZipCode] = useState('');
    const [useCurrentLocation, setUseCurrentLocation] = useState(false);
    const [locationData, setLocationData] = useState(null);

    // Step 2: Household info
    const [householdSize, setHouseholdSize] = useState(1);
    const [hasPets, setHasPets] = useState(false);
    const [accessibilityNeeds, setAccessibilityNeeds] = useState(false);
    const [accessibilityDetails, setAccessibilityDetails] = useState('');

    // Step 3: Notifications
    const [allowNotifications, setAllowNotifications] = useState(true);

    // Get current location using Apple/Android location services
    const getCurrentLocation = async () => {
        setLocationLoading(true);
        try {
            // Request permission first - this uses the system permission dialog
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Location Permission Required',
                    'This app needs access to your location to provide relevant emergency information. Please enable location services in your device settings.',
                    [{ text: 'OK' }]
                );
                setUseCurrentLocation(false);
                setLocationLoading(false);
                return;
            }

            // Get the current position
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced
            });

            setLocationData({
                coords: location.coords
            });

            // Reverse geocode to get the address
            const address = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            if (address && address.length > 0) {
                // Update location data with address
                setLocationData(prevData => ({
                    ...prevData,
                    address: address[0]
                }));

                // Auto-fill zipcode if available
                if (address[0].postalCode) {
                    setZipCode(address[0].postalCode);
                }

                setUseCurrentLocation(true);
            }
        } catch (error) {
            console.error('Error getting location:', error);
            Alert.alert(
                'Location Error',
                'Could not get your location. Please enter your ZIP code manually.',
                [{ text: 'OK' }]
            );
            setUseCurrentLocation(false);
        } finally {
            setLocationLoading(false);
        }
    };

    // Animation for smooth transitions between steps
    const animateTransition = (nextStep) => {
        // Calculate the new progress value
        const newProgressValue = nextStep / 3;

        // First animate the progress bar separately (before content animation)
        Animated.timing(progressAnim, {
            toValue: newProgressValue,
            duration: 250,
            easing: Easing.ease, // Use standard ease function
            useNativeDriver: false, // Required for layout properties
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
        if (step === 1 && !zipCode && !useCurrentLocation) {
            Alert.alert('Location Required', 'Please enter your ZIP code or use your current location');
            return;
        }

        if (step < 3) {
            animateTransition(step + 1);
        } else {
            // Combine all data and complete onboarding
            const userData = {
                location: useCurrentLocation ? locationData : { zipCode },
                household: {
                    size: householdSize,
                    hasPets,
                    accessibilityNeeds,
                    accessibilityDetails: accessibilityNeeds ? accessibilityDetails : ''
                },
                notifications: allowNotifications
            };

            // Send to parent component
            if (onComplete) {
                onComplete(userData);
            }
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

    // Initialize animations on mount
    useEffect(() => {
        slideAnim.setValue(0);
        fadeAnim.setValue(1);
        progressAnim.setValue(0.33); // Set initial progress (1/3 for step 1)
    }, []);

    // Render animated progress indicator
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
                Step {step} of 3
            </Text>
        </View>
    );

    // Render step 1: Location
    const renderLocationStep = () => (
        <Animated.View
            style={[
                onboardingStyles.stepContainer,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
        >
            <Text style={onboardingStyles.headline}>Where are you now?</Text>
            <Text style={onboardingStyles.bodyLarge}>
                Your location helps us provide relevant emergency information and alerts.
            </Text>

            <View style={onboardingStyles.fieldContainer}>
                <Text style={onboardingStyles.label}>ZIP Code</Text>
                <TextInput
                    style={onboardingStyles.input}
                    value={zipCode}
                    onChangeText={setZipCode}
                    placeholder="Enter your ZIP code"
                    placeholderTextColor="#888888"
                    keyboardType="numeric"
                    maxLength={5}
                    // returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                    blurOnSubmit={true}
                />
            </View>

            <View style={onboardingStyles.separator}>
                <View style={onboardingStyles.separatorLine} />
                <Text style={onboardingStyles.separatorText}>OR</Text>
                <View style={onboardingStyles.separatorLine} />
            </View>

            <TouchableOpacity
                style={[
                    onboardingStyles.locationButton,
                    // Removed the conditional styling for active state
                    {
                        backgroundColor: '#FFFFFF',  // Always white background
                    }
                ]}
                onPress={getCurrentLocation}
            >
                {locationLoading ? (
                    <ActivityIndicator size="small" color="#000000" />
                ) : (
                    <>
                        <Ionicons
                            name="location"
                            size={22}
                            color="#000000"  // Always dark icon
                        />
                        <Text
                            style={[
                                onboardingStyles.locationButtonText,
                                { color: '#000000' }  // Always dark text
                            ]}
                        >
                            Use My Current Location
                        </Text>
                    </>
                )}
            </TouchableOpacity>

            {useCurrentLocation && locationData && locationData.address && (
                <View style={onboardingStyles.locationConfirmation}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CD964" />
                    <Text style={onboardingStyles.locationConfirmationText}>
                        Location detected: {locationData.address.city || ''},
                        {locationData.address.region || ''} {locationData.address.postalCode || ''}
                    </Text>
                </View>
            )}
        </Animated.View>
    );

    // Render step 2: Household Info
    const renderHouseholdStep = () => (
        <Animated.View
            style={[
                onboardingStyles.stepContainer,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
        >
            <Text style={onboardingStyles.headline}>Household Information</Text>
            <Text style={{...onboardingStyles.bodyLarge, marginBottom:50}}>
                Help us understand your needs during an emergency.
            </Text>

            <View style={onboardingStyles.fieldContainer}>
                <Text style={onboardingStyles.label}>How many people are in your household?</Text>
                <View style={onboardingStyles.counterContainer}>
                    <TouchableOpacity
                        style={onboardingStyles.counterButton}
                        onPress={() => setHouseholdSize(Math.max(1, householdSize - 1))}
                    >
                        <Ionicons name="remove" size={22} color="#FFFFFF" />
                    </TouchableOpacity>

                    <Text style={onboardingStyles.counterText}>{householdSize}</Text>

                    <TouchableOpacity
                        style={onboardingStyles.counterButton}
                        onPress={() => setHouseholdSize(householdSize + 1)}
                    >
                        <Ionicons name="add" size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={onboardingStyles.switchContainer}>
                <Text style={onboardingStyles.label}>Do you have pets?</Text>
                <Switch
                    value={hasPets}
                    onValueChange={setHasPets}
                    trackColor={{ false: '#555555', true: '#BFDEFF' }}
                    thumbColor={hasPets ? '#FFFFFF' : '#F4F4F4'}
                    ios_backgroundColor="#555555"
                />
            </View>

            <View style={onboardingStyles.switchContainer}>
                <Text style={onboardingStyles.label}>Any accessibility needs?</Text>
                <Switch
                    value={accessibilityNeeds}
                    onValueChange={setAccessibilityNeeds}
                    trackColor={{ false: '#555555', true: '#BFDEFF' }}
                    thumbColor={accessibilityNeeds ? '#FFFFFF' : '#F4F4F4'}
                    ios_backgroundColor="#555555"
                />
            </View>

            {accessibilityNeeds && (
                <View style={onboardingStyles.fieldContainer}>
                    <Text style={onboardingStyles.label}>Please specify any accessibility needs:</Text>
                    <TextInput
                        style={[onboardingStyles.input, onboardingStyles.textArea]}
                        value={accessibilityDetails}
                        onChangeText={setAccessibilityDetails}
                        placeholder="E.g., mobility assistance, medical equipment, etc."
                        placeholderTextColor="#888888"
                        multiline={true}
                        numberOfLines={3}
                    />
                </View>
            )}
        </Animated.View>
    );

    // Render step 3: Notifications
    const renderNotificationsStep = () => (
        <Animated.View
            style={[
                onboardingStyles.stepContainer,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
        >
            <Text style={onboardingStyles.headline}>Alerts & Notifications</Text>
            <Text style={onboardingStyles.bodyLarge}>
                Receive important updates about emergencies in your area.
            </Text>

            <View style={onboardingStyles.notificationOptions}>
                <TouchableOpacity
                    style={[
                        onboardingStyles.notificationOption,
                        allowNotifications && onboardingStyles.activeNotificationOption
                    ]}
                    onPress={() => setAllowNotifications(true)}
                >
                    <View style={onboardingStyles.notificationContent}>
                        <Ionicons
                            name="notifications"
                            size={32}
                            color={allowNotifications ? "#FFFFFF" : "#999999"}
                        />
                        <Text style={[
                            onboardingStyles.notificationTitle,
                            allowNotifications && onboardingStyles.activeNotificationTitle
                        ]}>
                            Yes, notify me
                        </Text>
                        <Text style={[
                            onboardingStyles.notificationDescription,
                            allowNotifications && onboardingStyles.activeNotificationDescription
                        ]}>
                            I want to receive important emergency alerts
                        </Text>
                    </View>
                    <View style={[
                        onboardingStyles.radioButton,
                        allowNotifications && onboardingStyles.radioButtonActive
                    ]}>
                        {allowNotifications && <View style={onboardingStyles.radioButtonInner} />}
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        onboardingStyles.notificationOption,
                        !allowNotifications && onboardingStyles.activeNotificationOption
                    ]}
                    onPress={() => setAllowNotifications(false)}
                >
                    <View style={onboardingStyles.notificationContent}>
                        <Ionicons
                            name="notifications-off"
                            size={32}
                            color={!allowNotifications ? "#FFFFFF" : "#999999"}
                        />
                        <Text style={[
                            onboardingStyles.notificationTitle,
                            !allowNotifications && onboardingStyles.activeNotificationTitle
                        ]}>
                            No, not now
                        </Text>
                        <Text style={[
                            onboardingStyles.notificationDescription,
                            !allowNotifications && onboardingStyles.activeNotificationDescription
                        ]}>
                            I'll manage notification settings later
                        </Text>
                    </View>
                    <View style={[
                        onboardingStyles.radioButton,
                        !allowNotifications && onboardingStyles.radioButtonActive
                    ]}>
                        {!allowNotifications && <View style={onboardingStyles.radioButtonInner} />}
                    </View>
                </TouchableOpacity>
            </View>

        </Animated.View>
    );

    return (
        <KeyboardAvoidingView
            style={[onboardingStyles.container, { flex: 1 }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                            {step === 1 && renderLocationStep()}
                            {step === 2 && renderHouseholdStep()}
                            {step === 3 && renderNotificationsStep()}

                            {/* Add extra padding at the bottom to ensure scrolling works well */}
                            <View style={{ height: 80 }} />
                        </ScrollView>
                    </View>
                </View>
            </TouchableWithoutFeedback>

            {/* Footer with continue button and back button - positioned absolutely */}
            <View style={[onboardingStyles.footer, {
                position: 'absolute',
                bottom: 20,
                left: 0,
                right: 0,
                borderTopWidth: 0, // Remove the top border
                paddingTop: 0, // Reduce top padding to bring elements closer
            }]}>
                {/* Back button (only shown on steps 2 and 3) */}
                {step > 1 && (
                    <TouchableOpacity
                        style={{
                            alignItems: 'center',
                            paddingVertical: 12,
                            marginBottom: 8, // Add margin between back and continue
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
                >
                    <Text style={onboardingStyles.continueButtonText}>
                        {step < 3 ? 'Continue' : 'Complete Setup'}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

export default OnboardingScreen;