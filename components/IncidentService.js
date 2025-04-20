import axios from 'axios';

// Flag to use mock data during development
const USE_MOCK_DATA = true;

// Base URLs for data sources (only used when USE_MOCK_DATA is false)
const CAL_FIRE_API = 'https://api.example.com/calfire'; // Replace with actual API endpoint
const NOAA_API = 'https://api.example.com/noaa'; // Replace with actual API endpoint
const USGS_API = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';
const CROWD_SOURCED_API = 'https://api.example.com/crowdsourced'; // Replace with your backend API

class IncidentService {
    // Fetch all incidents
    async getAllIncidents() {
        // During development, immediately return mock data to avoid API call errors
        if (USE_MOCK_DATA) {
            console.log('Using mock incident data');
            return this.getMockData();
        }

        try {
            const [fires, evacuations, reliefCenters, floods, earthquakes] = await Promise.all([
                this.getFireData(),
                this.getEvacuationData(),
                this.getReliefCenterData(),
                this.getFloodData(),
                this.getEarthquakeData()
            ]);

            return {
                fires,
                evacuations,
                reliefCenters,
                floods,
                earthquakes
            };
        } catch (error) {
            console.error('Error fetching all incidents:', error);
            return this.getMockData(); // Fallback to mock data
        }
    }

    // Fetch fire data from Cal Fire and other sources
    async getFireData() {
        if (USE_MOCK_DATA) {
            return this.getMockData().fires;
        }

        try {
            const response = await axios.get(`${CAL_FIRE_API}/incidents`);

            // Transform the response data to match our app's format
            return response.data.map(fire => ({
                id: fire.id,
                latitude: fire.latitude,
                longitude: fire.longitude,
                weight: this.calculateWeight(fire.acres, fire.containment),
                title: fire.name,
                description: `${fire.acres} acres, ${fire.containment}% contained`,
                timestamp: fire.started,
                source: 'Cal Fire'
            }));
        } catch (error) {
            console.error('Error fetching fire data:', error);
            return this.getMockData().fires;
        }
    }

    // Fetch evacuation data
    async getEvacuationData() {
        if (USE_MOCK_DATA) {
            return this.getMockData().evacuations;
        }

        try {
            const response = await axios.get(`${CAL_FIRE_API}/evacuations`);

            return response.data.map(evac => ({
                id: evac.id,
                latitude: evac.latitude,
                longitude: evac.longitude,
                weight: evac.mandatory ? 0.9 : 0.5,
                title: evac.zoneName,
                description: evac.mandatory ? 'Mandatory Evacuation' : 'Voluntary Evacuation',
                timestamp: evac.issued,
                source: 'Cal Fire'
            }));
        } catch (error) {
            console.error('Error fetching evacuation data:', error);
            return this.getMockData().evacuations;
        }
    }

    // Fetch relief center data
    async getReliefCenterData() {
        if (USE_MOCK_DATA) {
            return this.getMockData().reliefCenters;
        }

        try {
            // This could come from a government API or your own backend
            const response = await axios.get(`${CROWD_SOURCED_API}/relief-centers`);

            return response.data.map(center => ({
                id: center.id,
                latitude: center.latitude,
                longitude: center.longitude,
                title: center.name,
                description: `Capacity: ${center.capacity}, ${center.services.join(', ')}`,
                timestamp: center.updated,
                source: center.source
            }));
        } catch (error) {
            console.error('Error fetching relief center data:', error);
            return this.getMockData().reliefCenters;
        }
    }

    // Fetch flood data from NOAA
    async getFloodData() {
        if (USE_MOCK_DATA) {
            return this.getMockData().floods;
        }

        try {
            const response = await axios.get(`${NOAA_API}/floods`);

            return response.data.map(flood => ({
                id: flood.id,
                latitude: flood.latitude,
                longitude: flood.longitude,
                weight: this.calculateFloodWeight(flood.severity),
                title: flood.title,
                description: flood.description,
                timestamp: flood.issued,
                source: 'NOAA'
            }));
        } catch (error) {
            console.error('Error fetching flood data:', error);
            return this.getMockData().floods;
        }
    }

