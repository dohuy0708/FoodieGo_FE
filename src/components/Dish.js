import React from "react";
import { Color } from "../constants";
import { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from "react-native";
export default function Dish() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/dish.png")}
        style={styles.image}
      />
      <View style={{ gap: 10 }}>
        <Text>Cháo ếch thập cẩm</Text>
        <View style={{ flexDirection: "row",gap: 30 }}>
          <Text>1000 đã bán</Text>
          <Text style={{ color:Color.DEFAULT_YELLOW }}>300.000đ</Text>
          </View>
          <Text style={{ color:Color.DEFAULT_GREEN }}>Đang bán</Text>
      </View>
    </View>
  );
}
const styles = {
  container: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  image: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 10,
  },
};
