import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, Image } from 'react-native';
import Camera_Test from './Camera_Test.js';
import Home from './Home.js';
import { ClothingItemView, ClothingItemListView } from './ClothingAndOutfits.js';
import { OutfitListView, SingleOutfitView } from './Outfits.js';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import styles from './Stylesheet';
import axios from 'axios';
import { SafeAreaView } from 'react-native-web';
import { postItem } from './APIContainer.js';
import { CalendarView } from './Calendar.js';
import LandingPage from './LandingPage';

const Stack = createNativeStackNavigator();

/*
Stack.Navigator is a registry of all tabs that exist. 
'Home' is first, so that's the home page.

Maybe we should generalize a function for creating tabs?
*/

export default function App() {

  return (
    <NavigationContainer>

      <Stack.Navigator>

        <Stack.Screen
          name={'Landing'}
          component={LandingPage}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={'Home'}
          component={Home}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={'Camera'}
          component={Camera_Test}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={'Clothing Item View'}
          component={ClothingItemListView}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={'Single Clothing Item View'}
          component={ClothingItemView}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={'Outfit List View'}
          component={OutfitListView}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={'Single Outfit View'}
          component={SingleOutfitView}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={'Calendar'}
          component={CalendarView}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
