import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, Pressable, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePhotoGallery } from './Camera_Test.js';
import styles from './Stylesheet';


//Base Home Tab. This also serves as a template for a basic tab. 
export default Home = () => {
    const navigation = useNavigation();
    const photoTools = usePhotoGallery();
    const [imageElement, setImageElement] = useState(<Text >No Recent Image</Text>);
    const onGoToCamera = () => {
        navigation.navigate('Camera');
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
                <Image 
            style={{
              width: 300,
              height: 300,
              borderWidth: 0,
              resizeMode: "contain",
              alignItems: 'center',
              borderColor: 'black'
          }}
            resizeMode={'cover'} // cover or contain its upto you view look
            source={{ uri: require("./assets/favicon.png") }} />
            </View>)
            
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            {imageElement}
            <Pressable style={styles.button} onPress={getRecentTakenPhoto}>
                <Text style={styles.button_text}>Update Image</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={onGoToCamera}>
                <Text style={styles.button_text}>Go to video camera</Text>
            </Pressable>
        </SafeAreaView>
    );
};