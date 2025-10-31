import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importar as telas
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AdminLoginScreen from '../screens/AdminLoginScreen';
import MainScreen from '../screens/MainScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import CarManagementScreen from '../screens/CarManagementScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
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
          component={LoginScreen}
          options={{
            title: 'Login',
          }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen}
          options={{
            title: 'Cadastro',
          }}
        />
        <Stack.Screen 
          name="AdminLogin" 
          component={AdminLoginScreen}
          options={{
            title: 'Login Admin',
          }}
        />
        <Stack.Screen 
          name="Main" 
          component={MainScreen}
          options={{
            title: 'Principal',
          }}
        />
        <Stack.Screen 
          name="AdminDashboard" 
          component={AdminDashboardScreen}
          options={{
            title: 'Dashboard Admin',
          }}
        />
        <Stack.Screen 
          name="CarManagement" 
          component={CarManagementScreen}
          options={{
            title: 'Gerenciar Carros',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}