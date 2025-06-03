import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "../screens/customer/SplashScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import Register from "../screens/vendor/Register";
import HomeVendor from "../screens/vendor/HomeVendor";
import EditVendor from "../screens/vendor/EditVendor";
import EditCategory from "../screens/vendor/EditCategory";
import DishDetail from "../screens/vendor/DishDetail";
import AddDish from "../screens/vendor/AddDish";
import EditDish from "../screens/vendor/EditDish";
import OrderList from "../screens/vendor/OrderList";
import OrderDetail from "../screens/vendor/OrderDetail";
import Notification from "../screens/vendor/Notification";
import Statistic from "../screens/vendor/Statistic";
import Category from "../screens/Admin/Category";
import ListVendor from "../screens/Admin/ListVendor";
import Comment from "../screens/Admin/Comment";
import StatisticAdmin from "../screens/Admin/StatisticAdmin";

import Account from "../screens/vendor/Account";

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
import ChatListScreen from "../screens/vendor/ChatListScreen";
import IndividualChat from "../screens/vendor/IndividualChatScreen";
import ChatCustomer from "../screens/customer/ChatCustomer";
import IndividualChatCustomer from "../screens/customer/InvidualChatCustomer";
// import OrderDetailScreen from "../screens/customer/OrderDetailScreen";
import FeedbackScreen from "../screens/customer/FeedbackScreen";
import { CartProvider } from "../context/CartContext";
import OrderConfirmScreen from "../screens/customer/OrderConfirmScreen";
import PaymentScreen from "../screens/customer/PaymentScreen";
import CategoryScreen from "../screens/customer/CategoryScreen";
import AddressScreen from "../Screens/Customer/AddressScreen";
import AddAddressScreens from "../Screens/Customer/AddAddressScreen";
import SelectAddressScreen from "../Screens/Customer/SelectAddressScreen";

const Stack = createNativeStackNavigator();

export default function Navigation() {
  return (
    <UserProvider>
      <CartProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/*App*/}
            <Stack.Screen name="SplashScreen" component={SplashScreen} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="MainApp" component={CustomerBottomTab} />
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
            {/* Vendor */}
            <Stack.Screen name="HomeVendor" component={HomeVendor} />
            <Stack.Screen name="AboutUsScreen" component={AboutUsScreen} />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen
              name="RestaurantScreen"
              component={RestaurantScreen}
            />
            <Stack.Screen name="FoodScreen" component={FoodScreen} />
            <Stack.Screen name="ExploreScreen" component={ExploreScreen} />
            <Stack.Screen name="SearchScreen" component={SearchScreen} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="StatisticAdmin" component={StatisticAdmin} />
            <Stack.Screen name="Category" component={Category} />
            <Stack.Screen name="Account" component={Account} />
            <Stack.Screen name="Comment" component={Comment} />
            <Stack.Screen name="ListVendor" component={ListVendor} />
            <Stack.Screen name="Statistic" component={Statistic} />
            <Stack.Screen name="Notification" component={Notification} />
            <Stack.Screen name="OrderList" component={OrderList} />
            <Stack.Screen name="EditVendor" component={EditVendor} />
            <Stack.Screen name="EditCategory" component={EditCategory} />
            <Stack.Screen name="DishDetail" component={DishDetail} />
            <Stack.Screen name="AddDish" component={AddDish} />
            <Stack.Screen name="EditDish" component={EditDish} />
            <Stack.Screen name="OrderDetail" component={OrderDetail} />
            <Stack.Screen name="AddressScreen" component={AddressScreen} />
            <Stack.Screen
              name="AddAddressScreen"
              component={AddAddressScreens}
            />
            <Stack.Screen
              name="SelectAddressScreen"
              component={SelectAddressScreen}
            />
            <Stack.Screen name="ChatListScreen" component={ChatListScreen} />
            <Stack.Screen name="IndividualChat" component={IndividualChat} />
            <Stack.Screen name="ChatCustomer" component={ChatCustomer} />
            <Stack.Screen
              name="IndividualChatCustomer"
              component={IndividualChatCustomer}
            />
            <Stack.Screen name="OrderDetailScreen" component={OrderDetail} />
            <Stack.Screen name="FeedbackScreen" component={FeedbackScreen} />
            <Stack.Screen name="CategoryScreen" component={CategoryScreen} />
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
