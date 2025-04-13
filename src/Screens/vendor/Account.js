import React from "react";
import { View, Text, StyleSheet,TextInput,TouchableOpacity, ScrollView } from "react-native";
import { Color } from "../../constants";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
export default function Account() {
    const user="Nguyễn Văn A"
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Tài khoản</Text>
      <View style={styles.iconContainer}>
        <MaterialIcons
          name="account-circle"
          size={200}
          color={Color.DEFAULT_GREEN}
          style={{ alignSelf: "center" }}
        />
         <TouchableOpacity style={[styles.button,{backgroundColor: Color.DEFAULT_YELLOW,alignSelf:"center"}]}>
            <Text style={{ color: "#fff", fontSize: 16 }}>Đăng xuất</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 20, textAlign: "center", marginTop: 10 }}>
          {user}
        </Text>
      </View>
      <Text style={[styles.header,{fontSize:18,marginTop:20}]}>Đổi mật khẩu</Text>
      <View style={styles.changePass}>
        <Text style={{ color: Color.DEFAULT_GREEN, fontSize: 16 }}>
            Mật khẩu cũ
        </Text>
        <TextInput
          style={{
           
            borderColor: Color.GRAY_BORDER,
            borderWidth: 1,
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 10,
          }}
          secureTextEntry={true}
            placeholder="Nhập mật khẩu cũ"
        />
         <Text style={{ color: Color.DEFAULT_GREEN, fontSize: 16 }}>
            Mật khẩu mới
        </Text>
        <TextInput
          style={{
            borderColor: Color.GRAY_BORDER,
            borderWidth: 1,
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 10,
          }}
          secureTextEntry={true}
            placeholder="Nhập mật khẩu mới"
        />
         <Text style={{ color: Color.DEFAULT_GREEN, fontSize: 16 }}>
            Nhập lại mật khẩu mới
        </Text>
        <TextInput
          style={{
            borderColor: Color.GRAY_BORDER,
            borderWidth: 1,
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 10,
          }}
          secureTextEntry={true}
            placeholder="Nhập lại mật khẩu mới"
        />
        <TouchableOpacity style={[styles.button,{backgroundColor: Color.DEFAULT_GREEN}]}>
            <Text style={{ color: "#fff", fontSize: 16 }}>Đổi mật khẩu</Text>
        </TouchableOpacity>
        
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {

    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  header: {
    marginTop: 40,
    textAlign: "center",
    color: Color.DEFAULT_GREEN,
    fontWeight: "bold",
    fontSize: 24,
    marginBottom: 15,
  },
  iconContainer: {
    borderRadius:10,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Color.GRAY_BORDER,
  },
  changePass:
  {
    borderRadius:10,
    paddingVertical: 20,
    paddingHorizontal: 10,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Color.LIGHT_GREY2,
    gap:15,
    marginBottom: 20,
  },

  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignSelf:"flex-end",
    minHeight: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
