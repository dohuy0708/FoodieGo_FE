import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import SplashScreen from "../Screens/Customer/SplashScreen";
// import LoginScreen from "../Screens/auth/LoginScreen";
// import SignUpScreen from "../Screens/auth/SignUpScreen";
// import ForgotPassScreen from "../Screens/auth/ForgotPassScreen";
// import ChangePassScreen from "../Screens/auth/ChangePassScreen";
// import VerifyScreen from "../Screens/auth/VerifyScreen";
// import CustomerBottomTab from "./CustomerBottomTab";
// import Home from "../Screens/Customer/Home";
// import Splash from "../Screens/Customer/Splash";
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
const Stack = createNativeStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="MainApp" component={CustomerBottomTab} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
        <Stack.Screen name="VerifyScreen" component={VerifyScreen} />
        <Stack.Screen name="ForgotPassScreen" component={ForgotPassScreen} />
        <Stack.Screen name="ChangePassScreen" component={ChangePassScreen} /> */}
         <Stack.Screen name="StatisticAdmin" component={StatisticAdmin} />
        <Stack.Screen name="HomeVendor" component={HomeVendor} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Category" component={Category} />

        <Stack.Screen name="Account" component={Account} />
       
        <Stack.Screen name="Comment" component={Comment} />
        <Stack.Screen name="ListVendor" component={ListVendor} />

        <Stack.Screen name="Statistic" component={Statistic} />
        <Stack.Screen name="Notification" component={Notification} />
        <Stack.Screen name="OrderList" component={OrderList} />
        {/* <Stack.Screen name="Splash" component={Splash} /> */}
        {/* <Stack.Screen name="Home" component={Home} /> */}
        <Stack.Screen name="EditVendor" component={EditVendor} />
        <Stack.Screen name="EditCategory" component={EditCategory} />
        <Stack.Screen name="DishDetail" component={DishDetail} />
        <Stack.Screen name="AddDish" component={AddDish} />
        <Stack.Screen name="EditDish" component={EditDish} />
        <Stack.Screen name="OrderDetail" component={OrderDetail} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
