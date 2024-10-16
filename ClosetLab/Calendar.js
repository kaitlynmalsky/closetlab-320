import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, Pressable, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePhotoGallery } from './Camera_Test.js';
import BottomNavigation from '@mui/material/BottomNavigation';
import { BottomNavigationAction } from '@mui/material';
import { AccessAlarm, ThreeDRotation } from '@mui/icons-material';

export default Calendar = () => {
    const navigation = useNavigation();
    const photoTools = usePhotoGallery();
    return (
        <SafeAreaView style={styles.container}>
            <Text>you have arrived at the calendar</Text>
            <BottomNavigation
                showLabels
            // value={1}
            // onChange={(event, newValue) => {
            //     setValue(newValue);
            // }}
            >
                <BottomNavigationAction label="Home" />
                <BottomNavigationAction label="Closet" />
                <BottomNavigationAction label="Add" />
                <BottomNavigationAction label="Outfits" />
                <BottomNavigationAction label="Settings" />
            </BottomNavigation>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        padding: 20,
        margin: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#f0f0f0',
        backgroundColor: '#f9f9f9',
    },
});