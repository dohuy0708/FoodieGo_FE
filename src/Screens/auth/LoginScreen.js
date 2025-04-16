import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import Logo from "../../assets/images/Logo.png";
import { Header } from "../../components";
import { SafeAreaView } from "react-native-safe-area-context";
import Fonts from "../../constants/Fonts";
import CheckBox from "@react-native-community/checkbox";
const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRemember, setIsRemember] = useState(false); // State kiểm tra checkbox

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Nút quay lại */}
        <Header title="Đăng nhập" onBackPress={() => navigation.goBack()} />

        {/* Logo */}
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

        {/* Quên mật khẩu và nhớ mật khẩu */}

        <View style={styles.rememberForgotContainer}>
          {/* Checkbox nhớ mật khẩu */}
          <View style={styles.rememberContainer}>
            <TouchableOpacity onPress={() => setIsRemember(!isRemember)}>
              <Ionicons
                name={isRemember ? "checkbox" : "square-outline"}
                size={20}
                color="gray"
              />
            </TouchableOpacity>
            <Text style={styles.rememberText}>Nhớ mật khẩu</Text>
          </View>

          {/* Quên mật khẩu */}
          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassScreen")}
            style={styles.forgotPassword}
          >
            <Text style={styles.forgotText}>Quên mật khẩu ?</Text>
          </TouchableOpacity>
        </View>

        {/* Nút đăng nhập */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => alert("Đăng nhập thành công!")}
        >
          <Text style={styles.loginText}>Đăng nhập</Text>
        </TouchableOpacity>

        {/* Chuyển đến trang đăng ký */}
        <View style={styles.registerContainer}>
          <Text>Bạn chưa có tài khoản?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUpScreen")}>
            <Text style={styles.registerText}> Đăng ký</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
  },
  title: {
    fontSize: 12,
    color: "#007B7F",
    marginBottom: 20,
  },
  logo: {
    width: 180,
    height: 150,
    marginBottom: 20,
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
  rememberForgotContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
  },
  rememberContainer: {
    marginLeft: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  rememberText: {
    marginLeft: 5,
    color: "gray",
  },
});

export default LoginScreen;
