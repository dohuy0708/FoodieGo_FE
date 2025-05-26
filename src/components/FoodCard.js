import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import Display from "../utils/Display";
import { Colors } from "../constants";
import { useCart } from "../context/CartContext";

const FoodCard = ({
  restaurantId,
  id,
  name,
  description,
  price,
  imageUrl,
  navigate,
}) => {
  const { addToCart, decreaseFromCart, getCartItems } = useCart();

  const [itemCount, setItemCount] = useState(0);

  // Khi component mount, lấy số lượng món hiện tại trong giỏ để sync
  useEffect(() => {
    const cartItems = getCartItems(restaurantId);
    const existingItem = cartItems.find((i) => i.id === id);
    setItemCount(existingItem ? existingItem.quantity : 0);
  }, [getCartItems, restaurantId, id]);
  const handleAdd = () => {
    addToCart(restaurantId, { id, name, price, imageUrl, description });
    setItemCount((prev) => prev + 1);
  };

  const handleRemove = () => {
    if (itemCount <= 0) return;
    decreaseFromCart(restaurantId, id);
    setItemCount((prev) => (prev > 0 ? prev - 1 : 0));
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigate()} activeOpacity={0.8}>
        <Image
          style={styles.image}
          source={{
            uri:
              imageUrl?.length > 0
                ? imageUrl
                : "https://file.hstatic.net/200000385717/article/fa57c14d-6733-4489-9953-df4a4760d147_1daf56255c344ad79439608b2ef80bd1.jpeg",
          }}
        />
      </TouchableOpacity>
      <View style={styles.detailsContainer}>
        <TouchableOpacity onPress={() => navigate()} activeOpacity={0.8}>
          <Text numberOfLines={1} style={styles.titleText}>
            {name}
          </Text>
          <Text numberOfLines={2} style={styles.descriptionText}>
            {description}
          </Text>
        </TouchableOpacity>
        <View style={styles.footerContainer}>
          <Text style={styles.priceText}>
            {" "}
            {new Intl.NumberFormat("vi-VN").format(price)} VND
          </Text>
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    marginVertical: 5,
    alignItems: "center",
    borderRadius: 10,
    elevation: 2,
    backgroundColor: Colors.DEFAULT_WHITE,
  },
  image: {
    height: 100,
    width: 100,
    margin: 6,
    borderRadius: 8,
  },
  detailsContainer: {
    marginHorizontal: 5,
  },
  titleText: {
    width: Display.setWidth(60),
    color: Colors.DEFAULT_BLACK,
    fontSize: 15,
    lineHeight: 13 * 1.4,
    marginBottom: 8,
  },
  descriptionText: {
    width: Display.setWidth(60),
    color: Colors.DEFAULT_GREY,
    fontSize: 13,
    lineHeight: 10 * 1.4,
    marginBottom: 8,
  },
  priceText: {
    color: Colors.DEFAULT_YELLOW,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 14 * 1.4,
  },
  footerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 5,
  },
  itemAddContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.LIGHT_GREY2,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  itemCountText: {
    color: Colors.DEFAULT_BLACK,
    fontSize: 14,
    lineHeight: 14 * 1.4,
    marginHorizontal: 8,
  },
});

export default FoodCard;
