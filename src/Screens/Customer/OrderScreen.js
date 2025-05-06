import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants";
import OrderCard from "../../components/OrderCard";
import HistoryOrderCard from "../../components/HistoryOrderCard";

const OrderScreen = ({ navigation }) => {
  const [activeSortItem, setActiveSortItem] = useState("Đơn đặt");
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    if (activeSortItem === "Đơn đặt") {
      // API giả cho đơn đặt
      const fakeOrders = [
        {
          id: 1,
          storeName: "Bún Chả Hà Nội",
          firstFood: "Bún chả",
          firstFoodImg: "https://link-to-image.jpg",
          itemCount: 2,
          totalItem: 3,
          totalPrice: 75000,
          status: "Chờ xác nhận",
        },
        {
          id: 2,
          storeName: "Bún Chả Hà Nội",
          firstFood: "Bún chả",
          firstFoodImg: "https://link-to-image.jpg",
          itemCount: 2,
          totalItem: 3,
          totalPrice: 75000,
          status: "Đang giao",
        },
      ];
      setOrders(fakeOrders);
    } else if (activeSortItem === "Lịch sử") {
      // API giả cho lịch sử đơn hàng
      const fakeHistoryOrders = [
        {
          id: 101,
          storeName: "Cơm Gà Xối Mỡ",
          firstFood: "Cơm gà",
          firstFoodImg: "https://link-to-image.jpg",
          itemCount: 1,
          totalItem: 1,
          totalPrice: 45000,
          isFeedback: false,
        },
        {
          id: 102,
          storeName: "Bánh Mì PewPew",
          firstFood: "Bánh mì thịt nướng",
          firstFoodImg: "https://link-to-image.jpg",
          itemCount: 1,
          totalItem: 1,
          totalPrice: 35000,
          isFeedback: true,
        },
      ];
      setOrders(fakeHistoryOrders);
    }
  }, [activeSortItem]);
  const sortStyle = (isActive) =>
    isActive
      ? {
          ...styles.sortListItem,
          borderBottomColor: Colors.DEFAULT_GREEN, // màu gạch chân khi active
        }
      : {
          ...styles.sortListItem,
          borderBottomColor: Colors.DEFAULT_WHITE, // ẩn khi không active
        };

  const textColorStyle = (isActive) => ({
    ...styles.sortListItemText,
    color: isActive ? Colors.DEFAULT_GREEN : Colors.DEFAULT_BLACK,

    fontWeight: isActive ? "500" : "400", // tô đậm nếu active
  });
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.center}>
            <Text style={styles.title}>Đơn đặt</Text>
          </View>
        </View>
        <View style={styles.sortListContainer}>
          {["Đơn đặt", "Lịch sử"].map((item) => {
            const isActive = activeSortItem === item;
            return (
              <TouchableOpacity
                key={item}
                style={sortStyle(isActive)}
                onPress={() => setActiveSortItem(item)}
              >
                <Text style={textColorStyle(isActive)}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView style={styles.listContainer}>
          {activeSortItem === "Đơn đặt"
            ? orders.map((order) => (
                <OrderCard
                  key={order.id}
                  {...order}
                  navigate={(orderId) =>
                    navigation.navigate("OrderDetailScreen", { orderId })
                  }
                />
              ))
            : orders.map((order) => (
                <HistoryOrderCard
                  key={order.id}
                  {...order}
                  navigate={(orderId) =>
                    navigation.navigate("OrderDetailScreen", { orderId })
                  }
                />
              ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.DEFAULT_WHITE,
    zIndex: -100,
    height: "100%",
  },
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
  sortListContainer: {
    backgroundColor: Colors.DEFAULT_WHITE,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginTop: 8,
    elevation: 1,
    marginTop: 55,
  },
  sortListItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    height: 40,
    borderRightWidth: 0.5,
  },
  sortListItemText: {
    fontSize: 14,
    lineHeight: 13 * 1.4,
    fontWeight: "400", // hoặc "600" hay "700"
  },
  listContainer: {
    paddingVertical: 5,
    zIndex: -5,
    marginBottom: 30,
  },
});
export default OrderScreen;
