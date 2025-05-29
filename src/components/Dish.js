import React from "react";
import Colors from "../constants/Colors";
import { useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import Display from "../utils/Display";
export default function Dish({ data, navigation }) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate("DishDetail", { data })}
    >
      <Image source={{ uri: data.imageUrl }} style={styles.image} />
      <View style={{ gap: Display.setWidth(2.5) }}>
        <Text>{data.name}</Text>
        <View style={{ flexDirection: "row",gap: Display.setWidth(12) }}>
          <Text style={{ color: Color.DEFAULT_YELLOW }}>{data.price}</Text>
          <Text>Còn lại: {data.quantity}</Text>
        </View>
        <Text
          style={{
            fontSize: 18,

            color:
              data.status === "available"
                ? Colors.DEFAULT_GREEN
                : Colors.DEFAULT_RED,
            fontWeight: "bold",
          }}
        >
          {data.status === "available" ? "Đang bán " : "Tạm dừng bán"}
        </Text>
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
