import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useRoute } from "@react-navigation/native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Color } from "../constants";
export default function NavAdmin({ nav }) {
  const route = useRoute();
  const currentRoute = route.name;

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 10,
      }}
    >
      <TouchableOpacity onPress={() => nav.navigate("Category")}>
        <MaterialIcons 
          name="category" 
          size={24} 
          color={currentRoute === "Category" ? Color.DEFAULT_YELLOW : "black"} 
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => nav.navigate("OrderList")}>
        <FontAwesome5 
          name="list-alt" 
          size={24} 
          color={currentRoute === "OrderList" ? Color.DEFAULT_YELLOW : "black"} 
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => nav.navigate("Comment")}>
        <FontAwesome
          name="comments" 
          size={24} 
          color={currentRoute === "Comment" ? Color.DEFAULT_YELLOW : "black"} 
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => nav.navigate("StatisticAdmin")}>
        <FontAwesome5 
          name="chart-bar" 
          size={24} 
          color={currentRoute === "StatisticAdmin" ? Color.DEFAULT_YELLOW : "black"} 
        />
      </TouchableOpacity>
    </View>
  );
}
