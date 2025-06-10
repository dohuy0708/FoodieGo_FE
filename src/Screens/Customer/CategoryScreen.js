import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../../components";
import RestaurantMediumCard from "../../components/RestaurantMediumCard";
import FavoriteCard from "../../components/FavouriteCard";
import { Colors } from "../../constants";
import { use } from "react";
import {
  findRestaurantsByCategory,
  searchMostOrderedRestaurants,
  searchTopRatedRestaurants,
} from "../../services/restaurantService";
// const restaurants = [
//   {
//     id: "1",
//     name: "Pizza Palace",
//     images: {
//       poster: "https://example.com/images/pizza.jpg",
//     },
//     tags: ["Pizza", "Italian"],
//     distance: "1.2 km",
//     time: "25-30 min",
//   },
//   {
//     id: "2",
//     name: "Sushi World",
//     images: {
//       poster: "https://example.com/images/sushi.jpg",
//     },
//     tags: ["Sushi", "Japanese"],
//     distance: "2.5 km",
//     time: "30-40 min",
//   },
//   {
//     id: "3",
//     name: "Burger Town",
//     images: {
//       poster: "https://example.com/images/burger.jpg",
//     },
//     tags: ["Burger", "Fast Food"],
//     distance: "0.9 km",
//     time: "20-25 min",
//   },
// ];

const CategoryScreen = ({ navigation, route }) => {
  const { categoryName } = route.params;
  const [activeSortItem, setActiveSortItem] = useState("Mới nhất");
  const [restaurants, setRestaurants] = useState(restaurants);
  const [isLoading, setIsLoading] = useState(false);
  const sortStyle = (isActive) =>
    isActive
      ? {
          ...styles.sortListItem,
          borderBottomColor: Colors.DEFAULT_GREEN, // màu gạch chân khi active
        }
      : {
          ...styles.sortListItem,
          borderBottomColor: Colors.DEFAULT_WHITE, // ẩn khi không active
        };

  const textColorStyle = (isActive) => ({
    ...styles.sortListItemText,
    color: isActive ? Colors.DEFAULT_GREEN : Colors.DEFAULT_BLACK,

    fontWeight: isActive ? "500" : "400", // tô đậm nếu active
  });

  useEffect(() => {
    const fetchRestaurants = async () => {
      setIsLoading(true);
      try {
        let data = [];

        if (categoryName === "Đề xuất") {
          data = await searchMostOrderedRestaurants(); // có distace r thì truyền ị trí vào
        } else if (categoryName === "Nổi bật") {
          data = await searchTopRatedRestaurants(); // có distace r thì truyền ị trí vào
        } else {
          data = await findRestaurantsByCategory(
            categoryName,
            10.8790332,
            106.8107046,
            1,
            10
          );
        }

        setRestaurants(data);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, [categoryName]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Header */}
        <Header title={categoryName} onBackPress={() => navigation.goBack()} />

        {/* Sort list */}
        <View style={styles.sortListContainer}>
          {["Mới nhất", "Bán chạy", "Đánh giá"].map((item) => {
            const isActive = activeSortItem === item;
            return (
              <TouchableOpacity
                key={item}
                style={sortStyle(isActive)}
                onPress={() => setActiveSortItem(item)}
              >
                <Text style={textColorStyle(isActive)}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* List FoodCard */}
        <ScrollView style={styles.listContainer}>
          {restaurants?.map((item) => {
            console.log("Rendering item:", item); // 👈 Ghi log từng item
            return (
              <FavoriteCard
                {...item}
                key={item?.id}
                navigate={(restaurantId) =>
                  navigation.navigate("RestaurantScreen", { restaurantId })
                }
              />
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.DEFAULT_WHITE,
    zIndex: -100,
    height: "100%",
  },
  headerContainer: {
    position: "absolute", // Đặt header ở vị trí tuyệt đối
    top: 0, // Đưa header lên trên cùng của màn hình
    left: 0,
    right: 0,
    height: 50, // Chiều cao cố định cho header
    backgroundColor: "white", // Màu nền của header (có thể thay đổi)
    flexDirection: "row", // Để các phần tử hiển thị theo hàng ngang
    alignItems: "center", // Căn giữa các phần tử theo chiều dọc
    zIndex: 1, // Đảm bảo header hiển thị phía trên cùng
    // Đổ bóng (Android)
    elevation: 4,
  },
  side: {
    width: 40, // Cố định chiều rộng 2 bên
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 21,
    fontWeight: "bold",
  },
  listContainer: {
    paddingVertical: 5,
    zIndex: -5,
    marginBottom: 30,
  },
  sortListContainer: {
    backgroundColor: Colors.DEFAULT_WHITE,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginTop: 8,

    elevation: 1,
    marginTop: 55,
  },
  sortListItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    height: 40,
  },
  sortListItemText: {
    fontSize: 14,
    lineHeight: 13 * 1.4,
    fontWeight: "400", // hoặc "600" hay "700"
  },
});

export default CategoryScreen;
