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
  images: { poster },
  tags,
  distance,
  time,
  navigate,
}) => {
  // const dispatch = useDispatch();
  // const isBookmarked = useSelector(
  //   (state) =>
  //     state?.bookmarkState?.bookmarks?.filter(
  //       (item) => item?.restaurantId === id
  //     )?.length > 0
  // );
  // const addBookmark = () =>
  //   dispatch(BookmarkAction.addBookmark({ restaurantId: id }));
  // const removeBookmark = () =>
  //   dispatch(BookmarkAction.removeBookmark({ restaurantId: id }));
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.8}
      onPress={() => navigate(id)}
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
          uri: "https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/M6HASPARCZHYNN4XTUYT7H6PTE.jpg&w=800&h=600",
        }} // Replace with your image URL}}
        style={styles.posterStyle}
      />
      <Text style={styles.titleText}>{name}</Text>
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
            <Text style={styles.timeAndDistanceText}>2.7km</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: Colors.DEFAULT_WHITE,
    borderRadius: 10,
    elevation: 3,
    marginBottom: 5,
  },
  posterStyle: {
    width: 800 * 0.15,
    height: 700 * 0.15,
    borderRadius: 10,
    margin: 5,
  },
  titleText: {
    marginLeft: 8,
    fontSize: 15,
    lineHeight: 15 * 1.4,
    color: Colors.DEFAULT_BLACK,
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

export default RestaurantCard;
