// SplashScreen.js
import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    Animated,
    Easing,
    StyleSheet,
    Dimensions,
    Platform,
} from 'react-native';

// Import theme and typography
import { colors, fonts, fontSizes, spacing, shadows } from '../styles/theme';
import { text } from '../styles/typography';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onComplete }) => {
    // Animation values
    const textOpacity = useRef(new Animated.Value(0)).current;
    const contentOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Simple fade in and fade out sequence
        Animated.sequence([
            // Step 1: Fade in the text
            Animated.timing(textOpacity, {
                toValue: 1,
                duration: 500,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),

            // Step 2: Brief pause to display the brand
            Animated.delay(1000),

            // Step 3: Fade out everything
            Animated.timing(contentOpacity, {
                toValue: 0,
                duration: 500,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start(() => {
            // Animation complete - call the provided onComplete callback
            if (onComplete) {
                onComplete();
            }
        });
    }, []);

    return (
        <Animated.View
            style={[
                styles.container,
                { opacity: contentOpacity }
            ]}
        >
            <View style={styles.contentContainer}>
                {/* App name with simple styling */}
                <Animated.Text
                    style={[
                        text.headline,
                        styles.appName,
                        { opacity: textOpacity }
                    ]}
                >
                    Siren
                </Animated.Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: width,
        height: height,
        backgroundColor: colors.black,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000, // Ensure it sits on top of other components
    },
    contentContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    appName: {
        color: colors.white,
        fontSize: 56,
        letterSpacing: 2,
        textAlign: 'center',
        ...Platform.select({
            ios: {
                fontWeight: '400', // Regular font weight as requested
            },
            android: {
                fontWeight: '400', // Regular font weight as requested
            },
        }),
    }
});

export default SplashScreen;