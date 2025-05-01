import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Color } from "../constants";
import {
  FavoriteScreen,
  HomeScreen,
  NotificationScreen,
  OrderScreen,
  ProfileScreen,
} from "../screens/customer";
import Display from "../utils/Display";
import AccountScreen from "../screens/customer/AccountScreen";

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
        backgroundColor: Color.DEFAULT_WHITE,
        borderTopWidth: 0,
      },
      tabBarShowLabel: true,
      tabBarActiveTintColor: Color.DEFAULT_GREEN,
      tabBarInactiveTintColor: Color.INACTIVE_GREY,
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
  </CustomerBottomTabs.Navigator>
);
