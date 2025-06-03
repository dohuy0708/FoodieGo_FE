import React, { useState, useContext, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Avatar, Button } from "react-native-elements";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Color } from "../../constants";
import { UserContext } from "../../context/UserContext";
import ConfirmModal from "../../components/ConfirmModal";
import AlertModal from "../../components/AlertModal";
import { useCart } from "../../context/CartContext";

const AccountScreen = ({ navigation }) => {
  const [username, setUsername] = useState("---");
  const [email, setEmail] = useState("Bạn chưa đăng nhập tài khoản!");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // Trạng thái hiển thị modal
  const { userInfo } = useContext(UserContext); // Lấy thông tin user từ context
  const { setUserInfo } = useContext(UserContext); // Lấy hàm setUserInfo từ context
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false); // Trạng thái hiển thị modal
  const { clearAllCarts } = useCart();
  useEffect(() => {
    if (userInfo) {
      setIsLoggedIn(true);
      setUsername(userInfo.name || "---");
      setEmail(userInfo.email || "N/A");
    }
  }, [userInfo]); // Cập nhật lại khi userInfo thay đổi

  const handleLogout = async () => {
    try {
      console.log("Logout userInfo", userInfo);
      // 1. Xóa dữ liệu trong AsyncStorage
      await AsyncStorage.removeItem("userInfo");
      await AsyncStorage.removeItem("token");

      // 2. Reset context
      setUserInfo(null); // hoặc setUserInfo({}) tùy theo bạn setup
      // 3. Reset context giỏ hàng
      clearAllCarts(); // gọi hàm clearAllCarts từ context
      // 3. Reset stack và điều hướng về màn hình chính (hoặc Login)
      navigation.reset({
        index: 0,
        routes: [{ name: "SplashScreen" }], // hoặc 'Login' tùy vào yêu cầu của bạn
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  const handleLoginRedirect = () => {
    setIsModalVisible(false); // Đóng modal
    navigation.navigate("LoginScreen"); // Chuyển đến màn hình đăng nhập
  };
  // Hàm để đóng modal khi nhấn nút "Hủy"
  const handleCloseModal = () => {
    setIsModalVisible(false); // Đóng modal
  };
  return (
    <SafeAreaView style={styles.container}>
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
          {/* Thông tin cá nhân*/}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              if (isLoggedIn) {
                // Nếu đã đăng nhập, điều hướng đến màn hình ProfileScreen
                navigation.navigate("ProfileScreen");
              } else {
                // Nếu chưa đăng nhập, hiển thị modal yêu cầu đăng nhập
                setIsAlertModalVisible(true);
              }
            }} // Gọi hàm khi nhấn vào mục này)}
          >
            <View style={styles.iconTitle}>
              <Ionicons name="person-outline" size={22} style={styles.icon} />
              <Text style={styles.title}>Thông tin cá nhân</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} />
          </TouchableOpacity>
          {/* Địa chỉ */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              if (isLoggedIn) {
                // Nếu đã đăng nhập, điều hướng đến màn hình AddressScreen
                navigation.navigate("AddressScreen");
              } else {
                // Nếu chưa đăng nhập, hiển thị modal yêu cầu đăng nhập
                setIsAlertModalVisible(true);
              }
            }}
          >
            <View style={styles.iconTitle}>
              <Ionicons
                name="paper-plane-outline"
                size={22}
                style={styles.icon}
              />
              <Text style={styles.title}>Địa chỉ</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} />
          </TouchableOpacity>
          {/* Chính sách  */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              navigation.navigate("AboutUsScreen");
            }}
          >
            <View style={styles.iconTitle}>
              <Ionicons
                name="newspaper-outline"
                size={22}
                style={styles.icon}
              />
              <Text style={styles.title}>Chính sách</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} />
          </TouchableOpacity>
          {/* Về chúng tôi */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              navigation.navigate("AboutUsScreen");
            }}
          >
            <View style={styles.iconTitle}>
              <Ionicons name="business-outline" size={22} style={styles.icon} />
              <Text style={styles.title}>Về chúng tôi</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} />
          </TouchableOpacity>
          {/* Trợ giúp */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              navigation.navigate("AboutUsScreen");
            }}
          >
            <View style={styles.iconTitle}>
              <Ionicons
                name="alert-circle-outline"
                size={22}
                style={styles.icon}
              />
              <Text style={styles.title}>Trợ giúp</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => {
            if (!isLoggedIn) {
              navigation.navigate("LoginScreen");
            } else {
              setIsModalVisible(true);
            }
          }}
        >
          <Text style={styles.loginText}>
            {!isLoggedIn ? "Đăng nhập/Đăng ký" : "Đăng xuất"}
          </Text>
        </TouchableOpacity>
      </View>
      {/* Sử dụng ModalComponent và truyền onClose, onAction */}
      <ConfirmModal
        visible={isModalVisible}
        onClose={handleCloseModal} // Đóng modal
        onAction={handleLogout}
        info="Bạn muốn đăng xuất?" // Thực hiện hành động khi nhấn nút "Đăng nhập"
        actionText="Đăng xuất" // Tùy chọn văn bản cho nút hành động
      />
      <AlertModal
        visible={isAlertModalVisible}
        onClose={() => setIsAlertModalVisible(false)} // Đóng modal
        info="Đăng nhập để xem thông tin!" // Thông báo cho người dùng
      />
    </SafeAreaView>
  );
};

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

export default AccountScreen;
