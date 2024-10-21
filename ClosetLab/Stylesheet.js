// import React, { useState } from 'react';
import { StyleSheet } from "react-native";

export default styles = StyleSheet.create({
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
        backgroundColor: '#2c2c2c',
    },
    button_text: {
        color: 'white'
    },
    camera: {
        flex: 1,
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },

    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 64,
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
    },
})