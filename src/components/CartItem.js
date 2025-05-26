// components/CartItem.js
import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useCart } from "../context/CartContext";
import AntDesign from "react-native-vector-icons/AntDesign";
import { Colors } from "../constants";
const CartItem = ({ restaurantId, item }) => {
  const { addToCart, decreaseFromCart, getCartItems } = useCart();
  const [itemCount, setItemCount] = useState(item.quantity || 0);

  const handleAdd = () => {
    addToCart(restaurantId, {
      id: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      description: item.description,
    });
    setItemCount((prev) => prev + 1);
  };

  const handleRemove = () => {
    if (itemCount <= 0) return;
    decreaseFromCart(restaurantId, item.id);
    setItemCount((prev) => (prev > 0 ? prev - 1 : 0));
  };

  return (
    <View style={styles.item}>
      <Image
        source={{
          uri:
            item.imageUrl?.length > 0
              ? item.imageUrl
              : "https://file.hstatic.net/200000385717/article/fa57c14d-6733-4489-9953-df4a4760d147_1daf56255c344ad79439608b2ef80bd1.jpeg",
        }}
        style={styles.image}
      />
      <View style={{ flex: 1, paddingHorizontal: 10 }}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>{item.price.toLocaleString()}đ</Text>
      </View>
      <View style={styles.itemAddContainer}>
        {itemCount > 0 ? (
          <>
            <AntDesign
              name="minus"
              color={Colors.DEFAULT_YELLOW}
              size={18}
              onPress={handleRemove}
            />
            <Text style={styles.itemCountText}>{itemCount}</Text>
          </>
        ) : null}

        <AntDesign
          name="plus"
          color={Colors.DEFAULT_YELLOW}
          size={18}
          onPress={handleAdd}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    marginHorizontal: 2,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    elevation: 2,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  itemAddContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.LIGHT_GREY2,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 4,
  },
  itemPrice: {
    fontSize: 15,
    color: Colors.DEFAULT_YELLOW,
    marginTop: 4,
  },

  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  details: {
    flex: 1,
    marginLeft: 10,
  },
  quantity: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default CartItem;
