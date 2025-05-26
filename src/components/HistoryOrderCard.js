import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants";
import { color } from "react-native-elements/dist/helpers";
const HistoryOrderCard = ({
  id,
  storeName,
  firstFood,
  firstFoodImg,
  itemCount,
  totalItem,
  totalPrice,
  isFeedback,
  navigate,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={() => navigate(id)}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons style={styles.icon} name="storefront-outline" size={22} />
          <Text style={styles.storeName}>{storeName}</Text>
        </View>
        <Text style={styles.statusTag}>Hoàn thành</Text>
      </View>

      <View style={styles.itemDetails}>
        <Image
          source={{
            uri: "https://file.hstatic.net/200000385717/article/fa57c14d-6733-4489-9953-df4a4760d147_1daf56255c344ad79439608b2ef80bd1.jpeg",
          }}
          style={styles.foodImage}
        />
        <Text style={styles.itemCount}>
          {itemCount}x {firstFood}
        </Text>
      </View>

      <View style={styles.total}>
        <Text style={styles.totalText}>Tổng thanh toán ({totalItem} món)</Text>
        <Text style={styles.price}>{totalPrice} đ</Text>
      </View>

      <View style={styles.statusContainer}>
        {isFeedback == true && (
          <TouchableOpacity
            style={styles.feedbackButton}
            onPress={() => navigate("FeedbackScreen", { orderId: id })}
          >
            <Text style={styles.buttonText}>Đánh giá</Text>
          </TouchableOpacity>
        )}

        {isFeedback == false && (
          <TouchableOpacity style={styles.viewFeedbackButton}>
            <Text style={styles.buttonText}>Xem đánh giá</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.reorderButton}>
          <Text style={styles.buttonText}>Đặt lại</Text>
        </TouchableOpacity>
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
