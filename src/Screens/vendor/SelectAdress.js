import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Dimensions,
} from "react-native";
import Display from "../../utils/Display";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GRAPHQL_ENDPOINT from "../../../config"; // Đảm bảo đường dẫn này đúng
import { CommonActions } from "@react-navigation/native";
import { updateAddressAPI,createNewAddress,updateRestaurantAPI} from "../../services/vendorService";
const SEARCH_GOONG_PLACE_QUERY_FULL = `
  query SearchGoongPlace($input: String!) {
    searchPlace(input: $input) {
      predictions {
        description
        place_id
      }
    }
  }
`;

const GET_GOONG_PLACE_DETAILS_QUERY_FULL = `
  query GetGoongPlaceDetails($input: String!) {
    searchAddress(input: $input) {
      latitude
      longitude
      placeId
    }
  }
`;

const REVERSE_GOONG_GEOCODE_QUERY_SIMPLE = `
  query ReverseGoongGeocode($lat: Float!, $lng: Float!) {
    reverseGeocode(lat: $lat, lng: $lng) {
      formatted_address
      place_id
      # Nếu backend của bạn CÓ trả về các thành phần này, hãy bỏ comment
      # streetName
      # wardName
      # districtName
      # provinceName
    }
  }
`;



const SelectAddressScreen = ({ navigation, route }) => {
   const currentAddressId=route?.params?.currentAddressId || null;
   const restaurantId=route?.params?.restaurantId || null;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 10.7769,
    longitude: 106.7009,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const mapRef = useRef(null);

  const callGraphQL = useCallback(async (query, variables) => {
    const token = await AsyncStorage.getItem("token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
    });
    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Lỗi máy chủ: Không thể phân tích phản hồi.`);
    }
    if (!response.ok || responseData.errors) {
      const errorMessage = responseData.errors?.map((e) => e.message).join("\n") || responseData.message || `Lỗi API (${response.status})`;
      throw new Error(errorMessage);
    }
    return responseData.data;
  }, []);
  const handleUpdateAddress = async () => {
    
    console.log("selectedAddress", selectedAddress);
    console.log("currentAddressId", currentAddressId);
    const addressUpdateData = {
            id: currentAddressId,
            province: selectedAddress?.province || null,
            district: selectedAddress?.district || null,
            ward: selectedAddress?.ward || null,
            street: selectedAddress?.street || null,
            latitude: selectedAddress?.latitude || null,
            longitude: selectedAddress?.longitude || null,
            placeId: selectedAddress?.placeId || null,
            label: "restaurant",
      };
      console.log("addressUpdateData", addressUpdateData);
      console.log("Updating address with data:", addressUpdateData);
      if(currentAddressId){
      const updatedAddress = await updateAddressAPI(addressUpdateData);
      if (!updatedAddress) {
        throw new Error("Không thể cập nhật địa chỉ.");
      }
      console.log("Address update successful:", updatedAddress);
      navigation.navigate('HomeVendor');
    }
    else{
        const addressUpdateData = {
           
            province: selectedAddress?.province || null,
            district: selectedAddress?.district || null,
            ward: selectedAddress?.ward || null,
            street: selectedAddress?.street || null,
            latitude: selectedAddress?.latitude || null,
            longitude: selectedAddress?.longitude || null,
            placeId: selectedAddress?.placeId || null,
            label: "restaurant",
      };
        const newAddress = await createNewAddress(addressUpdateData);
        const addressId=newAddress.id;
        if (!newAddress) {
            throw new Error("Không thể tạo địa chỉ mới.");
          }
          console.log("New address created:", newAddress);
          const updateRestaurant = await updateRestaurantAPI({
            id: restaurantId,
            addressId: addressId,
          });
          if (!updateRestaurant) {
            throw new Error("Không thể cập nhật nhà hàng.");
          }
          navigation.navigate('HomeVendor');
    }
  }
  const parseFormattedAddress = (formattedAddress) => {
    if (!formattedAddress || typeof formattedAddress !== "string") {
      return { street: "", ward: "", district: "", province: "" };
    }
    const parts = formattedAddress.split(",").map((part) => part.trim());
    let street = "", ward = "", district = "", province = "";
    const len = parts.length;
    const provinceKeywords = ["tỉnh", "thành phố", "tp."];
    const districtKeywords = ["quận", "huyện", "thị xã", "tx."];
    const wardKeywords = ["phường", "xã", "thị trấn", "tt."];
    let provinceIndex = -1, districtIndex = -1, wardIndex = -1;
    for (let i = len - 1; i >= 0; i--) {
      const partLower = parts[i].toLowerCase();
      if (provinceIndex === -1 && provinceKeywords.some((kw) => partLower.includes(kw))) {
        provinceIndex = i;
        province = parts[i];
        continue;
      }
      if (districtIndex === -1 && provinceIndex !== i && districtKeywords.some((kw) => partLower.includes(kw))) {
        districtIndex = i;
        district = parts[i];
        continue;
      }
      if (wardIndex === -1 && provinceIndex !== i && districtIndex !== i && wardKeywords.some((kw) => partLower.includes(kw))) {
        wardIndex = i;
        ward = parts[i];
        continue;
      }
    }
    if (!province && len > 0) {
      province = parts[len - 1];
      provinceIndex = len - 1;
    }
    if (!district && len > 1 && (provinceIndex === -1 || provinceIndex > len - 2)) {
      district = parts[len - 2];
      districtIndex = len - 2;
    }
    if (!ward && len > 2 && (districtIndex === -1 || districtIndex > len - 3) && (provinceIndex === -1 || provinceIndex > len - 3)) {
      ward = parts[len - 3];
      wardIndex = len - 3;
    }
    const streetParts = [];
    for (let i = 0; i < len; i++) {
      if (i !== provinceIndex && i !== districtIndex && i !== wardIndex) {
        streetParts.push(parts[i]);
      }
    }
    street = streetParts.join(", ").trim();
    if (!street && formattedAddress) {
      street = formattedAddress;
    }
    const MAX_LEN = 255;
    return {
      street: (street || "").substring(0, MAX_LEN).trim(),
      ward: (ward || "").substring(0, MAX_LEN).trim(),
      district: (district || "").substring(0, MAX_LEN).trim(),
      province: (province || "").substring(0, MAX_LEN).trim(),
    };
  };

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setShowSearchResults(true);
    if (query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    setTimeout(async () => {
      try {
        const data = await callGraphQL(SEARCH_GOONG_PLACE_QUERY_FULL, { input: query });
        setSearchResults(data.searchPlace?.predictions || []);
      } catch (error) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 600);
  }, [callGraphQL]);

  const onSelectSearchResult = useCallback(async (prediction) => {
    const selectedDescription = prediction.description;
    try {
      const detailsData = await callGraphQL(GET_GOONG_PLACE_DETAILS_QUERY_FULL, { input: selectedDescription });
      console.log("detailsData from select address", detailsData);
      if (!detailsData?.searchAddress) throw new Error("Không thể lấy tọa độ.");
      const { latitude, longitude } = detailsData.searchAddress;
      const latNum = parseFloat(latitude);
      const lngNum = parseFloat(longitude);
      if (isNaN(latNum) || isNaN(lngNum)) throw new Error("Tọa độ không hợp lệ.");
      // Lấy địa chỉ chi tiết từ reverse geocode
      const reverseData = await callGraphQL(REVERSE_GOONG_GEOCODE_QUERY_SIMPLE, { lat: latNum, lng: lngNum });
      let formattedAddress = selectedDescription;
      let placeId = prediction.place_id;
      if (reverseData?.reverseGeocode && reverseData.reverseGeocode.length > 0) {
        formattedAddress = reverseData.reverseGeocode[0].formatted_address;
        placeId = reverseData.reverseGeocode[0].place_id;
      }
      const parsedComponents = parseFormattedAddress(formattedAddress);
      const addressData = {
        latitude: latNum,
        longitude: lngNum,
        address: formattedAddress,
        street: parsedComponents.street,
        ward: parsedComponents.ward,
        district: parsedComponents.district,
        province: parsedComponents.province,
        placeId: placeId,
      };
      setSelectedAddress(addressData);
      setMapRegion({
        latitude: latNum,
        longitude: lngNum,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setShowSearchResults(false);
      setSearchQuery(formattedAddress);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể lấy chi tiết vị trí.");
    }
  }, [callGraphQL]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn địa chỉ</Text>
      </View>
      <View style={styles.searchSection}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm địa điểm..."
            value={searchQuery}
            onChangeText={handleSearch}
            onFocus={() => setShowSearchResults(true)}
            onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(""); setSearchResults([]); setShowSearchResults(false); }}>
              <Icon name="close-circle" size={20} color="#999" style={styles.clearIcon} />
            </TouchableOpacity>
          )}
          {isSearching && (
            <ActivityIndicator size="small" color="#666" style={{ marginLeft: 5 }} />
          )}
        </View>
        {showSearchResults && searchResults.length > 0 && (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.searchResultItem} onPress={() => onSelectSearchResult(item)}>
                <Icon name="location-outline" size={20} color="#555" style={styles.resultIcon} />
                <View style={styles.resultTextContainer}>
                  <Text style={styles.resultMainText} numberOfLines={1}>{item.description.split(",")[0]}</Text>
                  <Text style={styles.resultSecondaryText} numberOfLines={1}>{item.description.substring(item.description.indexOf(",") + 1).trim()}</Text>
                </View>
              </TouchableOpacity>
            )}
            style={[styles.searchResultsContainer,{flex:1}]}
            keyboardShouldPersistTaps="always"
          />
        )}
      </View>
      {/* Hiển thị map và marker nếu đã chọn địa chỉ */}
      {/* <View style={{ width: "100%", height: 220, backgroundColor: "#e0e0e0", marginTop: 10 }}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          region={mapRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
        >
          {selectedAddress && (
            <Marker
              coordinate={{ latitude: selectedAddress.latitude, longitude: selectedAddress.longitude }}
              title="Vị trí đã chọn"
              description={selectedAddress.address}
            />
          )}
        </MapView>
      </View> */}
      {/* Hiển thị địa chỉ đã chọn và nút xác nhận */}
      <View style={{ padding: 16 }}>
  {/* {selectedAddress && (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontWeight: "bold", marginBottom: 4, color: "#007bff" }}>
        Địa chỉ bạn đã chọn:
      </Text>
      <Text style={{ color: "#333" }}>{selectedAddress.address}</Text>
    </View>
  )} */}
  <TouchableOpacity
    disabled={!selectedAddress}
    onPress={() => {
      if (selectedAddress) {
        handleUpdateAddress();
      }
    }}
    style={{
      backgroundColor: selectedAddress ? "#007bff" : "#ccc",
      padding: 14,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 8,
    }}
  >
    <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
      Xác nhận và lưu địa chỉ này
    </Text>
  </TouchableOpacity>
</View>
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: { padding: 8, marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#1f2937" },
  searchSection: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    zIndex: 10,
    paddingBottom: 8,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 12,
    /* Bỏ margin bottom để searchResultsContainer sát hơn */ paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: "#111827", paddingVertical: 0 },
  clearIcon: { marginLeft: 10 },
  searchResultsContainer: {
    height: Display.setHeight(50),
    backgroundColor: "#ffffff",
    position: "absolute",
    top: 68,
    /* Điều chỉnh top cho khớp với search bar */ left: 16,
    right: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    zIndex: 20,
  },
  searchResultItem: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
  },
  resultIcon: { marginRight: 12 },
  resultTextContainer: { flex: 1 },
  resultMainText: { fontSize: 15, color: "#333", fontWeight: "500" },
  resultSecondaryText: { fontSize: 13, color: "#777", marginTop: 2 },
});

export default SelectAddressScreen;