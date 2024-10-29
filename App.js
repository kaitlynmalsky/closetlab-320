import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import UploadClothes from './components/UploadClothes';
import TagClothes from './components/TagClothes';
import ClothesGallery from './components/ClothesGallery';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Gallery">
        <Stack.Screen name="Gallery" component={ClothesGallery} />
        <Stack.Screen name="Upload" component={UploadClothes} />
        <Stack.Screen name="Tag" component={TagClothes} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
