// CartModal.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Colors } from "../constants";
import CartItem from "./CartItem";
import { useCart } from "../context/CartContext";

export default function CartModal({
  restaurantId,
  visible,
  onClose,
  onNavigateToCart,
}) {
  const { getCartItems, clearCart, hasItems } = useCart();
  const [items, setItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalItems, setTotalItems] = useState(0); // Thêm state tổng số lượng món
  // Thêm state tổng giá

  useEffect(() => {
    if (restaurantId) {
      const cartItems = getCartItems(restaurantId);

      setItems(cartItems);
    }
  }, [restaurantId, visible, getCartItems]);
  // Tính tổng tiền mỗi khi items thay đổi
  useEffect(() => {
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    setTotalItems(totalQuantity);
    setTotalPrice(total);
  }, [items]);
  useEffect(() => {
    if (visible && items.length === 0) {
      onClose();
    }
  }, [items, visible]);
  // const total = items.reduce(
  //   (sum, item) => sum + item.price * item.quantity,
  //   0
  // );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => clearCart(restaurantId)}>
              <Text style={styles.clearText}>Xóa tất cả</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Giỏ hàng</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CartItem item={item} restaurantId={restaurantId} />
            )}
          />

          <TouchableOpacity style={styles.footer} onPress={onNavigateToCart}>
            <Text style={styles.checkoutText}>
              Giao hàng ({totalItems}) - {totalPrice.toLocaleString()} đ
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    justifyContent: "flex-end", // Đẩy modal xuống dưới cùng
    alignItems: "center",
    height: "100%",
    backgroundColor: "rgba(87, 87, 87, 0.7)",
  },
  container: {
    backgroundColor: "#fff",
    width: "100%",
    height: "70%",
    padding: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
    position: "absolute", // Đảm bảo modal nằm ở dưới cùng
    bottom: 0, // Gắn modal vào đáy màn hình
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  clearText: { color: "red" },
  title: { fontSize: 20, fontWeight: "bold", marginRight: 20 },
  item: {
    flexDirection: "row",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    marginVertical: 5,
    elevation: 2,
    alignItems: "center",
  },
  image: { width: 60, height: 60, borderRadius: 10 },
  details: { flex: 1, marginLeft: 10 },
  quantity: { flexDirection: "row", alignItems: "center" },
  footer: {
    marginTop: 10,
    backgroundColor: Colors.DEFAULT_GREEN, // Màu xanh mòng két (LightSeaGreen)
    paddingVertical: 10,
    borderRadius: 10, // Bo góc nhiều cho nút
  },
  checkoutText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
});
