import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, Image} from 'react-native';
import Camera_Test from './Camera_Test.js';
import Home from './Home.js';
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();

/*
Stack.Navigator is a registry of all tabs that exist. 
'Home' is first, so that's the home page.

Maybe we should generalize a function for creating tabs?
*/
export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
