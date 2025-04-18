import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useRoute } from "@react-navigation/native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Color } from "../constants";
import Display from "../utils/Display";
export default function NavAdmin({ nav }) {
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
     

      <TouchableOpacity onPress={() => nav.navigate("ListVendor")}>
        <FontAwesome5 
          name="list-alt" 
          size={24} 
          color={currentRoute === "ListVendor" ? Color.DEFAULT_YELLOW : "black"} 
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => nav.navigate("Comment")}>
        <FontAwesome6
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
