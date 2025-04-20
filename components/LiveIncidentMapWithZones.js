import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Platform, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import IncidentService from './IncidentService';
import MapView, { Marker, Polygon, Circle } from 'react-native-maps';
import { mapDarkStyles } from '../styles/mapDarkStyles';

// This component uses Apple Maps on iOS (default provider) with dark mode styling

const markerColors = {
    fires: '#FF5733',
    evacuations: '#FFC300',
    reliefCenters: '#2ECC71',
    floods: '#3498DB',
    earthquakes: '#9B59B6',
};

// Emergency zone types and their colors
const zoneTypes = {
    mandatory_evacuation: {
        color: 'rgba(255, 0, 0, 0.3)',
        borderColor: '#FF0000',
        title: 'Mandatory Evacuation'
    },
    voluntary_evacuation: {
        color: 'rgba(255, 165, 0, 0.3)',
        borderColor: '#FFA500',
        title: 'Voluntary Evacuation'
    },
    fire_zone: {
        color: 'rgba(255, 87, 51, 0.3)',
        borderColor: '#FF5733',
        title: 'Active Fire Zone'
    },
    flood_zone: {
        color: 'rgba(52, 152, 219, 0.3)',
        borderColor: '#3498DB',
        title: 'Flood Risk Zone'
    },
    shelter_in_place: {
        color: 'rgba(142, 68, 173, 0.3)',
        borderColor: '#8E44AD',
        title: 'Shelter-in-Place'
    }
};

