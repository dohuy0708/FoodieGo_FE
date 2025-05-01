import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
const Header = ({ title, onBackPress }) => {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={onBackPress} style={styles.side}>
        <Ionicons name="chevron-back-outline" size={28} color="black" />
      </TouchableOpacity>

      <View style={styles.center}>
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Placeholder để giữ cân đối layout */}
      <View style={styles.side} />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: "absolute", // Đặt header ở vị trí tuyệt đối
    top: 0, // Đưa header lên trên cùng của màn hình
    left: 0,
    right: 0,
    height: 50, // Chiều cao cố định cho header
    backgroundColor: "white", // Màu nền của header (có thể thay đổi)
    flexDirection: "row", // Để các phần tử hiển thị theo hàng ngang
    alignItems: "center", // Căn giữa các phần tử theo chiều dọc
    zIndex: 1, // Đảm bảo header hiển thị phía trên cùng
    // Đổ bóng (Android)
    elevation: 4,
  },
  side: {
    width: 40, // Cố định chiều rộng 2 bên
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 21,
    fontWeight: "bold",
  },
});

export default Header;
