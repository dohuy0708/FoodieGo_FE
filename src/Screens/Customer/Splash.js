import { View, Text, Image, StyleSheet } from "react-native";
import React from "react";
import { Color } from "../../constants";
import Logo from "../../assets/images/Logo.png";
export default function Splash() {
  return (
    <View style={styles.container}>
      <Image source={Logo} resizeMode="contain" style={styles.image}></Image>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Color.DEFAULT_GREEN,
  },
  image: {
    height: 180,
    width: 200,
  },
  title: {
    color: Color.DEFAULT_WHITE,
    fontSize: 30,
  },
});
