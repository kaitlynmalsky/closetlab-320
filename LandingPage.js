import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function LandingPage() {
    const navigation = useNavigation();

    const onHomePress = () => {
        navigation.navigate('Home');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Welcome to Closetlab</Text>
            <View style={styles.buttonContainer}>
                <Pressable style={styles.button} onPress={onHomePress}>
                    <Text style={styles.buttonText}>Home</Text>
                </Pressable>
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
    button: {
        padding: 20,
        backgroundColor: '#2c2c2c',
        borderRadius: 10,
        minWidth: 150,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    }
}); 