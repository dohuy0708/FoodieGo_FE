import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "../screens/customer/SplashScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import SignUpScreen from "../screens/auth/SignUpScreen";
import { HomeScreen } from "../screens/customer";
import ForgotPassScreen from "../screens/auth/ForgotPassScreen";
import ChangePassScreen from "../screens/auth/ChangePassScreen";
import VerifyScreen from "../screens/auth/VerifyScreen";
import CustomerBottomTab from "./CustomerBottomTab";
const Stack = createNativeStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="MainApp" component={CustomerBottomTab} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
        <Stack.Screen name="VerifyScreen" component={VerifyScreen} />
        <Stack.Screen name="ForgotPassScreen" component={ForgotPassScreen} />
        <Stack.Screen name="ChangePassScreen" component={ChangePassScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
