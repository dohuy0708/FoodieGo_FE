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

          setUserInfo({ ...userInfo, token }); // Cập nhật vào context

          // Điều hướng theo roleId
          const roleId = userInfo.roleId;

          if (roleId === 1) {
            navigation.replace("MainApp"); // Có thể thay đổi thành "AdminApp"
          } else if (roleId === 2) {
            navigation.replace("MainApp"); // Có thể thay đổi thành "CustomerApp"
          } else if (roleId === 3) {
            navigation.replace("ListVendor"); // Có thể thay đổi thành "RestaurantApp"
          } else {
            // Trường hợp role không hợp lệ hoặc thiếu => về MainApp
            navigation.replace("MainApp");
          }
        } else {
          // Chưa đăng nhập => về MainApp mặc định
          navigation.replace("MainApp");
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra đăng nhập:", error);
        navigation.replace("MainApp"); // Fallback an toàn
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
