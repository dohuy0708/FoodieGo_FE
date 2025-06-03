import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../context/CartContext"; // cập nhật đường dẫn nếu cần
import Colors from "../constants/Colors"; // cập nhật nếu bạn có file định nghĩa màu

const CartPanel = ({ restaurantId }) => {
  const navigation = useNavigation();
  const { getCartItems } = useCart();

  const cartItems = getCartItems(restaurantId);
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.quantity * item.price,
    0
  );

  if (itemCount === 0) return null; // Không hiển thị panel nếu không có món

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        backgroundColor: "#f8f8f8",
        borderTopWidth: 1,
        borderColor: "#ddd",
        // Đã bỏ đổ bóng phía dưới
      }}
    >
      {/* Icon giỏ hàng */}
      <View style={{ position: "relative" }}>
        <Text style={{ fontSize: 24, color: "#000000", marginLeft: 10 }}>
          🛒
        </Text>
        <View
          style={{
            position: "absolute",
            top: -5,
            right: -8,
            backgroundColor: "red",
            borderRadius: 10,
            width: 20,
            height: 20,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 12, fontWeight: "bold" }}>
            {itemCount}
          </Text>
        </View>
      </View>

      {/* Giá tiền */}
      <View style={{ flex: 1, alignItems: "flex-end", marginRight: 10 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "bold",
            color: Colors.DEFAULT_YELLOW,
          }}
        >
          {totalPrice.toLocaleString("vi-VN")} đ
        </Text>
      </View>

      {/* Nút Giao hàng */}
      <TouchableOpacity
        style={{
          marginRight: 10,
          backgroundColor: Colors.DEFAULT_GREEN,
          paddingVertical: 8,
          paddingHorizontal: 10,
          borderRadius: 5,
        }}
        onPress={() => navigation.navigate("OrderConfirmScreen")}
      >
        <Text style={{ color: "white", fontSize: 14, fontWeight: "bold" }}>
          Giao hàng
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CartPanel;
