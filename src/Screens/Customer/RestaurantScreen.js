import React, { useEffect, useState } from "react";
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
} from "react-native";

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

const mockRestaurant = {
  id: 1,
  name: "Bún Chả Hương Liên",
  time: 30, // delivery time in minutes
  distance: 2500, // distance in meters
  rating: 4.5,
  reviews: 120,
  description:
    "Bún chả Hương Liên là một trong những quán ăn nổi tiếng nhất tại Hà Nội, nổi bật với món bún chả truyền thống.",
  categories: [
    "Món chính",
    "Đồ uống",
    "Tráng miệng",
    "Đồ ăn vặt",
    "Đồ ăn nhanh",
  ],
  foods: [
    {
      id: 101,
      name: "Bún Chả",
      description: "Thịt nướng ăn kèm bún và nước chấm",
      price: 45000,
      image:
        "https://cdn.tgdd.vn/Files/2021/08/29/1380247/bun-cha-la-gi-cach-an-bun-cha-dung-chuan-ha-noi-202201131431012299.jpg",
      category: "Món chính",
    },
    {
      id: 102,
      name: "Nem cua bể",
      description: "Nem chiên giòn nhân cua bể",
      price: 30000,
      image:
        "https://cdn.tgdd.vn/Files/2021/06/24/1363673/cach-lam-nem-cua-be-gion-ngon-chuan-vi-hai-phong-202107191107490948.jpg",
      category: "Món chính",
    },
    {
      id: 201,
      name: "Trà đá",
      description: "Giải khát mát lạnh",
      price: 5000,
      image:
        "https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2022/9/12/1088945/Tradanh.JPG",
      category: "Đồ uống",
    },
    {
      id: 301,
      name: "Chè đậu xanh",
      description: "Chè đậu xanh nấu với nước cốt dừa",
      price: 15000,
      image:
        "https://cdn.tgdd.vn/Files/2021/09/18/1386084/cach-nau-che-dau-xanh-cot-dua-ngon-don-gian-tai-nha-202201131520562309.jpg",
      category: "Tráng miệng",
    },
  ],
  images: {
    cover:
      "https://media-cdn.tripadvisor.com/media/photo-s/18/f1/41/f8/bun-cha-huong-lien.jpg",
  },
};

const RestaurantScreen = ({
  navigation,
  route: {
    params: { restaurantId },
  },
}) => {
  const [isCartVisible, setCartVisible] = useState(false);

  const toggleCartModal = () => {
    setCartVisible(!isCartVisible);
  };

  //  old
  const [restaurant, setRestaurant] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  //const [isBookmarked, setIsBookmarked] = useState(false);
  useEffect(() => {
    setSelectedCategory(mockRestaurant.categories[0]);
    setRestaurant(mockRestaurant);
  }, []);
  // useEffect(() => {
  //   RestaurantService.getOneRestaurantById(restaurantId).then((response) => {
  //     setSelectedCategory(response?.data?.categories[0]);
  //     setRestaurant(response?.data);
  //   });
  // }, []);

  // const isBookmarked = useSelector(
  //   (state) =>
  //     state?.bookmarkState?.bookmarks?.filter(
  //       (item) => item?.restaurantId === restaurantId
  //     )?.length > 0
  // );
  // const addBookmark = () =>
  //   dispatch(BookmarkAction.addBookmark({ restaurantId }));
  // const removeBookmark = () =>
  //   dispatch(BookmarkAction.removeBookmark({ restaurantId }));

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Image
          // source={{
          //   uri: StaticImageService.getGalleryImage(
          //     restaurant?.images?.cover,
          //     ApiContants.STATIC_IMAGE.SIZE.SQUARE
          //   ),
          // }}
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
        <ScrollView>
          <Separator height={Display.setHeight(22)} />
          <View style={styles.mainContainer}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{restaurant?.name}</Text>
              <Ionicons
                name={"heart-outline"}
                color={Colors.DEFAULT_YELLOW}
                size={28}
                onPress={() =>
                  isBookmarked ? removeBookmark() : addBookmark()
                }
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
                <Text style={styles.ratingText}>4.2</Text>
                <Text style={styles.reviewsText}>(455 Reviews)</Text>
              </View>
              <View style={styles.rowAndCenter}>
                <View style={styles.timeAndDistanceContainer}>
                  <Ionicons
                    name="location-outline"
                    color={Colors.DEFAULT_YELLOW}
                    size={15}
                  />
                  <Text style={styles.timeAndDistanceText}> 2.7km</Text>
                </View>
                <View style={styles.timeAndDistanceContainer}>
                  <Ionicons
                    name="time-outline"
                    color={Colors.DEFAULT_YELLOW}
                    size={15}
                  />
                  <Text style={styles.timeAndDistanceText}> 12phut</Text>
                </View>
              </View>
            </View>
          </View>
          <Separator height={Display.setHeight(1)} />
          <View style={styles.categoriesContainer}>
            <FlatList
              data={restaurant?.categories}
              keyExtractor={(item) => item}
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
                  onPress={() => setSelectedCategory(item)}
                >
                  <Text
                    style={
                      selectedCategory === item
                        ? styles.activeCategoryText
                        : styles.inActiveCategoryText
                    }
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
          {/* food list */}
          <View style={styles.foodList}>
            {restaurant?.foods
              ?.filter((food) => food?.category === selectedCategory)
              ?.map((item) => (
                <FoodCard
                  key={item?.id}
                  {...item}
                  navigate={() =>
                    navigation.navigate("FoodScreen", { foodId: item?.id })
                  }
                />
              ))}
            <Separator height={Display.setHeight(2)} />
          </View>
        </ScrollView>
        {/* {hasItems(restaurantId) && ( */}
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 5,
            paddingVertical: 5,
            backgroundColor: "#f9f9f9", // Màu nền hơi xám trắng
            // Thêm một chút bóng mờ (elevation cho Android, shadow cho iOS)
            borderTopColor: "#e0e0e0",
            borderTopWidth: 0.5,
          }}
          onPress={toggleCartModal}
        >
          {/* Phần giỏ hàng */}
          <View style={{ position: "relative" }}>
            <Text style={{ fontSize: 24, color: "#000000", marginLeft: 10 }}>
              🛒
            </Text>
            {/* <Icon name="cart-outline" size={32} color="#000000" /> */}
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
                5
              </Text>
            </View>
          </View>

          {/* Phần giá tiền */}
          <View style={{ flex: 1, alignItems: "flex-end", marginRight: 10 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: Colors.DEFAULT_YELLOW,
              }}
            >
              314.000 đ
            </Text>
          </View>

          {/* Phần nút Giao hàng */}
          <TouchableOpacity
            style={{
              marginRight: 10,
              backgroundColor: Colors.DEFAULT_GREEN, // Màu xanh mòng két (LightSeaGreen)
              paddingVertical: 8,
              paddingHorizontal: 10,
              borderRadius: 5, // Bo góc nhiều cho nút
            }}
            onPress={() => {
              // Xử lý sự kiện khi nhấn nút Giao hàng
              navigation.navigate("OrderConfirmScreen");
            }}
          >
            <Text style={{ color: "white", fontSize: 14, fontWeight: "bold" }}>
              Giao hàng
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
        {}
        {/*CartPanelModel */}
      </View>
      <CartModal
        visible={isCartVisible}
        onClose={() => setCartVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    maxHeight: 50,
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
});

export default RestaurantScreen;
