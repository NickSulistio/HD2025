import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import our components
import LiveIncidentMapWithZones from './components/LiveIncidentMapWithZones';
import SafetyPostcardScreen from './screens/SafetyPostcardScreen';
import ResourceDirectoryScreen from './screens/ResourceDirectoryScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import SplashScreen from './screens/SplashScreen';
import IncidentService from './components/IncidentService';
import InfoScreen from './screens/InfoScreen';


// Create a Tab Navigator
const Tab = createBottomTabNavigator();

// Main App Component
export default function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [incidentData, setIncidentData] = useState(null);
    const [error, setError] = useState(null);
    const [showOnboarding, setShowOnboarding] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [showSplash, setShowSplash] = useState(true);

    const updateUserProfile = (newProfile) => {
        setUserProfile(newProfile);
    };

    // Handle splash screen completion
    const handleSplashComplete = () => {
        setShowSplash(false);
    };

    useEffect(() => {
        // Check if user has completed onboarding
        const checkOnboardingStatus = async () => {
            try {
                const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
                const userData = await AsyncStorage.getItem('userProfile');

                if (onboardingCompleted === 'true' && userData) {
                    setShowOnboarding(false);
                    setUserProfile(JSON.parse(userData));
                }
            } catch (e) {
                console.error('Error checking onboarding status:', e);
            }
        };

        // Load initial incident data
        const loadIncidents = async () => {
            try {
                const data = await IncidentService.getAllIncidents();
                setIncidentData(data);
                setIsLoading(false);
            } catch (err) {
                console.error('Error loading incidents:', err);
                setError('Could not load incident data. Please try again later.');
                setIsLoading(false);
            }
        };

        checkOnboardingStatus();
        loadIncidents();
    }, []);

    const handleOnboardingComplete = async (userData) => {
        try {
            await AsyncStorage.setItem('onboardingCompleted', 'true');
            await AsyncStorage.setItem('userProfile', JSON.stringify(userData));

            setUserProfile(userData);
            setShowOnboarding(false);
        } catch (e) {
            console.error('Error saving onboarding data:', e);
        }
    };

    // Show splash screen first, independent of other app states
    if (showSplash) {
        return <SplashScreen onComplete={handleSplashComplete} />;
    }

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size={48} color="#000000" />
                <Text style={styles.loadingText}>Loading emergency data...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={60} color="#FF3B30" />
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (showOnboarding) {
        return <OnboardingScreen onComplete={handleOnboardingComplete} />;
    }

    return (
        <>
            <NavigationContainer>
                <Tab.Navigator
                    screenOptions={({ route }) => ({
                        tabBarIcon: ({ focused, color, size }) => {
                            let iconName;

                            if (route.name === 'Map') {
                                iconName = focused ? 'map' : 'map-outline';
                            } else if (route.name === 'Resources') {
                                iconName = focused ? 'medical' : 'medical-outline';
                            } else if (route.name === 'Safety') {
                                iconName = focused ? 'bag-add' : 'bag-add-outline';
                            } else if (route.name === 'Info') {
                                iconName = focused ? 'home' : 'home-outline';
                            }

                            return <Ionicons name={iconName} size={size} color={color} />;
                        },
                        tabBarActiveTintColor: '#FFFFFF',
                        tabBarInactiveTintColor: '#AAAAAA',
                        tabBarStyle: {
                            backgroundColor: '#000000',
                            borderTopColor: '#333333',
                            height: 65,
                            paddingTop: 5,
                            paddingBottom: 10,
                        },
                        headerShown: false,
                    })}
                >
                    <Tab.Screen
                        name="Map"
                        options={{ title: 'Map' }}
                    >
                        {(props) => <LiveIncidentMapWithZones {...props} incidentData={incidentData} userProfile={userProfile} />}
                    </Tab.Screen>

                    <Tab.Screen
                        name="Resources"
                        component={ResourceDirectoryScreen}
                        options={{ title: 'Resource Directory' }}
                    />

                    <Tab.Screen
                        name="Safety"
                        component={SafetyPostcardScreen}
                        options={{ title: 'Relief' }}
                    />

                    <Tab.Screen
                        name="Info"
                        options={{ title: 'My Profile' }}
                    >
                        {(props) => <InfoScreen
                            {...props}
                            userProfile={userProfile}
                            updateUserProfile={updateUserProfile}
                        />}
                    </Tab.Screen>
                </Tab.Navigator>
            </NavigationContainer>
            <StatusBar style="light" />
        </>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
    },
    loadingText: {
        marginTop: 20,
        fontSize: 17, // Body Large from your design system
        fontFamily: 'OpenSans',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
        padding: 20,
    },
    errorText: {
        marginTop: 20,
        fontSize: 17, // Body Large from your design system
        fontFamily: 'OpenSans',
        textAlign: 'center',
        color: '#FF3B30',
    },
    infoContainer: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F8F8F8',
    },
    infoTitle: {
        fontSize: 28, // Headline from your design system
        fontFamily: 'Helvetica',
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    infoSection: {
        marginBottom: 20,
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    infoSectionTitle: {
        fontSize: 22, // Title from your design system
        fontFamily: 'Helvetica',
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#000000', // Changed from blue to black
    },
    infoText: {
        fontSize: 15, // Body Medium from your design system
        fontFamily: 'OpenSans',
        lineHeight: 24,
    },
    disclaimer: {
        marginTop: 20,
        textAlign: 'center',
        fontStyle: 'italic',
        color: '#666666',
        fontSize: 13, // Body Small from your design system
        fontFamily: 'OpenSans',
    },
});