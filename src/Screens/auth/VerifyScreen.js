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
import { verifySignup } from "../../services/authService";

const VerifyScreen = ({ navigation }) => {
  const [otp, setOTP] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSendOTP = async () => {
    if (otp.trim() === "") {
      setErrorMessage("Vui lòng nhập mã xác thực");
    } else {
      setErrorMessage("");
      try {
        const data = await verifySignup(otp);
        console.log("API response:", data);

        if (
          data.data &&
          data.data.verifySignup &&
          data.data.verifySignup.token
        ) {
          navigation.navigate("LoginScreen");
        } else {
          setErrorMessage("Xác thực thất bại. Vui lòng kiểm tra mã OTP.");
        }
      } catch (error) {
        setErrorMessage("Có lỗi xảy ra khi xác thực.");
      }
    }
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Header title="Xác thực" onBackPress={() => navigation.goBack()} />

        <Image source={Logo} style={styles.logo}></Image>
        {/* Ô nhập email */}
        <Text
          style={[Fonts.bodyText, { alignSelf: "flex-start", marginLeft: 30 }]}
        >
          Mã xác thực đã được gửi đến email của bạn! 5 phút để xác thực
        </Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="bag-check-outline"
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
        <View style={styles.noticeContainer}>
          {errorMessage !== "" && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}
        </View>
        {/* Nút xác thực */}
        <TouchableOpacity
          style={{
            marginTop: 10,
            backgroundColor: Color.DEFAULT_GREEN,
            padding: 10,
            borderRadius: 5,
            width: "90%",
            alignItems: "center",
          }}
          onPress={handleSendOTP}
        >
          <Text style={[Fonts.buttonText, { color: "white" }]}>
            Xác thực OPT
          </Text>
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
    height: 150,
    marginBottom: 80,
  },
  inputContainer: {
    marginTop: 10,
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
export default VerifyScreen;
