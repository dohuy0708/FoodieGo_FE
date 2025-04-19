import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Avatar, Button } from "react-native-elements";

import { Color } from "../../constants";

const Profile = ({ navigation }) => {
  const [username, setUsername] = useState("Dohuy");
  const [email, setEmail] = useState("dohuy22314@gmail.com");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  return (
    <SafeAreaView style={styles.container}>
      {/*  Avatar     */}

      {/* User Info */}
      <View style={styles.header}>
        <View>
          <Avatar
            rounded
            size={70}
            source={require("../../assets/images/user.png")}
            containerStyle={styles.avatar}
          ></Avatar>
        </View>
        <Text style={styles.name}>{username}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>
      <View style={styles.bodyContainer}>
        <View style={styles.menuContainer}>
          <MenuItem icon="person-outline" title="Thông tin cá nhân" />
          <MenuItem icon="paper-plane-outline" title="Địa chỉ" />
          <MenuItem icon="newspaper-outline" title="Chính sách" />
          <MenuItem icon="business-outline" title="Về chúng tôi" />
          <MenuItem icon="alert-circle-outline" title="Trợ giúp" />
        </View>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => {
            if (isLoggedIn) {
              navigation.navigate("LoginScreen");
              // Xử lý đăng xuất
              //  setIsLoggedIn(false);
            } else {
              // Xử lý đăng nhập
              // setIsLoggedIn(true);
            }
          }}
        >
          <Text style={styles.loginText}>
            {isLoggedIn ? "Đăng nhập" : "Đăng xuất"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const MenuItem = ({ icon, title }) => (
  <TouchableOpacity style={styles.menuItem}>
    <View style={styles.iconTitle}>
      <Ionicons name={icon} size={22} style={styles.icon} />
      <Text style={styles.title}>{title}</Text>
    </View>
    <Ionicons name="chevron-forward-outline" size={20} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: "#118b96",
    padding: 20,
    alignItems: "center",
    height: "30%",
    justifyContent: "center",
  },
  bodyContainer: {
    flex: 1,
  },
  avatar: {
    backgroundColor: "#fff",
  },
  name: {
    color: "#fff",
    fontSize: 18,
    marginTop: 8,
  },
  email: {
    color: "#fff",
    fontSize: 14,
    marginTop: 4,
  },
  menuContainer: {
    padding: 16,
  },
  menuItem: {
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 16,
    width: 24,
  },
  title: {
    fontSize: 14,
  },
  loginButton: {
    marginTop: 20,
    paddingVertical: 12,
    backgroundColor: "#007B7F",
    width: "90%",
    padding: 10,
    marginLeft: "5%",
    borderRadius: 5,
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    color: "#fff",
  },
});

export default Profile;
