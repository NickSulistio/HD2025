// InfoScreen.js
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Alert,
    ScrollView,
    SafeAreaView,
    TextInput,
    Switch,
    Modal,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const InfoScreen = ({ navigation, route, userProfile, updateUserProfile }) => {
    const [editedProfile, setEditedProfile] = useState(userProfile || {});
    const [isEditing, setIsEditing] = useState(false);
    const [editingSection, setEditingSection] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Temporary edit states
    const [tempZipCode, setTempZipCode] = useState(
        userProfile?.location?.zipCode || ''
    );
    const [useCurrentLocation, setUseCurrentLocation] = useState(false);
    const [householdSize, setHouseholdSize] = useState(
        userProfile?.household?.size || 1
    );
    const [hasPets, setHasPets] = useState(
        userProfile?.household?.hasPets || false
    );
    const [accessibilityNeeds, setAccessibilityNeeds] = useState(
        userProfile?.household?.accessibilityNeeds || false
    );
    const [accessibilityDetails, setAccessibilityDetails] = useState(
        userProfile?.household?.accessibilityDetails || ''
    );
    const [allowNotifications, setAllowNotifications] = useState(
        userProfile?.notifications || false
    );

    // Reset onboarding developer tool
    const resetOnboarding = async () => {
        try {
            await AsyncStorage.removeItem('onboardingCompleted');
            await AsyncStorage.removeItem('userProfile');
            Alert.alert(
                "Onboarding Reset",
                "Onboarding data has been reset. The app will now reload to begin onboarding.",
                [{
                    text: "OK",
                    onPress: () => {
                        // This would ideally trigger App.js to show onboarding
                        navigation.navigate('Map');
                    }
                }]
            );
        } catch (e) {
            console.error('Error resetting onboarding:', e);
            Alert.alert("Error", "Could not reset onboarding data. Please try again.");
        }
    };

    // Helper function to format the location data
    const formatLocation = () => {
        if (!editedProfile || !editedProfile.location) return "No location data";

        if (editedProfile.location.zipCode) {
            return `ZIP Code: ${editedProfile.location.zipCode}`;
        } else if (editedProfile.location.address) {
            const address = editedProfile.location.address;
            return [
                address.street,
                address.city,
                address.region,
                address.country,
                address.postalCode
            ].filter(Boolean).join(', ');
        } else if (editedProfile.location.coords) {
            return `Lat: ${editedProfile.location.coords.latitude.toFixed(4)}, Long: ${editedProfile.location.coords.longitude.toFixed(4)}`;
        }

        return "Location information unavailable";
    };

    // Get current location
    const getCurrentLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Permission to access location was denied');
                setUseCurrentLocation(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const address = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            if (address && address.length > 0) {
                const locationData = {
                    coords: location.coords,
                    address: address[0]
                };

                // Update temp state
                setUseCurrentLocation(true);
                if (address[0].postalCode) {
                    setTempZipCode(address[0].postalCode);
                }

                // Update edited profile
                setEditedProfile(prev => ({
                    ...prev,
                    location: locationData
                }));
            }
        } catch (error) {
            console.error('Error getting location:', error);
            Alert.alert('Location Error', 'Could not get your location. Please enter your ZIP code manually.');
            setUseCurrentLocation(false);
        }
    };

    // Save changes to a section
    const saveChanges = async () => {
        let updatedProfile = { ...editedProfile };

        // Save based on which section was being edited
        if (editingSection === 'location') {
            updatedProfile.location = useCurrentLocation
                ? updatedProfile.location
                : { zipCode: tempZipCode };
        }
        else if (editingSection === 'household') {
            updatedProfile.household = {
                size: householdSize,
                hasPets,
                accessibilityNeeds,
                accessibilityDetails: accessibilityNeeds ? accessibilityDetails : ''
            };
        }
        else if (editingSection === 'notifications') {
            updatedProfile.notifications = allowNotifications;
        }

        try {
            // Save to AsyncStorage
            await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));

            // Update state
            setEditedProfile(updatedProfile);

            // Update parent component if function exists
            if (updateUserProfile) {
                updateUserProfile(updatedProfile);
            }

            // Close modal
            setModalVisible(false);
            setEditingSection(null);

            Alert.alert("Success", "Your profile has been updated.");
        } catch (e) {
            console.error('Error saving profile:', e);
            Alert.alert("Error", "Could not save your profile. Please try again.");
        }
    };

    // Open edit modal for a specific section
    const openEditModal = (section) => {
        setEditingSection(section);

        // Reset temporary states to current values
        if (section === 'location') {
            setTempZipCode(editedProfile?.location?.zipCode || '');
            setUseCurrentLocation(false);
        }
        else if (section === 'household') {
            setHouseholdSize(editedProfile?.household?.size || 1);
            setHasPets(editedProfile?.household?.hasPets || false);
            setAccessibilityNeeds(editedProfile?.household?.accessibilityNeeds || false);
            setAccessibilityDetails(editedProfile?.household?.accessibilityDetails || '');
        }
        else if (section === 'notifications') {
            setAllowNotifications(editedProfile?.notifications || false);
        }

        setModalVisible(true);
    };

    // Render edit modal content based on section
    const renderModalContent = () => {
        switch (editingSection) {
            case 'location':
                return (
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Location</Text>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>ZIP Code</Text>
                            <TextInput
                                style={[styles.input, useCurrentLocation && styles.inputDisabled]}
                                value={tempZipCode}
                                onChangeText={setTempZipCode}
                                placeholder="Enter your ZIP code"
                                keyboardType="numeric"
                                maxLength={5}
                                editable={!useCurrentLocation}
                            />
                        </View>

                        <View style={styles.separator}>
                            <View style={styles.separatorLine} />
                            <Text style={styles.separatorText}>OR</Text>
                            <View style={styles.separatorLine} />
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.locationButton,
                                useCurrentLocation && styles.locationButtonActive
                            ]}
                            onPress={getCurrentLocation}
                        >
                            <Ionicons
                                name="location"
                                size={22}
                                color={useCurrentLocation ? "#FFFFFF" : "#007AFF"}
                            />
                            <Text
                                style={[
                                    styles.locationButtonText,
                                    useCurrentLocation && styles.locationButtonTextActive
                                ]}
                            >
                                Use My Current Location
                            </Text>
                        </TouchableOpacity>

                        {useCurrentLocation && editedProfile?.location?.address && (
                            <View style={styles.locationConfirmation}>
                                <Ionicons name="checkmark-circle" size={20} color="#4CD964" />
                                <Text style={styles.locationConfirmationText}>
                                    Location detected: {editedProfile.location.address.city || ''},
                                    {editedProfile.location.address.region || ''} {editedProfile.location.address.postalCode || ''}
                                </Text>
                            </View>
                        )}
                    </View>
                );

            case 'household':
                return (
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Household Information</Text>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>How many people in your household?</Text>
                            <View style={styles.counterContainer}>
                                <TouchableOpacity
                                    style={styles.counterButton}
                                    onPress={() => setHouseholdSize(Math.max(1, householdSize - 1))}
                                >
                                    <Ionicons name="remove" size={22} color="#007AFF" />
                                </TouchableOpacity>

                                <Text style={styles.counterText}>{householdSize}</Text>

                                <TouchableOpacity
                                    style={styles.counterButton}
                                    onPress={() => setHouseholdSize(householdSize + 1)}
                                >
                                    <Ionicons name="add" size={22} color="#007AFF" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.switchContainer}>
                            <Text style={styles.fieldLabel}>Do you have pets?</Text>
                            <Switch
                                value={hasPets}
                                onValueChange={setHasPets}
                                trackColor={{ false: '#E0E0E0', true: '#BFDEFF' }}
                                thumbColor={hasPets ? '#007AFF' : '#F4F4F4'}
                            />
                        </View>

                        <View style={styles.switchContainer}>
                            <Text style={styles.fieldLabel}>Any accessibility needs?</Text>
                            <Switch
                                value={accessibilityNeeds}
                                onValueChange={setAccessibilityNeeds}
                                trackColor={{ false: '#E0E0E0', true: '#BFDEFF' }}
                                thumbColor={accessibilityNeeds ? '#007AFF' : '#F4F4F4'}
                            />
                        </View>

                        {accessibilityNeeds && (
                            <View style={styles.fieldContainer}>
                                <Text style={styles.fieldLabel}>Please specify any accessibility needs:</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={accessibilityDetails}
                                    onChangeText={setAccessibilityDetails}
                                    placeholder="E.g., mobility assistance, medical equipment, etc."
                                    multiline={true}
                                    numberOfLines={3}
                                />
                            </View>
                        )}
                    </View>
                );

            case 'notifications':
                return (
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Notification Preferences</Text>

                        <View style={styles.notificationOptions}>
                            <TouchableOpacity
                                style={[
                                    styles.notificationOption,
                                    allowNotifications && styles.activeNotificationOption
                                ]}
                                onPress={() => setAllowNotifications(true)}
                            >
                                <View style={styles.notificationContent}>
                                    <Ionicons
                                        name="notifications"
                                        size={32}
                                        color={allowNotifications ? "#007AFF" : "#666666"}
                                    />
                                    <Text style={[
                                        styles.notificationTitle,
                                        allowNotifications && styles.activeNotificationTitle
                                    ]}>
                                        Yes, notify me
                                    </Text>
                                    <Text style={[
                                        styles.notificationDescription,
                                        allowNotifications && styles.activeNotificationDescription
                                    ]}>
                                        I want to receive important emergency alerts
                                    </Text>
                                </View>
                                <View style={[
                                    styles.radioButton,
                                    allowNotifications && styles.radioButtonActive
                                ]}>
                                    {allowNotifications && <View style={styles.radioButtonInner} />}
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.notificationOption,
                                    !allowNotifications && styles.activeNotificationOption
                                ]}
                                onPress={() => setAllowNotifications(false)}
                            >
                                <View style={styles.notificationContent}>
                                    <Ionicons
                                        name="notifications-off"
                                        size={32}
                                        color={!allowNotifications ? "#007AFF" : "#666666"}
                                    />
                                    <Text style={[
                                        styles.notificationTitle,
                                        !allowNotifications && styles.activeNotificationTitle
                                    ]}>
                                        No, not now
                                    </Text>
                                    <Text style={[
                                        styles.notificationDescription,
                                        !allowNotifications && styles.activeNotificationDescription
                                    ]}>
                                        I'll manage notification settings later
                                    </Text>
                                </View>
                                <View style={[
                                    styles.radioButton,
                                    !allowNotifications && styles.radioButtonActive
                                ]}>
                                    {!allowNotifications && <View style={styles.radioButtonInner} />}
                                </View>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.privacyNote}>
                            You can change your notification preferences at any time.
                        </Text>
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>My Profile</Text>

                {/* Location Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="location" size={24} color="#007AFF" />
                        <Text style={styles.sectionTitle}>Location</Text>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => openEditModal('location')}
                        >
                            <Ionicons name="pencil" size={18} color="#007AFF" />
                            <Text style={styles.editButtonText}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.sectionContent}>
                        {formatLocation()}
                    </Text>
                </View>

                {/* Household Section */}
                {editedProfile && editedProfile.household && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="people" size={24} color="#007AFF" />
                            <Text style={styles.sectionTitle}>Household Information</Text>
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => openEditModal('household')}
                            >
                                <Ionicons name="pencil" size={18} color="#007AFF" />
                                <Text style={styles.editButtonText}>Edit</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Household Size:</Text>
                            <Text style={styles.infoValue}>{editedProfile.household.size}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Has Pets:</Text>
                            <Text style={styles.infoValue}>{editedProfile.household.hasPets ? 'Yes' : 'No'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Accessibility Needs:</Text>
                            <Text style={styles.infoValue}>
                                {editedProfile.household.accessibilityNeeds ? 'Yes' : 'No'}
                            </Text>
                        </View>
                        {editedProfile.household.accessibilityNeeds && editedProfile.household.accessibilityDetails && (
                            <View style={styles.accessibilityDetails}>
                                <Text style={styles.infoLabel}>Details:</Text>
                                <Text style={styles.accessibilityText}>
                                    {editedProfile.household.accessibilityDetails}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Notifications Section */}
                {editedProfile && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons
                                name={editedProfile.notifications ? "notifications" : "notifications-off"}
                                size={24}
                                color="#007AFF"
                            />
                            <Text style={styles.sectionTitle}>Notifications</Text>
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => openEditModal('notifications')}
                            >
                                <Ionicons name="pencil" size={18} color="#007AFF" />
                                <Text style={styles.editButtonText}>Edit</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.sectionContent}>
                            {editedProfile.notifications
                                ? "You will receive emergency alerts and notifications."
                                : "You have opted out of notifications."}
                        </Text>
                    </View>
                )}

                {/* App Info Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="information-circle" size={24} color="#007AFF" />
                        <Text style={styles.sectionTitle}>About This App</Text>
                    </View>
                    <Text style={styles.sectionContent}>
                        This app provides real-time information about active emergencies including fires, floods,
                        earthquakes, evacuation zones, and relief centers. It was inspired by the need for
                        centralized emergency information during disasters.
                    </Text>
                </View>

                {/* Emergency Contacts */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="call" size={24} color="#007AFF" />
                        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
                    </View>
                    <Text style={styles.sectionContent}>
                        In case of emergency, always call 911 first.{'\n\n'}
                        Cal Fire: 1-800-468-8477{'\n'}
                        FEMA: 1-800-621-3362
                    </Text>
                </View>

                {/* Developer Tool - Reset Onboarding */}
                <View style={styles.devSection}>
                    <Text style={styles.devTitle}>Developer Tools</Text>
                    <TouchableOpacity
                        style={styles.resetButton}
                        onPress={resetOnboarding}
                    >
                        <Ionicons name="refresh" size={20} color="#FFFFFF" />
                        <Text style={styles.resetButtonText}>Reset Onboarding</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.disclaimer}>
                    This app is provided for informational purposes only. Always follow official instructions during emergencies.
                </Text>
            </ScrollView>

            {/* Edit Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    style={styles.modalContainer}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={styles.modalView}>
                        <ScrollView>
                            {renderModalContent()}
                        </ScrollView>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={saveChanges}
                            >
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F8F8',
    },
    scrollContent: {
        padding: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    section: {
        marginBottom: 20,
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 8,
        flex: 1,
        color: '#333333',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 6,
    },
    editButtonText: {
        marginLeft: 4,
        color: '#007AFF',
        fontWeight: '500',
    },
    sectionContent: {
        fontSize: 16,
        lineHeight: 24,
        color: '#555555',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    infoLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#555555',
    },
    infoValue: {
        fontSize: 16,
        color: '#333333',
    },
    accessibilityDetails: {
        marginTop: 8,
        backgroundColor: '#F9F9F9',
        padding: 12,
        borderRadius: 6,
    },
    accessibilityText: {
        fontSize: 16,
        color: '#333333',
        marginTop: 4,
    },
    devSection: {
        marginTop: 10,
        marginBottom: 20,
        padding: 16,
        backgroundColor: '#EFEFEF',
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#999999',
    },
    devTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#555555',
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF3B30',
        borderRadius: 8,
        padding: 12,
    },
    resetButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    disclaimer: {
        marginTop: 10,
        marginBottom: 20,
        textAlign: 'center',
        fontStyle: 'italic',
        color: '#666666',
        fontSize: 14,
    },

    // Modal styles
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    modalContent: {
        paddingBottom: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    modalButton: {
        flex: 1,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F2F2F2',
        marginRight: 10,
    },
    cancelButtonText: {
        color: '#333333',
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: '#007AFF',
        marginLeft: 10,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },

    // Field styles
    fieldContainer: {
        marginBottom: 20,
    },
    fieldLabel: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F9F9F9',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        fontSize: 16,
    },
    inputDisabled: {
        backgroundColor: '#EFEFEF',
        color: '#999999',
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },

    // Location styles
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#F9F9F9',
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    locationButtonActive: {
        backgroundColor: '#007AFF',
    },
    locationButtonText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '500',
    },
    locationButtonTextActive: {
        color: '#FFFFFF',
    },
    locationConfirmation: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        padding: 8,
        backgroundColor: '#F0FFF0',
        borderRadius: 6,
    },
    locationConfirmationText: {
        marginLeft: 8,
        color: '#4CAF50',
        fontSize: 14,
    },
    separator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
    },
    separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    separatorText: {
        paddingHorizontal: 12,
        color: '#999999',
        fontWeight: '500',
    },

    // Counter styles
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    counterButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    counterText: {
        fontSize: 20,
        fontWeight: 'bold',
        paddingHorizontal: 20,
    },

    // Switch styles
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },

    // Notification styles
    notificationOptions: {
        marginTop: 8,
    },
    notificationOption: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: '#F9F9F9',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        alignItems: 'center',
    },
    activeNotificationOption: {
        backgroundColor: '#E3F2FD',
        borderColor: '#007AFF',
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 8,
        color: '#333333',
    },
    activeNotificationTitle: {
        color: '#007AFF',
    },
    notificationDescription: {
        marginTop: 4,
        color: '#666666',
    },
    activeNotificationDescription: {
        color: '#444444',
    },
    radioButton: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#999999',
        marginLeft: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioButtonActive: {
        borderColor: '#007AFF',
    },
    radioButtonInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#007AFF',
    },
    privacyNote: {
        marginTop: 16,
        textAlign: 'center',
        fontSize: 14,
        color: '#666666',
        fontStyle: 'italic',
    },
});

export default InfoScreen;