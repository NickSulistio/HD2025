# Siren - Emergency Response Mobile App

Siren is a mobile application designed to provide real-time emergency information, including fire alerts, evacuations, relief centers, and other critical resources during disasters.

## Features

- **Live Incident Map**: View active emergencies with color-coded zones for evacuation areas
- **Resource Directory**: Find nearby emergency shelters, food banks, and relief centers
- **Safety Postcards**: Share your status with friends and family during emergencies
- **Personalized Setup**: Customize your profile with household information and accessibility needs

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS Simulator (Mac only) or Android Emulator, or physical device with Expo Go app

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/siren-app.git
   cd siren-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables (if needed):
    - Create a `.env` file in the root directory
    - Add your API keys and other configuration values

## Running the App

Start the Expo development server:

```bash
npx expo start
# or
yarn expo start
```

This will open a new browser window with the Expo DevTools. From here, you can:
- Press `i` to open in iOS Simulator (Mac only)
- Press `a` to open in Android Emulator
- Scan the QR code with the Expo Go app on your physical device

## Project Structure

```
siren-app/
├── assets/            # Images, fonts, and other static assets
├── components/        # Reusable UI components
│   ├── IncidentService.js
│   └── LiveIncidentMapWithZones.js
├── screens/           # App screens
│   ├── InfoScreen.js
│   ├── OnboardingScreen.js
│   ├── ResourceDirectoryScreen.js
│   ├── SafetyPostcardScreen.js
│   └── SplashScreen.js
├── styles/            # Style definitions
│   ├── mapDarkStyles.js
│   ├── onboarding.js
│   └── theme.js
├── App.js             # Main application component
├── app.json           # Expo configuration
└── package.json       # Dependencies and scripts
```

## Dependencies

The app uses the following key libraries and APIs:
- React Native and Expo
- React Navigation for screen navigation
- Expo Location for geolocation services
- React Native Maps for map functionality
- AsyncStorage for local data storage
- Expo Image Picker for camera and gallery access
- React Native View Shot for screenshot capabilities

## Development Notes

- Mock data is used for emergency incidents, resources, and campaigns in development. Toggle `USE_MOCK_DATA` in service files to use live data instead.
- The app is designed with a dark theme for better visibility during emergencies.
- Location permissions are required for the full functionality of the app.

## Testing

To test the app with different scenarios:

1. Use the mock data in `IncidentService.js` and `ResourceService.js`
2. Reset onboarding data in the "My Profile" screen for testing the setup flow
3. Test on different screen sizes to ensure responsive design

## Building for Production

To create a production build:

```bash
expo build:android  # For Android
expo build:ios      # For iOS
```

Follow the prompts to generate an APK/AAB file (Android) or IPA file (iOS).

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Emergency icons and graphics from [resource name]
- Map styling inspiration from [resource name]
- [Add any other credits as needed]