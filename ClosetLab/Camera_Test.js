//Adapted from:
//https://docs.expo.dev/versions/latest/sdk/camera/#example-appjson-with-config-plugin
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState } from 'react';
import { SafeAreaView, Button, StyleSheet, Text, Pressable, View, Image, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { saveImage, loadStoredImages, deleteImage, clearAllImages, getStoredImages } from './Image_Storage';
import styles, {generateIcon, icons} from './Stylesheet';
import { base_url } from './APIContainer.js';


//https://medium.com/@programer7823/how-to-remove-image-background-in-nodejs-without-any-api-02abad4a7b3a
//https://github.com/atlj/react-native-background-remover
//import { removeBackground } from "@imgly/background-removal";
//global.Buffer = require('buffer').Buffer;
////const toBuffer = (uri) => Buffer.from(uri.replace(/^.\*,/g, ''), 'base64');
//
//const toDataURI = (blob) =>
//  new Promise((resolve) => {
//    const reader = new FileReader();
//    reader.readAsDataURL(blob);
//    reader.onloadend = () => {
//      const uri = reader.result?.toString();
//      resolve(uri);
//    };
//  });
//const toBuffer = (blob) =>
//  new Promise((resolve) => {
//    const reader = new FileReader();
//    reader.readAsDataURL(blob);
//    reader.onloadend = () => {
//      const uri = reader.result?.toString() ?? '';
//      const base64 = uri.replace(/^.\*,/g, '');
//
//      resolve(Buffer.from(base64, 'base64'));
//    };
//  });
//async function removeImageBackground(imgSource) {
//  const blob = await removeBackground(imgSource);
//  //const buffer = Buffer.from(await blob.arrayBuffer());
//  //const dataURL = `data:image/png;base64,${buffer.toString("base64")}`;
//  //return dataURL;
//
//  const dataURI = await toDataURI(blob);
//  return dataURI;
//}
//
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

  const onCancelImage = () => {
    navigation.navigate('Single Clothing Item View');
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

      //remove bg
      //const newPic_noBG = await removeImageBackground(newPic);

      try {
        
       
        if (window.global_selectedClothingItem==null){window.global_selectedClothingItem = {imageUri:"none"}}
        window.global_selectedClothingItem.imageUri = newPic.base64
        options = {
          method: 'POST',
          headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({"image_link":newPic.base64})
        }
        response = await fetch(base_url + 'v1/clothing-items/set-image-link/' +window.global_selectedClothingItem._id+ '/', options);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const responseData = await response.json();
        console.log(responseData);
        window.global_itemListNeedsUpdate = true
        //TODO: update database with changed image 
        //navigation.navigate('Home');
        //console.log(window.global_selectedClothingItem.imageUri)
        navigation.navigate('Single Clothing Item View');



        // Use the saveImage function from Image_storage.js to store the image
        const savedPath = await saveImage(newPic.base64); // Pass the base64 image data to saveImage

        if (savedPath && Platform.OS!=='web') {
          photoTools.addPhoto(newPic.base64); // Add the important b64 to the gallery
          console.log('Photo URI stored in AsyncStorage:', savedPath);
        }
        else {
          photoTools.addPhoto(newPic.base64);
        }
        
      } catch (error) {
        console.log('Error saving the photo:', error);
      }
    } else {
      console.log('Camera not ready');
    }
  }


  activeCameraView = (
    <SafeAreaView style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={(ref) => setCamera(ref)}>
        <View style={[styles.container_camera]}>

          <Pressable style={styles.button_camera} onPress={toggleCameraFacing}>
            {generateIcon("flip", null, 'cover')}
          </Pressable>

          <Pressable style={styles.button_camera} onPress={takePictureAndStore}>
          {generateIcon("cam", null, 'cover')}
          </Pressable>

          <Pressable style={styles.button_camera} onPress={onCancelImage}>
          {generateIcon("no", null, 'cover')}
          </Pressable>

        </View>

      </CameraView>
    </SafeAreaView>
  );

  return activeCameraView;
}