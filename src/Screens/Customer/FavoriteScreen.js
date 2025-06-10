import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useState, useContext, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../../components";
import RestaurantMediumCard from "../../components/RestaurantMediumCard";
import FavoriteCard from "../../components/FavouriteCard";
import { Colors } from "../../constants";
import { UserContext } from "../../context/UserContext";

import { useFocusEffect } from "@react-navigation/native";
import { fetchFavoritesByUserId } from "../../services/favouriteService";

const FavoriteScreen = ({ navigation }) => {
  const [activeSortItem, setActiveSortItem] = useState("Mới nhất");
  const [listFavorite, setListFavorite] = useState([]);
  const { userInfo } = useContext(UserContext);
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
  useFocusEffect(
    React.useCallback(() => {
      const fetchFavorites = async () => {
        if (!userInfo) return;
        try {
          const favorites = await fetchFavoritesByUserId({
            userId: userInfo.id,
          });
          setListFavorite(Array.isArray(favorites) ? favorites : []);
        } catch (error) {
          setListFavorite([]);
          console.error("Failed to fetch favorite restaurants", error);
        }
      };

      fetchFavorites();
    }, [userInfo])
  );

  const handleRemoveFavorite = async (favoriteId) => {
    try {
      await removeFavorite(favoriteId); // Assuming removeFavorite is a function in favouriteService.js
      const updatedFavorites = listFavorite.filter(
        (item) => item.id !== favoriteId
      );
      setListFavorite(updatedFavorites);
    } catch (error) {
      console.error("Failed to remove favorite", error);
    }
  };

  if (!userInfo) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 16, marginBottom: 16 }}>
          Bạn cần đăng nhập để xem{" "}
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>Yêu Thích</Text>
        </Text>

        <TouchableOpacity
          style={{
            backgroundColor: Colors.DEFAULT_GREEN,
            padding: 10,
            borderRadius: 8,
          }}
          onPress={() => navigation.navigate("LoginScreen")}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Đăng nhập</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.center}>
            <Text style={styles.title}>Yêu thích</Text>
          </View>
        </View>

        {/* Sort list */}
        {/* <View style={styles.sortListContainer}>
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
        </View> */}

        {/* List FoodCard */}
        <ScrollView style={styles.listContainer}>
          {listFavorite?.map((item) => {
            console.log("Favorite item:", item); // Log each item
            return (
              <FavoriteCard
                {...item}
                key={item?.id}
                navigate={(restaurantId) =>
                  navigation.navigate("RestaurantScreen", { restaurantId })
                }
                onRemoveFavorite={handleRemoveFavorite}
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

export default FavoriteScreen;
