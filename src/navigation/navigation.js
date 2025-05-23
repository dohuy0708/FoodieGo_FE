import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "../screens/customer/SplashScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import SignUpScreen from "../screens/auth/SignUpScreen";
import ProfileScreen from "../screens/customer/ProfileScreen";
import ForgotPassScreen from "../screens/auth/ForgotPassScreen";
import ChangePassScreen from "../screens/auth/ChangePassScreen";
import VerifyScreen from "../screens/auth/VerifyScreen";
import CustomerBottomTab from "./CustomerBottomTab";
import { UserProvider } from "../context/UserContext";
import AboutUsScreen from "../screens/customer/AboutUsScreen";
import RestaurantScreen from "../screens/customer/RestaurantScreen";
import FoodScreen from "../screens/customer/FoodScreen";
import ExploreScreen from "../screens/customer/ExploreScreen";
import SearchScreen from "../screens/customer/SearchScreen";
import OrderDetail from "../screens/customer/OrderDetailScreen";
import FeedbackScreen from "../screens/customer/FeedbackScreen";
import { CartProvider } from "../context/CartContext";
import OrderConfirmScreen from "../screens/customer/OrderConfirmScreen";
import PaymentScreen from "../screens/customer/PaymentScreen";
const Stack = createNativeStackNavigator();

export default function Navigation() {
  return (
    <UserProvider>
      <CartProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SplashScreen" component={SplashScreen} />
            <Stack.Screen name="MainApp" component={CustomerBottomTab} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
            <Stack.Screen name="VerifyScreen" component={VerifyScreen} />
            <Stack.Screen
              name="ForgotPassScreen"
              component={ForgotPassScreen}
            />
            <Stack.Screen
              name="ChangePassScreen"
              component={ChangePassScreen}
            />
            <Stack.Screen name="AboutUsScreen" component={AboutUsScreen} />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen
              name="RestaurantScreen"
              component={RestaurantScreen}
            />
            <Stack.Screen name="FoodScreen" component={FoodScreen} />
            <Stack.Screen name="ExploreScreen" component={ExploreScreen} />
            <Stack.Screen name="SearchScreen" component={SearchScreen} />
            <Stack.Screen name="OrderDetailScreen" component={OrderDetail} />
            <Stack.Screen name="FeedbackScreen" component={FeedbackScreen} />
            <Stack.Screen
              name="OrderConfirmScreen"
              component={OrderConfirmScreen}
            />
            <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </UserProvider>
  );
}
