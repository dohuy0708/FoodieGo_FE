import React, { use, useContext, useEffect, useState } from "react";
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
import { useCart } from "../../context/CartContext";
import CartModal from "../../components/CartModal";
import { useTheme } from "react-native-elements";
import { UserContext } from "../../context/UserContext";
import ConfirmModal from "../../components/ConfirmModal";
import { getReviewsByRestaurant } from "../../services/reviewService";

const FoodScreen = ({ navigation, route }) => {
  const { userInfo } = useContext(UserContext);
  const { food, restaurantId } = route.params; // lấy restaurantId ở đây
  const { getCartItems, addToCart, hasItems, decreaseFromCart } = useCart();
  const [items, setItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isCartVisible, setCartVisible] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [reviewList, setReviewList] = useState();
  useEffect(() => {
    if (restaurantId) {
      const fetchReviews = async () => {
        try {
          const reviews = await getReviewsByRestaurant(restaurantId);
          setReviewList(reviews);
        } catch (error) {
          console.error("Failed to fetch reviews:", error);
        }
      };
      fetchReviews();
    }
  }, [restaurantId]);
  useEffect(() => {
    if (restaurantId) {
      const cartItems = getCartItems(restaurantId);
      setItems(cartItems);
    }
  }, [restaurantId, getCartItems]);
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
    const cartItems = getCartItems(restaurantId);
    const existingItem = cartItems.find((item) => food.id === item.id);
    setItemCount(existingItem ? existingItem.quantity : 0);
  }, [getCartItems, restaurantId, food.id]);

  const handleAdd = () => {
    if (!userInfo) {
      setShowLoginModal(true);
      return;
    }
    addToCart(restaurantId, {
      id: food.id,
      name: food.name,
      price: food.price,
      imageUrl: food.imageUrl,
      description: food.description,
    });
    setItemCount((prev) => prev + 1);
  };

  const handleRemove = () => {
    if (itemCount <= 0) return;
    decreaseFromCart(restaurantId, food.id);
    setItemCount((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const toggleCartModal = () => {
    setCartVisible(!isCartVisible);
  };

  return (
    <SafeAreaView style={{ flex: 1, position: "relative" }}>
      <ScrollView>
        <View style={styles.container}>
          {/* Food image */}
          <Image
            source={{
              uri:
                food.imageUrl?.length > 0
                  ? food.imageUrl
                  : "https://file.hstatic.net/200000385717/article/fa57c14d-6733-4489-9953-df4a4760d147_1daf56255c344ad79439608b2ef80bd1.jpeg",
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

          {/* Food descrip
          tion */}
          <View style={styles.mainContainer}>
            {/* name  */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{food.name}</Text>
            </View>
            {/* Description */}
            <View style={styles.descriptionContainer}>
              <Text style={styles.desText}>
                {food.description?.length > 50
                  ? food.description.substring(0, 50) + "..."
                  : food.description}
              </Text>
            </View>
            {/* Price */}
            <View style={styles.footerContainer}>
              <Text style={styles.priceText}>
                {" "}
                {new Intl.NumberFormat("vi-VN").format(food.price)} VND
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

          <View style={styles.commentContainer}>
            <View style={styles.titleReviewContainer}>
              <Text style={styles.titleReview}>Bình luận</Text>
            </View>
            {/* Reviews */}
            {reviewList.map((review, index) => (
              <View key={review.id}>
                <ReviewItem
                  username={review.username}
                  userImageUri={review.userImageUri}
                  rating={review.rating}
                  content={review.content}
                  reviewImage={review.reviewImage}
                />
                {/* Divider trừ phần tử cuối cùng */}
                {index !== reviews.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {hasItems(restaurantId) && (
        <View style={styles.cartPanelWrapper}>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 10,
              backgroundColor: "#f8f8f8",
              borderTopWidth: 1,
              borderColor: "#ddd",
            }}
            onPress={toggleCartModal} // Mở modal giỏ hàng khi nhấn
          >
            {/* Icon giỏ hàng */}
            <View style={{ position: "relative" }}>
              <Text style={{ fontSize: 24, color: "#000000", marginLeft: 10 }}>
                🛒
              </Text>
              <View
                style={{
                  position: "absolute",
                  top: -5,
                  right: -8,
                  backgroundColor: "red",
                  borderRadius: 10,
                  width: 20,
                  height: 20,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "white", fontSize: 12, fontWeight: "bold" }}
                >
                  {totalItems}
                </Text>
              </View>
            </View>

            {/* Giá tiền */}
            <View style={{ flex: 1, alignItems: "flex-end", marginRight: 10 }}>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "bold",
                  color: Colors.DEFAULT_YELLOW,
                }}
              >
                {totalPrice.toLocaleString("vi-VN")} đ
              </Text>
            </View>

            {/* Nút Giao hàng */}
            <TouchableOpacity
              style={{
                marginRight: 10,
                backgroundColor: Colors.DEFAULT_GREEN,
                paddingVertical: 8,
                paddingHorizontal: 10,
                borderRadius: 5,
              }}
              onPress={() => navigation.navigate("OrderConfirmScreen")}
            >
              <Text
                style={{ color: "white", fontSize: 14, fontWeight: "bold" }}
              >
                Giao hàng ({totalItems})
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      )}
      <CartModal
        restaurantId={restaurantId}
        visible={isCartVisible}
        onClose={() => setCartVisible(false)}
      />
      <ConfirmModal
        visible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onAction={() => navigation.navigate("LoginScreen")}
        info={"Bạn cần đăng nhập để thêm món vào giỏ hàng."}
        actionText={"Đăng nhập"}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cartPanelWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    zIndex: 100,
  },
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
