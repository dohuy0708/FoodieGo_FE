import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

import FontAwesome from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Colors } from "../constants";
// import { StaticImageService } from "../services";
// import { useDispatch, useSelector } from "react-redux";
// import { BookmarkAction } from "../actions";

const FavoriteCard = ({ id, restaurant, navigate }) => {
  // const addBookmark = () =>
  //   dispatch(BookmarkAction.addBookmark({ restaurantId: id }));
  // const removeBookmark = () =>
  //   dispatch(BookmarkAction.removeBookmark({ restaurantId: id }));
  console.log("RestaurantCard", restaurant);
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.8}
      onPress={() => navigate(id)}
    >
      {/* ICON bookmark ở góc trên phải */}
      <TouchableOpacity style={styles.heart}>
        <Ionicons name={"heart"} color={Colors.SECONDARY_RED} size={28} />
      </TouchableOpacity>
      <Image
        source={{
          uri:
            restaurant?.avatar?.length > 0
              ? restaurant.avatar
              : "https://file.hstatic.net/200000385717/article/fa57c14d-6733-4489-9953-df4a4760d147_1daf56255c344ad79439608b2ef80bd1.jpeg",
        }}
        style={styles.posterStyle}
      />
      {/* Description*/}
      <View style={styles.descriptionContainer}>
        <Text style={styles.titleText}>{restaurant?.name}</Text>
        <Text style={styles.desText}>{restaurant?.description}</Text>
        {/* <Text style={styles.tagText}>{tags?.join(" • ")}</Text> */}
        <View style={styles.footerContainer}>
          <View style={styles.rowAndCenter}>
            <FontAwesome name="star" size={14} color={Colors.DEFAULT_YELLOW} />
            <Text style={styles.ratingText}>4</Text>
            <Text style={styles.reviewsText}>({10})</Text>
          </View>
          <View style={styles.rowAndCenter}>
            <View style={styles.timeAndDistanceContainer}>
              <Ionicons name="location-outline" color={"#yellow"} size={15} />
              <Text style={styles.timeAndDistanceText}>
                {" "}
                {/* {distance?.toFixed(1)} km */}
                20km
              </Text>
            </View>
            <View style={styles.timeAndDistanceContainer}>
              <Ionicons name="time-outline" color="Blue" size={15} />
              <Text style={styles.timeAndDistanceText}>
                {" "}
                {/* {Math.round(distance?.toFixed(1) * 1.5)} phút */}
                15 phút
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "flex-start",
    backgroundColor: Colors.DEFAULT_WHITE,
    borderRadius: 10,
    elevation: 3,
    marginBottom: 5,
    marginTop: 5,
    marginHorizontal: 10,
    padding: 2,
  },
  heart: {
    position: "absolute",
    top: 2,
    right: 4,
    zIndex: 10,
    backgroundColor: Colors.DEFAULT_WHITE,
    borderRadius: 20,
    padding: 4,
  },
  posterStyle: {
    width: 700 * 0.15,
    height: 700 * 0.15,
    borderRadius: 10,
    margin: 5,
  },
  descriptionContainer: {
    flex: 1, // Cho phép chiếm phần còn lại
    justifyContent: "space-between",
  },
  titleText: {
    marginTop: 10,
    marginLeft: 8,
    fontSize: 16,
    lineHeight: 15 * 1.4,
    color: Colors.DEFAULT_BLACK,
  },
  desText: {
    marginLeft: 8,
    fontSize: 12,
    lineHeight: 11 * 1.4,
    color: Colors.DEFAULT_GREY,
    marginBottom: 5,
  },
  footerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
    marginBottom: 15,
    justifyContent: "space-between",
  },
  rowAndCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeAndDistanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    paddingVertical: 3,
    backgroundColor: Colors.LIGHT_YELLOW,
    borderRadius: 12,
    marginHorizontal: 3,
  },
  timeAndDistanceText: {
    fontSize: 10,
    lineHeight: 10 * 1.4,
    color: Colors.DEFAULT_YELLOW,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 10,
    lineHeight: 10 * 1.4,
    color: Colors.DEFAULT_BLACK,
  },
  reviewsText: {
    fontSize: 10,
    lineHeight: 10 * 1.4,
    color: Colors.DEFAULT_BLACK,
  },
  bookmark: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
});

export default FavoriteCard;
