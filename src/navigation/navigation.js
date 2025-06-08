import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "../Screens/Customer/SplashScreen";
import LoginScreen from "../Screens/auth/LoginScreen";
import Register from "../Screens/vendor/Register";
import HomeVendor from "../Screens/vendor/HomeVendor";
import EditVendor from "../Screens/vendor/EditVendor";
import EditCategory from "../Screens/vendor/EditCategory";
import DishDetail from "../Screens/vendor/DishDetail";
import AddDish from "../Screens/vendor/AddDish";
import EditDish from "../Screens/vendor/EditDish";
import OrderList from "../Screens/vendor/OrderList";
import OrderDetail from "../Screens/vendor/OrderDetail";
import Notification from "../Screens/vendor/Notification";
import Statistic from "../Screens/vendor/Statistic";
import Category from "../Screens/Admin/Category";
import ListVendor from "../Screens/Admin/ListVendor";
import Comment from "../Screens/Admin/Comment";
import StatisticAdmin from "../Screens/Admin/StatisticAdmin";

import Account from "../Screens/vendor/Account";

import SignUpScreen from "../Screens/auth/SignUpScreen";
import ProfileScreen from "../Screens/Customer/ProfileScreen";
import ForgotPassScreen from "../Screens/auth/ForgotPassScreen";
import ChangePassScreen from "../Screens/auth/ChangePassScreen";
import VerifyScreen from "../Screens/auth/VerifyScreen";
import CustomerBottomTab from "./CustomerBottomTab";
import { UserProvider } from "../context/UserContext";
import AboutUsScreen from "../Screens/Customer/AboutUsScreen";
import RestaurantScreen from "../Screens/Customer/RestaurantScreen";
import FoodScreen from "../Screens/Customer/FoodScreen";
import ExploreScreen from "../Screens/Customer/ExploreScreen";
import SearchScreen from "../Screens/Customer/SearchScreen";
import ChatListScreen from "../Screens/vendor/ChatListScreen";
import IndividualChat from "../Screens/vendor/IndividualChatScreen";
import ChatCustomer from "../Screens/Customer/ChatCustomer";
import IndividualChatCustomer from "../Screens/Customer/InvidualChatCustomer";
// import OrderDetailScreen from "../Screens/Customer/OrderDetailScreen";
import FeedbackScreen from "../Screens/Customer/FeedbackScreen";
import { CartProvider } from "../context/CartContext";
import OrderConfirmScreen from "../Screens/Customer/OrderConfirmScreen";
import PaymentScreen from "../Screens/Customer/PaymentScreen";
import CategoryScreen from "../Screens/Customer/CategoryScreen";
import AddressScreen from "../Screens/Customer/AddressScreen";
import AddAddressScreens from "../Screens/Customer/AddAddressScreen";
import SelectAddressScreen from "../Screens/Customer/SelectAddressScreen";
import SeeRestaurantScreen from "../Screens/Admin/SeeRestaurantScreen";

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
            <Stack.Screen
              name="SeeRestaurantScreen"
              component={SeeRestaurantScreen}
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
