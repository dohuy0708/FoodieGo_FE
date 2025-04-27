import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../../components";
import Logo from "../../assets/images/Logo.png";
import { Color, Fonts } from "../../constants";
import Ionicons from "@expo/vector-icons/Ionicons";
import GRAPHQL_ENDPOINT from "../../../config";
const ChangePassScreen = ({ navigation }) => {
  const [otp, setOTP] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isRecheckPasswordVisible, setIsRecheckPasswordVisible] =
    useState(false);
  // handle

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  const toggleRecheckPasswordVisibility = () => {
    setIsRecheckPasswordVisible(!isRecheckPasswordVisible);
  };
  const handleChangePass = async () => {
    if (otp.trim() === "") {
      setErrorMessage("Vui lòng nhập OTP.");
      return;
    }
    if (newPassword.trim() === "") {
      setErrorMessage("Vui lòng nhập mật khẩu mới.");
      return;
    }
    if (confirmPassword.trim() === "") {
      setErrorMessage("Vui lòng nhập xác nhận mật khẩu.");
      return;
    }
    // Check if new password and confirm password match
    if (newPassword !== confirmPassword) {
      setErrorMessage("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }

    setErrorMessage(""); // Clear any previous errors
    try {
      // GraphQL mutation query for changing password
      const query = `
        mutation {
          verifyChangePassword(
            token: "${otp}",
            password: "${newPassword}"
          ) {
            token
          }
        }
      `;
      // Sending request to GraphQL API
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

      if (
        data.data &&
        data.data.verifyChangePassword &&
        data.data.verifyChangePassword.token
      ) {
        // Successfully changed password
        setErrorMessage(""); // Clear any previous errors
        // Optionally, save the new token or do anything else you need to do
        navigation.navigate("LoginScreen"); // Navigate to a success screen
      } else {
        setErrorMessage("Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setErrorMessage("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };
  // // init Function
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <Header
              title="Đổi mật khẩu"
              onBackPress={() => {
                navigation.goBack();
              }}
            />
            <Image source={Logo} style={styles.logo} />
            {/* Ô nhập Họ tên */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={24}
                color="gray"
                style={styles.icon}
              />
              <TextInput
                placeholder="Mã xác thực"
                style={Fonts.inputText}
                value={otp}
                onChangeText={setOTP}
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
                secureTextEntry={!isPasswordVisible}
                value={newPassword}
                onChangeText={setNewPassword}
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
            {/* Ô nhập lại mật khẩu */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-open-outline"
                size={24}
                color="gray"
                style={styles.icon}
              />
              <TextInput
                placeholder="Nhập lại mật khẩu"
                style={Fonts.inputText}
                secureTextEntry={!isRecheckPasswordVisible}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                onPress={toggleRecheckPasswordVisibility}
                style={styles.eyeIconContainer}
              >
                <Ionicons
                  name={
                    isRecheckPasswordVisible ? "eye-off-outline" : "eye-outline"
                  } // Change icon based on visibility
                  size={24}
                  color="gray"
                  style={styles.icon}
                />
              </TouchableOpacity>
            </View>
            {/* Thông báo lỗi */}
            <View style={styles.noticeContainer}>
              {errorMessage !== "" && (
                <Text style={styles.errorText}>{errorMessage}</Text>
              )}
            </View>
            {/* Nút đăng ký */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleChangePass}
            >
              <Text style={Fonts.buttonText}>Đổi mật khẩu</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    marginBottom: 40,
    marginTop: 20,
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
    position: "relative", // Important for positioning the eye icon inside
  },
  eyeIconContainer: {
    position: "absolute", // Position the eye icon inside the container
    right: 10, // Move it 10px from the right edge
  },
  picker: {
    flex: 1,
    height: 55,
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

export default ChangePassScreen;
