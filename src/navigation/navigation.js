import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../Screens/Customer/Home";
import Splash from "../Screens/Customer/Splash";
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
const Stack = createNativeStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ListVendor" component={ListVendor} />
        <Stack.Screen name="Category" component={Category} />
        <Stack.Screen name="Statistic" component={Statistic} />
        <Stack.Screen name="Notification" component={Notification} />
        <Stack.Screen name="OrderList" component={OrderList} />
        <Stack.Screen name="HomeVendor" component={HomeVendor} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Home" component={Home} />
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
