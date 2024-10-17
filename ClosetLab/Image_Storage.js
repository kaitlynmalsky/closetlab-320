import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system'; // Replaces rn-fetch-blob

class Image {
  constructor(uri, key) {
    this.uri = uri;
    this.key = key;
  }

  // Save the image to the file system and store the path in AsyncStorage
  async saveImage() {
    try {
      const path = `${FileSystem.documentDirectory}${this.key}.jpg`; // Define local path using the key
      await FileSystem.writeAsStringAsync(path, this.uri, { encoding: FileSystem.EncodingType.Base64 });
      console.log('Image saved to file system:', path);

      // Save file path in AsyncStorage
      await AsyncStorage.setItem(this.key, path);
      console.log('Image saved in AsyncStorage:', path);

      return path; // Return the saved path
    } catch (error) {
      console.error('Error saving image:', error);
    }
  }

  // Delete the image from the file system and AsyncStorage
  async deleteImage() {
    try {
      // Retrieve file path from AsyncStorage
      const filePath = await AsyncStorage.getItem(this.key);

      if (filePath) {
        // Remove image from the file system
        await FileSystem.deleteAsync(filePath);
        console.log('Image deleted from file system:', filePath);

        // Remove file path from AsyncStorage
        await AsyncStorage.removeItem(this.key);
        console.log('Image deleted from AsyncStorage:', this.key);
      } else {
        console.log('No image found for the given key:', this.key);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }
}

export default Image;

// Fetch all stored keys and their corresponding image paths from AsyncStorage
export async function getAllStoredImages() {
  try {
    const keys = await AsyncStorage.getAllKeys(); // Get all stored image keys
    const imageURIs = await AsyncStorage.multiGet(keys); // Retrieve all image paths as key-value pairs

    imageURIs.forEach((image) => {
      console.log('Image Key:', image[0]); // Log the key (filename)
      console.log('Image URI:', image[1]); // Log the image path (URI)
    });

    return imageURIs; // Return key-value pairs [key, uri]
  } catch (error) {
    console.log('Error loading images:', error);
  }
}

// Clear all keys and values from AsyncStorage
export async function clearAllImages() {
  try {
    await AsyncStorage.clear();
    console.log('All images cleared from storage');
  } catch (error) {
    console.error('Error clearing image storage:', error);
  }
}