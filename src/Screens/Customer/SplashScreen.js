import { View, Text, Image, StyleSheet } from "react-native";
import React, { useEffect } from "react";
import { Color } from "../../constants";
import Logo from "../../assets/images/Logo.png";
export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("MainApp");
    }, 2000); // 2 seconds

    return () => clearTimeout(timer); // Cleanup the timer on unmount
  }, [navigation]);
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
