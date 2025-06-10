import React, { useEffect, useState, useContext } from "react";

import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  TouchableWithoutFeedback,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Separator from "../../components/Seporator";
import FoodCard from "../../components/FoodCard";
import { Colors } from "../../constants";
import Display from "../../utils/Display";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../../components";
import { useCart } from "../../context/CartContext";
import CartDetailPanel from "../../components/CartModal";
import CartPanelModal from "../../components/CartModal";
import CartModal from "../../components/CartModal";
import {
  fetchCategoriesByRestaurantId,
  fetchFoodsByCategoryId,
  findRestaurantById,
} from "../../services/restaurantService";
import CartPanel from "../../components/CartPanel";
import {
  createFavorite,
  getFavoriteByRestaurantId,
} from "../../services/favouriteService";
import { UserContext } from "../../context/UserContext";

const RestaurantScreen = ({ navigation, route }) => {
  const { restaurant } = route.params || {}; // Thêm fallback để tránh lỗi

  console.log("restaurant", restaurant);

  const { userInfo } = useContext(UserContext);
  const customerId = userInfo.id;

  const restaurantId = restaurant?.id; // Lấy restaurantId từ restaurant
  // <-- Đúng cú pháp
  const [isCartVisible, setCartVisible] = useState(false);
  const { getCartItems, clearCart, hasItems } = useCart();
  const [items, setItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalItems, setTotalItems] = useState(0); // Thêm state tổng số lượng món
  const [isLoadingFoods, setIsLoadingFoods] = useState(false); // 👈 Thêm state loading
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState({
    id: null,
    name: "",
  });
  const [listFoods, setListFoods] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [restaurantDetails, setRestaurant] = useState(restaurant); // Thêm state cho chi tiết nhà hàng
  // Thêm state tổng giá
  // kiểm tra nhà hàng đã được yêu thích chưa
  useEffect(() => {
    const checkFavorite = async () => {
      if (restaurantId && userInfo) {
        const favorite = await getFavoriteByRestaurantId(
          restaurantId,
          userInfo.id
        );
        setIsFavorite(!!favorite);
      }
    };
    checkFavorite();
  }, [restaurantId, userInfo]);
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
  const handleChat = () => {
    if (customerId) {
      console.log(restaurant);
      navigation.navigate("IndividualChatCustomer", {
        contactName: restaurant?.name,
        contactAvatar: restaurant?.avatar,
        userId: customerId.toString(),
        vendorId: restaurant?.id,
      });
    } else {
      navigation.navigate("LoginScreen");
    }
  };
  const toggleCartModal = () => {
    setCartVisible(!isCartVisible);
  };

  const handleNavigateToCart = () => {
    setCartVisible(false);
    // Điều hướng đến OrderConfirmScreen với restaurantId
    navigation.navigate("OrderConfirmScreen", {
      restaurant: restaurant,
      items: items,
      totalPrice: totalPrice,
      totalItems: totalItems,
    });
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategoriesByRestaurantId(restaurant.id);

        setCategories(data);

        // Gán category đầu tiên vào selectedCategory nếu có
        if (data.length > 0) {
          setSelectedCategory({ id: data[0].id, name: data[0].name });
        }
      } catch (error) {
        console.error("Failed to load categories", error);
      }
    };

    if (restaurant?.id) {
      loadCategories();
    }
  }, [restaurant]);

  // 🔁 Khi selectedCategory.id thay đổi thì fetch danh sách món ăn
  useEffect(() => {
    const loadFoods = async () => {
      setIsLoadingFoods(true); // 👈 Bắt đầu loading
      try {
        if (selectedCategory.id) {
          const foods = await fetchFoodsByCategoryId(selectedCategory.id);

          setListFoods(foods);
        }
      } catch (error) {
        console.error("Failed to load foods", error);
      } finally {
        setIsLoadingFoods(false); // 👈 Kết thúc loading
      }
    };

    loadFoods();
  }, [selectedCategory.id]);

  const addFavorite = async () => {
    try {
      console.log("userInfo", userInfo.id);
      console.log("restaurantId", restaurant.id);
      await createFavorite(restaurant.id, userInfo.id);
      setIsFavorite(true);
    } catch (error) {
      console.error("Failed to add favorite", error);
    }
  };

  const removeFavorite = () => {
    try {
      // Giả sử bạn có một hàm để xóa yêu thích, ví dụ:

      setIsFavorite(false); // Cập nhật trạng thái yêu thích
    } catch (error) {
      console.error("Failed to remove favorite", error);
    }
  };

  useEffect(() => {
    if (!restaurant && restaurantId) {
      const fetchRestaurantDetails = async () => {
        try {
          const restaurantDetails = await findRestaurantById(restaurantId);
          setRestaurant(restaurantDetails);
        } catch (error) {
          console.error("Error fetching restaurant details:", error);
        }
      };
      fetchRestaurantDetails();
    }
  }, [restaurantId, restaurant]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Image
          source={{
            uri:
              restaurant.avatar?.length > 0
                ? restaurant.avatar
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

        <Separator height={Display.setHeight(22)} />
        <View style={styles.mainContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{restaurant?.name}</Text>
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              color={Colors.DEFAULT_YELLOW}
              size={28}
              onPress={isFavorite ? removeFavorite : addFavorite}
            />
          </View>
          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.desText}>{restaurant?.description}</Text>
          </View>

          {/*Delivery */}
          <View style={styles.footerContainer}>
            <View style={styles.ratingReviewsContainer}>
              <FontAwesome
                name="star"
                size={18}
                color={Colors.DEFAULT_YELLOW}
              />
              <Text style={styles.ratingText}>
                {" "}
                {restaurant.averageRating > 0
                  ? restaurant.averageRating?.toFixed(1)
                  : "..."}
              </Text>
            </View>
            <View style={styles.rowAndCenter}>
              <View style={styles.timeAndDistanceContainer}>
                <Ionicons
                  name="location-outline"
                  color={Colors.DEFAULT_YELLOW}
                  size={15}
                />
                <Text style={styles.timeAndDistanceText}>
                  {" "}
                  {restaurant.distance?.toFixed(1)} km
                </Text>
              </View>
              <View style={styles.timeAndDistanceContainer}>
                <Ionicons
                  name="time-outline"
                  color={Colors.DEFAULT_YELLOW}
                  size={15}
                />
                <Text style={styles.timeAndDistanceText}>
                  {" "}
                  {Math.round(restaurant.distance * 1.5)} phút
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleChat}>
            <MaterialCommunityIcons name="chat" size={20} color="white" />
            <Text style={styles.buttonText}>Nhắn tin</Text>
          </TouchableOpacity>
        </View>
        <Separator height={Display.setHeight(1)} />

        <View style={styles.categoriesContainer}>
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "space-evenly",
              backgroundColor: Colors.DEFAULT_WHITE,
              borderRadius: 12,
            }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.CategoryContainer}
                onPress={() =>
                  setSelectedCategory({ id: item.id, name: item.name })
                }
              >
                <Text
                  style={
                    selectedCategory.name === item.name
                      ? styles.activeCategoryText
                      : styles.inActiveCategoryText
                  }
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
        {/* Food List */}
        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
          <View style={styles.foodList}>
            {isLoadingFoods ? (
              <ActivityIndicator size="large" color={Colors.DEFAULT_GREEN} />
            ) : (
              <>
                {listFoods.map((item) => (
                  <FoodCard
                    key={item?.id}
                    {...item}
                    restaurantId={restaurantId} // Thêm prop này
                    navigate={() =>
                      navigation.navigate("FoodScreen", {
                        food: item,
                        restaurantId: restaurantId,
                      })
                    }
                    navigateLogin={() => navigation.navigate("LoginScreen")}
                  />
                ))}
                <Separator height={Display.setHeight(2)} />
              </>
            )}
          </View>
        </ScrollView>
        {/* cart footer*/}
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
                <Text
                  style={{ fontSize: 24, color: "#000000", marginLeft: 10 }}
                >
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
              <View
                style={{ flex: 1, alignItems: "flex-end", marginRight: 10 }}
              >
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
                onPress={() => {
                  navigation.navigate("OrderConfirmScreen", {
                    restaurant: restaurant,
                    items: items,
                    totalPrice: totalPrice,
                    totalItems: totalItems,
                  });
                }}
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
      </View>

      {/* // cart model  */}
      <CartModal
        restaurantId={restaurantId}
        visible={isCartVisible}
        onClose={() => setCartVisible(false)}
        onNavigateToCart={handleNavigateToCart} // Thêm hàm này để điều hướng đến OrderConfirmScreen
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

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Màu mờ đen 40%
    zIndex: 1,
  },
  container: {
    flex: 1,
    position: "relative",
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
    fontSize: 20,
    fontWeight: "bold",
    lineHeight: 23 * 1.4,
    color: Colors.DEFAULT_BLACK,
  },
  descriptionContainer: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 10,
    marginHorizontal: 10,
    maxHeight: 55,
    overflow: "hidden",
  },

  desText: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.DEFAULT_GREY,
    textAlign: "justify",
  },
  ratingReviewsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 5,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 13,
    lineHeight: 13 * 1.4,
    color: Colors.DEFAULT_BLACK,
  },
  reviewsText: {
    marginLeft: 5,
    fontSize: 13,
    lineHeight: 13 * 1.4,
    color: Colors.DEFAULT_BLACK,
  },

  categoriesContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginHorizontal: 10,
    backgroundColor: Colors.DEFAULT_WHITE,
    borderRadius: 12,
    overflow: "hidden", // bắt buộc để bo góc có hiệu lực
    marginVertical: 5,
  },
  foodList: {
    marginHorizontal: 15,
  },
  CategoryContainer: {
    backgroundColor: Colors.DEFAULT_WHITE,
    paddingHorizontal: 10,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  activeCategoryText: {
    fontSize: 14,
    lineHeight: 13 * 1.4,
    fontWeight: "bold",
    color: Colors.DEFAULT_YELLOW,
  },
  inActiveCategoryText: {
    fontSize: 14,
    lineHeight: 13 * 1.4,
    color: Colors.DEFAULT_GREY,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 8,
    marginBottom: 5,
    marginTop: 10,
    marginLeft: 25,
  },
  rowAndCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeAndDistanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: Colors.LIGHT_YELLOW,
    borderRadius: 12,
    marginHorizontal: 3,
    marginRight: 10,
  },
  timeAndDistanceText: {
    fontSize: 12,
    lineHeight: 10 * 1.4,
    color: Colors.DEFAULT_GREY,
  },
  button: {
    backgroundColor: Colors.DEFAULT_YELLOW,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 10,
    marginTop: 10,
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  buttonText: {
    color: Colors.DEFAULT_WHITE,
    fontSize: 13,
  },
});

export default RestaurantScreen;
