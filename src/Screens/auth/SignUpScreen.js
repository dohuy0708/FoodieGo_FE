import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import React, { useState } from "react";

import { Header } from "../../components";
import Ionicons from "@expo/vector-icons/Ionicons";
import Logo from "../../assets/images/Logo.png";
import { SafeAreaView } from "react-native-safe-area-context";
import Fonts from "../../constants/Fonts";

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [checkPassword, setCheckPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const handleSignUp = () => {
    if (email.trim() === "") {
      setErrorMessage("Vui lòng nhập email");
    } else {
      setErrorMessage("");
      navigation.navigate("VerifyScreen");
    }
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Header
          title="Đăng ký"
          onBackPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate("LoginScreen"); // fallback nếu không có màn trước
            }
          }}
        />
        <Image source={Logo} style={styles.logo} />

        {/* Ô nhập email */}
        <View style={styles.inputContainer}>
          <Ionicons
            name="mail-outline"
            size={24}
            color="gray"
            style={styles.icon}
          />
          <TextInput
            placeholder="Email"
            style={Fonts.inputText}
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Ô nhập mật khẩu */}
        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={24}
            color="gray"
            style={styles.icon}
          />
          <TextInput
            placeholder="Mật khẩu"
            style={Fonts.inputText}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>
        {/* Ô nhập lại mật khẩu */}
        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={24}
            color="gray"
            style={styles.icon}
          />
          <TextInput
            placeholder="Nhập lại mật khẩu"
            style={Fonts.inputText}
            secureTextEntry
            value={checkPassword}
            onChangeText={setCheckPassword}
          />
        </View>
        {/* Thông báo lỗi */}
        <View style={styles.noticeContainer}>
          {errorMessage !== "" && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}
        </View>
        {/* Nút đăng ký */}
        <TouchableOpacity style={styles.loginButton} onPress={handleSignUp}>
          <Text style={Fonts.buttonText}>Đăng ký</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 60, // Dành không gian cho Header (cao 50px)
    paddingHorizontal: 20,
    alignItems: "center",
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    alignItems: "center",
  },
  noticeContainer: {
    minHeight: 20,
    marginBottom: 10,
  },
  errorText: {
    color: "red",
    fontSize: 14,
  },
  logo: {
    width: 180,
    height: 150,
    marginBottom: 90,
    marginTop: 80,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    width: "100%",
  },
  icon: {
    marginRight: 2,
  },
  input: {
    flex: 1,
    height: 40,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 15,
  },
  forgotText: {
    color: "#007B7F",
  },
  loginButton: {
    backgroundColor: "#007B7F",
    width: "100%",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  loginText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
  registerContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  registerText: {
    color: "#007B7F",
    fontWeight: "bold",
  },
});

export default SignUpScreen;