    // Fetch earthquake data from USGS
    async getEarthquakeData() {
        if (USE_MOCK_DATA) {
            return this.getMockData().earthquakes;
        }

        try {
            const response = await axios.get(USGS_API);

            return response.data.features.map(quake => {
                const { mag, place, time } = quake.properties;
                const [longitude, latitude] = quake.geometry.coordinates;

                return {
                    id: quake.id,
                    latitude,
                    longitude,
                    weight: this.calculateEarthquakeWeight(mag),
                    title: `M${mag} - ${place}`,
                    description: `Magnitude: ${mag}`,
                    timestamp: time,
                    source: 'USGS'
                };
            });
        } catch (error) {
            console.error('Error fetching earthquake data:', error);
            return this.getMockData().earthquakes;
        }
    }

    // Submit a user report
    async submitUserReport(report) {
        if (USE_MOCK_DATA) {
            // Simulate a successful submission with a delay
            console.log('Mock report submission:', report);
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({ success: true, id: 'mock-report-' + Date.now() });
                }, 1000);
            });
        }

        try {
            const response = await axios.post(`${CROWD_SOURCED_API}/reports`, report);
            return response.data;
        } catch (error) {
            console.error('Error submitting user report:', error);
            throw error;
        }
    }

    // Helper methods for calculating weights
    calculateWeight(acres, containment) {
        // Logic to determine severity based on size and containment
        if (!acres || !containment) return 0.5;

        // Larger fires with lower containment are more severe
        const sizeWeight = Math.min(acres / 10000, 1) * 0.7;
        const containmentWeight = (100 - containment) / 100 * 0.3;

        return Math.min(sizeWeight + containmentWeight, 1);
    }

    calculateFloodWeight(severity) {
        // Convert severity string to weight
        switch (severity.toLowerCase()) {
            case 'major': return 0.9;
            case 'moderate': return 0.6;
            case 'minor': return 0.3;
            default: return 0.5;
        }
    }

    calculateEarthquakeWeight(magnitude) {
        // Magnitude 3.0 and below: minor, 3.0-5.0: moderate, 5.0+: major
        return Math.min(magnitude / 10, 1);
    }

    // Mock data for testing or when APIs are unavailable
    getMockData() {
        return {
            fires: [
                { id: 1, latitude: 34.0522, longitude: -118.2437, weight: 0.8, title: 'Palisades Fire', description: '2,500 acres, 30% contained', timestamp: Date.now(), source: 'Mock Data' },
                { id: 2, latitude: 34.0622, longitude: -118.2537, weight: 0.5, title: 'Eaton Fire', description: '1,200 acres, 45% contained', timestamp: Date.now(), source: 'Mock Data' },
                { id: 3, latitude: 34.0822, longitude: -118.2237, weight: 0.7, title: 'Canyon Fire', description: '3,100 acres, 15% contained', timestamp: Date.now(), source: 'Mock Data' },
            ],
            evacuations: [
                { id: 1, latitude: 34.0552, longitude: -118.2457, weight: 0.9, title: 'Mandatory Evacuation Zone A', description: 'All residents must evacuate immediately', timestamp: Date.now(), source: 'Mock Data' },
                { id: 2, latitude: 34.0652, longitude: -118.2557, weight: 0.6, title: 'Voluntary Evacuation Zone B', description: 'Be prepared to evacuate if conditions worsen', timestamp: Date.now(), source: 'Mock Data' },
            ],
            reliefCenters: [
                { id: 1, latitude: 34.0722, longitude: -118.2637, title: 'Community Center Relief', description: 'Capacity: 250, Services: Food, Water, Medical', timestamp: Date.now(), source: 'Mock Data' },
                { id: 2, latitude: 34.0922, longitude: -118.2837, title: 'High School Shelter', description: 'Capacity: 500, Services: Food, Water, Medical, Pet Boarding', timestamp: Date.now(), source: 'Mock Data' },
            ],
            floods: [
                { id: 1, latitude: 34.1022, longitude: -118.3037, weight: 0.4, title: 'Flash Flood Warning', description: 'Active until 7PM. Avoid low lying areas.', timestamp: Date.now(), source: 'Mock Data' },
            ],
            earthquakes: [
                { id: 1, latitude: 34.0522, longitude: -118.3437, weight: 0.6, title: 'M4.2 Earthquake', description: 'Depth: 10km', timestamp: Date.now(), source: 'Mock Data' },
            ]
        };
    }
}

export default new IncidentService();