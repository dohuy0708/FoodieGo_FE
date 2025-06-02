import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
  Keyboard,
  Platform,
  Dimensions, // Thêm Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // Sử dụng từ safe-area-context
import Icon from "react-native-vector-icons/Ionicons";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps"; // Marker không cần import riêng nếu không dùng trực tiếp
import * as Location from "expo-location";

const GOOGLE_MAPS_API_KEY = "AIzaSyDmthPP3oRtm9E7tRAHo4_ChQ2y2LJeO6w";

const SelectAddressScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]); // Sẽ chứa kết quả từ Places API Autocomplete
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false); // Để kiểm soát việc hiển thị danh sách

  const [region, setRegion] = useState({
    latitude: 10.7769, // HCM city center
    longitude: 106.7009,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  // selectedLocation sẽ lưu trữ { latitude, longitude, address, name (tên địa điểm nếu có), placeId }
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentMapAddress, setCurrentMapAddress] = useState(
    "Di chuyển bản đồ để chọn vị trí"
  );
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  const mapRef = useRef(null);
  const searchTimeout = useRef(null);
  const isMapInteraction = useRef(false); // Cờ để xác định người dùng tương tác với map hay không

  // Hàm lấy địa chỉ từ tọa độ (Reverse Geocoding)
  const fetchAddressFromCoords = async (
    latitude,
    longitude,
    placeId = null,
    name = null
  ) => {
    if (
      !GOOGLE_MAPS_API_KEY ||
      GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY"
    ) {
      Alert.alert("Lỗi cấu hình", "Vui lòng cung cấp Google Maps API Key.");
      setCurrentMapAddress("Lỗi API Key");
      setSelectedLocation(null);
      return;
    }
    setIsLoadingAddress(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}&language=vi`
      );
      const data = await response.json();
      let fetchedAddress = "Không tìm thấy địa chỉ";
      let newSelectedLocation = null;

      if (data.results && data.results.length > 0) {
        fetchedAddress = data.results[0].formatted_address;
        newSelectedLocation = {
          latitude,
          longitude,
          address: fetchedAddress,
          name:
            name ||
            data.results[0].address_components[0]?.long_name ||
            fetchedAddress.split(",")[0], // Lấy tên gợi ý
          placeId: placeId || data.results[0].place_id,
        };
      }
      setCurrentMapAddress(fetchedAddress);
      setSelectedLocation(newSelectedLocation);
    } catch (error) {
      console.error("Lỗi khi lấy địa chỉ từ tọa độ:", error);
      setCurrentMapAddress("Lỗi khi tìm địa chỉ");
      setSelectedLocation(null);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Lấy vị trí hiện tại khi màn hình được tải
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Cần quyền truy cập vị trí",
          "Vui lòng cho phép ứng dụng truy cập vị trí của bạn."
        );
        // Lấy địa chỉ cho vị trí mặc định nếu không cấp quyền
        await fetchAddressFromCoords(region.latitude, region.longitude);
        return;
      }

      try {
        setIsLoadingAddress(true);
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(newRegion); // Cập nhật region của MapView
        if (mapRef.current) {
          mapRef.current.animateToRegion(newRegion, 1000);
        }
        // Fetch address cho vị trí hiện tại
        await fetchAddressFromCoords(
          location.coords.latitude,
          location.coords.longitude
        );
      } catch (error) {
        console.error("Lỗi lấy vị trí hiện tại:", error);
        Alert.alert("Lỗi", "Không thể lấy vị trí hiện tại.");
        await fetchAddressFromCoords(region.latitude, region.longitude); // Fallback
      }
    })();
  }, []); // Chỉ chạy một lần khi component mount

  // Xử lý khi người dùng dừng kéo thả bản đồ
  const onRegionChangeComplete = async (newRegionFromMap, details) => {
    // details.isGesture sẽ true nếu người dùng tương tác (kéo, zoom)
    if (details && details.isGesture) {
      isMapInteraction.current = true; // Đánh dấu là người dùng đã tương tác với map
      // Chỉ cập nhật region và fetch địa chỉ nếu tọa độ thay đổi đáng kể
      if (
        Math.abs(region.latitude - newRegionFromMap.latitude) > 0.000001 ||
        Math.abs(region.longitude - newRegionFromMap.longitude) > 0.000001
      ) {
        //setRegion(newRegionFromMap); // Cập nhật region state (dùng cho initialRegion)
        await fetchAddressFromCoords(
          newRegionFromMap.latitude,
          newRegionFromMap.longitude
        );
        setRegion((prevRegion) => ({
          // Giữ lại delta, chỉ cập nhật lat/lng
          ...prevRegion,
          latitude: newRegionFromMap.latitude,
          longitude: newRegionFromMap.longitude,
        }));
      }
    }
  };

  // Xử lý tìm kiếm địa điểm với Places API Autocomplete
  const handleSearch = async (query) => {
    setSearchQuery(query);
    setShowSearchResults(true); // Luôn hiển thị danh sách khi đang gõ

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    if (query.length < 2) {
      // Cần ít nhất 2 ký tự để tìm
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeout.current = setTimeout(async () => {
      if (
        !GOOGLE_MAPS_API_KEY ||
        GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY"
      ) {
        Alert.alert("Lỗi cấu hình", "Vui lòng cung cấp Google Maps API Key.");
        setIsSearching(false);
        return;
      }
      try {
        // Sử dụng Google Places API Autocomplete
        // sessiontoken giúp nhóm các yêu cầu autocomplete và details lại, có thể giúp giảm chi phí
        // const sessionToken = uuid.v4(); // Cần cài thư viện uuid: npm install uuid và import uuid from 'uuid';
        // Để đơn giản, tạm bỏ sessiontoken
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            query
          )}&key=${GOOGLE_MAPS_API_KEY}&language=vi&components=country:VN&types=address|establishment|geocode`
          // `&sessiontoken=${sessionToken}` // Nếu dùng session token
        );
        const data = await response.json();
        if (data.predictions && data.predictions.length > 0) {
          setSearchResults(data.predictions);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Lỗi tìm kiếm địa điểm:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500); // Debounce: đợi 500ms
  };

  // Chọn một địa điểm từ kết quả tìm kiếm (Places API Autocomplete)
  const onSelectSearchResult = async (prediction) => {
    Keyboard.dismiss();
    setSearchQuery(prediction.description); // Hiển thị tên địa điểm lên ô tìm kiếm
    setShowSearchResults(false); // Ẩn danh sách kết quả
    setSearchResults([]);

    if (
      !GOOGLE_MAPS_API_KEY ||
      GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY"
    ) {
      Alert.alert("Lỗi cấu hình", "Vui lòng cung cấp Google Maps API Key.");
      return;
    }

    setIsLoadingAddress(true); // Bắt đầu loading
    try {
      // Lấy chi tiết địa điểm (bao gồm tọa độ) bằng Place Details API
      // const sessionToken = uuid.v4(); // Nên dùng session token nếu đã dùng ở autocomplete
      const detailsResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&key=${GOOGLE_MAPS_API_KEY}&language=vi&fields=geometry,formatted_address,name,place_id`
        // `&sessiontoken=${sessionToken}`
      );
      const detailsData = await detailsResponse.json();

      if (detailsData.result && detailsData.result.geometry) {
        const { lat, lng } = detailsData.result.geometry.location;
        const newRegion = {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.005, // Zoom gần hơn một chút khi chọn từ search
          longitudeDelta: 0.005,
        };
        setRegion(newRegion); // Cập nhật region của MapView
        if (mapRef.current) {
          mapRef.current.animateToRegion(newRegion, 1000);
        }
        // Cập nhật địa chỉ và selectedLocation từ Place Details
        const addressFromDetails = detailsData.result.formatted_address;
        const nameFromDetails = detailsData.result.name;
        const placeIdFromDetails = detailsData.result.place_id;

        setCurrentMapAddress(addressFromDetails);
        setSelectedLocation({
          latitude: lat,
          longitude: lng,
          address: addressFromDetails,
          name: nameFromDetails,
          placeId: placeIdFromDetails,
        });
        isMapInteraction.current = false; // Reset cờ vì đây là chọn từ search, không phải kéo map
      } else {
        Alert.alert("Lỗi", "Không thể lấy chi tiết vị trí đã chọn.");
        await fetchAddressFromCoords(region.latitude, region.longitude); // Fallback về vị trí hiện tại trên map
      }
    } catch (error) {
      console.error("Lỗi lấy chi tiết địa điểm:", error);
      Alert.alert("Lỗi", "Lỗi khi lấy chi tiết vị trí.");
      await fetchAddressFromCoords(region.latitude, region.longitude); // Fallback
    } finally {
      setIsLoadingAddress(false); // Kết thúc loading
    }
  };

  // Nút "Định vị hiện tại"
  const handleNavigateToCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Cần quyền truy cập vị trí",
        "Vui lòng cấp quyền để sử dụng tính năng này."
      );
      return;
    }
    try {
      setIsLoadingAddress(true);
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = location.coords;
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(newRegion); // Cập nhật region của MapView
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
      await fetchAddressFromCoords(latitude, longitude);
      isMapInteraction.current = true; // Giả sử người dùng muốn tương tác với map sau khi nhấn nút này
    } catch (e) {
      console.error("Lỗi định vị hiện tại:", e);
      Alert.alert("Lỗi", "Không thể lấy vị trí hiện tại.");
      setIsLoadingAddress(false);
    }
  };

  // Xử lý khi chọn địa chỉ và quay lại
  const handleConfirmLocation = () => {
    if (selectedLocation && selectedLocation.address) {
      navigation.navigate({
        name: "AddAddressScreen",
        params: { pickedLocation: selectedLocation },
        merge: true,
      });
    } else {
      Alert.alert(
        "Chưa có địa chỉ",
        "Vui lòng di chuyển bản đồ hoặc tìm kiếm để chọn một địa chỉ hợp lệ."
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn địa chỉ</Text>
      </View>

      {/* Search Bar and Results */}
      <View style={styles.searchSection}>
        <View style={styles.searchInputContainer}>
          <Icon
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm địa điểm, địa chỉ..."
            value={searchQuery}
            onChangeText={handleSearch}
            onFocus={() => setShowSearchResults(true)} // Hiển thị khi focus
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setSearchResults([]);
                setShowSearchResults(false);
              }}
            >
              <Icon
                name="close-circle"
                size={20}
                color="#999"
                style={styles.clearIcon}
              />
            </TouchableOpacity>
          )}
          {isSearching && (
            <ActivityIndicator
              size="small"
              color="#666"
              style={{ marginLeft: 5 }}
            />
          )}
        </View>
        {showSearchResults && searchResults.length > 0 && (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.searchResultItem}
                onPress={() => onSelectSearchResult(item)}
              >
                <Icon
                  name="location-outline"
                  size={20}
                  color="#555"
                  style={styles.resultIcon}
                />
                <View style={styles.resultTextContainer}>
                  <Text style={styles.resultMainText}>
                    {item.structured_formatting?.main_text ||
                      item.description.split(",")[0]}
                  </Text>
                  <Text style={styles.resultSecondaryText}>
                    {item.structured_formatting?.secondary_text ||
                      item.description
                        .substring(item.description.indexOf(",") + 1)
                        .trim()}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            style={styles.searchResultsContainer}
            keyboardShouldPersistTaps="handled" // Để TouchableOpacity trong FlatList hoạt động tốt
          />
        )}
      </View>

      {/* Map */}
      <View style={styles.mapWrapper}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={region} // Chỉ đặt initialRegion một lần
          // region={region} // Nếu muốn map luôn đồng bộ với state region (có thể gây giật nếu cập nhật quá thường xuyên)
          onRegionChangeComplete={onRegionChangeComplete}
          showsUserLocation={false}
          showsMyLocationButton={false}
          moveOnMarkerPress={false} // Ngăn map di chuyển khi có marker (nếu bạn thêm marker)
        />
        <View style={styles.mapPinContainer}>
          <Icon name="location-sharp" size={40} color="#EA4335" />
        </View>
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={handleNavigateToCurrentLocation}
        >
          <Icon name="navigate" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Address Display and Confirm Button */}
      <View style={styles.addressConfirmContainer}>
        <Text style={styles.selectedAddressLabel}>Vị trí trên bản đồ:</Text>
        {isLoadingAddress &&
        (!selectedLocation || !selectedLocation.address) ? ( // Chỉ hiện loading chính nếu chưa có địa chỉ
          <ActivityIndicator
            size="small"
            color="#14b8a6"
            style={{ marginVertical: 8, alignSelf: "flex-start" }}
          />
        ) : (
          <Text style={styles.selectedAddressText} numberOfLines={2}>
            {selectedLocation?.address || currentMapAddress}
          </Text>
        )}
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!selectedLocation ||
              !selectedLocation.address ||
              isLoadingAddress) &&
              styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirmLocation}
          disabled={
            !selectedLocation || !selectedLocation.address || isLoadingAddress
          }
        >
          {isLoadingAddress && selectedLocation && selectedLocation.address ? ( // Hiển thị loading nhỏ trên nút nếu đang load nhưng đã có địa chỉ
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>Xác nhận địa chỉ này</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  searchSection: {
    backgroundColor: "#ffffff",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    zIndex: 10, // Đảm bảo thanh tìm kiếm và kết quả nổi lên trên map
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    padding: 0,
  },
  clearIcon: {
    marginLeft: 8,
  },
  searchResultsContainer: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: 1, // Khoảng cách nhỏ từ search bar
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
  },
  searchResultItem: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
  },
  resultIcon: {
    marginRight: 12,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultMainText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  resultSecondaryText: {
    fontSize: 13,
    color: "#777",
  },
  mapWrapper: {
    flex: 1,
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapPinContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -20 }, { translateY: -40 }], // Tâm của icon location-sharp
    alignItems: "center",
    justifyContent: "center",
  },
  currentLocationButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 30,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  addressConfirmContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 16 : 12, // Thêm padding cho bottom safe area
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  selectedAddressLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },
  selectedAddressText: {
    fontSize: 15,
    color: "#1f2937",
    fontWeight: "500",
    marginBottom: 10,
    minHeight: 20, // Để không bị nhảy layout
  },
  confirmButton: {
    backgroundColor: "#14b8a6",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  confirmButtonDisabled: {
    backgroundColor: "#a0aec0",
  },
  confirmButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default SelectAddressScreen;
