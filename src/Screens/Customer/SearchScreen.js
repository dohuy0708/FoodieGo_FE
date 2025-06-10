import { set } from "firebase/database";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import {
  fetchMostOrderedRestaurantsByName,
  fetchNearestRestaurantsByName,
  fetchTopRatedRestaurantsByName,
  findMenusByImage,
} from "../../services/restaurantService";
import RestaurantMediumCard from "../../components/RestaurantMediumCard";
import { Colors } from "../../constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FoodSearchCard from "../../components/FoodSearchCard";

const suggestions = [
  "Bún",
  "Phở",
  "Bánh mì",
  "Pizza",
  "Cơm tấm",
  "Mỳ cay",
  "Trà sữa",
  "Matcha",
  "Gà rán",
  "Caffe muối",
];

const SearchScreen = ({ navigation }) => {
  const [activeSort, setActiveSort] = useState("Gần đây");
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [imageSearchResults, setImageSearchResults] = useState([]); // State mới để chứa kết quả tìm kiếm bằng ảnh
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageSearch = async (image) => {
    console.log("Handling image search with image:", image);
    if (!image) {
      Alert.alert("Chưa chọn ảnh", "Vui lòng chọn ảnh để tìm kiếm.");
      return;
    }
    setIsLoading(true);
    setHasSearched(true);
    try {
      const data = await findMenusByImage(image);
      setImageSearchResults(data); // Lưu kết quả vào state mới
    } catch (error) {
      setImageSearchResults([]); // Đặt kết quả là mảng rỗng nếu có lỗi
      if (error.message === "Network request failed") {
        Alert.alert(
          "Lỗi mạng",
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert(
          "Cần quyền truy cập",
          "Bạn cần cấp quyền truy cập thư viện ảnh để chọn ảnh."
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [8, 7],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
        handleImageSearch(result.assets[0]); // Gọi API sau khi chọn ảnh
      }
    } catch (error) {
      console.log("ImagePicker Error: ", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi chọn ảnh.");
    }
  };
  const handleSearch = async (text) => {
    if (!text.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    try {
      const data = await fetchNearestRestaurantsByName({
        latitude: 10.762622,
        longitude: 106.660172,
        keyword: text,
        page: 1,
        limit: 10,
      });
      setSearchResults(data);

      // Lưu lịch sử (không trùng lặp)
      let newHistory = [text, ...searchHistory.filter((item) => item !== text)];
      if (newHistory.length > 10) newHistory = newHistory.slice(0, 10);
      setSearchHistory(newHistory);
      saveSearchHistory(newHistory);
    } catch (error) {
      console.error("Error loading restaurants:", error);
      setSearchResults([]);
    }
    setIsLoading(false);
  };

  const handleClearHistory = async () => {
    setSearchHistory([]);
    try {
      await AsyncStorage.removeItem("searchHistory");
    } catch (e) {
      console.error("Lỗi xóa lịch sử tìm kiếm:", e);
    }
  };
  const loadSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem("searchHistory");
      if (history) setSearchHistory(JSON.parse(history));
    } catch (e) {}
  };
  useEffect(() => {
    loadSearchHistory();
  }, []);
  const saveSearchHistory = async (history) => {
    try {
      await AsyncStorage.setItem("searchHistory", JSON.stringify(history));
    } catch (e) {
      console.error("Lỗi lưu lịch sử tìm kiếm:", e);
    }
  };

  useEffect(() => {
    // Ensure UI updates immediately when searchResults or imageSearchResults change
    console.log("Search Results Updated:", searchResults);
    console.log("Image Search Results Updated:", imageSearchResults);
  }, [searchResults, imageSearchResults]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={{
            width: "10%",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm"
            placeholderTextColor="#aaa"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={() => handleSearch(searchText)}
          />
          <TouchableOpacity
            style={{ padding: 4 }}
            onPress={() => handleSearch(searchText)}
          >
            <Ionicons name="search" size={20} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={{
            width: "10%",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={selectImage}
        >
          <Ionicons name="camera-outline" size={24} />
        </TouchableOpacity>
      </View>

      {/* UI logic */}
      {!hasSearched ? (
        // Lần đầu vào: Hiện lịch sử & gợi ý
        <View style={styles.sectionContainer}>
          {/* Search History */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Lịch sử tìm kiếm</Text>
              <TouchableOpacity onPress={handleClearHistory}>
                <Text style={styles.clearText}>Xóa</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {searchHistory.map((item, index) => (
                <TouchableOpacity
                  onPress={() => {
                    setSearchText(item);
                  }}
                  key={index}
                  style={styles.historyItem}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          {/* Search Suggestions */}
          <View style={styles.section2}>
            <Text style={styles.sectionTitle}>Gợi ý tìm kiếm</Text>
            <View style={styles.suggestionsContainer}>
              {suggestions.map((item, index) => (
                <TouchableOpacity
                  onPress={() => {
                    setSearchText(item);
                  }}
                  key={index}
                  style={styles.suggestionItem}
                >
                  <Text style={styles.suggestionText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      ) : isLoading ? (
        // Đang loading
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Đang tìm kiếm...</Text>
        </View>
      ) : (
        // Đã search: luôn hiện sortListContainer, dưới là kết quả hoặc thông báo không tìm thấy
        <View style={{ flex: 1 }}>
          {searchResults.length === 0 && imageSearchResults.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text>Không tìm thấy sản phẩm</Text>
            </View>
          ) : (
            <>
              {searchResults.length > 0 && (
                <ScrollView>
                  {searchResults.map((item) => (
                    <RestaurantMediumCard
                      {...item}
                      key={item?.id}
                      navigate={(restaurant) => {
                        navigation.navigate("RestaurantScreen", { restaurant });
                      }}
                    />
                  ))}
                </ScrollView>
              )}
              {imageSearchResults.length > 0 && (
                <ScrollView>
                  {imageSearchResults.map((item) => (
                    <FoodSearchCard
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      avatar={item.imageUrl}
                      description={item.description}
                      navigate={() => {
                        console.log("Navigating to FoodScreen with data:");
                        console.log("Food item:", item);
                        console.log(
                          "Restaurant ID:",
                          item.category?.restaurant?.id
                        );

                        navigation.navigate("FoodScreen", {
                          food: item,
                          restaurantId: item.category?.restaurant?.id,
                        });
                      }}
                    />
                  ))}
                </ScrollView>
              )}
            </>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  headerContainer: {
    marginTop: 10,
    flexDirection: "row",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",

    paddingHorizontal: 10,
    borderRadius: 10,

    width: "80%",
  },
  searchInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    color: "#000",
  },
  sectionContainer: {
    height: "100%",
  },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    marginVertical: 8,
    height: "30%",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
  },
  clearText: {
    color: "#999",
  },
  historyItem: {
    fontSize: 15,
    color: "#333",
    marginBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
    paddingBottom: 6,
  },
  seeMore: {
    color: "#999",
    textAlign: "center",
    marginTop: 10,
  },
  suggestionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  suggestionItem: {
    backgroundColor: "#eee",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    margin: 4,
  },
  section2: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 16,
    marginVertical: 8,
    height: "100%",
  },
  suggestionText: {
    fontSize: 14,
    color: "#333",
  },
  sortListContainer: {
    paddingVertical: 8,
    backgroundColor: Colors.DEFAULT_WHITE,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 5,
    elevation: 1,
  },
});
