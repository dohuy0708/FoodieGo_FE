import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const ReviewItem = ({
  username,
  userImageUri,
  rating,
  content,
  reviewImage,
  timestamp,
}) => {
  return (
    <View style={styles.reviewContainer}>
      <View style={styles.userRow}>
        <Ionicons name="person-circle-outline" size={24} />
        <Text style={styles.username}>{username}</Text>
      </View>
      <View style={styles.reviewContent}>
        <View style={styles.starsRow}>
          {[...Array(rating)].map((_, index) => (
            <Ionicons key={index} name="star" size={18} color="#FFD700" />
          ))}
        </View>

        <Text style={styles.commentText}>{content}</Text>

        {reviewImage && (
          <Image source={{ uri: reviewImage }} style={styles.imageReview} />
        )}

        <Text style={styles.timestamp}>{timestamp}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  reviewContainer: {},
  userRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  username: {
    marginLeft: 8,
    fontWeight: "600",
    fontSize: 15,
  },
  reviewContent: {
    paddingLeft: 30,
  },

  starsRow: {
    flexDirection: "row",
  },
  commentText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  imageReview: {
    width: 100,
    height: 100,
    marginTop: 10,
    borderRadius: 8,
  },
  timestamp: {
    color: "#888",
    fontSize: 12,
    marginTop: 6,
  },
});

export default ReviewItem;
