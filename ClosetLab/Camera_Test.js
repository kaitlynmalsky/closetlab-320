//Adapted from:
//https://docs.expo.dev/versions/latest/sdk/camera/#example-appjson-with-config-plugin
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState } from 'react';
import { SafeAreaView, Button, StyleSheet, Text, Pressable, View } from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Image from './Image_Storage'; // Import the Image class





//messages

const giveCamPermissionMessage = "We need your permission to use your camera."
const giveCamPermissionButton = "Grant permission!"

const recentPhotoURI = [];

export const usePhotoGallery = () => {
  //const [recentPhotoURI, setRecentPhotoURI] = useState(["test"]); 
  
  //returns last taken photo URI.
  function getRecentPhoto(){
    return recentPhotoURI.length>0?recentPhotoURI[recentPhotoURI.length-1]:"";
  }
  //appends something to the end of the internal photo URI storage.
  function addPhoto(thisURI){
    return recentPhotoURI.push(thisURI);
    //return setRecentPhotoURI(recentPhotoURI.push(thisURI))
  }
  return {
    getRecentPhoto,
    addPhoto
  };
}


//Open Camera View
//This took unnecessarily long lol
export default Camera_Test = () => {
  const navigation = useNavigation();
  const onGoToHome = () => { 
    navigation.navigate('Home');
  };

  const [facing, setFacing] = useState('back'); //facing dir of camera; should only ever be "back" or "front"
  const [camera, setCamera] = useState(null); //camera object.
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    // Camera permissions are still loading.
    //TODO: way to exit this page without closing app
    return <SafeAreaView style={styles.container}><View /></SafeAreaView>;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet; displays a simple message prompting user to give access
    //TODO: way to exit this page without closing app
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          <Text style={styles.message}>{giveCamPermissionMessage}</Text>
          <Button onPress={requestPermission} title={giveCamPermissionButton} />
        </View>
      </SafeAreaView>
    );
  }

  function toggleCameraFacing() {
    setFacing(facing==="front" ? "back" : "front");
  }

  // Updated function to save the image to the local file system
  async function takePictureAndStore() {
    if (camera) {
      const photoTools = usePhotoGallery(); // Assuming usePhotoGallery is defined elsewhere
      const newPic = await camera.takePictureAsync({
        base64: true, // Capture the image as base64
        skipProcessing: true,
      });
  
      try {
        const key = `photo_${Date.now()}`; // Generate a unique key for the image
        const image = new Image(newPic.base64, key); // Create a new Image instance
  
        // Use the saveImage method of the Image class to store the image
        const savedPath = await image.saveImage(); // Save the image and get the saved path
        
        if (savedPath) {
          photoTools.addPhoto(savedPath); // Add the file path to the gallery
          console.log('Photo URI stored in AsyncStorage:', savedPath);
        }
      } catch (error) {
        console.log('Error saving the photo:', error);
      }
    } else {
      console.log('Camera not ready');
    }
  }
  
  

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <CameraView style={styles.camera} facing={facing} ref={(ref) => setCamera(ref)}>
          <View style={styles.buttonContainer}>

            <Pressable style={styles.button} onPress={toggleCameraFacing}>
              <Text style={styles.text}>Flip Camera</Text>
            </Pressable>
            
            <Pressable style={styles.button} onPress={takePictureAndStore}>
              <Text style={styles.text}>Take Picture</Text>
            </Pressable>
            
          </View>

          <View style={styles.buttonContainer}>
            <Pressable style={styles.button} onPress={onGoToHome}>
              <Text style={styles.text}>Back to Home</Text>
            </Pressable>
          </View>

        </CameraView>
      </View>
    </SafeAreaView>
  );
}



//TODO: 1 file devoted to common styles across entire app
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});


