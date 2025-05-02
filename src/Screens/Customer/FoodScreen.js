import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Separator from "../../components/Seporator";
import FoodCard from "../../components/FoodCard";
import { Colors } from "../../constants";
import Display from "../../utils/Display";
import { SafeAreaView } from "react-native-safe-area-context";
import ReviewItem from "../../components/ReviewItem";

const reviews = [
  {
    id: 1,
    username: "Huy Hoàng",
    userImageUri: "",
    rating: 5,
    content:
      "Nếu bạn là tín đồ của bún đậu mắm tôm, nhất định phải thử ngay quán này! Mọi thứ từ bún, đậu hủ, chả cốm đến thịt luộc đều tươi ngon, được chế biến vừa vặn.",
    reviewImage:
      "https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/M6HASPARCZHYNN4XTUYT7H6PTE.jpg&w=800&h=600",
    timestamp: "12/03/2025 20:12",
  },
  {
    id: 2,
    username: "Minh Anh",
    userImageUri: "",
    rating: 4,
    content:
      "Không gian quán sạch sẽ, phục vụ nhanh nhẹn. Bún đậu ngon, nước mắm pha vừa miệng. Điểm trừ nhỏ là hơi đông vào cuối tuần.",
    reviewImage: "",
    timestamp: "11/03/2025 19:00",
  },
  {
    id: 3,
    username: "Ngọc Trinh",
    userImageUri: "",
    rating: 5,
    content:
      "Lần nào đến đây cũng ăn no căng bụng! Giá cả hợp lý, đồ ăn nóng hổi và chất lượng ổn định.",
    reviewImage:
      "https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/M6HASPARCZHYNN4XTUYT7H6PTE.jpg&w=800&h=600",

    timestamp: "10/03/2025 17:45",
  },
];

const FoodScreen = ({ navigation }) => {
  const itemCount = 2;
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Food image */}
        <Image
          source={{
            uri: "https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/M6HASPARCZHYNN4XTUYT7H6PTE.jpg&w=800&h=600",
          }}
          style={styles.backgroundImage}
        />
        {/* Nút Back nằm ở góc trái trên của ảnh */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Separator height={Display.setHeight(23)} />
        {/* Food description */}
        <View style={styles.mainContainer}>
          {/* name  */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Cơm gà sốt bơ tỏi</Text>
          </View>
          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.desText}>Gà sốt bơ tỏi ngon tuyệt cú mèo</Text>
          </View>
          {/* Price */}
          <View style={styles.footerContainer}>
            <Text style={styles.priceText}> 35.000 VND</Text>
            <View style={styles.itemAddContainer}>
              {itemCount > 0 ? (
                <>
                  <AntDesign
                    name="minus"
                    color={Colors.DEFAULT_YELLOW}
                    size={18}
                    //onPress={() => removeFromCart(id)}
                  />
                  <Text style={styles.itemCountText}>{itemCount}</Text>
                </>
              ) : null}

              <AntDesign
                name="plus"
                color={Colors.DEFAULT_YELLOW}
                size={18}
                //  onPress={() => addToCart(id)}
              />
            </View>
          </View>
        </View>
        <ScrollView>
          <View style={styles.commentContainer}>
            <View style={styles.titleReviewContainer}>
              <Text style={styles.titleReview}>Bình luận</Text>
            </View>
            {/* Reviews */}
            {reviews.map((review, index) => (
              <View key={review.id}>
                <ReviewItem
                  username={review.username}
                  userImageUri={review.userImageUri}
                  rating={review.rating}
                  content={review.content}
                  reviewImage={review.reviewImage}
                  timestamp={review.timestamp}
                />
                {/* Divider trừ phần tử cuối cùng */}
                {index !== reviews.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    height: Display.setWidth(50),
    width: Display.setWidth(100),
  },
  backButton: {
    position: "absolute",
    top: 10, // hoặc dùng `Platform.OS === 'android' ? 30 : 40` để tránh overlap với notch
    left: 10,
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 2,
    borderRadius: 20,
    zIndex: 10,
  },

  mainContainer: {
    backgroundColor: Colors.DEFAULT_WHITE,
    borderRadius: 32,
    borderRadius: 32,
    paddingBottom: 10,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 25,
    marginTop: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    lineHeight: 23 * 1.4,
    color: Colors.DEFAULT_BLACK,
  },
  descriptionContainer: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 10,
    marginHorizontal: 10,
    maxHeight: 50,
    overflow: "hidden",
  },

  desText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.DEFAULT_GREY,
    textAlign: "justify",
  },
  priceText: {
    color: Colors.DEFAULT_YELLOW,
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 14 * 1.4,
  },
  footerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
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
  commentContainer: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 10,
    marginHorizontal: 2,
    paddingLeft: 20,
    paddingBottom: 50,
  },
  titleReviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  titleReview: {
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 23 * 1.4,
    color: Colors.DEFAULT_BLACK,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  username: {
    marginLeft: 8,
    fontWeight: "600",
    fontSize: 15,
  },

  starsRow: {
    flexDirection: "row",
    marginVertical: 6,
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
  divider: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 16,
  },
});
export default FoodScreen;
