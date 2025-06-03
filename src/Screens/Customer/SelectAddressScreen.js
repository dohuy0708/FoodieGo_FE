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
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GRAPHQL_ENDPOINT from "../../../config"; // Đảm bảo đường dẫn này đúng

// --- GraphQL Query/Mutation Strings ---
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
      # Nếu backend có trả về các thành phần chi tiết, hãy query ở đây
      # streetName
      # wardName
      # districtName
      # provinceName
    }
  }
`;

const CREATE_ADDRESS_MUTATION = `
  mutation CreateNewAddress($input: CreateAddressInput!) {
    createAddress(createAddressInput: $input) {
      id
    }
  }
`;

const UPDATE_ADDRESS_MUTATION = `
  mutation UpdateExistingAddress($input: UpdateAddressInput!) {
    updateAddress(updateAddressInput: $input) {
      id
    }
  }
`;

// Mutation này gửi addressId, backend cần xử lý để cập nhật User.addressId trong DB
const UPDATE_USER_WITH_ADDRESS_ID_MUTATION = `
  mutation UpdateUserWithAddressId($userId: Int!, $addressIdToLink: Int!) {
    updateUser(updateUserInput: {
      id: $userId,
      addressId: $addressIdToLink # Gửi addressId
    }) {
      id
      name
      address {
        id
        # street
        # province
      }
    }
  }
