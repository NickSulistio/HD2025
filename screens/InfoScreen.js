// InfoScreen.js with updated edit buttons and card spacing
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
import { colors, spacing, borderRadius, shadows } from '../styles';
import { text } from '../styles/typography';

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
                                placeholderTextColor="#999999"
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
                                color={useCurrentLocation ? colors.white : colors.white}
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
                                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
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
                                    <Ionicons name="remove" size={22} color={colors.white} />
                                </TouchableOpacity>

                                <Text style={styles.counterText}>{householdSize}</Text>

                                <TouchableOpacity
                                    style={styles.counterButton}
                                    onPress={() => setHouseholdSize(householdSize + 1)}
                                >
                                    <Ionicons name="add" size={22} color={colors.white} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.switchContainer}>
                            <Text style={styles.fieldLabel}>Do you have pets?</Text>
                            <Switch
                                value={hasPets}
                                onValueChange={setHasPets}
                                trackColor={{ false: '#555555', true: colors.primaryLight }}
                                thumbColor={hasPets ? colors.primary : '#F4F4F4'}
                            />
                        </View>

                        <View style={styles.switchContainer}>
                            <Text style={styles.fieldLabel}>Any accessibility needs?</Text>
                            <Switch
                                value={accessibilityNeeds}
                                onValueChange={setAccessibilityNeeds}
                                trackColor={{ false: '#555555', true: colors.primaryLight }}
                                thumbColor={accessibilityNeeds ? colors.primary : '#F4F4F4'}
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
                                    placeholderTextColor="#999999"
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
                                        color={allowNotifications ? colors.primary : "#666666"}
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
                                        color={!allowNotifications ? colors.primary : "#666666"}
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
                        <Ionicons name="location" size={24} color={colors.white} />
                        <Text style={styles.sectionTitle}>Location</Text>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => openEditModal('location')}
                        >
                            <Ionicons name="pencil-outline" size={20} color={colors.white} />
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
                            <Ionicons name="people" size={24} color={colors.white} />
                            <Text style={styles.sectionTitle}>Household Information</Text>
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => openEditModal('household')}
                            >
                                <Ionicons name="pencil-outline" size={20} color={colors.white} />
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
                                color={colors.white}
                            />
                            <Text style={styles.sectionTitle}>Notifications</Text>
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => openEditModal('notifications')}
                            >
                                <Ionicons name="pencil-outline" size={20} color={colors.white} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.sectionContent}>
                            {editedProfile.notifications
                                ? "You will receive emergency alerts and notifications."
                                : "You have opted out of notifications."}
                        </Text>
                    </View>
                )}

                {/* Emergency Contacts */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="call" size={24} color={colors.white} />
                        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
                    </View>
                    <Text style={styles.sectionContent}>
                        In case of emergency, always call 911 first.{'\n\n'}
                        Cal Fire: 1-800-468-8477{'\n'}
                        FEMA: 1-800-621-3362
                    </Text>
                </View>

                {/* App Info Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="information-circle" size={24} color={colors.white} />
                        <Text style={styles.sectionTitle}>About This App</Text>
                    </View>
                    <Text style={styles.sectionContent}>
                        This app provides real-time information about active emergencies including fires, floods,
                        earthquakes, evacuation zones, and relief centers. It was inspired by the need for
                        centralized emergency information during disasters.
                    </Text>
                </View>
                
                {/* Developer Tool - Reset Onboarding */}
                <View style={styles.devSection}>
                    <Text style={styles.devTitle}>Developer Tools</Text>
                    <TouchableOpacity
                        style={styles.resetButton}
                        onPress={resetOnboarding}
                    >
                        <Ionicons name="refresh" size={20} color={colors.white} />
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
        backgroundColor: '#000000', // Black background
    },
    scrollContent: {
        padding: spacing.medium,
    },
    title: {
        ...text.display,
        color: colors.white,
        marginBottom: spacing.large,
        fontWeight: 400,
        fontSize: 28
    },
    section: {
        marginBottom: 14, // Reduced spacing between cards to 14
        backgroundColor: '#202020', // Dark card background
        padding: spacing.medium,
        borderRadius: borderRadius.medium,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.medium,
    },
    sectionTitle: {
        ...text.title,
        color: colors.white,
        marginLeft: spacing.small,
        flex: 1,
    },
    editButton: {
        padding: spacing.tiny,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionContent: {
        ...text.bodyMedium,
        color: colors.white,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.small,
        paddingBottom: spacing.small,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    infoLabel: {
        ...text.bodyMedium,
        color: colors.lightGray,
    },
    infoValue: {
        ...text.bodyMedium,
        color: colors.white,
    },
    accessibilityDetails: {
        marginTop: spacing.small,
        backgroundColor: '#333333',
        padding: spacing.medium,
        borderRadius: borderRadius.small,
    },
    accessibilityText: {
        ...text.bodyMedium,
        color: colors.white,
        marginTop: spacing.tiny,
    },
    devSection: {
        marginTop: spacing.medium,
        marginBottom: spacing.large,
        padding: spacing.medium,
        backgroundColor: '#333333',
        borderRadius: borderRadius.medium,
        borderLeftWidth: 4,
        borderLeftColor: colors.lightGray,
    },
    devTitle: {
        ...text.title,
        color: colors.white,
        marginBottom: spacing.medium,
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.danger,
        borderRadius: borderRadius.medium,
        padding: spacing.medium,
    },
    resetButtonText: {
        ...text.bodyMediumBold,
        color: colors.white,
        marginLeft: spacing.small,
    },
    disclaimer: {
        marginTop: spacing.medium,
        marginBottom: spacing.large,
        textAlign: 'center',
        fontStyle: 'italic',
        color: colors.lightGray,
        ...text.bodySmall,
    },

    // Modal styles
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    modalView: {
        backgroundColor: '#202020',
        borderTopLeftRadius: borderRadius.large,
        borderTopRightRadius: borderRadius.large,
        padding: spacing.large,
        maxHeight: '80%',
    },
    modalContent: {
        paddingBottom: spacing.large,
    },
    modalTitle: {
        ...text.headline,
        color: colors.white,
        marginBottom: spacing.large,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.large,
    },
    modalButton: {
        flex: 1,
        padding: spacing.medium,
        borderRadius: borderRadius.medium,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#444444',
        marginRight: spacing.medium,
    },
    cancelButtonText: {
        ...text.bodyMediumBold,
        color: colors.white,
    },
    saveButton: {
        backgroundColor: colors.primary,
        marginLeft: spacing.medium,
    },
    saveButtonText: {
        ...text.bodyMediumBold,
        color: colors.white,
    },

    // Field styles
    fieldContainer: {
        marginBottom: spacing.large,
    },
    fieldLabel: {
        ...text.bodyMedium,
        color: colors.white,
        marginBottom: spacing.small,
    },
    input: {
        backgroundColor: '#333333',
        borderRadius: borderRadius.medium,
        padding: spacing.medium,
        borderWidth: 1,
        borderColor: '#444444',
        color: colors.white,
        ...text.bodyMedium,
    },
    inputDisabled: {
        backgroundColor: '#2A2A2A',
        color: '#888888',
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
        padding: spacing.medium,
        borderRadius: borderRadius.medium,
        backgroundColor: '#333333',
        borderWidth: 1,
        borderColor: colors.primary,
    },
    locationButtonActive: {
        backgroundColor: colors.primary,
    },
    locationButtonText: {
        ...text.bodyMedium,
        marginLeft: spacing.small,
        color: colors.primary,
    },
    locationButtonTextActive: {
        color: colors.white,
    },
    locationConfirmation: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.medium,
        padding: spacing.small,
        backgroundColor: '#334433',
        borderRadius: borderRadius.small,
    },
    locationConfirmationText: {
        marginLeft: spacing.small,
        color: colors.success,
        ...text.bodySmall,
    },
    separator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.medium,
    },
    separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#444444',
    },
    separatorText: {
        paddingHorizontal: spacing.medium,
        color: colors.lightGray,
        ...text.bodyMedium,
    },

    // Counter styles
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.small,
    },
    counterButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#333333',
        alignItems: 'center',
        justifyContent: 'center',
    },
    counterText: {
        ...text.title,
        color: colors.white,
        paddingHorizontal: spacing.large,
    },

    // Switch styles
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.large,
    },

    // Notification styles
    notificationOptions: {
        marginTop: spacing.small,
    },
    notificationOption: {
        flexDirection: 'row',
        padding: spacing.medium,
        borderRadius: borderRadius.medium,
        marginBottom: spacing.medium,
        backgroundColor: '#333333',
        borderWidth: 1,
        borderColor: '#444444',
        alignItems: 'center',
    },
    activeNotificationOption: {
        backgroundColor: '#1A3A5A',
        borderColor: colors.primary,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        ...text.bodyLargeBold,
        marginTop: spacing.small,
        color: colors.white,
    },
    activeNotificationTitle: {
        color: colors.primary,
    },
    notificationDescription: {
        ...text.bodyMedium,
        marginTop: spacing.tiny,
        color: colors.lightGray,
    },
    activeNotificationDescription: {
        color: colors.white,
    },
    radioButton: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#777777',
        marginLeft: spacing.medium,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioButtonActive: {
        borderColor: colors.primary,
    },
    radioButtonInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.primary,
    },
    privacyNote: {
        marginTop: spacing.medium,
        textAlign: 'center',
        ...text.bodySmall,
        color: colors.lightGray,
        fontStyle: 'italic',
    },
});

export default InfoScreen;