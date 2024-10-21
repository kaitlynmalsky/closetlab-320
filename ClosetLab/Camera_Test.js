//Adapted from:
//https://docs.expo.dev/versions/latest/sdk/camera/#example-appjson-with-config-plugin
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState } from 'react';
import { SafeAreaView, Button, StyleSheet, Text, Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { saveImage, loadStoredImages, deleteImage, clearAllImages } from './Image_Storage';
import styles from './Stylesheet';

//messages

const giveCamPermissionMessage = "We need your permission to use your camera."
const giveCamPermissionButton = "Grant permission!"

const recentPhotoURI = [];

export const usePhotoGallery = () => {
  //const [recentPhotoURI, setRecentPhotoURI] = useState(["test"]); 

  //returns last taken photo URI.
  function getRecentPhoto() {
    return recentPhotoURI.length > 0 ? recentPhotoURI[recentPhotoURI.length - 1] : "";
  }
  //appends something to the end of the internal photo URI storage.
  function addPhoto(thisURI) {
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
    setFacing(facing === "front" ? "back" : "front");
  }

  // Updated function to save the image to the local file system, uses saveImage from Image_Storage.js
  async function takePictureAndStore() {
    if (camera) {
      const photoTools = usePhotoGallery(); // Assuming usePhotoGallery is defined elsewhere
      const newPic = await camera.takePictureAsync({
        base64: true, // Capture the image as base64
        skipProcessing: true,
      });

      try {
        // Use the saveImage function from Image_storage.js to store the image
        const savedPath = await saveImage(newPic.base64); // Pass the base64 image data to saveImage

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
      <CameraView style={styles.camera} facing={facing} ref={(ref) => setCamera(ref)}>
        <View style={[styles.container_test]}>

          <Pressable style={styles.button_camera} onPress={toggleCameraFacing}>
            <Text style={styles.button_text}>Flip Camera</Text>
          </Pressable>

          <Pressable style={styles.button_camera} onPress={takePictureAndStore}>
            <Text style={styles.button_text}>Take Picture</Text>
          </Pressable>

          <Pressable style={styles.button_camera} onPress={onGoToHome}>
            <Text style={styles.button_text}>Back to Home</Text>
          </Pressable>

        </View>

      </CameraView>
    </SafeAreaView>
  );
}