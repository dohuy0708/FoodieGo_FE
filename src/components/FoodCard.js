import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import Display from "../utils/Display";
import { Colors } from "../constants";

const FoodCard = ({ id, name, description, price, image, navigate }) => {
  //   const dispatch = useDispatch();
  //   const itemCount = useSelector(
  //     (state) =>
  //       state?.cartState?.cart?.cartItems?.find((item) => item?.foodId === id)
  //         ?.count
  //   );
  //   const addToCart = (foodId) => dispatch(CartAction.addToCart({ foodId }));
  //   const removeFromCart = (foodId) =>
  //     dispatch(CartAction.removeFromCart({ foodId }));

  const [itemCount, setItemCount] = useState(10);
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigate()} activeOpacity={0.8}>
        <Image
          style={styles.image}
          //   source={{
          //     uri: StaticImageService.getGalleryImage(
          //       image,
          //       ApiContants.STATIC_IMAGE.SIZE.SQUARE
          //     ),
          //   }}
          source={{
            uri: "https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/M6HASPARCZHYNN4XTUYT7H6PTE.jpg&w=800&h=600",
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
          <Text style={styles.priceText}> {price} VND</Text>
          <View style={styles.itemAddContainer}>
            {itemCount > 0 ? (
              <>
                <AntDesign
                  name="minus"
                  color={Colors.DEFAULT_YELLOW}
                  size={18}
                  onPress={() => removeFromCart(id)}
                />
                <Text style={styles.itemCountText}>{itemCount}</Text>
              </>
            ) : null}

            <AntDesign
              name="plus"
              color={Colors.DEFAULT_YELLOW}
              size={18}
              onPress={() => addToCart(id)}
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
