import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants";
import { color } from "react-native-elements/dist/helpers";
const HistoryOrderCard = ({ order, navigate, handleNavigateFeedback }) => {
  const totalItems =
    order?.orderDetail?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // Kiểm tra trạng thái đơn hàng
  let statusText = "";
  if (order?.status === "confirmed") statusText = "Hoàn thành";
  else if (order?.status === "cancelled") statusText = "Đã hủy";
  else statusText = order?.status;

  // Kiểm tra đã đánh giá hay chưa
  const hasFeedback = Array.isArray(order?.review) && order.review.length > 0;

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
      </View>

      <View style={styles.total}>
        <Text style={styles.totalText}>Tổng thanh toán ({totalItems} món)</Text>
        <Text>
          {order?.orderDetail?.[0]?.menu?.price}đ x{" "}
          {order?.orderDetail?.[0]?.quantity}
        </Text>
      </View>

      <View style={styles.statusContainer}>
        {order?.status === "completed" && (
          <Text
            style={[
              styles.statusTag,
              { flex: 1, textAlign: "left", color: "green" },
            ]}
          >
            Hoàn thành
          </Text>
        )}
        {order?.status === "cancelled" && (
          <Text
            style={[
              styles.statusTag,
              { flex: 1, textAlign: "left", color: "#e74c3c" },
            ]}
          >
            Đã hủy
          </Text>
        )}
        {order?.status === "completed" && !hasFeedback && (
          <TouchableOpacity
            style={styles.feedbackButton}
            onPress={(e) => {
              e.stopPropagation();
              handleNavigateFeedback(order);
            }}
          >
            <Text style={styles.buttonText}>Đánh giá</Text>
          </TouchableOpacity>
        )}
        {order?.status === "completed" && hasFeedback && (
          <TouchableOpacity
            style={styles.viewFeedbackButton}
            onPress={(e) => {
              e.stopPropagation();
              handleNavigateFeedback(order);
            }}
          >
            <Text style={styles.buttonText}>Xem đánh giá</Text>
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
    color: "green",
    fontSize: 13,
    fontWeight: "bold",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    overflow: "hidden",
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
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 2,
    gap: 10,
  },

  status: {
    fontSize: 13,
    color: "#555",
  },

  reorderButton: {
    paddingHorizontal: 12,
    backgroundColor: Colors.DEFAULT_GREEN,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  viewFeedbackButton: {
    paddingHorizontal: 8,
    backgroundColor: Colors.DEFAULT_GREY,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },

  feedbackButton: {
    paddingHorizontal: 8,
    backgroundColor: Colors.DEFAULT_YELLOW,
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

export default HistoryOrderCard;