`;
// --- Hết GraphQL ---

// Hàm phân tích địa chỉ (CƠ BẢN - CẦN CẢI THIỆN VÀ KIỂM TRA KỸ)
const parseFormattedAddress = (formattedAddress) => {
  console.log("Attempting to parse address:", formattedAddress);
  if (!formattedAddress || typeof formattedAddress !== "string") {
    console.warn("parseFormattedAddress: Input is not a valid string.");
    return { street: "", ward: "", district: "", province: "" };
  }

  const parts = formattedAddress.split(",").map((part) => part.trim());
  let street = "",
    ward = "",
    district = "",
    province = "";
  const len = parts.length;

  // Logic phân tích cơ bản dựa trên số lượng phần tử
  // Giả định phổ biến: Đường, Phường/Xã, Quận/Huyện, Tỉnh/TP
  if (len >= 4) {
    province = parts[len - 1];
    district = parts[len - 2];
    ward = parts[len - 3];
    street = parts.slice(0, len - 3).join(", ");
  } else if (len === 3) {
    province = parts[2];
    district = parts[1];
    // Không chắc phần tử đầu là street hay ward, tạm gán cho street
    street = parts[0];
    // ward = ""; // Hoặc cố gắng tìm từ khóa
  } else if (len === 2) {
    province = parts[1];
    street = parts[0];
  } else if (len === 1) {
    street = parts[0]; // Toàn bộ là street hoặc tên địa điểm
  }

  // Cố gắng tinh chỉnh bằng từ khóa (rất cơ bản)
  // Bạn có thể mở rộng danh sách từ khóa này
  const provinceKeywords = ["tỉnh", "thành phố", "tp"];
  const districtKeywords = ["quận", "huyện", "thị xã", "tx"];
  const wardKeywords = ["phường", "xã", "thị trấn", "tt"];

  // Tinh chỉnh province (thường là phần tử cuối)
  if (parts.length > 0) {
    const lastPart = parts[parts.length - 1];
    if (provinceKeywords.some((kw) => lastPart.toLowerCase().includes(kw))) {
      province = lastPart;
    }
  }

  // Tinh chỉnh district (thường là phần tử kế cuối)
  if (parts.length > 1) {
    const secondLastPart = parts[parts.length - 2];
    if (
      districtKeywords.some((kw) => secondLastPart.toLowerCase().includes(kw))
    ) {
      district = secondLastPart;
      // Nếu district được xác định, và province chưa có hoặc giống district, cập nhật province
      if (!province || province === district) {
        if (parts.length > 0) province = parts[parts.length - 1]; // Lấy lại phần tử cuối làm tỉnh
      }
    }
  }

  // Tinh chỉnh ward
  if (parts.length > 2) {
    const thirdLastPart = parts[parts.length - 3];
    if (wardKeywords.some((kw) => thirdLastPart.toLowerCase().includes(kw))) {
      ward = thirdLastPart;
      // Nếu ward được xác định, và district/province chưa có hoặc trùng, cập nhật lại
      if (!district || district === ward) {
        if (parts.length > 1) district = parts[parts.length - 2];
        if (!province || province === district || province === ward) {
          if (parts.length > 0) province = parts[parts.length - 1];
        }
      }
    }
  }

  // Gán phần còn lại cho street nếu street chưa được xác định rõ ràng từ các bước trên
  // và các thành phần khác đã có vẻ hợp lý.
  if (street === "" && (ward || district || province)) {
    const remainingParts = [];
    for (const part of parts) {
      if (part !== ward && part !== district && part !== province) {
        remainingParts.push(part);
      }
    }
    street = remainingParts.join(", ");
  }

  // Nếu street vẫn là toàn bộ formattedAddress (trường hợp ít thành phần)
  // và các thành phần khác đã được xác định, cố gắng loại bỏ chúng khỏi street
  if (street === formattedAddress && (ward || district || province)) {
    let tempStreet = formattedAddress;
    if (province)
      tempStreet = tempStreet.replace(
        new RegExp(`,\\s*${province.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`),
        ""
      );
    if (district)
      tempStreet = tempStreet.replace(
        new RegExp(`,\\s*${district.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`),
        ""
      );
    if (ward)
      tempStreet = tempStreet.replace(
        new RegExp(`,\\s*${ward.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`),
        ""
      );
    street = tempStreet.trim();
  }

  // Đảm bảo street không rỗng nếu các thành phần khác cũng rỗng (trường hợp chỉ có 1 phần)
  if (!street && !ward && !district && !province && parts.length > 0) {
    street = formattedAddress;
  }

  const MAX_LEN = 255;
  const result = {
    street: (street || "").substring(0, MAX_LEN),
    ward: (ward || "").substring(0, MAX_LEN),
    district: (district || "").substring(0, MAX_LEN),
    province: (province || "").substring(0, MAX_LEN),
  };
  console.log("Parsed result:", result);
  return result;
};

const SelectAddressScreen = ({ navigation, route }) => {
  const { userId, currentAddressId } = route.params || {};

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const defaultRegion = useRef({
    latitude: 10.7769,
    longitude: 106.7009,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  }).current;
  const [mapRegion, setMapRegion] = useState(defaultRegion);
  const [selectedLocation, setSelectedLocation] = useState(null); // Sẽ chứa các thành phần chi tiết sau khi parse
  const [currentMapAddress, setCurrentMapAddress] = useState(
    "Di chuyển bản đồ để chọn vị trí"
  );
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(null);

  const mapRef = useRef(null);
  const searchTimeout = useRef(null);
  const isProgrammaticPan = useRef(false);
  const hasFetchedInitialAddress = useRef(false);

  const callGraphQL = useCallback(async (query, variables) => {
    // ... (Hàm callGraphQL giữ nguyên như phiên bản trước)
    console.log(
      "callGraphQL - Query:",
      query.substring(0, 60) + "...",
      "Variables:",
      variables
    );
    const token = await AsyncStorage.getItem("token");
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      throw new Error("Token không được tìm thấy. Vui lòng đăng nhập lại.");
    }
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ query, variables }),
      });
      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Lỗi parse JSON: ${responseText.substring(0, 100)}`);
      }
      console.log(
        "callGraphQL - Parsed Response:",
        JSON.stringify(responseData, null, 2)
      );
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại."
        );
      }
      if (!response.ok) {
        const errTxt =
          responseData.errors?.map((e) => e.message).join("\n") ||
          responseData.message ||
          `Lỗi API (${response.status})`;
        throw new Error(errTxt);
      }
      if (responseData.errors) {
        throw new Error(responseData.errors.map((e) => e.message).join("\n"));
      }
      return responseData.data;
    } catch (error) {
      throw error;
    }
  }, []);

  const fetchAddressFromCoordsGraphQL = useCallback(
    async (latitude, longitude, isUserInitiated = false) => {
      if (isLoadingAddress && !isUserInitiated) return;
      setIsLoadingAddress(true);
      if (isUserInitiated) {
        setSelectedLocation(null);
        setCurrentMapAddress("Đang xác định vị trí...");
      }
      try {
        const data = await callGraphQL(REVERSE_GOONG_GEOCODE_QUERY_SIMPLE, {
          lat: latitude,
          lng: longitude,
        });
        if (data.reverseGeocode && data.reverseGeocode.length > 0) {
          const primaryResult = data.reverseGeocode[0];
          const formattedAddress = primaryResult.formatted_address;
          const parsedComponents = parseFormattedAddress(formattedAddress); // ÁP DỤNG HÀM PARSE

          setCurrentMapAddress(formattedAddress);
          setSelectedLocation({
            latitude,
            longitude,
            address: formattedAddress, // Giữ lại formatted_address gốc
            name: formattedAddress.split(",")[0], // Tên vẫn lấy từ phần đầu
            placeId: primaryResult.place_id,
            street: parsedComponents.street, // Lưu các thành phần đã parse
            ward: parsedComponents.ward,
            district: parsedComponents.district,
            province: parsedComponents.province,
          });
        } else {
          setCurrentMapAddress("Không tìm thấy địa chỉ.");
          setSelectedLocation(null);
        }
      } catch (error) {
        setCurrentMapAddress("Lỗi khi tìm địa chỉ.");
        setSelectedLocation(null);
        if (
          error.message.includes("Phiên đăng nhập") ||
          error.message.includes("Token không được tìm thấy")
        ) {
          Alert.alert("Lỗi xác thực", error.message, [
            { text: "OK", onPress: () => navigation.goBack() },
          ]);
        } else {
          console.error("Lỗi Reverse Geocode:", error.message);
        }
      } finally {
        setIsLoadingAddress(false);
        if (!hasFetchedInitialAddress.current)
          hasFetchedInitialAddress.current = true;
      }
    },
    [callGraphQL, isLoadingAddress, navigation]
  );

  useEffect(() => {
    const initializeLocation = async () => {
      /* ... (Giữ nguyên logic, nó đã gọi fetchAddressFromCoordsGraphQL) ... */
      if (
        hasFetchedInitialAddress.current &&
        locationPermissionGranted !== null
      )
        return;
      let { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermissionGranted(status === "granted");
      if (status === "granted") {
        try {
          setIsLoadingAddress(true);
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
            timeout: 10000,
          });
          const { latitude, longitude } = location.coords;
          const newRegion = {
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          isProgrammaticPan.current = true;
          setMapRegion(newRegion);
          if (mapRef.current) mapRef.current.animateToRegion(newRegion, 1000);
          await fetchAddressFromCoordsGraphQL(latitude, longitude);
        } catch (error) {
          await fetchAddressFromCoordsGraphQL(
            defaultRegion.latitude,
            defaultRegion.longitude
          );
        }
      } else {
        Alert.alert("Quyền vị trí bị từ chối", "Sử dụng vị trí mặc định.");
        await fetchAddressFromCoordsGraphQL(
          defaultRegion.latitude,
          defaultRegion.longitude
        );
      }
    };
    initializeLocation();
  }, [fetchAddressFromCoordsGraphQL, defaultRegion, locationPermissionGranted]);

  const onRegionChangeComplete = useCallback(
    async (newRegionFromMap, details) => {
      // ... (Giữ nguyên logic, nó đã gọi fetchAddressFromCoordsGraphQL) ...
      if (isProgrammaticPan.current) {
        isProgrammaticPan.current = false;
        return;
      }
      if (details && details.isGesture) {
        if (
          Math.abs(mapRegion.latitude - newRegionFromMap.latitude) > 0.000001 ||
          Math.abs(mapRegion.longitude - newRegionFromMap.longitude) > 0.000001
        ) {
          setMapRegion(newRegionFromMap);
          await fetchAddressFromCoordsGraphQL(
            newRegionFromMap.latitude,
            newRegionFromMap.longitude,
            true
          );
        }
      }
    },
    [fetchAddressFromCoordsGraphQL, mapRegion]
  );

  const handleSearch = useCallback(
    (query) => {
      // ... (Giữ nguyên logic) ...
      setSearchQuery(query);
      setShowSearchResults(true);
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      if (query.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      searchTimeout.current = setTimeout(async () => {
        try {
          const data = await callGraphQL(SEARCH_GOONG_PLACE_QUERY_FULL, {
            input: query,
          });
          setSearchResults(data.searchPlace?.predictions || []);
        } catch (error) {
          setSearchResults([]);
          if (
            error.message.includes("Phiên đăng nhập") ||
            error.message.includes("Token không được tìm thấy")
          )
            Alert.alert("Lỗi xác thực", error.message);
        } finally {
          setIsSearching(false);
        }
      }, 600);
    },
    [callGraphQL]
  );

  const onSelectSearchResult = useCallback(
    async (prediction) => {
      Keyboard.dismiss();
      const selectedDescription = prediction.description;
      setSearchQuery(selectedDescription);
      setShowSearchResults(false);
      setSearchResults([]);
      setIsLoadingDetails(true);
      setSelectedLocation(null);
      setCurrentMapAddress("Đang tải chi tiết vị trí...");
      try {
        const detailsData = await callGraphQL(
          GET_GOONG_PLACE_DETAILS_QUERY_FULL,
          { input: selectedDescription }
        );
        if (!detailsData.searchAddress)
          throw new Error("Không thể lấy tọa độ.");
        const { latitude, longitude } = detailsData.searchAddress;
        const latNum = parseFloat(latitude);
        const lngNum = parseFloat(longitude);
        if (isNaN(latNum) || isNaN(lngNum))
          throw new Error("Tọa độ không hợp lệ.");

        isProgrammaticPan.current = true;
        const newMapRegion = {
          latitude: latNum,
          longitude: lngNum,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };
        setMapRegion(newMapRegion);
        if (mapRef.current) mapRef.current.animateToRegion(newMapRegion, 1000);

        // Gọi Reverse Geocode để lấy formatted_address và phân tích các thành phần
        const reverseData = await callGraphQL(
          REVERSE_GOONG_GEOCODE_QUERY_SIMPLE,
          { lat: latNum, lng: lngNum }
        );
        if (
          reverseData.reverseGeocode &&
          reverseData.reverseGeocode.length > 0
        ) {
          const primaryResult = reverseData.reverseGeocode[0];
          const formattedAddress = primaryResult.formatted_address;
          const parsedComponents = parseFormattedAddress(formattedAddress); // ÁP DỤNG HÀM PARSE

          setCurrentMapAddress(formattedAddress);
          setSelectedLocation({
            latitude: latNum,
            longitude: lngNum,
            address: formattedAddress, // Giữ formatted_address gốc
            name: selectedDescription.split(",")[0], // Giữ tên từ Autocomplete
            placeId: primaryResult.place_id, // Dùng place_id từ reverse geocode
            street: parsedComponents.street, // Lưu các thành phần đã parse
            ward: parsedComponents.ward,
            district: parsedComponents.district,
            province: parsedComponents.province,
          });
        } else {
          // Fallback nếu reverse geocode lỗi
          const parsedComponents = parseFormattedAddress(selectedDescription);
          setCurrentMapAddress(selectedDescription);
          setSelectedLocation({
            latitude: latNum,
            longitude: lngNum,
            address: selectedDescription,
            name: selectedDescription.split(",")[0],
            placeId: prediction.place_id,
            street: parsedComponents.street,
            ward: parsedComponents.ward,
            district: parsedComponents.district,
            province: parsedComponents.province,
          });
        }
      } catch (error) {
        /* ... xử lý lỗi ... */
      } finally {
        setIsLoadingDetails(false);
      }
    },
    [callGraphQL, mapRegion, navigation]
  ); // Bỏ fetchAddressFromCoordsGraphQL

  const handleNavigateToCurrentLocation = useCallback(async () => {
    /* ... (Giữ nguyên) ... */
  }, [fetchAddressFromCoordsGraphQL, locationPermissionGranted]);

  // Xử lý khi xác nhận vị trí
  const handleConfirmAndSaveChanges = async () => {
    // Kiểm tra selectedLocation và các thành phần đã parse
    if (
      !selectedLocation?.address ||
      !selectedLocation.latitude ||
      !selectedLocation.longitude ||
      !selectedLocation.street ||
      !selectedLocation.province
    ) {
      // Thêm kiểm tra street và province (ít nhất)
      Alert.alert(
        "Địa chỉ không đủ thông tin",
        "Vui lòng chọn một địa chỉ mà hệ thống có thể phân tích được các thành phần chi tiết (đường, tỉnh/thành phố)."
      );
      console.log(
        "selectedLocation hiện tại không đủ chi tiết:",
        selectedLocation
      );
      return;
    }
    if (!userId) {
      /* ... lỗi userId ... */ return;
    }

    setIsSavingAddress(true);
    try {
      const addressInputForBackend = {
        label: selectedLocation.name.substring(0, 254),
        street: selectedLocation.street, // Sử dụng thành phần đã phân tích
        province: selectedLocation.province, // Sử dụng thành phần đã phân tích
        district: selectedLocation.district || "", // Gửi chuỗi rỗng nếu không có
        ward: selectedLocation.ward || "", // Gửi chuỗi rỗng nếu không có
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        placeId: selectedLocation.placeId || null,
      };
      console.log(
        "Input gửi lên cho Create/Update Address:",
        JSON.stringify(addressInputForBackend, null, 2)
      );

      let finalAddressId;
      if (currentAddressId) {
        const updateInput = { id: currentAddressId, ...addressInputForBackend };
        const updateResult = await callGraphQL(UPDATE_ADDRESS_MUTATION, {
          input: updateInput,
        });
        if (!updateResult.updateAddress?.id)
          throw new Error("Cập nhật địa chỉ thất bại.");
        finalAddressId = updateResult.updateAddress.id;
      } else {
        const createResult = await callGraphQL(CREATE_ADDRESS_MUTATION, {
          input: addressInputForBackend,
        });
        if (!createResult.createAddress?.id)
          throw new Error("Tạo địa chỉ mới thất bại.");
        finalAddressId = createResult.createAddress.id;

        const updateUserLinkResult = await callGraphQL(
          UPDATE_USER_WITH_ADDRESS_ID_MUTATION,
          {
            userId: userId,
            addressIdToLink: finalAddressId,
          }
        );
        if (!updateUserLinkResult.updateUser?.id)
          throw new Error("Liên kết địa chỉ với người dùng thất bại.");
        if (
          updateUserLinkResult.updateUser.address === null &&
          finalAddressId
        ) {
          console.warn("LƯU Ý: User.address trả về là null sau khi cập nhật.");
        }
      }
      Alert.alert("Thành công", "Địa chỉ của bạn đã được cập nhật.");
      navigation.navigate({
        name: "AddressScreen",
        params: { addressUpdated: true, newAddressId: finalAddressId },
        merge: true,
      });
    } catch (error) {
      /* ... xử lý lỗi ... */
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Phần return JSX (UI)
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
        <Text style={styles.headerTitle}>Chọn địa chỉ trên bản đồ</Text>
      </View>

      {/* Search Section */}
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
            placeholder="Tìm địa điểm..."
            value={searchQuery}
            onChangeText={handleSearch}
            onFocus={() => setShowSearchResults(true)}
            onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
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
                  <Text style={styles.resultMainText} numberOfLines={1}>
                    {item.description.split(",")[0]}
                  </Text>
                  <Text style={styles.resultSecondaryText} numberOfLines={1}>
                    {item.description
                      .substring(item.description.indexOf(",") + 1)
                      .trim()}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            style={styles.searchResultsContainer}
            keyboardShouldPersistTaps="always"
          />
        )}
      </View>

      {/* Map Section */}
      <View style={styles.mapWrapper}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={mapRegion}
          onRegionChangeComplete={onRegionChangeComplete}
          showsUserLocation={false}
          showsMyLocationButton={false}
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

      {/* Confirm Section */}
      <View style={styles.addressConfirmContainer}>
        <Text style={styles.selectedAddressLabel}>Vị trí đã chọn:</Text>
        {(isLoadingAddress || isLoadingDetails) &&
        !selectedLocation?.address ? (
          <ActivityIndicator
            size="small"
            color="#14b8a6"
            style={styles.addressLoadingIndicator}
          />
        ) : (
          <Text style={styles.selectedAddressText} numberOfLines={2}>
            {selectedLocation?.address || currentMapAddress}
          </Text>
        )}
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!userId ||
              !selectedLocation?.address ||
              isLoadingAddress ||
              isLoadingDetails ||
              isSavingAddress) &&
              styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirmAndSaveChanges}
          disabled={
            !userId ||
            !selectedLocation?.address ||
            isLoadingAddress ||
            isLoadingDetails ||
            isSavingAddress
          }
        >
          {isSavingAddress ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (isLoadingAddress || isLoadingDetails) &&
            selectedLocation?.address ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>Xác nhận & Lưu địa chỉ</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Styles (Dán đầy đủ styles của bạn ở đây, giống như phiên bản trước)
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
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: "#111827", paddingVertical: 0 },
  clearIcon: { marginLeft: 10 },
  searchResultsContainer: {
    maxHeight: height * 0.35,
    backgroundColor: "#ffffff",
    position: "absolute",
    top: 68,
    left: 16,
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
  mapWrapper: { flex: 1, backgroundColor: "#e0e0e0" },
  map: { ...StyleSheet.absoluteFillObject },
  mapPinContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -20 }, { translateY: -40 }],
  },
  currentLocationButton: {
    position: "absolute",
    bottom: 25,
    right: 20,
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 30,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  addressConfirmContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  selectedAddressLabel: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 5,
    fontWeight: "500",
  },
  selectedAddressText: {
    fontSize: 16,
    color: "#212529",
    fontWeight: "500",
    marginBottom: 12,
    minHeight: 40,
    lineHeight: 22,
  },
  addressLoadingIndicator: { marginVertical: 10, alignSelf: "flex-start" },
  confirmButton: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  confirmButtonDisabled: { backgroundColor: "#ced4da" },
  confirmButtonText: { color: "#ffffff", fontSize: 17, fontWeight: "600" },
});

export default SelectAddressScreen;
