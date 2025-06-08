import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants";
import { color } from "react-native-elements/dist/helpers";
import { serviceUpdateOrderStatus } from "../services/orderService";

const OrderCard = ({ order, navigate, onStatusChange, setLoading }) => {
  console.log("OrderCard order:", order);
  // Tính tổng số món
  const totalItems =
    order?.orderDetail?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const handleCancelOrder = async (event) => {
    event.stopPropagation();
    try {
      if (setLoading) setLoading(true);
      await serviceUpdateOrderStatus(order.id, "cancelled");
      if (onStatusChange) onStatusChange();
    } catch (error) {
      alert("Có lỗi khi hủy đơn hàng!");
    } finally {
      if (setLoading) setLoading(false);
    }
  };
  const handleConfirmOrder = async (event) => {
    event.stopPropagation();
    try {
      if (setLoading) setLoading(true);
      await serviceUpdateOrderStatus(order.id, "completed");
      if (onStatusChange) onStatusChange();
    } catch (error) {
      alert("Có lỗi khi xác nhận đơn hàng!");
    } finally {
      if (setLoading) setLoading(false);
    }
  };
  return (
    <TouchableOpacity style={styles.container} onPress={() => navigate(order)}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons style={styles.icon} name="storefront-outline" size={22} />
          <Text style={styles.storeName}>{order?.restaurant?.name}</Text>
        </View>
        <Text style={{ color: Colors.DEFAULT_GREEN, fontWeight: "bold" }}>
          ĐH: {order?.id}
        </Text>
      </View>

      <View style={styles.itemDetails}>
        <Image
          source={{
            uri:
              order?.orderDetail?.[0]?.menu?.imageUrl ||
              "https://file.hstatic.net/200000385717/article/fa57c14d-6733-4489-9953-df4a4760d147_1daf56255c344ad79439608b2ef80bd1.jpeg",
          }}
          style={styles.foodImage}
        />
        <Text style={styles.itemCount}>
          {order?.orderDetail?.[0]?.menu?.name}
        </Text>
        <Text>
          {order?.orderDetail?.[0]?.menu?.price}đ x{" "}
          {order?.orderDetail?.[0]?.quantity}
        </Text>
      </View>

      <View>
        <View style={styles.total}>
          <Text style={styles.totalText}>
            Tổng thanh toán ({totalItems} món)
          </Text>
          <Text style={styles.price}>
            {" "}
            {order?.totalPrice?.toLocaleString("vi-VN")} đ
          </Text>
        </View>
      </View>

      <View style={styles.statusContainer}>
        <Text
          style={[
            styles.statusTag,
            order?.status === "pending" && styles.statusPending,
            order?.status === "confirmed" && styles.statusDelivering,
          ]}
        >
          {order?.status === "pending"
            ? "Đang chờ"
            : order?.status === "confirmed"
            ? "Đang giao"
            : order?.status}
        </Text>
        {order?.status === "pending" && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={(event) => handleCancelOrder(event)}
          >
            <Text style={styles.buttonText}>Hủy đơn</Text>
          </TouchableOpacity>
        )}
        {order?.status === "confirmed" && (
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={(event) => handleConfirmOrder(event)}
          >
            <Text style={styles.buttonText}>Đã nhận</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.DEFAULT_WHITE,
    borderRadius: 8,
    padding: 16,
    margin: 5,
    borderWidth: 1.5,
    borderColor: "#ddd",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  statusTag: {
    fontSize: 13,
    fontWeight: "bold",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    overflow: "hidden",
    color: "white",
  },

  statusPending: {
    color: "#fbbf24",
  },

  statusDelivering: {
    color: Colors.DEFAULT_GREEN,
  },

  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  itemDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  foodImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 8,
  },
  itemCount: {
    fontWeight: 500,
    flex: 1,
  },
  viewMore: {
    color: "gray",
    marginBottom: 8,
  },
  total: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  totalText: {
    fontWeight: "500",
    fontSize: 13,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "orange",
  },
  status: {
    color: "gray",
    fontWeight: "bold",
  },
  statusArriving: {
    color: "green",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },

  status: {
    fontSize: 13,
    color: "#555",
  },

  cancelButton: {
    paddingHorizontal: 8,
    backgroundColor: Colors.DEFAULT_GREY,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },

  confirmButton: {
    paddingHorizontal: 8,

    backgroundColor: Colors.DEFAULT_GREEN,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 13,
  },
});

export default OrderCard;
