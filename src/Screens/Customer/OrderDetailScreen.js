import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "../../components";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useCart } from "../../context/CartContext";
import { UserContext } from "../../context/UserContext";
import {
  createOrder,
  createOrderDetail,
  createPaypalOrder,
  serviceUpdateOrderStatus,
} from "../../services/orderService";
const OrderDetailScreen = ({ navigation, route }) => {
  const { order } = route.params;

  const { userInfo } = useContext(UserContext); // Lấy thông tin user
  // Delivery info
  const [shippingFee, setShippingFee] = useState(order?.shippingFee || 0);
  const [userLocation, setUserLocation] = useState(
    order?.address
      ? `${order.address.street}, ${order.address.ward}, ${order.address.district}, ${order.address.province}`
      : ""
  );
  const [userPhone, setUserPhone] = useState(userInfo?.phone || "");
  const [userName, setUserName] = useState(userInfo?.name || "");
  const [items, setItems] = useState(
    order?.orderDetail?.map((od) => ({
      id: od.menu?.id,
      name: od.menu?.name,
      price: od.menu?.price,
      imageUrl: od.menu?.imageUrl,
      quantity: od.quantity,
      note: od.note || "",
    })) || []
  );
  const { getCartItems, clearCart, hasItems } = useCart();
  const [isOrdering, setIsOrdering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState(order?.status);

  // Lấy tên nhà hàng
  const restaurant = order?.restaurant || {};
  // Tổng giá món
  const totalPrice = order?.totalPrice || 0;
  // Phương thức thanh toán
  const paymentMethod = order?.payment?.[0]?.paymentMethod || "";

  const handleCancelOrder = async () => {
    setLoading(true);
    try {
      await serviceUpdateOrderStatus(order.id, "cancelled");
      setOrderStatus("cancelled");
    } catch (error) {
      alert("Có lỗi khi hủy đơn hàng!");
    } finally {
      setLoading(false);
    }
  };
  const handleConfirmOrder = async () => {
    setLoading(true);
    try {
      await serviceUpdateOrderStatus(order.id, "completed");
      setOrderStatus("completed");
    } catch (error) {
      alert("Có lỗi khi xác nhận đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: "#F4F4F4" }}
        contentContainerStyle={{ padding: 5 }}
      >
        <Header
          title="Chi tiết đơn hàng"
          onBackPress={() => navigation.goBack()}
        />
        {/* Địa chỉ và thông tin người nhận */}
        <View style={styles.AddressSection}>
          <View style={styles.row}>
            <Ionicons
              name="location-outline"
              size={20}
              color={Colors.DEFAULT_GREEN}
            />
            <Text style={styles.addressText}>{userLocation}</Text>
          </View>
          <View style={styles.row}>
            <Ionicons
              name="person-outline"
              size={20}
              color={Colors.DEFAULT_GREEN}
            />
            <Text style={styles.text}>
              {userName}
              <Text> | </Text>
              {userPhone}
            </Text>
          </View>
        </View>
        {/* PHẦN CHI TIẾT MÓN */}
        <View style={styles.section}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <Ionicons
              style={styles.icon}
              name="storefront-outline"
              size={22}
              color={Colors.DEFAULT_GREEN}
            />
            <Text style={styles.shopTitle}>{restaurant?.name}</Text>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            {items.map((item, index) => (
              <View style={styles.itemRow} key={item.id || index}>
                <Image source={{ uri: item.imageUrl }} style={styles.image} />
                <View style={styles.itemDetail}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 4,
                    }}
                  >
                    {/* Tên món */}
                    <Text style={styles.quantity}>
                      {item.quantity} x {item.name}
                    </Text>
                    <Text style={[styles.price, { marginLeft: 10 }]}>
                      {(item.price * item.quantity).toLocaleString("vi-VN")} đ
                    </Text>
                  </View>
                  {/* Ghi chú */}
                  {item.note ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 2,
                      }}
                    >
                      <Ionicons
                        name="document-text-outline"
                        size={16}
                        color="#888"
                        style={{ marginRight: 4 }}
                      />
                      <Text style={{ fontSize: 13, color: "#444" }}>
                        {item.note}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
        {/* PHẦN THANH TOÁN & PHƯƠNG THỨC */}
        <View style={styles.footerContainer}>
          <View style={styles.section}>
            <Text style={styles.paymentTitle}>Chi tiết thanh toán</Text>
            <View style={styles.paymentRow}>
              <Text style={styles.text}>Tổng giá món</Text>
              <Text style={styles.text}>
                {totalPrice.toLocaleString("vi-VN")} đ
              </Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.text}>Phí giao hàng</Text>
              <Text style={styles.text}>
                {shippingFee.toLocaleString("vi-VN")} đ
              </Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.totalLabel}>Tổng thanh toán</Text>
              <Text style={styles.totalPrice}>
                {(totalPrice + shippingFee).toLocaleString("vi-VN")} đ
              </Text>
            </View>
          </View>
          <View style={styles.footer}>
            <View style={styles.paymentMethod}>
              <Ionicons name="wallet-outline" size={20} color="#333" />
              <Text style={styles.text}>Phương thức thanh toán: </Text>
              <Text
                style={{
                  color: "#0070ba",
                  fontWeight: "bold",
                }}
              >
                {paymentMethod}
              </Text>
            </View>
          </View>
        </View>
        {/* Trạng thái và nút hành động */}
        <View style={styles.statusActionRow}>
          <Text style={styles.statusText}>
            Trạng thái đơn hàng:{" "}
            <Text
              style={[
                orderStatus === "pending" && styles.statusPending,
                orderStatus === "confirmed" && styles.statusDelivering,
                orderStatus === "completed" && styles.statusCompleted,
                orderStatus === "cancelled" && styles.statusCancelled,
              ]}
            >
              {orderStatus === "pending"
                ? "Đang chờ"
                : orderStatus === "confirmed"
                ? "Đang giao"
                : orderStatus === "completed"
                ? "Hoàn thành"
                : orderStatus === "cancelled"
                ? "Đã hủy"
                : orderStatus}
            </Text>
          </Text>
          {orderStatus === "pending" && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: Colors.DEFAULT_GREY }]}
              onPress={handleCancelOrder}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Hủy đơn</Text>
              )}
            </TouchableOpacity>
          )}
          {orderStatus === "confirmed" && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: Colors.DEFAULT_GREEN }]}
              onPress={handleConfirmOrder}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Đã nhận</Text>
              )}
            </TouchableOpacity>
          )}
          {orderStatus === "completed" &&
            (Array.isArray(order.review) && order.review.length === 0 ? (
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: Colors.DEFAULT_YELLOW },
                ]}
                onPress={() =>
                  navigation.navigate("FeedbackScreen", { orderId: order.id })
                }
              >
                <Text style={[styles.buttonText, { color: "white" }]}>
                  Đánh giá
                </Text>
              </TouchableOpacity>
            ) : Array.isArray(order.review) && order.review.length > 0 ? (
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: Colors.DEFAULT_GREY },
                ]}
                onPress={() =>
                  navigation.navigate("ReviewFeedbackScreen", {
                    orderId: order.id,
                  })
                }
              >
                <Text style={styles.buttonText}>Xem đánh giá</Text>
              </TouchableOpacity>
            ) : null)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
    padding: 5,
  },
  footerContainer: {},

  title: {
    fontSize: 22,
    fontWeight: "bold",
    alignSelf: "center",
    marginVertical: 10,
  },
  AddressSection: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginTop: 40,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
    paddingHorizontal: 3,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
  },
  addressText: {
    flex: 1,
    marginLeft: 8,
    color: "#333",
  },
  editText: {
    color: "#00AEEF",
    fontSize: 14,
  },
  text: {
    marginLeft: 8,
    color: "#333",
  },
  shopTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  itemRow: {
    gap: 10,
    backgroundColor: "#yellow",
    flexDirection: "row",
    marginVertical: 8,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemDetail: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  quantity: {
    fontSize: 15,
    fontWeight: "500",
  },
  price: {
    color: "#333",
  },
  viewMore: {
    textAlign: "center",
    color: "#999",
    marginTop: 6,
  },
  paymentTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  totalLabel: {
    fontWeight: "bold",
    fontSize: 15,
  },
  totalPrice: {
    color: "#FFA500",
    fontWeight: "bold",
    fontSize: 16,
  },
  footer: {
    paddingTop: 10,
  },
  paypalIcon: {
    width: 50,
    height: 20,
    resizeMode: "contain",
  },
  button: {
    marginRight: 10,
    backgroundColor: "#008080",
    paddingVertical: 6,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginVertical: 5,
    marginHorizontal: 5,
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  statusActionRow: {
    marginTop: 10,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 0,
    marginTop: 0,
    marginBottom: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 10,
    padding: 10,
  },
  statusText: {
    marginLeft: 8,
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  statusPending: {
    color: "#fbbf24", // vàng
  },
  statusDelivering: {
    color: Colors.DEFAULT_GREEN, // xanh
  },
  statusCompleted: {
    color: "green", // xanh lá
  },
  statusCancelled: {
    color: "#e74c3c",
  },
});
export default OrderDetailScreen;
