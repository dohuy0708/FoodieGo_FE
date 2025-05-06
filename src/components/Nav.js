import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useRoute } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Colors from "../constants/Colors";
import Display from "../utils/Display";
export default function Nav({ nav }) {
  const route = useRoute();
  const currentRoute = route.name;

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        padding: Display.setWidth(3),
      }}
    >
      <TouchableOpacity onPress={() => nav.navigate("HomeVendor")}>
        <Feather 
          name="home" 
          size={24} 
          color={currentRoute === "HomeVendor" ? Colors.DEFAULT_YELLOW : "black"} 
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => nav.navigate("OrderList")}>
        <FontAwesome5 
          name="list-alt" 
          size={24} 
          color={currentRoute === "OrderList" ? Colors.DEFAULT_YELLOW : "black"} 
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => nav.navigate("Statistic")}>
        <FontAwesome5 
          name="chart-bar" 
          size={24} 
          color={currentRoute === "Statistic" ? Colors.DEFAULT_YELLOW : "black"} 
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => nav.navigate("Notification")}>
        <FontAwesome5 
          name="bell" 
          size={24} 
          color={currentRoute === "Notification" ? Colors.DEFAULT_YELLOW : "black"} 
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => nav.navigate("Account")}>
        <MaterialCommunityIcons 
          name="account-outline" 
          size={24} 
          color={currentRoute === "Account" ? Colors.DEFAULT_YELLOW : "black"} 
        />
      </TouchableOpacity>
    </View>
  );
}