const LiveIncidentMapWithZones = ({ incidentData }) => {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [loadingLocation, setLoadingLocation] = useState(true);
    const [visibleLayers, setVisibleLayers] = useState({
        fires: true,
        evacuations: true,
        reliefCenters: true,
        floods: false,
        earthquakes: false,
        emergencyZones: true, // New layer for emergency zones
    });
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [incidents, setIncidents] = useState(null);
    const [emergencyZones, setEmergencyZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedZone, setSelectedZone] = useState(null);

    // New state for incident service panel
    const [showIncidentService, setShowIncidentService] = useState(false);
    const [reportType, setReportType] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const [submittingReport, setSubmittingReport] = useState(false);

    // Animation value for the sliding panel
    const slideAnimation = useRef(new Animated.Value(0)).current;

    // Reference to the map
    const mapRef = useRef(null);

    // Function to toggle the incident service panel
    const toggleIncidentService = () => {
        if (showIncidentService) {
            // Slide down
            Animated.timing(slideAnimation, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setShowIncidentService(false);
            });
        } else {
            setShowIncidentService(true);
            // Slide up
            Animated.timing(slideAnimation, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    };

    // Function to submit a user report
    const submitReport = async () => {
        if (!reportType || !reportDescription) {
            // Show some validation error
            return;
        }

        setSubmittingReport(true);
        try {
            // Get current location for the report
            const coords = location ? {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            } : null;

            // Create report object
            const report = {
                type: reportType,
                description: reportDescription,
                timestamp: Date.now(),
                ...coords,
            };

            // Submit report via IncidentService
            const result = await IncidentService.submitUserReport(report);

            // Reset form and show success message
            setReportType('');
            setReportDescription('');

            // Close the panel after submission
            toggleIncidentService();

            // You might want to add some feedback here
            console.log('Report submitted successfully', result);
        } catch (error) {
            console.error('Error submitting report:', error);
            // Handle error here
        } finally {
            setSubmittingReport(false);
        }
    };

    useEffect(() => {
        // Load incidents if not provided through props
        const loadIncidents = async () => {
            try {
                const data = await IncidentService.getAllIncidents();
                setIncidents(data);

                // Load emergency zones
                const zones = await getEmergencyZones();
                setEmergencyZones(zones);

                // Zoom to show emergency zones on initial load
                if (mapRef.current && zones && zones.length > 0) {
                    // Calculate bounds to fit all emergency zones
                    const allCoords = zones.flatMap(zone => zone.coordinates);
                    if (allCoords.length > 0) {
                        setTimeout(() => {
                            try {
                                mapRef.current.fitToCoordinates(allCoords, {
                                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                                    animated: true
                                });
                            } catch (e) {
                                console.error('Error fitting to coordinates:', e);
                            }
                        }, 1000);
                    }
                }

                setLoading(false);
            } catch (error) {
                console.error('Error loading incidents:', error);
                setErrorMsg('Could not load incident data');
                setLoading(false);
            }
        };

        if (incidentData) {
            setIncidents(incidentData);

            // Still load emergency zones even if incident data is provided
            getEmergencyZones().then(zones => {
                setEmergencyZones(zones);

                // Zoom to show emergency zones
                if (mapRef.current && zones && zones.length > 0) {
                    const allCoords = zones.flatMap(zone => zone.coordinates);
                    if (allCoords.length > 0) {
                        setTimeout(() => {
                            try {
                                mapRef.current.fitToCoordinates(allCoords, {
                                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                                    animated: true
                                });
                            } catch (e) {
                                console.error('Error fitting to coordinates:', e);
                            }
                        }, 1000);
                    }
                }

                setLoading(false);
            }).catch(error => {
                console.error('Error loading emergency zones:', error);
                setLoading(false);
            });
        } else {
            loadIncidents();
        }
    }, [incidentData]);

    // Initialize loading state and handle location errors
    useEffect(() => {
        const initializeLocation = async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setErrorMsg('Permission to access location was denied');
                    setLoadingLocation(false);
                    return;
                }

                // Get initial location
                let initialLocation = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced
                });
                setLocation(initialLocation);
                setLoadingLocation(false);
            } catch (error) {
                console.error('Error getting initial location:', error);
                setErrorMsg('Could not fetch location');
                setLoadingLocation(false);
            }
        };

        initializeLocation();
    }, []);

    const toggleLayer = (layer) => {
        setVisibleLayers(prev => ({
            ...prev,
            [layer]: !prev[layer]
        }));
    };

    const centerOnUserLocation = () => {
        if (location && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            }, 1000);
        }
    };

    // Function to get emergency zones (mock data for now, would be from an API)
    const getEmergencyZones = async () => {
        // In a real app, this would fetch from an API
        // For now, we'll return some sample polygons with realistic emergency areas
        return [
            {
                id: 1,
                type: 'mandatory_evacuation',
                name: 'Palisades Evacuation Zone A',
                description: 'Mandatory evacuation due to rapidly spreading fire. Leave immediately.',
                coordinates: [
                    { latitude: 34.045, longitude: -118.52 },
                    { latitude: 34.06, longitude: -118.52 },
                    { latitude: 34.06, longitude: -118.54 },
                    { latitude: 34.045, longitude: -118.54 },
                ]
            },
            {
                id: 2,
                type: 'voluntary_evacuation',
                name: 'Palisades Evacuation Zone B',
                description: 'Voluntary evacuation recommended. Be prepared to leave if conditions worsen.',
                coordinates: [
                    { latitude: 34.045, longitude: -118.54 },
                    { latitude: 34.06, longitude: -118.54 },
                    { latitude: 34.06, longitude: -118.56 },
                    { latitude: 34.045, longitude: -118.56 },
                ]
            },
            // ...other zone data from original code...
            {
                id: 13,
                type: 'flood_zone',
                name: 'Putah Creek Flood Zone',
                description: 'Flood warning in effect. Areas near Putah Creek may experience flooding following heavy rainfall.',
                coordinates: [
                    { latitude: 38.5235, longitude: -121.7462 },
                    { latitude: 38.5215, longitude: -121.7505 },
                    { latitude: 38.5205, longitude: -121.7555 },
                    { latitude: 38.5208, longitude: -121.7605 },
                    { latitude: 38.5218, longitude: -121.7642 },
                    { latitude: 38.5238, longitude: -121.7678 },
                    { latitude: 38.5252, longitude: -121.7692 },
                    { latitude: 38.5268, longitude: -121.7678 },
                    { latitude: 38.5278, longitude: -121.7642 },
                    { latitude: 38.5282, longitude: -121.7592 },
                    { latitude: 38.5278, longitude: -121.7542 },
                    { latitude: 38.5268, longitude: -121.7505 },
                    { latitude: 38.5252, longitude: -121.7472 }
                ]
            }
        ];
    };

    if (loadingLocation || loading) {
        return (
            <View style={mapDarkStyles.container}>
                <ActivityIndicator size={48} color="#4CD964" />
                <Text style={mapDarkStyles.loadingText}>
                    {loading ? 'Loading incident data...' : 'Getting your location...'}
                </Text>
            </View>
        );
    }

    if (errorMsg) {
        return (
            <View style={mapDarkStyles.container}>
                <Text style={mapDarkStyles.errorText}>{errorMsg}</Text>
                <Text style={{ color: '#FFFFFF' }}>Please enable location services to use this app.</Text>
            </View>
        );
    }

    // Initialize with a region that can show UC Davis by default
    const initialRegion = location ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0422,
        longitudeDelta: 0.0321,
    } : {
        latitude: 38.5382, // UC Davis coordinates
        longitude: -121.7617,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    // Animation interpolation
    const translateY = slideAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [500, 0], // Panel height - increased to ensure buttons are visible
    });

    return (
        <View style={mapDarkStyles.container}>
            <MapView
                ref={mapRef}
                style={mapDarkStyles.map}
                initialRegion={initialRegion}
                // Apple Maps dark mode settings
                userInterfaceStyle="dark"
                mapType="mutedStandard"
                onPress={() => {
                    setSelectedIncident(null);
                    setSelectedZone(null);
                }}
                showsUserLocation={true}
                showsMyLocationButton={false}
                showsCompass={true}
                showsScale={true}
                showsTraffic={false}
                showsBuildings={false}
                showsIndoors={false}
            >
                {/* Emergency Zones as Polygons */}
                {visibleLayers.emergencyZones && emergencyZones.map((zone) => (
                    <Polygon
                        key={`zone-${zone.id}`}
                        coordinates={zone.coordinates}
                        fillColor={zoneTypes[zone.type].color}
                        strokeColor={zoneTypes[zone.type].borderColor}
                        strokeWidth={2}
                        onPress={() => {
                            setSelectedZone(zone);
                            setSelectedIncident(null);
                        }}
                        tappable={true}
                    />
                ))}

                {/* Current User Location Circle */}
                {location && (
                    <Circle
                        center={{
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        }}
                        radius={100} // 100 meters radius
                        fillColor="rgba(0, 122, 255, 0.3)" // Semi-transparent blue
                        strokeColor="white"
                        strokeWidth={3}
                    />
                )}

                {/* Incident Markers */}
                {incidents && Object.keys(incidents).map(type => {
                    if (!visibleLayers[type] || !incidents[type]) return null;

                    return incidents[type].map(incident => (
                        <Marker
                            key={`marker-${type}-${incident.id}`}
                            coordinate={{
                                latitude: incident.latitude,
                                longitude: incident.longitude,
                            }}
                            pinColor={markerColors[type]}
                            title={incident.title}
                            description={incident.description}
                            onPress={() => {
                                setSelectedIncident(incident);
                                setSelectedZone(null);
                            }}
                        />
                    ));
                })}
            </MapView>

            {/* Emergency Zone Legend */}
            {visibleLayers.emergencyZones && (
                <View style={mapDarkStyles.legendContainer}>
                    <Text style={mapDarkStyles.legendTitle}>Emergency Zones</Text>
                    {Object.keys(zoneTypes).map(type => (
                        <View key={type} style={mapDarkStyles.legendItem}>
                            <View
                                style={[
                                    mapDarkStyles.legendColor,
                                    {
                                        backgroundColor: zoneTypes[type].color,
                                        borderColor: zoneTypes[type].borderColor
                                    }
                                ]}
                            />
                            <Text style={mapDarkStyles.legendText}>{zoneTypes[type].title}</Text>
                        </View>
                    ))}
                </View>
            )}

            <View style={mapDarkStyles.controlPanel}>
                <Text style={mapDarkStyles.controlTitle}>Incident Types</Text>
                {Object.keys(visibleLayers).map(layer => {
                    // Customize the icon based on layer type
                    let iconName = 'layers';
                    let label = layer.charAt(0).toUpperCase() + layer.slice(1);

                    if (layer === 'fires') iconName = 'flame';
                    else if (layer === 'evacuations') iconName = 'warning';
                    else if (layer === 'reliefCenters') iconName = 'medkit';
                    else if (layer === 'floods') iconName = 'water';
                    else if (layer === 'earthquakes') iconName = 'pulse';
                    else if (layer === 'emergencyZones') {
                        iconName = 'map';
                        label = 'Emergency Zones';
                    }

                    return (
                        <TouchableOpacity
                            key={layer}
                            style={[
                                mapDarkStyles.layerButton,
                                visibleLayers[layer] ? { backgroundColor: markerColors[layer] || '#555' } : mapDarkStyles.layerButtonInactive
                            ]}
                            onPress={() => toggleLayer(layer)}
                        >
                            <Ionicons name={iconName} size={16} color={visibleLayers[layer] ? '#fff' : '#ddd'} />
                            <Text style={visibleLayers[layer] ? mapDarkStyles.layerTextActive : mapDarkStyles.layerText}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Selected incident or zone info */}
            {(selectedIncident || selectedZone) && (
                <View style={mapDarkStyles.incidentInfo}>
                    {selectedZone ? (
                        <>
                            <Text style={mapDarkStyles.incidentTitle}>{selectedZone.name}</Text>
                            <Text style={mapDarkStyles.incidentType}>{zoneTypes[selectedZone.type].title}</Text>
                            <Text style={mapDarkStyles.incidentDescription}>{selectedZone.description}</Text>
                        </>
                    ) : (
                        <>
                            <Text style={mapDarkStyles.incidentTitle}>{selectedIncident.title}</Text>
                            {selectedIncident.description && (
                                <Text style={mapDarkStyles.incidentDescription}>{selectedIncident.description}</Text>
                            )}
                        </>
                    )}
                    <TouchableOpacity
                        style={mapDarkStyles.closeButton}
                        onPress={() => {
                            setSelectedIncident(null);
                            setSelectedZone(null);
                        }}
                    >
                        <Ionicons name="close-circle" size={24} color="#DDDDDD" />
                    </TouchableOpacity>
                </View>
            )}

            {/* User location button */}
            <TouchableOpacity
                style={mapDarkStyles.locateButton}
                onPress={centerOnUserLocation}
            >
                <Ionicons name="locate" size={24} color="#DDDDDD" />
            </TouchableOpacity>

            {/* New Report Incident Button */}
            <TouchableOpacity
                style={styles.reportButton}
                onPress={toggleIncidentService}
            >
                <Ionicons name="alert-circle" size={24} color="#FFFFFF" />
                <Text style={styles.reportButtonText}>Report Incident</Text>
            </TouchableOpacity>

            {/* Incident Service Panel */}
            {showIncidentService && (
                <Animated.View
                    style={[
                        styles.panelContainer,
                        { transform: [{ translateY }] }
                    ]}
                >
                    <View style={styles.panelHandle}></View>
                    <Text style={styles.panelTitle}>Report an Incident</Text>

                    <View style={styles.typeButtonsContainer}>
                        <TouchableOpacity
                            style={[styles.typeButton, reportType === 'fire' && styles.typeButtonSelected]}
                            onPress={() => setReportType('fire')}
                        >
                            <Ionicons name="flame" size={24} color={reportType === 'fire' ? '#FFFFFF' : '#FF5733'} />
                            <Text style={styles.typeButtonText}>Fire</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.typeButton, reportType === 'flood' && styles.typeButtonSelected]}
                            onPress={() => setReportType('flood')}
                        >
                            <Ionicons name="water" size={24} color={reportType === 'flood' ? '#FFFFFF' : '#3498DB'} />
                            <Text style={styles.typeButtonText}>Flood</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.typeButton, reportType === 'hazard' && styles.typeButtonSelected]}
                            onPress={() => setReportType('hazard')}
                        >
                            <Ionicons name="warning" size={24} color={reportType === 'hazard' ? '#FFFFFF' : '#FFC300'} />
                            <Text style={styles.typeButtonText}>Hazard</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.typeButton, reportType === 'other' && styles.typeButtonSelected]}
                            onPress={() => setReportType('other')}
                        >
                            <Ionicons name="alert-circle" size={24} color={reportType === 'other' ? '#FFFFFF' : '#9B59B6'} />
                            <Text style={styles.typeButtonText}>Other</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Description input would go here - using a placeholder Text component */}
                    <View style={styles.descriptionContainer}>
                        <Text style={styles.descriptionLabel}>Description</Text>
                        <View style={styles.descriptionInput}>
                            <Text style={styles.descriptionPlaceholder}>
                                {reportDescription || "Describe the incident and its severity..."}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={toggleIncidentService}
                        >
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.submitButton, (!reportType || submittingReport) && styles.submitButtonDisabled]}
                            onPress={submitReport}
                            disabled={!reportType || submittingReport}
                        >
                            {submittingReport ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={styles.buttonText}>Submit Report</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            )}
        </View>
    );
};

