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
import * as Location from "expo-location";
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

const ExploreScreen = ({ navigation, route }) => {
  const { categoryName, location } = route.params;
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
    const fetchLocationAndRestaurants = async () => {
      setIsLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.error("Permission to access location was denied");
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        const latitude = loc.coords.latitude;
        const longitude = loc.coords.longitude;

        let data = [];

        if (categoryName === "Đề xuất") {
          const response = await searchMostOrderedRestaurants(
            latitude,
            longitude
          );
          data = response?.data || [];
        } else if (categoryName === "Nổi bật") {
          const response = await searchTopRatedRestaurants(latitude, longitude);
          data = response?.data || [];
        }

        if (!Array.isArray(data)) {
          throw new Error("Invalid data format: Expected an array");
        }

        setRestaurants(data);
      } catch (error) {
        console.error("Error fetching location or restaurants:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocationAndRestaurants();
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
    marginTop: 55,
    paddingVertical: 5,
    zIndex: -5,
    marginBottom: 30,
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

export default ExploreScreen;
