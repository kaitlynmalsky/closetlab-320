// import React, { useState } from 'react';
import { StyleSheet, Image, Platform } from "react-native";
//Test19
const iconResources = {
    flip: require("./assets/buttonIcons/icon_flip.png"),
    home: require("./assets/buttonIcons/icon_home.png"),
    cam: require("./assets/buttonIcons/icon_cam.png"),
    donation_on: require("./assets/buttonIcons/icon_donation_on.png"),
    donation_off: require("./assets/buttonIcons/icon_donation_off.png"),
    add: require("./assets/buttonIcons/icon_add.png"),
    remove: require("./assets/buttonIcons/icon_remove.png"),
    yes: require("./assets/buttonIcons/icon_yes.png"),
    no: require("./assets/buttonIcons/icon_no.png"),
}
const defaultIconStyle = {
    width: 100,
    height: 100,
    borderWidth: 0,
    resizeMode: "contain",
    alignItems: 'center',
    borderColor: 'black'
}


export function generateIcon(name, optionalStyle = defaultIconStyle, resizeStyle = 'contain') {
    //console.log(name)

    if (!iconResources[name]) {
        console.log("using favicon")
        return (<Image
            style={optionalStyle}
            resizeMode={'cover'} // cover or contain its upto you view look
            source={require("./assets/favicon.png")} />)
    }
    //console.log("using normal")
    return (<Image
        style={optionalStyle}
        resizeMode={resizeStyle} // cover or contain its upto you view look
        source={iconResources[name]} />)
    //source={{ uri: iconResources[name] }} />)
}


const styles = StyleSheet.create({
    spacer_row: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        borderWidth: 0,
        justifyContent: 'space-between',
    },
    spacer_row_mobile: {
        flexDirection: 'row',
        //alignItems: 'center',
        flex: 0.15,
        position: 'relative',
        borderWidth: 0,
        justifyContent: 'space-between',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    container_test: {
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    container_row: {
        //flex: 1,
        margin: 0,
        flexDirection: 'row',
        alignItems: 'right',
        justifyContent: 'center',
        position: 'relative'
    },
    container_row_leftAlign: {
        //flex: 1,
        margin: 0,
        flexDirection: 'row',
        alignItems: 'left',
        justifyContent: 'flex-start',
        position: 'relative'
    },
    container_row_rightAlign: {
        //flex: 1,
        margin: 0,
        flexDirection: 'row',
        alignItems: 'right',
        justifyContent: 'flex-end',
        position: 'relative'
    },
    container_underTopRow: {
        flex: 1,
        padding: 0,
        //top:-500,
        //flexDirection: 'row',
        alignItems: 'top',
        justifyContent: 'top',
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
        justifyContent: 'center',
    },
    listItem: {
        padding: 20,
        margin: 10,
        justifyContent: 'left',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#022b6e',
        backgroundColor: '#bbd3fa',
    },
    container_tag: {
        padding: 10,
        margin: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#022b6e',
        backgroundColor: '#bbd3fa',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    button_camera: {
        backgroundColor: 'rgba(44, 44, 44, 0.2)',
        padding: 10,
        margin: 7,
        width: 80,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: StyleSheet.hairlineWidth,
    },
    button_corner: {
        width: '25%',
        height: '100%',
        //margin: 7,
        alignItems: 'center',
        justifyContent: 'center',
        //borderWidth: 5,
    },
    button_donation: {
        width: 60,
        height: 60,
        //margin: 7,
        alignItems: 'center',
        justifyContent: 'bottom',
        borderWidth: 0,
    },
    button_iconCorner: {
        width: 40,
        height: 40,
        //margin: 7,
        alignItems: 'center',
        justifyContent: 'bottom',
        borderWidth: 0,
    },
    button_small: {
        width: 50,
        height: 50,
        //margin: 7,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0,
    },
    icon_general: {
        width: 50,
        height: 50,
        //margin: 7,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0,
    },
    icon_corner: {
        width: 50,
        height: 50,
        alignItems: 'right',
        justifyContent: 'bottom',
        borderWidth: 0,
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
    },
    text_Left: {
        textAlign: 'left',
        fontSize: 24,
    },
    text_Right: {
        textAlign: 'right',
        fontSize: 24,
    },
    title: {
        fontSize: 48,
    },
    tag: {
        "borderRadius": "10px",
        "WebkitBoxDecorationBreak": "clone",
        "boxDecorationBreak": "clone",
        padding: "0px"
    },
    tag_default: {
        backgroundColor: "#d6d6d6",
        color: "#000",
    },
    tag_red: {
        backgroundColor: "#ff3333",
        "color": "#000"
    },
    tag_orange: {
        backgroundColor: "#ff9900",
        color: "#000"
    },
    tag_yellow: {
        backgroundColor: "#ffff33",
        color: "#000"
    },
    tag_green: {
        backgroundColor: "#33cc33",
        color: "#000",
    },
    tag_blue: {
        backgroundColor: "#0066ff",
        color: "#000",
    },
    tag_purple: {
        backgroundColor: "#9966cc",
        color: "#000"
    },
    tag_pink: {
        backgroundColor: "#ff99cc",
        color: "#000"
    },
    tag_black: {
        backgroundColor: "#000",
        color: "#fff"
    },
    tag_gray: {
        backgroundColor: "#999999",
        color: "#000"
    },
    tag_brown: {
        backgroundColor: "#996633",
        color: "#000"
    },

    center: {
        display: "block",
        marginLeft: "auto",
        marginRight: "auto",
        width: "50%"
    },
    pad_text: {
        padding: 5,
    },

    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
    input: {
        padding: 10,
        borderWidth: 0.5,
        borderRadius: 4,
    },
    error_text: {
        color: 'red',
        fontSize: 20,
        textAlign: 'center',
    },
    dropdown: {
        width: 150,
        height: 50,
    },
    calendarContainer: {
        marginTop: 20,
        width: '95%',
        borderWidth: 1,
        borderColor: '#2c2c2c',
        backgroundColor: '#fff',
    },
    calendarTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 10,
        backgroundColor: '#2c2c2c',
        color: '#fff',
    },
    calendarRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#2c2c2c',
    },
    calendarHeaderCell: {
        flex: 1,
        padding: 8,
        borderRightWidth: 1,
        borderRightColor: '#2c2c2c',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    calendarCell: {
        flex: 1,
        height: 80,
        borderRightWidth: 1,
        borderRightColor: '#2c2c2c',
        padding: 2,
    },
    calendarHeaderText: {
        fontWeight: 'bold',
        fontSize: 12,
        color: '#2c2c2c',
    },
    calendarDayContent: {
        flex: 1,
    },
    calendarDayNumber: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    calendarInput: {
        fontSize: 10,
        padding: 2,
        marginBottom: 2,
        width: '100%',
        height: 20,
        textAlign: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 2,
    },
    calendarBackButton: {
        marginTop: 20,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#2c2c2c',
        padding: 10,
    },
    monthButton: {
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#444',
    },
    monthButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default styles;