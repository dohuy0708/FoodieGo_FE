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

const Stack = createNativeStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="HomeVendor" component={HomeVendor} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="EditVendor" component={EditVendor} />
        <Stack.Screen name="EditCategory" component={EditCategory} />
        <Stack.Screen name="DishDetail" component={DishDetail} />
        <Stack.Screen name="AddDish" component={AddDish} />
        <Stack.Screen name="EditDish" component={EditDish} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
