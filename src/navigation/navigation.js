import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
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
import SplashScreen from "../Screens/customer/SplashScreen";
import LoginScreen from "../Screens/auth/LoginScreen";
import SignUpScreen from "../Screens/auth/SignUpScreen";
import ProfileScreen from "../Screens/customer/ProfileScreen";
import ForgotPassScreen from "../Screens/auth/ForgotPassScreen";
import ChangePassScreen from "../Screens/auth/ChangePassScreen";
import VerifyScreen from "../Screens/auth/VerifyScreen";
import CustomerBottomTab from "./CustomerBottomTab";
import { UserProvider } from "../context/UserContext";
import AboutUsScreen from "../Screens/customer/AboutUsScreen";
import RestaurantScreen from "../Screens/customer/RestaurantScreen";
import FoodScreen from "../Screens/customer/FoodScreen";
import ExploreScreen from "../Screens/customer/ExploreScreen";
import SearchScreen from "../Screens/customer/SearchScreen";
import ChatListScreen from "../Screens/vendor/ChatListScreen";
import IndividualChat from "../Screens/vendor/IndividualChatScreen";
import ChatCustomer from "../Screens/customer/ChatCustomer";
import IndividualChatCustomer from "../Screens/customer/InvidualChatCustomer";
import AccountScreen from "../Screens/customer/AccountScreen";
import FeedbackScreen from "../Screens/customer/FeedbackScreen";
import { CartProvider } from "../context/CartContext";
import OrderConfirmScreen from "../Screens/customer/OrderConfirmScreen";
import PaymentScreen from "../Screens/customer/PaymentScreen";
import CategoryScreen from "../Screens/customer/CategoryScreen";

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
           {/* Vendor */}
          <Stack.Screen name="HomeVendor" component={HomeVendor} />
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
          <Stack.Screen name="ChatListScreen" component={ChatListScreen} />
          <Stack.Screen name="IndividualChat" component={IndividualChat} />
          <Stack.Screen name="ChatCustomer" component={ChatCustomer} />
          <Stack.Screen name="IndividualChatCustomer" component={IndividualChatCustomer} />
          <Stack.Screen name="AccountScreen" component={AccountScreen} />
         
         
         
         
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
