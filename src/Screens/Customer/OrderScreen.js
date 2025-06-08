import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState, useContext } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants";
import OrderCard from "../../components/OrderCard";
import HistoryOrderCard from "../../components/HistoryOrderCard";
import { UserContext } from "../../context/UserContext";
import { fetchPaidOrdersByUserId } from "../../services/orderService";
import { useFocusEffect } from "@react-navigation/native";

const OrderScreen = ({ navigation }) => {
  const { userInfo } = useContext(UserContext);
  const [activeSortItem, setActiveSortItem] = useState("Đơn đặt");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleNavigateFeedback = (order) => {
    navigation.navigate("FeedbackScreen", { order });
  };
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetchPaidOrdersByUserId(userInfo.id, 1, 10);
      setOrders(res.data);
      console.log("Orders fetched successfully:", res.data);
    } catch (err) {
      alert(err.message || "Lỗi khi lấy danh sách đơn hàng đã thanh toán");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (userInfo?.id) fetchOrders();
    }, [userInfo?.id])
  );

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

  // Nếu chưa đăng nhập, hiển thị thông báo và nút đăng nhập
  if (!userInfo) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 16, marginBottom: 16 }}>
          Bạn cần đăng nhập để xem{" "}
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>Đơn Hàng</Text>
        </Text>

        <TouchableOpacity
          style={{
            backgroundColor: Colors.DEFAULT_GREEN,
            padding: 10,
            borderRadius: 8,
          }}
          onPress={() => navigation.navigate("LoginScreen")}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Đăng nhập</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

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
            ? (() => {
                const filtered = orders.filter(
                  (order) =>
                    order.status !== "completed" && order.status !== "cancelled"
                );
                if (filtered.length === 0) {
                  return (
                    <Text
                      style={{
                        textAlign: "center",
                        marginTop: 30,
                        color: "gray",
                      }}
                    >
                      Không có đơn hàng nào
                    </Text>
                  );
                }
                return filtered.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    navigate={(orderObj) =>
                      navigation.navigate("OrderDetailScreen", {
                        order: orderObj,
                      })
                    }
                    onStatusChange={fetchOrders}
                    setLoading={setLoading}
                  />
                ));
              })()
            : (() => {
                const filtered = orders.filter(
                  (order) =>
                    order.status === "completed" || order.status === "cancelled"
                );
                if (filtered.length === 0) {
                  return (
                    <Text
                      style={{
                        textAlign: "center",
                        marginTop: 30,
                        color: "gray",
                      }}
                    >
                      Không có đơn hàng nào
                    </Text>
                  );
                }
                return filtered.map((order) => (
                  <HistoryOrderCard
                    key={order.id}
                    order={order}
                    navigate={(orderObj) =>
                      navigation.navigate("OrderDetailScreen", {
                        order: orderObj,
                      })
                    }
                    handleNavigateFeedback={handleNavigateFeedback}
                  />
                ));
              })()}
        </ScrollView>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.DEFAULT_GREEN} />
          </View>
        )}
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
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
});
export default OrderScreen;
