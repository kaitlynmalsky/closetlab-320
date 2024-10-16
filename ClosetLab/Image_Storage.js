import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFetchBlob from 'rn-fetch-blob'; // Replaces react-native-fs
import { v4 as uuidv4 } from 'uuid'; // For generating unique keys (Currently not needed, but could be)

// Fetch all stored keys and their corresponding image paths from AsyncStorage.
// Returns an array of URIs that can be used to display the images.
export async function loadStoredImages() {
  try {
    const keys = await AsyncStorage.getAllKeys(); // Get all stored image keys
    const imageURIs = await AsyncStorage.multiGet(keys); // Retrieve all image paths

    imageURIs.forEach((image) => {
      console.log('Image URI:', image[1]); // Log the image path for debugging
    });

    return imageURIs.map((image) => image[1]); // Return just the image URIs
  } catch (error) {
    console.log('Error loading images:', error);
  }
}

// Takes a base64 image string, saves it as a file, and stores its file path in AsyncStorage.
// Returns the saved file path.
export async function saveImage(imageUri) {
  const fileName = `photo_${Date.now()}.jpg`; // Create a unique file name
  const path = `${RNFetchBlob.fs.dirs.DocumentDir}/${fileName}`; // Define local path

  try {
    // Write the file to the file system using rn-fetch-blob
    await RNFetchBlob.fs.writeFile(path, imageUri, 'base64');
    console.log('Image saved to file system:', path);
    
    // Save the image path in AsyncStorage
    await AsyncStorage.setItem(fileName, path);
    console.log('Image saved in AsyncStorage:', path);
    
    return path; // Return the path for further use
  } catch (error) {
    console.error('Error saving image:', error);
  }
}

// Removes the image file from the file system and deletes the corresponding path from AsyncStorage.
export async function deleteImage(key) {
  try {
    // Retrieve the file path from AsyncStorage
    const filePath = await AsyncStorage.getItem(key);
    
    if (filePath) {
      // Remove the image from the file system using rn-fetch-blob
      await RNFetchBlob.fs.unlink(filePath);
      console.log('Image deleted from file system:', filePath);
      
      // Remove the path from AsyncStorage
      await AsyncStorage.removeItem(key);
      console.log('Image deleted from AsyncStorage:', key);
    } else {
      console.log('No image found for the given key');
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}

// Clears all keys and values stored in AsyncStorage
export async function clearAllImages() {
  try {
    await AsyncStorage.clear();
    console.log('All images cleared from storage');
  } catch (error) {
    console.error('Error clearing image storage:', error);
  }
}
