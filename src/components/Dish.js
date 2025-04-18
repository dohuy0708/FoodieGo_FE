import React from "react";
import { Color } from "../constants";
import { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
} from "react-native";
import Display from "../utils/Display"; 
export default function Dish({ data, navigation }) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate("DishDetail", { data })}
    >
      <Image
        source={require("../assets/images/dish.png")}
        style={styles.image}
      />
      <View style={{ gap: Display.setWidth(2.5) }}>
        <Text>{data.name}</Text>
        <View style={{ flexDirection: "row", gap: Display.setWidth(8) }}>
          <Text>{data.numSell}</Text>
          <Text style={{ color: Color.DEFAULT_YELLOW }}>{data.price}</Text>
        </View>
        <Text style={{ color: Color.DEFAULT_GREEN }}>{data.status}</Text>
      </View>
    </TouchableOpacity>
  );
}
const styles = {
  container: {
    flexDirection: "row",
    width: "100%",
    gap: Display.setWidth(8),
    backgroundColor: "#fff",
  },
  image: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 10,
  },
};
