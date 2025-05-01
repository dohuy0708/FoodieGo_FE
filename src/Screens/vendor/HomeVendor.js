import React, { useState, useEffect } from "react";
import { Color } from "../../constants";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import {
  getRestaurantByOwnerId,
  getCategoriesByRestaurantId,
  getMenusByCategoryId,
} from "../../services/vendorService";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Picker } from "@react-native-picker/picker";
import Dish from "../../components/Dish";
import Nav from "../../components/Nav";
import Display from "../../utils/Display";

const NAV_HEIGHT = Display.setHeight(7);
const IMAGE_ASPECT_RATIO = 16 / 9;
const IMAGE_WIDTH = Dimensions.get("window").width;
const IMAGE_HEIGHT = IMAGE_WIDTH / IMAGE_ASPECT_RATIO;
const VIEW_INFO_OVERLAP = Display.setHeight(2.5);

export default function HomeVendor({ navigation, route }) {
  const ownerId = 155;

  const [selectedImage, setSelectedImage] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [category, setCategory] = useState([]);
  const [menus, setMenus] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [isLoadingRestaurant, setIsLoadingRestaurant] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingMenus, setIsLoadingMenus] = useState(false);

  const [errorRestaurant, setErrorRestaurant] = useState(null);
  const [errorCategories, setErrorCategories] = useState(null);
  const [errorMenus, setErrorMenus] = useState(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      setIsLoadingRestaurant(true);
      setErrorRestaurant(null);
      try {
        const response = await getRestaurantByOwnerId(ownerId);
        console.log("Restaurant response:", response);

        if (Array.isArray(response) && response.length > 0) {
          const restaurantData = response[0];
          setRestaurant(restaurantData);
        } else {
          setErrorRestaurant("Không tìm thấy thông tin nhà hàng.");
          setRestaurant(null);
        }
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu nhà hàng:", err);
        setErrorRestaurant("Không thể tải dữ liệu nhà hàng.");
        setRestaurant(null);
      } finally {
        setIsLoadingRestaurant(false);
      }
    };

    fetchRestaurant();
  }, []);

  useEffect(() => {
    if (!restaurant || !restaurant.id) {
        setCategory([]);
        return;
    };

    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      setErrorCategories(null);
      setCategory([]);
      try {
        const response = await getCategoriesByRestaurantId(restaurant.id);
        console.log("Categories response:", response);
        if (Array.isArray(response)) {
          setCategory(response);
          if (response.length === 0) {
            console.log("Nhà hàng này chưa có danh mục nào.");
          }
        } else {
          setErrorCategories("Dữ liệu danh mục không hợp lệ.");
          setCategory([]);
        }
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu danh mục:", err);
        setErrorCategories("Không thể tải dữ liệu danh mục.");
        setCategory([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [restaurant]);

  useEffect(() => {
    if (selectedCategory === null) {
      setMenus([]);
      setErrorMenus(null);
      setIsLoadingMenus(false);
      return;
    }

    const fetchMenus = async () => {
      setIsLoadingMenus(true);
      setErrorMenus(null);
      setMenus([]);
      try {
        const response = await getMenusByCategoryId(selectedCategory);
        console.log("Menus response:", response);
        if (Array.isArray(response)) {
          setMenus(response);
           if (response.length === 0) {
            console.log("Danh mục này chưa có món ăn nào.");
          }
        } else {
          setErrorMenus("Dữ liệu món ăn không hợp lệ.");
          setMenus([]);
        }
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu món ăn:", err);
        setErrorMenus("Không thể tải dữ liệu món ăn.");
        setMenus([]);
      } finally {
        setIsLoadingMenus(false);
      }
    };

    fetchMenus();
  }, [selectedCategory]);

  const formatTime = (timeString) => {
    if (!timeString || typeof timeString !== "string") return "N/A";
    const parts = timeString.split(":");
    return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : "N/A";
  };

  const renderMenuItem = ({ item }) => {
    const dishData = {
      id: item.id,
      name: item.name,
      price: item.price ? `${item.price.toLocaleString('vi-VN')}đ` : 'N/A',
      status: item.available ? "Đang bán" : "Hết hàng",
      numSell: 'N/A',
      description: item.description || "...",
      imageUrl: item.imageUrl,
    };
    return <Dish data={dishData} navigation={navigation} />;
  };

  const HeaderComponent = () => {
    if (isLoadingRestaurant) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Color.DEFAULT_GREEN} />
          <Text style={styles.loadingText}>Đang tải thông tin nhà hàng...</Text>
        </View>
      );
    }

    if (errorRestaurant) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorRestaurant}</Text>
        </View>
      );
    }

    if (!restaurant) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Thông tin nhà hàng không có sẵn.</Text>
        </View>
      );
    }

    const ratingValue = restaurant.rating !== null ? restaurant.rating : 0;
    const addressObj = restaurant.address;
    const fullAddress = addressObj
      ? `${addressObj.street || ""}, ${addressObj.ward || ""}, ${
          addressObj.district || ""
        }, ${addressObj.province || ""}`
          .replace(/ ,/g, ",")
          .replace(/^,|,$/g, "")
          .trim()
      : "Địa chỉ không xác định";
    const phone = restaurant.phone || "Chưa cập nhật";
    const openingHours = `Mở cửa: ${formatTime(
      restaurant.openTime
    )} - ${formatTime(restaurant.closeTime)}`;
    const description = restaurant.description || "Chưa có mô tả";
    const isOpen = restaurant.status === "open";
    const ratingDisplay =
      restaurant.rating !== null
        ? `(${ratingValue.toFixed(1)})`
        : "(Chưa có đánh giá)";

    return (
      <>
        <View style={{ gap: 10 }}>
          <View style={{ alignItems: "flex-end" }}>
            <TouchableOpacity
              style={styles.edit_button}
              onPress={() =>
                navigation.navigate("EditVendor", {
                  restaurantData: restaurant,
                })
              }
            >
              <Text style={{ color: Color.DEFAULT_WHITE }}>
                Chỉnh sửa thông tin
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.name_vendor}>{restaurant.name}</Text>

          <View style={styles.evaluation}>
            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <FontAwesome
                  key={star}
                  name={
                    star <= ratingValue
                      ? "star"
                      : star - 0.5 <= ratingValue
                      ? "star-half-o"
                      : "star-o"
                  }
                  size={20}
                  color={Color.DEFAULT_YELLOW}
                />
              ))}
              <Text style={styles.ratingText}>{ratingDisplay}</Text>
            </View>
          </View>
          <Text style={styles.descriptionText}>{description}</Text>
          <Text style={styles.descriptionText}>Liên hệ: {phone}</Text>
          <Text style={styles.addressText}>{fullAddress}</Text>
          <Text style={styles.openingHoursText}>{openingHours}</Text>
          <Text
            style={[
              styles.statusText,
              { color: isOpen ? Color.DEFAULT_GREEN : Color.DEFAULT_RED },
            ]}
          >
            {isOpen ? "Đang mở cửa" : "Đang đóng cửa"}
          </Text>

          <View style={{ alignItems: "flex-end" }}>
            <TouchableOpacity
              style={styles.edit_button}
              onPress={() => navigation.navigate("EditCategory")}
            >
              <Text style={{ color: Color.DEFAULT_WHITE }}>
                Chỉnh sửa danh mục
              </Text>
            </TouchableOpacity>
          </View>

          {isLoadingCategories && <ActivityIndicator style={{marginTop: 10}} color={Color.DEFAULT_GREEN} />}
          {errorCategories && <Text style={styles.inlineErrorText}>{errorCategories}</Text>}

          {!isLoadingCategories && category.length > 0 && (
            <View style={styles.picker_container}>
              <Picker
                selectedValue={selectedCategory}
                onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                style={styles.picker}
                mode="dropdown"
                enabled={!isLoadingMenus}
              >
                <Picker.Item
                  label="-- Chọn danh mục --"
                  style={{ fontSize: 13, color: Color.GRAY_BORDER }}
                  value={null}
                  enabled={false}
                />
                {category.map((item) => (
                  <Picker.Item
                    key={item.id}
                    label={item.name}
                    value={item.id}
                    style={{ fontSize: 13 }}
                  />
                ))}
              </Picker>
            </View>
          )}
           {!isLoadingCategories && !errorCategories && category.length === 0 && (
                <Text style={styles.infoText}>Nhà hàng chưa có danh mục nào.</Text>
           )}

          <View
            style={{
              alignItems: "flex-end",
              marginTop: Display.setHeight(1.8),
            }}
          >
            <TouchableOpacity
              style={styles.addDishButton}
              disabled={selectedCategory === null || isLoadingMenus}
              onPress={() => navigation.navigate("AddDish", { categoryId: selectedCategory })}
            >
              <Text style={{ color: Color.DEFAULT_WHITE }}>
                Thêm món ăn mới
              </Text>
            </TouchableOpacity>
          </View>

           <View style={styles.menuStatusContainer}>
                {isLoadingMenus && <ActivityIndicator size="small" color={Color.DEFAULT_ORANGE} />}
                {errorMenus && <Text style={styles.inlineErrorText}>{errorMenus}</Text>}
                {!isLoadingMenus && !errorMenus && menus.length === 0 && selectedCategory !== null && (
                     <Text style={styles.infoText}>Danh mục này chưa có món ăn.</Text>
                )}
           </View>

        </View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <Image
        source={restaurant?.imageUrl ? { uri: restaurant.imageUrl } : require("../../assets/images/store.png")}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.view_information}>
        <FlatList
          ListHeaderComponent={HeaderComponent}
          data={menus}
          renderItem={renderMenuItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContentContainer,
            { paddingBottom: NAV_HEIGHT + Display.setHeight(5) },
          ]}
        />
      </View>

      <View style={styles.navContainer}>
        <Nav nav={navigation} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: IMAGE_HEIGHT,
  },
  view_information: {
    width: "100%",
    paddingHorizontal: Display.setWidth(5),
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: "absolute",
    top: IMAGE_HEIGHT - VIEW_INFO_OVERLAP,
    left: 0,
    right: 0,
    bottom: 0,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  listContentContainer: {
    paddingTop: Display.setHeight(2.5),
    gap: Display.setHeight(1.8),
  },
  loadingContainer: {
    flex: 1,
    minHeight: Display.setHeight(50),
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Display.setHeight(5),
  },
   menuStatusContainer: {
      marginTop: Display.setHeight(1.5),
      minHeight: Display.setHeight(3),
      alignItems: 'center',
      justifyContent: 'center'
    },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Color.DARK_ONE || "#333",
  },
  errorContainer: {
    flex: 1,
    minHeight: Display.setHeight(50),
    justifyContent: "center",
    alignItems: "center",
    padding: Display.setWidth(5),
  },
  errorText: {
    fontSize: 16,
    color: Color.DEFAULT_RED || "red",
    textAlign: "center",
    fontWeight: 'bold',
  },
  inlineErrorText: {
      fontSize: 14,
      color: Color.DEFAULT_RED || 'red',
      textAlign: 'center',
      marginTop: 5,
  },
  infoText: {
      fontSize: 14,
      color: Color.DARK_TWO || '#555',
      textAlign: 'center',
      marginTop: 5,
      fontStyle: 'italic'
  },
  name_vendor: {
    fontWeight: "bold",
    fontSize: 22,
    textAlign: "center",
    color: "#333",
    marginTop: Display.setHeight(1.2),
  },
  evaluation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Display.setWidth(4),
    marginTop: Display.setHeight(1),
    marginBottom: Display.setHeight(1),
  },
  ratingStars: {
    flexDirection: "row",
    alignItems: "center",
    gap: Display.setWidth(1),
  },
  ratingText: {
    marginLeft: Display.setWidth(1.2),
    fontSize: 14,
    color: "#555",
  },
  descriptionText: {
    fontSize: 15,
    color: "#444",
    textAlign: "center",
    marginTop: Display.setHeight(0.7),
    lineHeight: 20,
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: Display.setHeight(1.2),
    lineHeight: 18,
  },
  openingHoursText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: Display.setHeight(0.7),
  },
  statusText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: Display.setHeight(0.5),
    marginBottom: Display.setHeight(1.5),
  },
  edit_button: {
    backgroundColor: Color.DEFAULT_GREEN,
    paddingVertical: Display.setHeight(1.2),
    paddingHorizontal: Display.setWidth(4),
    borderRadius: 8,
    alignItems: "center",
  },
  addDishButton: {
    backgroundColor: Color.DEFAULT_ORANGE || "#FFA500",
    paddingVertical: Display.setHeight(1.2),
    paddingHorizontal: Display.setWidth(4),
    borderRadius: 8,
    alignItems: "center",
  },
  picker_container: {
    width: "100%",
    borderWidth: 1,
    borderColor: Color.GRAY_BORDER || "#ccc",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: Display.setHeight(1.8),
    backgroundColor: "#fafafa",
  },
  picker: {
    height: Display.setHeight(7),
    width: "100%",
    color: Color.SECONDARY_BLACK || "#333",
    backgroundColor: "transparent",
  },
  navContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: NAV_HEIGHT,
    backgroundColor: Color.DEFAULT_WHITE || "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    zIndex: 10,
  },
});