import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SectionList,
  Linking, // Dùng để gọi số điện thoại
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { Colors } from "../../constants";
import Display from "../../utils/Display";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Giả sử bạn cần token
import GRAPHQL_ENDPOINT from "../../../config"; // Import endpoint của bạn

const GET_RESTAURANT_DETAILS_QUERY = `
  query GetRestaurantById($id: Int!) {
    findByIdNotLocation(id: $id) {
      id
      name
      description
      phone
      avatar
      openTime
      closeTime
      rating
      status
      address {
        id
        street
        ward
        district
        province
      }
      categories {
        id
        name
        menu {
          id
          name
          price
          imageUrl
        }
      }
    }
  }
`;

const callGraphQL = async (query, variables) => {
  const token = await AsyncStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
    });
    const responseData = await response.json();
    if (responseData.errors) {
      throw new Error(responseData.errors.map((e) => e.message).join("\n"));
    }
    return responseData.data;
  } catch (error) {
    console.error("Lỗi GraphQL:", error);
    throw error;
  }
};

const SeeRestaurantScreen = ({ navigation, route }) => {
  const { restaurantId } = route.params;

  const [restaurant, setRestaurant] = useState(null);
  const [foodSections, setFoodSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      if (!restaurantId) {
        setError("Không có ID nhà hàng được cung cấp.");
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        setError(null);

        const response = await callGraphQL(GET_RESTAURANT_DETAILS_QUERY, {
          id: restaurantId,
        });

        const restaurantData = response.findByIdNotLocation;

        if (!restaurantData) {
          throw new Error("Không tìm thấy nhà hàng.");
        }

        setRestaurant(restaurantData);

        const sections = (restaurantData.categories || [])
          .map((category) => ({
            title: category.name,
            data: category.menu || [],
          }))
          .filter((section) => section.data.length > 0); // Chỉ giữ lại section có món ăn

        setFoodSections(sections);
      } catch (err) {
        setError("Không thể tải dữ liệu. Vui lòng thử lại.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [restaurantId]);

  // --- Các hàm hiển thị ---

  const renderFoodItem = ({ item }) => (
    // Đây là một component card đơn giản, bạn có thể thay bằng FoodCard nếu muốn
    <View style={styles.foodCard}>
      <Image
        source={{ uri: item.imageUrl || "https://via.placeholder.com/100" }}
        style={styles.foodImage}
      />
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodPrice}>
          {item.price.toLocaleString("vi-VN")} đ
        </Text>
      </View>
    </View>
  );

  const renderSectionHeader = ({ section: { title } }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  // --- Các trạng thái UI ---

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.DEFAULT_GREEN} />
        <Text style={styles.statusText}>Đang tải thông tin nhà hàng...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          style={styles.backButtonStatic}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.DEFAULT_BLACK} />
        </TouchableOpacity>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          {/* Có thể thêm nút thử lại ở đây */}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <SectionList
        sections={foodSections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderFoodItem}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={
          <>
            <Image
              source={{
                uri:
                  restaurant.avatar ||
                  "https://via.placeholder.com/400x200.png?text=Restaurant",
              }}
              style={styles.backgroundImage}
            />
            <View style={styles.mainContainer}>
              <Text style={styles.title}>{restaurant.name}</Text>
              <View style={styles.infoRow}>
                <FontAwesome
                  name="star"
                  size={16}
                  color={Colors.DEFAULT_YELLOW}
                />
                <Text style={styles.infoText}>
                  {restaurant.rating?.toFixed(1) || "Chưa có"}
                </Text>
                <Text style={styles.dotSeparator}>•</Text>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={Colors.DEFAULT_GREEN}
                />
                <Text style={styles.infoText}>
                  {restaurant.openTime} - {restaurant.closeTime}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.infoRow}
                onPress={() => Linking.openURL(`tel:${restaurant.phone}`)}
              >
                <Ionicons
                  name="call-outline"
                  size={16}
                  color={Colors.DEFAULT_BLUE}
                />
                <Text style={[styles.infoText, { color: Colors.DEFAULT_BLUE }]}>
                  {restaurant.phone}
                </Text>
              </TouchableOpacity>
              <View style={styles.infoRow}>
                <Ionicons
                  name="location-outline"
                  size={16}
                  color={Colors.DEFAULT_RED}
                />
                <Text style={styles.infoText} numberOfLines={2}>
                  {`${restaurant.address.street}, ${restaurant.address.ward}, ${restaurant.address.district}, ${restaurant.address.province}`}
                </Text>
              </View>
              <Text style={styles.description}>{restaurant.description}</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.centeredMessage}>
            <Text>Nhà hàng này hiện chưa có thực đơn.</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
};

// =================================================================
// 3. STYLESHEET
// =================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.DEFAULT_WHITE,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centeredMessage: {
    padding: 20,
    alignItems: "center",
    marginTop: 30,
  },
  statusText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.DEFAULT_GREY,
  },
  errorText: {
    color: Colors.DEFAULT_RED,
    textAlign: "center",
    fontSize: 16,
  },
  backgroundImage: {
    width: "100%",
    height: Display.setHeight(30),
  },
  backButton: {
    position: "absolute",
    top: 45, // An toàn cho hầu hết thiết bị
    left: 15,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  backButtonStatic: {
    position: "absolute",
    top: 45,
    left: 15,
    zIndex: 10,
  },
  mainContainer: {
    padding: 15,
    backgroundColor: Colors.DEFAULT_WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20, // Kéo lên để che ảnh
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.DEFAULT_BLACK,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.DARK_ONE,
    flexShrink: 1,
  },
  dotSeparator: {
    marginHorizontal: 8,
    color: Colors.DEFAULT_GREY,
  },
  description: {
    fontSize: 14,
    color: Colors.DEFAULT_GREY,
    marginTop: 10,
    lineHeight: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.DEFAULT_BLACK,
    backgroundColor: Colors.LIGHT_GREY,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginTop: 15,
  },
  foodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 10,
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GREY2,
  },
  foodImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  foodInfo: {
    flex: 1,
    marginLeft: 15,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.DARK_ONE,
  },
  foodPrice: {
    fontSize: 15,
    color: Colors.DEFAULT_GREEN,
    marginTop: 5,
  },
});

export default SeeRestaurantScreen;
