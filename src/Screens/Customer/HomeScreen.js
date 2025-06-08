import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from "react-native";

import React, { useState, useRef, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import RestaurantCard from "../../components/RestaurantCard";
import RestaurantMediumCard from "../../components/RestaurantMediumCard";
import Separator from "../../components/Seporator";
import Colors from "../../constants/Colors";
import Display from "../../utils/Display";
import { use } from "react";
import {
  searchMostOrderedRestaurants,
  searchNearestRestaurants,
  searchTopRatedRestaurants,
} from "../../services/restaurantService";
import * as Location from "expo-location";
import { GetAddressName } from "../../services/locationService";
const categories = [
  { id: 1, name: "Cơm", icon: "rice", iconType: "MaterialCommunityIcons" },
  {
    id: 2,
    name: "Bún, Phở",
    icon: "noodles",
    iconType: "MaterialCommunityIcons",
  },
  { id: 3, name: "Pizza", icon: "pizza", iconType: "Ionicons" },
  { id: 4, name: "Đồ uống", icon: "cup", iconType: "MaterialCommunityIcons" },
  { id: 5, name: "Cafe", icon: "cafe", iconType: "Ionicons" },
  { id: 8, name: "Chay", icon: "leaf", iconType: "Ionicons" },
  {
    id: 9,
    name: "Gà Rán",
    icon: "food-drumstick",
    iconType: "MaterialCommunityIcons",
  },
];

export default function HomeScreen({ navigation }) {
  const [activeCategory, setActiveCategory] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedRestaurants, setRecommendedRestaurants] = useState([]);

  const [activeSortItem, setActiveSortItem] = useState("Gần đây");
  const hasFetchedRef = useRef(false); // <== dùng ref để kiểm tra

  const [nearRestaurants, setNearRestaurants] = useState([]);
  const [nearPage, setNearPage] = useState(1);
  const [nearTotal, setNearTotal] = useState(0);

  const [popularRestaurants, setPopularRestaurants] = useState([]);
  const [popularPage, setPopularPage] = useState(1);
  const [popularTotal, setPopularTotal] = useState(0);

  const [rateRestaurants, setRateRestaurants] = useState([]);
  const [ratePage, setRatePage] = useState(1);
  const [rateTotal, setRateTotal] = useState(0);

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [address, setAddress] = useState(null);
  // Request location permission and get current position
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

      try {
        console.log("Location:", loc);
        const result = await GetAddressName(
          loc.coords.latitude,
          loc.coords.longitude
        );
        if (result && result.formatted_address) {
          setAddress(result.formatted_address);
        } else {
          // Nếu không có địa chỉ, dùng mặc định
          setAddress(
            "Cổng sau Trường ĐH Công nghệ thông tin , đại học quốc gia Thành phố Hồ Chí Minh, Linh Trung, Thủ Đức, Hồ Chí Minh"
          );
        }
      } catch (error) {
        setErrorMsg("Không thể lấy địa chỉ từ vị trí");
      }
    })();
  }, []);

  useEffect(() => {
    const fetchRestaurants = async () => {
      setIsLoading(true);
      try {
        const [near, popular, rated] = await Promise.all([
          searchNearestRestaurants(10.8790332, 106.8107046, 1, 6),
          searchMostOrderedRestaurants(10.8790332, 106.8107046, 1, 6),
          searchTopRatedRestaurants(10.8790332, 106.8107046, 1, 6),
        ]);

        setNearRestaurants(near.data);
        setNearTotal(near.total);

        setPopularRestaurants(popular.data);
        setPopularTotal(popular.total);
        setRateRestaurants(rated.data);
        setRateTotal(rated.total);

        console.log("Near restaurants:", {
          near: near.data,
        });
        console.log("Popular restaurants:", {
          popular: popular.data,
        });
        console.log("Rated restaurants:", {
          rated: rated.data,
        });
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  /* Load more*/
  const loadMoreNear = async () => {
    if (nearRestaurants.length >= nearTotal) return;
    const nextPage = nearPage + 1;
    const result = await searchNearestRestaurants(
      10.8790332,
      106.8107046,
      nextPage,
      6
    );
    setNearRestaurants([...nearRestaurants, ...result.data]);
    setNearPage(nextPage);
  };

  const loadMorePopular = async () => {
    if (popularRestaurants.length >= popularTotal) return;
    const nextPage = popularPage + 1;
    const result = await searchMostOrderedRestaurants(
      10.8790332,
      106.8107046,
      nextPage,
      6
    );
    setPopularRestaurants([...popularRestaurants, ...result.data]);
    setPopularPage(nextPage);
  };

  const loadMoreRated = async () => {
    if (rateRestaurants.length >= rateTotal) return;
    const nextPage = ratePage + 1;
    const result = await searchTopRatedRestaurants(
      10.8790332,
      106.8107046,
      nextPage,
      6
    );
    setRateRestaurants([...rateRestaurants, ...result.data]);
    setRatePage(nextPage);
  };
  /* List  restaurant info*/

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
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <ScrollView style={styles.listContainer}>
          <View style={styles.backgroundCurvedContainer} />
          {/* header container */}
          <View style={styles.headerContainer}>
            {/* location */}
            <TouchableOpacity style={styles.locationContainer}>
              <Ionicons name="location-outline" size={22} color={"#fff"} />
              <Text style={styles.locationText}>Giao đến: </Text>
              <Text
                numberOfLines={1}
                ellipsizeMode={"tail"}
                style={styles.selectedLocationText}
              >
                {address}
              </Text>
              <MaterialIcons
                name="keyboard-arrow-down"
                size={18}
                color={"#fff"}
              />
            </TouchableOpacity>
            {/* search */}
            <View style={styles.searchContainer}>
              <TouchableOpacity
                style={styles.searchSection}
                onPress={() => navigation.navigate("SearchScreen")}
              >
                <Ionicons name="search-outline" size={24} color={"#fff"} />
                <Text style={styles.searchText}>Tìm kiếm</Text>
              </TouchableOpacity>
            </View>

            {/* categories container */}
            <View style={styles.categoriesContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.category}
                    onPress={() =>
                      navigation.navigate("CategoryScreen", {
                        categoryName: category.name,
                      })
                    }
                  >
                    {category.iconType === "MaterialCommunityIcons" ? (
                      <MaterialCommunityIcons
                        style={styles.categoryIcon}
                        name={category.icon}
                        size={28}
                        color="white"
                      />
                    ) : (
                      <Ionicons
                        style={styles.categoryIcon}
                        name={category.icon}
                        size={28}
                        color="white"
                      />
                    )}
                    <Text style={styles.categoryText}>{category.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* list container */}

          <View style={styles.horizontalListContainer}>
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderTitle}>Đề xuất</Text>
              <Text
                style={styles.listHeaderSubtitle}
                onPress={() =>
                  navigation.navigate("ExploreScreen", {
                    categoryName: "Đề xuất",
                  })
                }
              >
                Xem tất cả
              </Text>
            </View>
            <FlatList
              data={popularRestaurants}
              keyExtractor={(item) => item?.id}
              horizontal
              onEndReached={loadMorePopular}
              onEndReachedThreshold={0.5}
              ListHeaderComponent={() => <Separator width={10} />}
              ListFooterComponent={() => <Separator width={10} />}
              ItemSeparatorComponent={() => <Separator width={10} />}
              showsHorizontalScrollIndicator={false} // ẩn thanh scroll ngang (nếu dùng horizontal)
              renderItem={({ item }) => (
                <RestaurantCard
                  {...item}
                  navigate={(restaurant) =>
                    navigation.navigate("RestaurantScreen", { restaurant })
                  }
                />
              )}
            />
          </View>
          <View style={styles.horizontalListContainer}>
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderTitle}>Nổi bật </Text>
              <Text
                style={styles.listHeaderSubtitle}
                onPress={() =>
                  navigation.navigate("ExploreScreen", {
                    categoryName: "Nổi bật",
                  })
                }
              >
                Xem tất cả
              </Text>
            </View>
            <FlatList
              data={rateRestaurants}
              keyExtractor={(item) => item?.id}
              horizontal
              onEndReached={loadMoreRated}
              onEndReachedThreshold={0.5}
              ListHeaderComponent={() => <Separator width={10} />}
              ListFooterComponent={() =>
                isLoading ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : null
              }
              ItemSeparatorComponent={() => <Separator width={10} />}
              showsHorizontalScrollIndicator={false} // ẩn thanh scroll ngang (nếu dùng horizontal)
              renderItem={({ item }) => (
                <RestaurantCard
                  {...item}
                  navigate={(restaurant) => {
                    navigation.navigate("RestaurantScreen", { restaurant });
                  }}
                />
              )}
            />
          </View>

          {/* Sort list */}
          <View style={styles.sortListContainer}>
            {["Gần đây", "Bán chạy", "Đánh giá"].map((item) => {
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
          {/* Render restaurant list based on activeSortItem */}
          {(activeSortItem === "Gần đây"
            ? nearRestaurants
            : activeSortItem === "Bán chạy"
            ? popularRestaurants
            : rateRestaurants
          )?.map((item) => {
            console.log("RestaurantMediumCard ite:", item); // 👈 Log dữ liệu item truyền vào card
            return (
              <RestaurantMediumCard
                {...item}
                key={item?.id}
                navigate={(restaurant) => {
                  navigation.navigate("RestaurantScreen", { restaurant });
                }}
              />
            );
          })}
          <Separator height={Display.setHeight(5)} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundCurvedContainer: {
    height: 1940,
    position: "absolute",
    top: -1 * (2000 - 230),
    width: 2000,
    borderRadius: 2000,
    alignSelf: "center",
    zIndex: -1,
    backgroundColor: "#007B7F",
  },
  headerContainer: {
    justifyContent: "space-evenly",
    marginBottom: 20,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    marginHorizontal: 20,
  },
  locationText: {
    marginLeft: 5,
    fontSize: 13,
    lineHeight: 13 * 1.4,
    color: "#fff",
  },
  selectedLocationText: {
    marginLeft: 5,
    fontSize: 13,
    lineHeight: 14 * 1.4,
    color: "#fff",
    width: Display.setWidth(60),
  },

  searchContainer: {
    height: 45,
    borderRadius: 8,
    marginHorizontal: 20,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 5,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 8,
    padding: 5,
    width: "95%",
  },
  searchText: {
    fontSize: 14,
    lineHeight: 16 * 1.4,
    marginLeft: 10,
    color: "#fff",
  },
  categoriesContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 15,
  },
  listContainer: {
    paddingVertical: 5,
    zIndex: -5,
    marginBottom: 30,
  },
  horizontalListContainer: {
    marginTop: 10,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 5,
  },
  listHeaderTitle: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 16 * 1.4,
  },
  listHeaderSubtitle: {
    fontSize: 13,
    lineHeight: 13 * 1.4,
    color: Colors.DEFAULT_GREEN,
  },
  sortListContainer: {
    backgroundColor: Colors.DEFAULT_WHITE,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 5,
    elevation: 1,
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
  category: {
    alignItems: "center",
    padding: 5,
    marginHorizontal: 10,
  },
  categoryIcon: {
    height: 30,
    width: 30,
  },
  categoryText: {
    fontSize: 12,
    lineHeight: 10 * 1.4,
    color: "#fff",
    marginTop: 5,
  },
});
