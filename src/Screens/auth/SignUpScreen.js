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
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { Header } from "../../components";
import Ionicons from "@expo/vector-icons/Ionicons";
import Logo from "../../assets/images/Logo.png";
import { SafeAreaView } from "react-native-safe-area-context";
import Fonts from "../../constants/Fonts";
import { Picker } from "@react-native-picker/picker";

import { registerUser } from "../../services/authService";

const SignUpScreen = ({ navigation }) => {
  // state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [checkPassword, setCheckPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isRecheckPasswordVisible, setIsRecheckPasswordVisible] =
    useState(false);
  const [loading, setLoading] = useState(false); // Thêm state loading

  // handle

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  const toggleRecheckPasswordVisibility = () => {
    setIsRecheckPasswordVisible(!isRecheckPasswordVisible);
  };

  const handleSignUp = async () => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    const phoneRegex = /^\d{10}$/; // Phone number should be exactly 10 digits
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&^])[A-Za-z\d@$!%*#?&^]{6,}$/;
    if (name.trim().length <= 5) {
      setErrorMessage("Họ tên phải có hơn 5 ký tự");
    } else if (gender === "") {
      setErrorMessage("Vui lòng chọn giới tính");
    } else if (!phoneRegex.test(phone)) {
      setErrorMessage("Số điện thoại phải có 10 số");
    } else if (!emailRegex.test(email)) {
      setErrorMessage("Email không hợp lệ");
    } else if (username.trim().length <= 0) {
      setErrorMessage("Tên đăng nhập phải có hơn 6 ký tự");
    } else if (!passwordRegex.test(password)) {
      setErrorMessage("Mật khẩu phải có chữ, số và ký tự đặc biệt");
    } else if (password !== checkPassword) {
      setErrorMessage("Mật khẩu nhập lại không khớp");
    } else {
      setLoading(true); // Bắt đầu loading
      setErrorMessage(" "); // Clear the error message if all validations pass

      try {
        const data = await registerUser({
          name,
          email,
          gender,
          username,
          password,
          phone,
        });

        console.log("API response:", data);

        if (data.data && data.data.register) {
          navigation.navigate("VerifyScreen");
        } else {
          setErrorMessage("Đăng ký thất bại, vui lòng thử lại!");
        }
      } catch (error) {
        setErrorMessage("Có lỗi xảy ra khi đăng ký.");
      } finally {
        setLoading(false); // Dù thành công hay thất bại đều dừng loading
      }
    }
  };
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
            {/* Ô nhập Họ tên */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={24}
                color="gray"
                style={styles.icon}
              />
              <TextInput
                placeholder="Họ và tên"
                style={Fonts.inputText}
                value={name}
                onChangeText={setName}
              />
            </View>
            {/* Dropdown chọn giới tính */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="male-female-outline"
                size={24}
                color="gray"
                style={styles.icon}
              />
              <Picker
                selectedValue={gender}
                style={styles.picker}
                onValueChange={(itemValue) => setGender(itemValue)}
              >
                <Picker.Item label="Giới tính" value="" enabled={false} />
                <Picker.Item label="Nam" value="Nam" />
                <Picker.Item label="Nữ" value="Nữ" />
              </Picker>
            </View>
            {/* Ô nhập số điện thoại */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="call-outline"
                size={24}
                color="gray"
                style={styles.icon}
              />
              <TextInput
                placeholder="Số điện thoại"
                keyboardType="phone-pad"
                style={Fonts.inputText}
                value={phone}
                onChangeText={setPhone}
              />
            </View>
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
            {/* Ô nhập tên đăng nhập */}
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
                secureTextEntry={!isPasswordVisible}
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
                value={checkPassword}
                onChangeText={setCheckPassword}
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
            <TouchableOpacity style={styles.loginButton} onPress={handleSignUp}>
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={Fonts.buttonText}>Đăng ký</Text>
              )}
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
    marginBottom: 20,
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

export default SignUpScreen;
