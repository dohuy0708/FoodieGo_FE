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
      <View style={{ gap: 10 }}>
        <Text>{data.name}</Text>
        <View style={{ flexDirection: "row", gap: 30 }}>
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
    gap: 20,
    backgroundColor: "#fff",
  },
  image: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 10,
  },
};
