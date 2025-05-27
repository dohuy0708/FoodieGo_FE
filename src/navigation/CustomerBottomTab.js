import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Color, Colors } from "../constants";
import {
  FavoriteScreen,
  HomeScreen,
  NotificationScreen,
  OrderScreen,
  ProfileScreen,
} from "../Screens/customer";
import Display from "../utils/Display";
import AccountScreen from "../Screens/customer/AccountScreen";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import ChatCustomer from "../Screens/customer/ChatCustomer";
const CustomerBottomTabs = createBottomTabNavigator();

export default () => (
  
  <CustomerBottomTabs.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        position: "absolute",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: Display.setHeight(7),
        backgroundColor: Colors.DEFAULT_WHITE,
        borderTopWidth: 0,
        marginBottom: 20,
      },
      tabBarShowLabel: true,
      tabBarActiveTintColor: Colors.DEFAULT_GREEN,
      tabBarInactiveTintColor: Colors.INACTIVE_GREY,
    }}
  >
    <CustomerBottomTabs.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ focused, color }) => (
          <Ionicons
            name={focused ? "home" : "home-outline"}
            size={25}
            color={color}
          />
        ),
      }}
    />
    <CustomerBottomTabs.Screen
      name="Đơn đặt"
      component={OrderScreen}
      options={{
        tabBarIcon: ({ focused, color }) => (
          <Ionicons
            name={focused ? "reader" : "reader-outline"}
            size={25}
            color={color}
          />
        ),
      }}
    />
    <CustomerBottomTabs.Screen
      name="Yêu thích"
      component={FavoriteScreen}
      options={{
        tabBarIcon: ({ focused, color }) => (
          <Ionicons
            name={focused ? "heart" : "heart-outline"}
            size={25}
            color={color}
          />
        ),
      }}
    />
    <CustomerBottomTabs.Screen
      name="Thông báo"
      component={NotificationScreen}
      options={{
        tabBarIcon: ({ focused, color }) => (
          <Ionicons
            name={focused ? "notifications" : "notifications-outline"}
            size={25}
            color={color}
          />
        ),
      }}
    />
    <CustomerBottomTabs.Screen
      name="Tôi"
      component={AccountScreen}
      options={{
        tabBarIcon: ({ focused, color }) => (
          <Ionicons
            name={focused ? "person" : "person-outline"}
            size={25}
            color={color}
          />
        ),
      }}
    />
     <CustomerBottomTabs.Screen
      name="Chat"
      component={ChatCustomer}
      options={{
        tabBarIcon: ({ focused, color }) => (
          <MaterialCommunityIcons
            name={focused ? "chat-outline" : "chat-outline"}
            size={25}
            color={color}
          />
        ),
      }}
    />
  </CustomerBottomTabs.Navigator>
);
