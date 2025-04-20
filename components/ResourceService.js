import axios from 'axios';

// Flag to use mock data
const USE_MOCK_DATA = true;

// Base URLs for data sources (only used when USE_MOCK_DATA is false)
const RESOURCE_API = 'https://api.example.com/resources';
const CAMPAIGN_API = 'https://api.example.com/campaigns';

class ResourceService {
    // Get all resources
    async getResources(userLocation = null) {
        // During development, immediately return mock data
        if (USE_MOCK_DATA) {
            console.log('Using mock resource data');
            const resources = this.getMockResources();

            // If user location is available, calculate distances
            if (userLocation) {
                return resources.map(resource => ({
                    ...resource,
                    distance: this.calculateDistance(
                        userLocation.coords.latitude,
                        userLocation.coords.longitude,
                        resource.latitude,
                        resource.longitude
                    )
                })).sort((a, b) => a.distance - b.distance);
            }

            return resources;
        }

        try {
            const response = await axios.get(RESOURCE_API);
            const resources = response.data;

            // If user location is available, calculate distances
            if (userLocation) {
                return resources.map(resource => ({
                    ...resource,
                    distance: this.calculateDistance(
                        userLocation.coords.latitude,
                        userLocation.coords.longitude,
                        resource.latitude,
                        resource.longitude
                    )
                })).sort((a, b) => a.distance - b.distance);
            }

            return resources;
        } catch (error) {
            console.error('Error fetching resources:', error);
            return this.getMockResources();
        }
    }

    // Get all donation campaigns
    async getCampaigns() {
        // During development, immediately return mock data
        if (USE_MOCK_DATA) {
            console.log('Using mock campaign data');
            return this.getMockCampaigns();
        }

        try {
            const response = await axios.get(CAMPAIGN_API);
            return response.data;
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            return this.getMockCampaigns();
        }
    }

