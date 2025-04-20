import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import IncidentService from './IncidentService';
import MapView, { Marker, Polygon } from 'react-native-maps';
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
    shelter_in_place: {
        color: 'rgba(142, 68, 173, 0.3)',
        borderColor: '#8E44AD',
        title: 'Shelter-in-Place'
    }
};

// Updated styles for black background buttons and legend with 60% opacity
const updatedStyles = StyleSheet.create({
    locateButton: {
        position: 'absolute',
        bottom: 80,
        right: 20,
        backgroundColor: '#000000', // Changed from gray to black
        padding: 12,
        borderRadius: 30,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    legendContainer: {
        position: 'absolute',
        bottom: 20, // Moved back to bottom left
        left: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Changed to 60% opacity
        padding: 10,
        borderRadius: 15,
        elevation: 5,
        maxWidth: 200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    alertContainer: {
        position: 'absolute',
        top: 60, // Shifted downward by a lot
        left: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Changed to 60% opacity
        padding: 24,
        borderRadius: 10, // No border/outline
        flexDirection: 'column',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    alertTitle: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 5,
    },
    alertMessage: {
        color: '#DDDDDD',
        fontSize: 14,
        marginBottom: 5,
    },
    alertStatus: {
        color: '#FF0000',
        fontWeight: 'bold',
        fontSize: 14,
        flexDirection: 'row',
        alignItems: 'center',
    },
    alertIcon: {
        marginRight: 5,
    }
});

const LiveIncidentMapWithZones = ({ incidentData }) => {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [loadingLocation, setLoadingLocation] = useState(true);
    const [visibleLayers, setVisibleLayers] = useState({
        fires: true,
        evacuations: true,
        reliefCenters: true,
        floods: true,
        earthquakes: true,
        emergencyZones: true, // All zones visible by default
    });
    const [legendVisible, setLegendVisible] = useState(true); // State for legend visibility
    const [alertVisible, setAlertVisible] = useState(true); // New state for alert visibility
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [incidents, setIncidents] = useState(null);
    const [emergencyZones, setEmergencyZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedZone, setSelectedZone] = useState(null);

    // Reference to the map
    const mapRef = useRef(null);

    // Function to toggle legend and alert visibility
    const toggleLegendAndAlert = () => {
        setLegendVisible(prev => !prev);
        setAlertVisible(prev => !prev);
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
        // Removed flood zone as requested
        return [
            {
                id: 14,
                type: 'fire_zone',
                name: 'Davis Golf Course Fire Zone',
                description: 'Active fire in the Davis Golf Course area. Please avoid this area and follow evacuation orders if issued.',
                coordinates: [
                    { latitude: 38.5580, longitude: -121.7600 },
                    { latitude: 38.5620, longitude: -121.7580 },
                    { latitude: 38.5640, longitude: -121.7520 },
                    { latitude: 38.5630, longitude: -121.7470 },
                    { latitude: 38.5590, longitude: -121.7450 },
                    { latitude: 38.5550, longitude: -121.7480 },
                    { latitude: 38.5540, longitude: -121.7550 }
                ]
            },
            {
                id: 15,
                type: 'mandatory_evacuation',
                name: 'Davis Golf Course Mandatory Evacuation',
                description: 'MANDATORY EVACUATION ORDER: All residents in this area must evacuate immediately due to the approaching fire.',
                coordinates: [
                    { latitude: 38.5570, longitude: -121.7620 },
                    { latitude: 38.5630, longitude: -121.7590 },
                    { latitude: 38.5660, longitude: -121.7520 },
                    { latitude: 38.5650, longitude: -121.7450 },
                    { latitude: 38.5600, longitude: -121.7430 },
                    { latitude: 38.5540, longitude: -121.7460 },
                    { latitude: 38.5530, longitude: -121.7560 }
                ]
            },
            {
                id: 16,
                type: 'voluntary_evacuation',
                name: 'Davis Golf Course Voluntary Evacuation',
                description: 'VOLUNTARY EVACUATION NOTICE: Residents in this area should prepare to evacuate if conditions worsen. Be ready to leave at a moment\'s notice.',
                coordinates: [
                    { latitude: 38.5550, longitude: -121.7650 },
                    { latitude: 38.5640, longitude: -121.7620 },
                    { latitude: 38.5680, longitude: -121.7520 },
                    { latitude: 38.5670, longitude: -121.7430 },
                    { latitude: 38.5600, longitude: -121.7410 },
                    { latitude: 38.5520, longitude: -121.7440 },
                    { latitude: 38.5510, longitude: -121.7570 }
                ]
            },
            {
                id: 17,
                type: 'shelter_in_place',
                name: 'ARC Shelter-in-Place',
                description: 'SHELTER-IN-PLACE ORDER: Remain indoors at the ARC. Close all windows and doors. Follow official instructions.',
                coordinates: [
                    { latitude: 38.5450, longitude: -121.7640 },
                    { latitude: 38.5380, longitude: -121.7640 },
                    { latitude: 38.5380, longitude: -121.7550 },
                    { latitude: 38.5450, longitude: -121.7550 },
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
                {/* Emergency Zones as Polygons - Always visible */}
                {emergencyZones.map((zone) => (
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

            {/* NEW: Alert Message at the top */}
            {alertVisible && (
                <View style={updatedStyles.alertContainer}>
                    <Text style={updatedStyles.alertTitle}>EVACUATION ALERT: FIRE (0.8 mi)</Text>
                    <Text style={updatedStyles.alertMessage}>
                        Evacuate immediately. Gather loved ones and supplies. Check out resources below.
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="warning" size={18} color="#FF0000" style={updatedStyles.alertIcon} />
                        <Text style={updatedStyles.alertStatus}>STATUS: CRITICAL</Text>
                    </View>
                </View>
            )}

            {/* Emergency Zone Legend - Toggleable */}
            {legendVisible && (
                <View style={updatedStyles.legendContainer}>
                    <Text style={mapDarkStyles.legendTitle}>Legend</Text>
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

            {/* User location button - now using updated styles */}
            <TouchableOpacity
                style={updatedStyles.locateButton}
                onPress={centerOnUserLocation}
            >
                <Ionicons name="locate" size={24} color="#DDDDDD" />
            </TouchableOpacity>

            {/* Toggle Legend Button - now using updated styles and toggling both legend and alert */}
            <TouchableOpacity
                style={[updatedStyles.locateButton, { bottom: 20, right: 20 }]}
                onPress={toggleLegendAndAlert}
            >
                <Ionicons
                    name={legendVisible ? "layers" : "layers-outline"}
                    size={24}
                    color="#DDDDDD"
                />
            </TouchableOpacity>
        </View>
    );
};

export default LiveIncidentMapWithZones;