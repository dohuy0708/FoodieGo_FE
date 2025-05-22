// CartModal.js
import React, { useState } from "react";
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

export default function CartModal({ visible, onClose }) {
  const [items, setItems] = useState([
    {
      id: "1",
      name: "Bún đậu đặc biệt (1 người)",
      price: 47000,
      quantity: 1,
      image: "https://example.com/bundau1.jpg",
    },
    {
      id: "2",
      name: "Bún đậu đặc biệt (3 người)",
      price: 143000,
      quantity: 1,
      image: "https://example.com/bundau3.jpg",
    },
  ]);

  const increase = (id) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decrease = (id) => {
    setItems(
      items.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

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
            <TouchableOpacity>
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
              <View style={styles.item}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <View style={styles.details}>
                  <Text>{item.name}</Text>
                  <Text style={{ color: "#FF9900" }}>
                    {item.price.toLocaleString()} đ
                  </Text>
                </View>
                <View style={styles.quantity}>
                  <TouchableOpacity onPress={() => decrease(item.id)}>
                    <Icon name="remove-circle-outline" size={22} />
                  </TouchableOpacity>
                  <Text style={{ marginHorizontal: 10 }}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => increase(item.id)}>
                    <Icon name="add-circle-outline" size={22} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          <TouchableOpacity
            style={styles.footer}
            onPress={() => console.log("Nút Giao hàng được nhấn!")}
          >
            <Text style={styles.checkoutText}>Giao hàng</Text>
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
    height: "80%",
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
  },
  clearText: { color: "red" },
  title: { fontSize: 20, fontWeight: "bold" },
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