// New styles for the incident service panel
const styles = StyleSheet.create({
    reportButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#FF5733',
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    reportButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    panelContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1C1C1E',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingTop: 10,
        paddingBottom: 30, // Increased padding at the bottom
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10,
        height: 350, // Increased height to accommodate all content
    },
    panelHandle: {
        width: 40,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#FFFFFF50',
        alignSelf: 'center',
        marginBottom: 10,
    },
    panelTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 15, // Slightly reduced to save space
        textAlign: 'center',
    },
    typeButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15, // Slightly reduced to save space
    },
    typeButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2A2A2A',
        borderRadius: 10,
        padding: 10,
        marginHorizontal: 5,
    },
    typeButtonSelected: {
        backgroundColor: '#007AFF',
    },
    typeButtonText: {
        color: '#FFFFFF',
        marginTop: 5,
        fontSize: 12,
    },
    descriptionContainer: {
        marginBottom: 15, // Slightly reduced to save space
    },
    descriptionLabel: {
        color: '#FFFFFF',
        marginBottom: 5,
    },
    descriptionInput: {
        backgroundColor: '#2A2A2A',
        borderRadius: 10,
        padding: 15,
        minHeight: 70, // Slightly reduced height
    },
    descriptionPlaceholder: {
        color: '#777777',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5, // Added margin at the top for better spacing
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#444444',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginRight: 10,
    },
    submitButton: {
        flex: 2,
        backgroundColor: '#FF5733',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#666666',
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});

export default LiveIncidentMapWithZones;