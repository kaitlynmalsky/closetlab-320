// import React, { useState } from 'react';
import { StyleSheet, Image, Platform } from "react-native";

const iconResources = {
    flip: require("./assets/buttonIcons/icon_flip.png"),
}


export function generateIcon(name) {
    console.log(name)
    console.log(iconResources["flip"])
    if (!iconResources[name]) {
        console.log("using favicon")
        return (<Image
            style={{
                width: 300,
                height: 300,
                borderWidth: 0,
                resizeMode: "contain",
                alignItems: 'center',
                borderColor: 'black'
            }}
            resizeMode={'cover'} // cover or contain its upto you view look
            source={{ uri: require("./assets/favicon.png") }} />)
    }
    console.log("using normal")
    return (<Image
        style={{
            width: 300,
            height: 300,
            borderWidth: 0,
            resizeMode: "contain",
            alignItems: 'center',
            borderColor: 'black'
        }}
        resizeMode={'cover'} // cover or contain its upto you view look
        source={{ uri: require('./assets/adaptive-icon.png') }} />)
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    container_test: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
    },
    container_camera: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        flexDirection: 'row',
        bottom: 0,
    },
    button: {
        padding: 20,
        margin: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#f0f0f0',
        backgroundColor: '#2c2c2c',
    },
    button_camera: {
        backgroundColor: 'rgba(44, 44, 44, 0.2)',
        padding: 10,
        margin: 20,
        width: 'calc(100vw/6)',
        height: 'calc(100vw/6)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: StyleSheet.hairlineWidth,
    },
    button_text: {
        color: 'white',
        textAlign: 'center',
    },
    camera: {
        width: '100%',
        height: '100%'
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
});

export default styles;