import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, Image } from 'react-native';
import Camera_Test from './Camera_Test.js';
import Home from './Home.js';
import { ClothingItemView, ClothingItemListView } from './ClothingAndOutfits.js';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import styles from './Stylesheet';
import axios from 'axios';
import { SafeAreaView } from 'react-native-web';
import { postItem } from './APIContainer.js';
import CalendarView from './Calendar.js';
import LandingPage from './LandingPage.js';
import NotificationPage from './NotificationPage.js';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Landing">
        <Stack.Screen
          name="Landing"
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
          name={'Calendar'}
          component={CalendarView}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={'Notification'}
          component={NotificationPage}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}