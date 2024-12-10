import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, Pressable, Image, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePhotoGallery } from './Camera_Test.js';
import styles from './Stylesheet';
import { logFetch, getItem, postItem, deleteItem } from './APIContainer.js';


//Base Home Tab. This also serves as a template for a basic tab. 
export default Home = () => {
    const navigation = useNavigation();
    const photoTools = usePhotoGallery();
    const [imageElement, setImageElement] = useState(<Text >No Recent Image</Text>);
    const onGoToCamera = () => {
        navigation.navigate('Camera');
    };
    const onGoToClothingItemTest = () => {
        navigation.navigate('Clothing Item View');
    };
    const onGoToCalendar = () => {
        navigation.navigate('Calendar')
    }
    const onGoToOutfitList = () => {
        navigation.navigate('Outfit List View');
    };
    function getRecentTakenPhoto() {
        const maybeURI = photoTools.getRecentPhoto();
        if (maybeURI) {

            setImageElement(<Image style={
                {
                    width: 300,
                    height: 300,
                    resizeMode: "contain",
                    borderWidth: 1,
                    borderColor: 'red'
                }
            }
                source={{ uri: maybeURI }} />)
        }
        else {
            //console.log("uri unavailable")
            setImageElement(<View>
                <Text >No Recent Image!</Text>
            </View>)

        }
    }
    //<Pressable style={styles.button} onPress={onGoToCamera}>
    //    <Text style={styles.button_text}>Go to video camera</Text>
    //</Pressable>


    //{imageElement}
    return (
        <SafeAreaView style={styles.container}>

            <Pressable style={styles.button} onPress={onGoToOutfitList}>
                <Text style={styles.button_text}>Outfits</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={onGoToClothingItemTest}>
                <Text style={styles.button_text}>Clothing Items</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={onGoToCalendar}>
                <Text style={styles.button_text}>Calendar</Text>
            </Pressable>

        </SafeAreaView>
    );
};