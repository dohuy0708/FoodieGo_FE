import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Color } from "../../constants";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Display from "../../utils/Display";
import Nav from "../../components/Nav";
const NAV_HEIGHT = Display.setHeight(7);
export default function Account({ navigation }) {
  const user = "Nguyễn Văn A";

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.header}>Tài khoản</Text>
        <View style={styles.iconContainer}>
          <MaterialIcons
            name="account-circle"
            size={Display.setWidth(50)}
            color={Color.DEFAULT_GREEN}
            style={{ alignSelf: "center" }}
          />
          <TouchableOpacity style={[styles.button, styles.logoutButton]}>
            <Text style={styles.buttonText}>Đăng xuất</Text>
          </TouchableOpacity>
          <Text style={styles.usernameText}>{user}</Text>
        </View>

        <Text style={[styles.header, styles.subHeader]}>Đổi mật khẩu</Text>

        <View style={styles.changePass}>
          <Text style={styles.label}>Mật khẩu cũ</Text>
          <TextInput
            style={styles.input}
            secureTextEntry={true}
            placeholder="Nhập mật khẩu cũ"
            placeholderTextColor={Color.LIGHT_GREY2}
          />
          <Text style={styles.label}>Mật khẩu mới</Text>
          <TextInput
            style={styles.input}
            secureTextEntry={true}
            placeholder="Nhập mật khẩu mới"
            placeholderTextColor={Color.LIGHT_GREY2}
          />
          <Text style={styles.label}>Nhập lại mật khẩu mới</Text>
          <TextInput
            style={styles.input}
            secureTextEntry={true}
            placeholder="Nhập lại mật khẩu mới"
            placeholderTextColor={Color.LIGHT_GREY2}
          />
          <TouchableOpacity style={[styles.button, styles.changePassButton]}>
            <Text style={styles.buttonText}>Đổi mật khẩu</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <View style={styles.navContainer}>
        <Nav nav={navigation} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: Display.setWidth(5),
    paddingVertical: Display.setHeight(1.2),
  },
  header: {
    marginTop: Display.setHeight(5),
    textAlign: "center",
    color: Color.DEFAULT_GREEN,
    fontWeight: "bold",
    fontSize: 24,
    marginBottom: Display.setHeight(1.8),
  },
  subHeader: {
    fontSize: 18,
    marginTop: Display.setHeight(2.5),
    marginBottom: Display.setHeight(1.2),
  },
  iconContainer: {
    borderRadius: 10,
    paddingVertical: Display.setHeight(1.2),
    paddingHorizontal: Display.setWidth(2.5),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Color.GRAY_BORDER,
    marginBottom: Display.setHeight(1.8),
  },
  usernameText: {
    fontSize: 20,
    textAlign: "center",
    marginTop: Display.setHeight(1.2),
    color: Color.DEFAULT_BLACK,
  },
  changePass: {
    borderRadius: 10,
    paddingVertical: Display.setHeight(2.5),
    paddingHorizontal: Display.setWidth(2.5),
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Color.LIGHT_GREY2,
    gap: Display.setHeight(1.8),
    marginBottom: Display.setHeight(2.5),
  },
  label: {
    color: Color.DEFAULT_GREEN,
    fontSize: 16,
  },
  input: {
    borderColor: Color.GRAY_BORDER,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Display.setWidth(2.5),
    paddingVertical: Display.setHeight(1.2),
    fontSize: 16,
    color: Color.DEFAULT_BLACK,
  },
  button: {
    paddingHorizontal: Display.setWidth(5),
    paddingVertical: Display.setHeight(1.2),
    minHeight: Display.setHeight(5),
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  logoutButton: {
    backgroundColor: Color.DEFAULT_YELLOW,
    marginTop: Display.setHeight(2),
  },
  changePassButton: {
    backgroundColor: Color.DEFAULT_GREEN,
    alignSelf: "flex-end",
    marginTop: Display.setHeight(1),
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  navContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: NAV_HEIGHT,
    backgroundColor: Color.DEFAULT_WHITE || "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  scrollView: {
    flex: 1,
    width: "100%",
    marginBottom: Display.setHeight(6),
  },
});
