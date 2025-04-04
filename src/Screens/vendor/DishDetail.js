import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
export default function DishDetail({ navigation, route }) {
  const { data } = route.params;
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/store.png")}
        style={styles.image}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 10,
  },
});
