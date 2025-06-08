import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

import FontAwesome from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Colors } from "../constants";
// import { StaticImageService } from "../services";
// import { useDispatch, useSelector } from "react-redux";
// import { BookmarkAction } from "../actions";

const RestaurantCard = ({
  id,
  name,
  avatar,
  description,
  tags,
  distance,
  time,
  navigate,
  averageRating,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.8}
      onPress={() => {
        const restaurant = {
          id,
          name,
          avatar,
          tags,
          distance,
          description,
          time,
        };

        navigate(restaurant);
      }}
    >
      {/* <Ionicons
        // name={isBookmarked ? "bookmark" : "bookmark-outline"}
        name="heart-outline"
        size={24}
        style={styles.bookmark}
        //  onPress={() => (isBookmarked ? removeBookmark() : addBookmark())}
      /> */}
      <Image
        // source={{ uri: StaticImageService.getPoster(poster) }}
        source={{
          uri:
            avatar?.length > 0
              ? avatar
              : "https://file.hstatic.net/200000385717/article/fa57c14d-6733-4489-9953-df4a4760d147_1daf56255c344ad79439608b2ef80bd1.jpeg",
        }}
        style={styles.posterStyle}
      />
      <Text style={styles.titleText} numberOfLines={1} ellipsizeMode="tail">
        {name}
      </Text>
      {/* <Text style={styles.tagText}>{tags?.join(" • ")}</Text> */}
      <View style={styles.footerContainer}>
        <View style={styles.rowAndCenter}>
          <FontAwesome name="star" size={14} color={Colors.DEFAULT_YELLOW} />
          <Text style={styles.ratingText}>{averageRating?.toFixed(1)}</Text>
        </View>
        <View style={styles.rowAndCenter}>
          <View style={styles.timeAndDistanceContainer}>
            <Ionicons name="location-outline" color={"#yellow"} size={12} />
            <Text style={styles.timeAndDistanceText}>
              {" "}
              {distance?.toFixed(1)} km
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 120, // hoặc 180, tùy bạn
    height: 175,
    justifyContent: "flex-start",
    backgroundColor: Colors.DEFAULT_WHITE,
    borderRadius: 10,
    elevation: 3,
    marginBottom: 5,
    marginHorizontal: 5,
  },
  posterStyle: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  titleText: {
    marginHorizontal: 8,
    marginTop: 6,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.DEFAULT_BLACK,
    numberOfLines: 1, // thuộc tính JSX, không CSS
    ellipsizeMode: "tail",
  },
  tagText: {
    marginLeft: 8,
    fontSize: 11,
    lineHeight: 11 * 1.4,
    color: Colors.DEFAULT_GREY,
    marginBottom: 5,
  },
  footerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
    marginTop: 5,
    marginBottom: 6,
    justifyContent: "space-between",
  },
  rowAndCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeAndDistanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 3,
    paddingVertical: 1,
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

export default RestaurantCard;