    // Submit a new resource
    async submitResource(resource) {
        if (USE_MOCK_DATA) {
            // Simulate a successful submission with a delay
            console.log('Mock resource submission:', resource);
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({ success: true, id: 'mock-resource-' + Date.now() });
                }, 1000);
            });
        }

        try {
            const response = await axios.post(RESOURCE_API, resource);
            return response.data;
        } catch (error) {
            console.error('Error submitting resource:', error);
            throw error;
        }
    }

    // Submit a new campaign
    async submitCampaign(campaign) {
        if (USE_MOCK_DATA) {
            // Simulate a successful submission with a delay
            console.log('Mock campaign submission:', campaign);
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({ success: true, id: 'mock-campaign-' + Date.now() });
                }, 1000);
            });
        }

        try {
            const response = await axios.post(CAMPAIGN_API, campaign);
            return response.data;
        } catch (error) {
            console.error('Error submitting campaign:', error);
            throw error;
        }
    }

    // Helper method to calculate distance between two coordinates in miles
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 3958.8; // Earth's radius in miles
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    }

    deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    // Mock resource data
    getMockResources() {
        return [
            {
                id: 1,
                name: "Westside Community Shelter",
                type: "shelter",
                description: "Emergency shelter providing temporary housing and support services for individuals and families affected by disasters.",
                latitude: 34.0512,
                longitude: -118.4228,
                services: [
                    "Emergency housing",
                    "Food services",
                    "Clothing distribution",
                    "Case management",
                    "Mental health support"
                ],
                accessibility: true,
                openNow: true,
                hours: {
                    0: [8, 22], // Sunday 8AM-10PM
                    1: [8, 22], // Monday 8AM-10PM
                    2: [8, 22], // Tuesday 8AM-10PM
                    3: [8, 22], // Wednesday 8AM-10PM
                    4: [8, 22], // Thursday 8AM-10PM
                    5: [8, 22], // Friday 8AM-10PM
                    6: [8, 22]  // Saturday 8AM-10PM
                },
                phone: "310-555-1234",
                website: "https://example.com/westsideShelter",
                notes: "Pets allowed in designated areas. Please bring ID if available, but not required."
            },
            {
                id: 2,
                name: "Santa Monica Food Bank",
                type: "foodBank",
                description: "Providing emergency food supplies to those affected by fires and other emergencies.",
                latitude: 34.0195,
                longitude: -118.4912,
                services: [
                    "Emergency food boxes",
                    "Fresh produce distribution",
                    "Special dietary needs accommodation",
                    "Home delivery for seniors"
                ],
                accessibility: true,
                openNow: false,
                hours: {
                    0: null, // Closed on Sunday
                    1: [9, 17], // Monday 9AM-5PM
                    2: [9, 17], // Tuesday 9AM-5PM
                    3: [9, 17], // Wednesday 9AM-5PM
                    4: [9, 17], // Thursday 9AM-5PM
                    5: [9, 17], // Friday 9AM-5PM
                    6: [10, 14]  // Saturday 10AM-2PM
                },
                phone: "310-555-2345",
                website: "https://example.com/santamonicafoodbank",
                notes: "No appointment necessary. Drive-through pickup available."
            },
            {
                id: 3,
                name: "Highland Park Medical Center",
                type: "medical",
                description: "Providing emergency medical services, check-ups, and medication for those affected by wildfires.",
                latitude: 34.1115,
                longitude: -118.1892,
                services: [
                    "Emergency medical care",
                    "Smoke inhalation treatment",
                    "Free medications",
                    "Mental health services",
                    "Telehealth consultations"
                ],
                accessibility: true,
                openNow: true,
                hours: {
                    0: [0, 24], // Sunday 24 hours
                    1: [0, 24], // Monday 24 hours
                    2: [0, 24], // Tuesday 24 hours
                    3: [0, 24], // Wednesday 24 hours
                    4: [0, 24], // Thursday 24 hours
                    5: [0, 24], // Friday 24 hours
                    6: [0, 24]  // Saturday 24 hours
                },
                phone: "323-555-3456",
                website: "https://example.com/highlandmedical",
                notes: "Special services available for those with fire-related injuries. Bring insurance information if available, but care will be provided regardless of insurance status."
            },
            {
                id: 4,
                name: "Valley Animal Rescue Center",
                type: "animal",
                description: "Emergency animal shelter and care for pets displaced by fires and other disasters.",
                latitude: 34.1866,
                longitude: -118.4487,
                services: [
                    "Emergency pet boarding",
                    "Veterinary care",
                    "Pet food distribution",
                    "Lost pet reunification",
                    "Pet supplies"
                ],
                accessibility: false,
                openNow: true,
                hours: {
                    0: [10, 18], // Sunday 10AM-6PM
                    1: [8, 20], // Monday 8AM-8PM
                    2: [8, 20], // Tuesday 8AM-8PM
                    3: [8, 20], // Wednesday 8AM-8PM
                    4: [8, 20], // Thursday 8AM-8PM
                    5: [8, 20], // Friday 8AM-8PM
                    6: [10, 18]  // Saturday 10AM-6PM
                },
                phone: "818-555-4567",
                website: "https://example.com/valleyanimalrescue",
                notes: "Currently at capacity for large dogs, but can still accept cats and small animals. Donations of pet supplies greatly appreciated."
            },
            {
                id: 5,
                name: "Echo Park Relief Center",
                type: "shelter",
                description: "Multi-service relief center providing shelter, meals, and support services for fire evacuees.",
                latitude: 34.0782,
                longitude: -118.2606,
                services: [
                    "Temporary housing",
                    "Hot meals",
                    "Showering facilities",
                    "Charging stations",
                    "Internet access",
                    "Mail services"
                ],
                accessibility: true,
                openNow: true,
                hours: {
                    0: [8, 20], // Sunday 8AM-8PM
                    1: [8, 20], // Monday 8AM-8PM
                    2: [8, 20], // Tuesday 8AM-8PM
                    3: [8, 20], // Wednesday 8AM-8PM
                    4: [8, 20], // Thursday 8AM-8PM
                    5: [8, 20], // Friday 8AM-8PM
                    6: [8, 20]  // Saturday 8AM-8PM
                },
                phone: "213-555-5678",
                website: "https://example.com/echoparkrelief",
                notes: "Family-friendly area available. Translation services available for Spanish, Armenian, and Korean speakers."
            },
            {
                id: 6,
                name: "Downtown Community Kitchen",
                type: "foodBank",
                description: "Hot meals and food supplies for those affected by the fires and evacuations.",
                latitude: 34.0430,
                longitude: -118.2673,
                services: [
                    "Hot meals",
                    "Grocery distribution",
                    "Water supply",
                    "Meal delivery for seniors",
                    "Special dietary accommodations"
                ],
                accessibility: true,
                openNow: false,
                hours: {
                    0: [11, 14], // Sunday 11AM-2PM
                    1: [7, 10, 11, 14, 17, 20], // Monday 7-10AM, 11AM-2PM, 5-8PM
                    2: [7, 10, 11, 14, 17, 20], // Tuesday 7-10AM, 11AM-2PM, 5-8PM
                    3: [7, 10, 11, 14, 17, 20], // Wednesday 7-10AM, 11AM-2PM, 5-8PM
                    4: [7, 10, 11, 14, 17, 20], // Thursday 7-10AM, 11AM-2PM, 5-8PM
                    5: [7, 10, 11, 14, 17, 20], // Friday 7-10AM, 11AM-2PM, 5-8PM
                    6: [11, 14]  // Saturday 11AM-2PM
                },
                phone: "213-555-6789",
                website: "https://example.com/downtownkitchen",
                notes: "No ID required. Volunteers needed for meal preparation and delivery."
            },
            {
                id: 7,
                name: "Glendale Urgent Care Clinic",
                type: "medical",
                description: "Offering free urgent care services for fire victims and evacuees.",
                latitude: 34.1425,
                longitude: -118.2551,
                services: [
                    "Urgent care",
                    "Respiratory assessments",
                    "First aid",
                    "Prescription refills",
                    "Free masks and inhalers",
                    "Eye wash stations"
                ],
                accessibility: true,
                openNow: true,
                hours: {
                    0: [9, 17], // Sunday 9AM-5PM
                    1: [8, 20], // Monday 8AM-8PM
                    2: [8, 20], // Tuesday 8AM-8PM
                    3: [8, 20], // Wednesday 8AM-8PM
                    4: [8, 20], // Thursday 8AM-8PM
                    5: [8, 20], // Friday 8AM-8PM
                    6: [9, 17]  // Saturday 9AM-5PM
                },
                phone: "818-555-7890",
                website: "https://example.com/glendaleclinic",
                notes: "Priority given to those with respiratory issues, elderly, and families with young children."
            },
            {
                id: 8,
                name: "Pasadena Pet Haven",
                type: "animal",
                description: "Emergency animal shelter providing temporary housing and care for pets of evacuated families.",
                latitude: 34.1478,
                longitude: -118.1445,
                services: [
                    "Emergency pet shelter",
                    "Veterinary services",
                    "Pet food and supplies",
                    "Foster placement",
                    "Microchipping"
                ],
                accessibility: false,
                openNow: false,
                hours: {
                    0: [9, 17], // Sunday 9AM-5PM
                    1: [9, 19], // Monday 9AM-7PM
                    2: [9, 19], // Tuesday 9AM-7PM
                    3: [9, 19], // Wednesday 9AM-7PM
                    4: [9, 19], // Thursday 9AM-7PM
                    5: [9, 19], // Friday 9AM-7PM
                    6: [9, 17]  // Saturday 9AM-5PM
                },
                phone: "626-555-8901",
                website: "https://example.com/pasadenapethaven",
                notes: "Limited capacity for large animals. Please call ahead if you need to bring in exotic pets."
            }
        ];
    }

    // Mock campaign data
    getMockCampaigns() {
        return [
            {
                id: 1,
                title: "Palisades Fire Relief Fund",
                organizer: "LA Community Foundation",
                description: "Supporting families who lost their homes in the recent Palisades Fire. Funds will be distributed directly to affected families for immediate needs including temporary housing, food, clothing, and other essentials.",
                imageUrl: "https://images.unsplash.com/photo-1523467827732-b8f15f9ed135?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
                amountRaised: 57500,
                goal: 100000,
                donors: 423,
                verified: true,
                donationLink: "https://example.com/palisadesfire",
                paymentMethods: ["creditCard", "venmo", "paypal"]
            },
            {
                id: 2,
                title: "Rebuild Canyon Elementary School",
                organizer: "Canyon PTA",
                description: "Our elementary school was damaged in the Eaton Fire. Help us rebuild classrooms and replace educational materials so our children can return to learning as soon as possible.",
                imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
                amountRaised: 125000,
                goal: 250000,
                donors: 892,
                verified: true,
                donationLink: "https://example.com/canyonschool",
                paymentMethods: ["creditCard", "paypal", "check"]
            },
            {
                id: 3,
                title: "Thompson Family Home Recovery",
                organizer: "Sarah Thompson",
                description: "Our family of five lost everything in the Eaton Fire, including our home of 15 years. We're staying with relatives temporarily but need help to start rebuilding our lives. Any amount helps and is deeply appreciated.",
                imageUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
                amountRaised: 32450,
                goal: 50000,
                donors: 217,
                verified: true,
                donationLink: "https://example.com/thompsonfamily",
                paymentMethods: ["creditCard", "venmo", "cashApp"]
            },
            {
                id: 4,
                title: "Wildfire First Responders Support",
                organizer: "Firefighters Aid Society",
                description: "Supporting the brave men and women fighting on the frontlines of the California wildfires. Funds go toward equipment, meals, and support for firefighters and their families.",
                imageUrl: "https://images.unsplash.com/photo-1523983254932-9845e3e6e2a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
                amountRaised: 87320,
                goal: 150000,
                donors: 756,
                verified: true,
                donationLink: "https://example.com/firstresponders",
                paymentMethods: ["creditCard", "paypal", "applePay"]
            },
            {
                id: 5,
                title: "Wildlife Rehabilitation After Fires",
                organizer: "California Wildlife Trust",
                description: "Supporting rescue and rehabilitation efforts for wildlife affected by the wildfires. Funds will help treat injured animals and restore damaged habitats.",
                imageUrl: "https://images.unsplash.com/photo-1504006833117-8886a355efbf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
                amountRaised: 42780,
                goal: 75000,
                donors: 385,
                verified: true,
                donationLink: "https://example.com/wildlife",
                paymentMethods: ["creditCard", "paypal"]
            }
        ];
    }
}

export default new ResourceService();