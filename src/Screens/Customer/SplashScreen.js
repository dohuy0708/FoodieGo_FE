import { View, Text, Image, StyleSheet } from "react-native";
import React, { useEffect, useContext } from "react";

import Logo from "../../assets/images/Logo.png";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../../context/UserContext";
import Colors from "../../constants/Colors";

export default function SplashScreen() {
  const { setUserInfo } = useContext(UserContext); // Lấy setUserInfo từ context
  const navigation = useNavigation();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userInfoString = await AsyncStorage.getItem("userInfo");

        if (token && userInfoString) {
          const userInfo = JSON.parse(userInfoString);
          console.log("LoginuserInfo", userInfo);
          console.log("Logintoken", token);
          setUserInfo({ ...userInfo, token }); // Lưu vào Context nếu đã đăng nhập
        }

        // Chuyển đến MainApp luôn, dù có đăng nhập hay không
        navigation.replace("MainApp");
      } catch (error) {
        console.error("Error checking login status", error);
        // Nếu có lỗi vẫn chuyển đến MainApp
        navigation.replace("LoginScreen");
      }
    };

    const timer = setTimeout(() => {
      checkLoginStatus(); // Kiểm tra đăng nhập sau 1 giây
    }, 1000);

    return () => clearTimeout(timer); // Cleanup timer
  }, [navigation, setUserInfo]);

  return (
    <View style={styles.container}>
      <Image source={Logo} resizeMode="contain" style={styles.image} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.DEFAULT_GREEN,
  },
  image: {
    height: 180,
    width: 200,
  },
});
