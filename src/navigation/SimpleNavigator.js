import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SimpleLoginScreen from '../screens/SimpleLoginScreen';
import SimpleMainScreen from '../screens/SimpleMainScreen';

const Stack = createStackNavigator();

export default function SimpleNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={SimpleLoginScreen}
        />
        <Stack.Screen 
          name="Main" 
          component={SimpleMainScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


