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
import GRAPHQL_ENDPOINT from "../../../config";
import { loginUser } from "../../services/authService";
const LoginScreen = ({ navigation }) => {
  // init state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRemember, setIsRemember] = useState(false); // State kiểm tra checkbox
  const [errorMessage, setErrorMessage] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // init Function
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const HandleLogin = async () => {
    if (username.trim().length <= 0) {
      setErrorMessage("Vui lòng nhập tên đăng nhập");
    } else if (password.trim().length <= 0) {
      setErrorMessage("Vui lòng nhập mật khẩu");
    } else {
      setErrorMessage(""); // Reset thông báo lỗi
      try {
        // Define the mutation query without using variables
        const query = `
          mutation {
            login(loginDto: {
              username: "${username}",
              password: "${password}"
            }) {
              token
            }
          }
        `;

        // Send the request directly to the GraphQL API
        const response = await fetch(GRAPHQL_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
          }),
        });

        const data = await response.json();
        console.log("API response:", data);

        if (data.data && data.data.login && data.data.login.token) {
          // Successfully logged in
          const token = data.data.login.token;
          // Store token if necessary
          navigation.navigate("MainApp", { token });
        } else {
          setErrorMessage("Thông tin đăng nhập không chính xác!");
        }
      } catch (error) {
        console.error("Login error:", error);
        setErrorMessage("Có lỗi xảy ra. Vui lòng thử lại.");
      }
    }
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Nút quay lại */}
        <Header title="Đăng nhập" onBackPress={() => navigation.goBack()} />

        {/* Logo */}
        <Image source={Logo} style={styles.logo} />

        {/* Ô nhập username */}
        <View style={styles.inputContainer}>
          <Ionicons
            name="person-outline"
            size={24}
            color="gray"
            style={styles.icon}
          />
          <TextInput
            placeholder="Tên đăng nhập"
            style={Fonts.inputText}
            value={username}
            onChangeText={setUsername}
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
            secureTextEntry={isPasswordVisible}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.eyeIconContainer}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} // Change icon based on visibility
              size={24}
              color="gray"
              style={styles.icon}
            />
          </TouchableOpacity>
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
        {/* Thông báo lỗi */}
        <View style={styles.noticeContainer}>
          {errorMessage !== "" && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}
        </View>
        {/* Nút đăng nhập */}
        <TouchableOpacity style={styles.loginButton} onPress={HandleLogin}>
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
    marginBottom: 50,
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
    position: "relative",
  },
  eyeIconContainer: {
    position: "absolute", // Position the eye icon inside the container
    right: 10, // Move it 10px from the right edge
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
    marginTop: 20,
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
  noticeContainer: {
    minHeight: 20,
  },
  errorText: {
    color: "red",
    fontSize: 14,
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
