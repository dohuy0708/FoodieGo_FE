import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../../components";
import Logo from "../../assets/images/Logo.png";
import { Color, Fonts } from "../../constants";
import Ionicons from "@expo/vector-icons/Ionicons";
const ForgotPassScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const handleSendMail = () => {
    if (email.trim() === "") {
      setErrorMessage("Vui lòng nhập email");
    } else {
      setErrorMessage("");
      // Xử lý tiếp đăng nhập
    }
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Header title="Quên mật khẩu" onBackPress={() => navigation.goBack()} />

        <Image source={Logo} style={styles.logo}></Image>
        {/* Ô nhập email */}
        <Text
          style={[Fonts.bodyText, { alignSelf: "flex-start", marginLeft: 30 }]}
        >
          Nhập địa chỉ email của bạn
        </Text>
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
        <View style={styles.noticeContainer}>
          {errorMessage !== "" && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}
        </View>
        {/* Nút gửi email */}
        <TouchableOpacity
          style={{
            marginTop: 10,
            backgroundColor: Color.DEFAULT_GREEN,
            padding: 10,
            borderRadius: 5,
            width: "90%",
            alignItems: "center",
          }}
          onPress={handleSendMail}
        >
          <Text style={[Fonts.buttonText, { color: "white" }]}>Gửi email</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,

    alignItems: "center",
    backgroundColor: "white",
  },
  logo: {
    marginTop: 150,
    width: 180,
    height: 120,
    marginBottom: 80,
  },
  inputContainer: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    width: "90%",
  },
  noticeContainer: {
    minHeight: 20,
  },
  errorText: {
    color: "red",
    fontSize: 14,
  },
});

export default ForgotPassScreen;
