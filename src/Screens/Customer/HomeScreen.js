import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import React, { useState } from "react";
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
export default function HomeScreen({ navigation }) {
  const [activeCategory, setActiveCategory] = useState();
  const [restaurants, setRestaurants] = useState([
    {
      id: "1",
      name: "Pizza Palace",
      images: {
        poster: "https://example.com/images/pizza.jpg",
      },
      tags: ["Pizza", "Italian"],
      distance: "1.2 km",
      time: "25-30 min",
    },
    {
      id: "2",
      name: "Sushi World",
      images: {
        poster: "https://example.com/images/sushi.jpg",
      },
      tags: ["Sushi", "Japanese"],
      distance: "2.5 km",
      time: "30-40 min",
    },
    {
      id: "3",
      name: "Burger Town",
      images: {
        poster: "https://example.com/images/burger.jpg",
      },
      tags: ["Burger", "Fast Food"],
      distance: "0.9 km",
      time: "20-25 min",
    },
  ]);

  const [activeSortItem, setActiveSortItem] = useState("Gần đây");

  const categories = [
    { id: 1, name: "Cơm", icon: "rice", iconType: "MaterialCommunityIcons" },
    {
      id: 2,
      name: "Bún, Phở",
      icon: "noodles",
      iconType: "MaterialCommunityIcons",
    },
    { id: 3, name: "Ăn vặt", icon: "pizza", iconType: "Ionicons" },
    { id: 4, name: "Đồ uống", icon: "cup", iconType: "MaterialCommunityIcons" },
    { id: 5, name: "Cafe", icon: "cafe", iconType: "Ionicons" },
    { id: 8, name: "Chay", icon: "leaf", iconType: "Ionicons" },
    {
      id: 9,
      name: "Gà rán",
      icon: "food-drumstick",
      iconType: "MaterialCommunityIcons",
    },
  ];

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
              <Text style={styles.locationText}>Delivered to</Text>
              <Text style={styles.selectedLocationText}>HOME</Text>
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
                  <TouchableOpacity key={category.id} style={styles.category}>
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
                onPress={() => navigation.navigate("ExploreScreen")}
              >
                Xem tất cả
              </Text>
            </View>
            <FlatList
              data={restaurants}
              keyExtractor={(item) => item?.id}
              horizontal
              ListHeaderComponent={() => <Separator width={10} />}
              ListFooterComponent={() => <Separator width={10} />}
              ItemSeparatorComponent={() => <Separator width={10} />}
              showsHorizontalScrollIndicator={false} // ẩn thanh scroll ngang (nếu dùng horizontal)
              renderItem={({ item }) => (
                <RestaurantCard
                  {...item}
                  navigate={(restaurantId) =>
                    navigation.navigate("RestaurantScreen", { restaurantId })
                  }
                />
              )}
            />
          </View>
          <View style={styles.horizontalListContainer}>
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderTitle}>Đã xem </Text>
              <Text
                style={styles.listHeaderSubtitle}
                onPress={() => navigation.navigate("ExploreScreen")}
              >
                Xem tất cả
              </Text>
            </View>
            <FlatList
              data={restaurants}
              keyExtractor={(item) => item?.id}
              horizontal
              ListHeaderComponent={() => <Separator width={10} />}
              ListFooterComponent={() => <Separator width={10} />}
              ItemSeparatorComponent={() => <Separator width={10} />}
              showsHorizontalScrollIndicator={false} // ẩn thanh scroll ngang (nếu dùng horizontal)
              renderItem={({ item }) => (
                <RestaurantCard
                  {...item}
                  navigate={(restaurantId) =>
                    navigation.navigate("RestaurantScreen", { restaurantId })
                  }
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
          {restaurants?.map((item) => (
            <RestaurantMediumCard
              {...item}
              key={item?.id}
              navigate={(restaurantId) =>
                navigation.navigate("RestaurantScreen", { restaurantId })
              }
            />
          ))}
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
    marginHorizontal: 5,
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
