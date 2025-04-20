import { StyleSheet } from 'react-native';

export const mapDarkStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000', // Black background to match onboarding screen
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    controlPanel: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(40, 40, 40, 0.9)', // Dark semi-transparent background
        borderRadius: 10,
        padding: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
    },
    controlTitle: {
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
        color: '#FFFFFF', // White text
    },
    layerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginVertical: 4,
    },
    layerButtonInactive: {
        backgroundColor: '#444444', // Darker gray for inactive buttons
    },
    layerText: {
        color: '#BBBBBB', // Light gray text for inactive
        marginLeft: 6,
    },
    layerTextActive: {
        color: '#FFFFFF', // White text for active
        fontWeight: 'bold',
        marginLeft: 6,
    },
    incidentInfo: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#222222', // Dark background
        borderRadius: 10,
        padding: 15,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: '#444444', // Subtle border
    },
    incidentTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#FFFFFF', // White text
    },
    incidentType: {
        fontSize: 14,
        color: '#BFDEFF', // Light blue similar to onboarding active buttons
        marginBottom: 5,
    },
    incidentDescription: {
        fontSize: 14,
        color: '#AAAAAA', // Light gray text
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    locateButton: {
        position: 'absolute',
        bottom: 80,
        right: 20,
        backgroundColor: '#222222', // Dark background
        borderRadius: 30,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        borderWidth: 1,
        borderColor: '#444444', // Subtle border
    },
    loadingText: {
        marginTop: 10,
        color: '#FFFFFF', // White text
    },
    errorText: {
        color: '#FF5555', // Red for errors, but slightly less harsh
        marginBottom: 10,
    },
    legendContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        backgroundColor: 'rgba(40, 40, 40, 0.9)', // Dark semi-transparent background
        borderRadius: 10,
        padding: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        maxWidth: 200,
        borderWidth: 1,
        borderColor: '#444444', // Subtle border
    },
    legendTitle: {
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
        color: '#FFFFFF', // White text
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 3,
    },
    legendColor: {
        width: 16,
        height: 16,
        borderRadius: 4,
        marginRight: 8,
        borderWidth: 1,
    },
    legendText: {
        fontSize: 12,
        color: '#DDDDDD', // Light gray text
    }
});

// Dark map style for Google Maps
export const darkMapStyle = [
    {
        "elementType": "geometry",
        "stylers": [{ "color": "#212121" }]
    },
    {
        "elementType": "labels.icon",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#757575" }]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [{ "color": "#212121" }]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry",
        "stylers": [{ "color": "#757575" }]
    },
    {
        "featureType": "administrative.country",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#9e9e9e" }]
    },
    {
        "featureType": "administrative.land_parcel",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "featureType": "administrative.locality",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#bdbdbd" }]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#757575" }]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [{ "color": "#181818" }]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#616161" }]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.stroke",
        "stylers": [{ "color": "#1b1b1b" }]
    },
    {
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "#2c2c2c" }]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#8a8a8a" }]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [{ "color": "#373737" }]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [{ "color": "#3c3c3c" }]
    },
    {
        "featureType": "road.highway.controlled_access",
        "elementType": "geometry",
        "stylers": [{ "color": "#4e4e4e" }]
    },
    {
        "featureType": "road.local",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#616161" }]
    },
    {
        "featureType": "transit",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#757575" }]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{ "color": "#000000" }]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#3d3d3d" }]
    }
];