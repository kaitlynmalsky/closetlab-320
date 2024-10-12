import React, { useState } from 'react';
import {SafeAreaView, StyleSheet, Text, Pressable, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {usePhotoGallery} from './Camera_Test.js';

//Base Home Tab. This also serves as a template for a basic tab. 
export default Home = () => {
  const navigation = useNavigation();
  const photoTools = usePhotoGallery();
  const [imageElement, setImageElement] = useState(<Text >No Recent Image</Text>);
  const onGoToCamera = () => {
    navigation.navigate('Camera');
  };
  function getRecentTakenPhoto(){
    const maybeURI = photoTools.getRecentPhoto();
    if (maybeURI){
      //console.log("uri available")
      setImageElement(<Image style={
        {
          width: 300, 
          height: 300, 
          resizeMode: "contain", 
          borderWidth: 1, 
          borderColor: 'red'}
        } 
        source={{uri: maybeURI}}/>)
    }
    else{
      //console.log("uri unavailable")
      setImageElement(<Text >No Recent Image!</Text>)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {imageElement}
      <Pressable style={styles.button} onPress={getRecentTakenPhoto}>
        <Text >Update Image</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={onGoToCamera}>
        <Text >Go to video camera</Text>
      </Pressable>
    </SafeAreaView>
  );
};


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