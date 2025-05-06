import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import Logo from "../../assets/images/Logo.png";
import { Header } from "../../components";
import { SafeAreaView } from "react-native-safe-area-context";
import Fonts from "../../constants/Fonts";
import CheckBox from "@react-native-community/checkbox";
import GRAPHQL_ENDPOINT from "../../../config";
import { GetUserById, loginUser } from "../../services/authService";
import { useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from "../../context/UserContext";
const LoginScreen = ({ navigation }) => {
  // init state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(true);
  const [loading, setLoading] = useState(false); // Thêm state loading
  const { setUserInfo } = useContext(UserContext); // Lấy hàm setUserInfo từ context

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
      setLoading(true); // Bắt đầu loading
      setErrorMessage(""); // Reset thông báo lỗi
      try {
        const data = await loginUser(username, password); // Call the service

        if (data?.data?.login?.token) {
          const token = data.data.login.token;
          const userId = data.data.login.id;
          console.log("usertkrn", token);
          console.log("usertkrnId", userId);
          // Lấy thông tin user
          const userInfo = await GetUserById(userId, token);
          const userData = userInfo.data.findUserById;
          console.log("userData", userData);

          // Lưu AsyncStorage
          await AsyncStorage.setItem("userInfo", JSON.stringify(userData));
          await AsyncStorage.setItem("token", token);

          // Update Context
          setUserInfo({ ...userData, token }); // <<< Cập nhật vào context ở đây nè!!

          //  Reset stack và điều hướng về màn hình SplashScreen
          navigation.reset({
            index: 0,
            routes: [{ name: "SplashScreen" }], // hoặc 'Login' tùy vào yêu cầu của bạn
          });
        } else {
          setErrorMessage("Thông tin đăng nhập không chính xác!");
        }
      } catch (error) {
        console.error("Login error:", error);
        setErrorMessage("Có lỗi xảy ra. Vui lòng thử lại.");
      } finally {
        setLoading(false); // Dù thành công hay thất bại đều dừng loading
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
        <TouchableOpacity
          style={styles.loginButton}
          onPress={HandleLogin}
          disabled={loading} // Khi loading thì disable nút
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.loginText}>Đăng nhập</Text>
          )}
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
    justifyContent: "flex-end",
    alignItems: "center",
    marginRight: 15,
    width: "100%",
  },
  rememberContainer: {
    marginLeft: 10,
    flexDirection: "row",
    alignItems: "right",
  },
  rememberText: {
    marginLeft: 5,
    color: "gray",
  },
});

export default LoginScreen;
