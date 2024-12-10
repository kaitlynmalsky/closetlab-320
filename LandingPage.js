import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function LandingPage() {
    const navigation = useNavigation();
    const [showNotificationDot, setShowNotificationDot] = useState(true);

    const onHomePress = () => {
        navigation.navigate('Home');
    };

    const onNotificationPress = () => {
        setShowNotificationDot(false);
        navigation.navigate('Notification');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Hello Closetlab</Text>
            <View style={styles.buttonContainer}>
                <Pressable style={styles.button} onPress={onHomePress}>
                    <Text style={styles.buttonText}>Home</Text>
                </Pressable>
                <View style={styles.notificationButtonContainer}>
                    <Pressable style={[styles.button, styles.notificationButton]} onPress={onNotificationPress}>
                        <Text style={styles.buttonText}>Notification</Text>
                    </Pressable>
                    {showNotificationDot && <View style={styles.notificationDot} />}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#89CFF0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 30,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 20,
    },
    notificationButtonContainer: {
        position: 'relative',
    },
    button: {
        padding: 20,
        backgroundColor: '#2c2c2c',
        borderRadius: 10,
        minWidth: 150,
        alignItems: 'center',
    },
    notificationButton: {
        backgroundColor: '#444',
    },
    notificationDot: {
        position: 'absolute',
        top: -5,
        left: -5,
        width: 12,
        height: 12,
        backgroundColor: '#FF0000',
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#fff',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    }
}); 