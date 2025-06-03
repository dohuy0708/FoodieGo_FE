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

// --- GraphQL Query/Mutation Strings (Giữ nguyên như bạn cung cấp) ---
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

const CREATE_ADDRESS_MUTATION = `
  mutation CreateNewAddress($input: CreateAddressInput!) {
    createAddress(createAddressInput: $input) {
      id
      label
      street
      ward
      district
      province
    }
  }
`;

const UPDATE_ADDRESS_MUTATION = `
  mutation UpdateExistingAddress($input: UpdateAddressInput!) {
    updateAddress(updateAddressInput: $input) {
      id
      label
      street
      ward
      district
      province
    }
  }
`;

const LINK_USER_TO_ADDRESS_MUTATION_FINAL = `
   mutation UserAddressLink($userId: Int!, $addressId: Int) { # Tên biến $addressId
    linkUserAddress(userId: $userId, addressId: $addressId) { # Tên mutation mới ở resolver
      id
      name
      address { # Query lại address để xem kết quả
        id
        # Thêm các trường của Address bạn muốn thấy ở đây, ví dụ:
        # street
        # province
        # formattedAddress (nếu Address entity của bạn có trường này)
      }
    }
  }
`;
// --- Hết GraphQL ---

// Hàm phân tích địa chỉ (CƠ BẢN - CẦN CẢI THIỆN VÀ KIỂM TRA KỸ VỚI NHIỀU DỮ LIỆU)
const parseFormattedAddress = (formattedAddress) => {
  console.log("[parseFormattedAddress] Input:", formattedAddress);
  if (!formattedAddress || typeof formattedAddress !== "string") {
    console.warn("[parseFormattedAddress] Input không hợp lệ.");
    return { street: "", ward: "", district: "", province: "" };
  }

  const parts = formattedAddress.split(",").map((part) => part.trim());
  let street = "",
    ward = "",
    district = "",
    province = "";
  const len = parts.length;

  // Ưu tiên các từ khóa để xác định chính xác hơn
  const provinceKeywords = ["tỉnh", "thành phố", "tp."]; // Thêm các từ viết tắt nếu có
  const districtKeywords = ["quận", "huyện", "thị xã", "tx."];
  const wardKeywords = ["phường", "xã", "thị trấn", "tt."];

  let provinceIndex = -1,
    districtIndex = -1,
    wardIndex = -1;

  // Tìm từ dưới lên để tăng độ chính xác
  for (let i = len - 1; i >= 0; i--) {
    const partLower = parts[i].toLowerCase();
    if (
      provinceIndex === -1 &&
      provinceKeywords.some((kw) => partLower.includes(kw))
    ) {
      provinceIndex = i;
      province = parts[i];
      continue; // Đã tìm thấy tỉnh, chuyển sang phần tử tiếp theo
    }
    if (
      districtIndex === -1 &&
      provinceIndex !== i &&
      districtKeywords.some((kw) => partLower.includes(kw))
    ) {
      districtIndex = i;
      district = parts[i];
      continue;
    }
    if (
      wardIndex === -1 &&
      provinceIndex !== i &&
      districtIndex !== i &&
      wardKeywords.some((kw) => partLower.includes(kw))
    ) {
      wardIndex = i;
      ward = parts[i];
      continue;
    }
  }

  // Nếu không tìm thấy tỉnh/thành phố bằng từ khóa, thử lấy phần tử cuối cùng
  if (!province && len > 0) {
    province = parts[len - 1];
    provinceIndex = len - 1;
  }
  // Nếu không tìm thấy quận/huyện và có ít nhất 2 phần tử (và phần tử đó không phải là tỉnh)
  if (
    !district &&
    len > 1 &&
    (provinceIndex === -1 || provinceIndex > len - 2)
  ) {
    district = parts[len - 2];
    districtIndex = len - 2;
  }
  // Nếu không tìm thấy phường/xã và có ít nhất 3 phần tử
  if (
    !ward &&
    len > 2 &&
    (districtIndex === -1 || districtIndex > len - 3) &&
    (provinceIndex === -1 || provinceIndex > len - 3)
  ) {
    ward = parts[len - 3];
    wardIndex = len - 3;
  }

  // Ghép các phần còn lại làm street
  const streetParts = [];
  for (let i = 0; i < len; i++) {
    if (i !== provinceIndex && i !== districtIndex && i !== wardIndex) {
      streetParts.push(parts[i]);
    }
  }
  street = streetParts.join(", ").trim();

  // Trường hợp đặc biệt: nếu chỉ có 1 hoặc 2 phần, và street đã bao gồm ward/district/province
  // thì cố gắng làm sạch street
  if (street === formattedAddress && (ward || district || province)) {
    let tempStreet = formattedAddress;
    if (province && tempStreet.endsWith(province))
      tempStreet = tempStreet
        .substring(0, tempStreet.lastIndexOf(province))
        .replace(/,\s*$/, "")
        .trim();
    if (district && tempStreet.endsWith(district))
      tempStreet = tempStreet
        .substring(0, tempStreet.lastIndexOf(district))
        .replace(/,\s*$/, "")
        .trim();
    if (ward && tempStreet.endsWith(ward))
      tempStreet = tempStreet
        .substring(0, tempStreet.lastIndexOf(ward))
        .replace(/,\s*$/, "")
        .trim();
    street = tempStreet;
  }

  // Nếu sau tất cả street vẫn rỗng và formattedAddress có giá trị, gán toàn bộ cho street
  if (!street && formattedAddress) {
    street = formattedAddress;
  }

  const MAX_LEN = 255; // Giới hạn độ dài cột trong DB nếu có
  const result = {
    street: (street || "").substring(0, MAX_LEN).trim(),
    ward: (ward || "").substring(0, MAX_LEN).trim(),
    district: (district || "").substring(0, MAX_LEN).trim(),
    province: (province || "").substring(0, MAX_LEN).trim(),
  };
  console.log("[parseFormattedAddress] Parsed result:", result);
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
  const [selectedLocation, setSelectedLocation] = useState(null);
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
    console.log(
      "callGraphQL - Query:",
      query.substring(0, 60) + "...",
      "Variables:",
      JSON.stringify(variables)
    );
    const token = await AsyncStorage.getItem("token");
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      console.error("callGraphQL: Token không được tìm thấy.");
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
        console.error(
          "callGraphQL - Lỗi parse JSON:",
          e,
          "\nResponse text:",
          responseText.substring(0, 200)
        );
        throw new Error(`Lỗi máy chủ: Không thể phân tích phản hồi.`);
      }
      console.log(
        "callGraphQL - Parsed Response:",
        JSON.stringify(responseData, null, 2)
      );
      if (response.status === 401 || response.status === 403) {
        console.error(
          "callGraphQL - Lỗi xác thực:",
          response.status,
          responseData
        );
        throw new Error(
          "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại."
        );
      }
      if (!response.ok) {
        const errorMessage =
          responseData.errors?.map((e) => e.message).join("\n") ||
          responseData.message ||
          `Lỗi API (${response.status})`;
        console.error("callGraphQL - Lỗi HTTP không OK:", errorMessage);
        throw new Error(errorMessage);
      }
      if (responseData.errors) {
        const errorMessage = responseData.errors
          .map((e) => e.message)
          .join("\n");
        console.error("callGraphQL - Lỗi GraphQL:", errorMessage);
        throw new Error(errorMessage);
      }
      return responseData.data;
    } catch (error) {
      console.error(
        "callGraphQL - Lỗi fetch hoặc lỗi đã throw:",
        error.message
      );
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
        if (data && data.reverseGeocode && data.reverseGeocode.length > 0) {
          const primaryResult = data.reverseGeocode[0];
          const formattedAddress = primaryResult.formatted_address;
          const parsedComponents = parseFormattedAddress(formattedAddress); // ÁP DỤNG HÀM PARSE

          setCurrentMapAddress(formattedAddress);
          setSelectedLocation({
            latitude,
            longitude,
            address: formattedAddress,
            name: formattedAddress.split(",")[0],
            placeId: primaryResult.place_id,
            street: parsedComponents.street,
            ward: parsedComponents.ward,
            district: parsedComponents.district,
            province: parsedComponents.province,
          });
        } else {
          setCurrentMapAddress("Không tìm thấy địa chỉ cho vị trí này.");
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
        if (!detailsData?.searchAddress)
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

        const reverseData = await callGraphQL(
          REVERSE_GOONG_GEOCODE_QUERY_SIMPLE,
          { lat: latNum, lng: lngNum }
        );
        if (
          reverseData?.reverseGeocode &&
          reverseData.reverseGeocode.length > 0
        ) {
          const primaryResult = reverseData.reverseGeocode[0];
          const formattedAddress = primaryResult.formatted_address;
          const parsedComponents = parseFormattedAddress(formattedAddress); // ÁP DỤNG HÀM PARSE
          setCurrentMapAddress(formattedAddress);
          setSelectedLocation({
            latitude: latNum,
            longitude: lngNum,
            address: formattedAddress,
            name: selectedDescription.split(",")[0],
            placeId: primaryResult.place_id,
            street: parsedComponents.street,
            ward: parsedComponents.ward,
            district: parsedComponents.district,
            province: parsedComponents.province,
          });
        } else {
          const parsedComponents = parseFormattedAddress(selectedDescription); // Parse cả fallback
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
        Alert.alert("Lỗi", "Không thể lấy chi tiết vị trí.");
        if (mapRegion.latitude && mapRegion.longitude)
          await fetchAddressFromCoordsGraphQL(
            mapRegion.latitude,
            mapRegion.longitude
          );
        if (
          error.message.includes("Phiên đăng nhập") ||
          error.message.includes("Token không được tìm thấy")
        )
          Alert.alert("Lỗi xác thực", error.message, [
            { text: "OK", onPress: () => navigation.goBack() },
          ]);
      } finally {
        setIsLoadingDetails(false);
      }
    },
    [callGraphQL, fetchAddressFromCoordsGraphQL, mapRegion, navigation]
  );

  const handleNavigateToCurrentLocation = useCallback(async () => {
    if (locationPermissionGranted === false) {
      Alert.alert("Quyền vị trí", "Bạn đã từ chối quyền.");
      return;
    }
    let currentStatus = locationPermissionGranted;
    if (currentStatus === null) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermissionGranted(status === "granted");
      currentStatus = status === "granted";
    }
    if (!currentStatus) {
      Alert.alert("Quyền vị trí", "Vui lòng cấp quyền.");
      return;
    }
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
      await fetchAddressFromCoordsGraphQL(latitude, longitude, true);
    } catch (e) {
      Alert.alert("Lỗi", "Không thể lấy vị trí hiện tại.");
      setIsLoadingAddress(false);
    }
  }, [fetchAddressFromCoordsGraphQL, locationPermissionGranted]);

  // Trong SelectAddressScreen.js

  // Đảm bảo các hằng số mutation này đã được định nghĩa ở phạm vi ngoài hàm:
  // const CREATE_ADDRESS_MUTATION = `...`;
  // const UPDATE_ADDRESS_MUTATION = `...`;
  // const LINK_USER_TO_ADDRESS_MUTATION = `
  //   mutation UserAddressLink($userId: Int!, $addressId: Int) {
  //     linkUserAddress(userId: $userId, addressId: $addressId) {
  //       id
  //       name
  //       address {
  //         id
  //         street
  //       }
  //     }
  //   }
  // `;

  const handleConfirmAndSaveChanges = async () => {
    // Kiểm tra selectedLocation và các thành phần đã parse
    if (
      !selectedLocation?.address || // formatted_address gốc
      !selectedLocation.latitude ||
      !selectedLocation.longitude ||
      !selectedLocation.street || // Thành phần đã parse
      !selectedLocation.province // Thành phần đã parse (ít nhất cần street và province)
    ) {
      Alert.alert(
        "Địa chỉ không đủ thông tin",
        "Không thể phân tích chi tiết địa chỉ này. Vui lòng chọn hoặc di chuyển bản đồ đến vị trí rõ ràng hơn, đảm bảo có đủ thông tin đường và tỉnh/thành phố."
      );
      console.log(
        "selectedLocation không đủ chi tiết cho việc lưu:",
        selectedLocation
      );
      return;
    }

    if (!userId) {
      Alert.alert(
        "Lỗi người dùng",
        "Không tìm thấy ID người dùng để thực hiện hành động này. Vui lòng đăng nhập lại."
      );
      console.log("handleConfirmAndSaveChanges: userId is missing.");
      return;
    }

    setIsSavingAddress(true);
    console.log(
      `[handleConfirm] Bắt đầu lưu địa chỉ. UserID: ${userId}, CurrentAddressID: ${currentAddressId}`
    );
    console.log(
      "[handleConfirm] SelectedLocation đầy đủ:",
      JSON.stringify(selectedLocation, null, 2)
    );

    let finalAddressId; // Khai báo ở scope của hàm

    try {
      const addressInputForBackend = {
        label: selectedLocation.name
          ? selectedLocation.name.substring(0, 254)
          : (selectedLocation.address.split(",")[0] || "Địa chỉ").substring(
              0,
              254
            ),
        street: selectedLocation.street,
        province: selectedLocation.province,
        district: selectedLocation.district || "", // Gửi chuỗi rỗng nếu parseFormattedAddress không tìm thấy
        ward: selectedLocation.ward || "", // Gửi chuỗi rỗng nếu parseFormattedAddress không tìm thấy
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        placeId: selectedLocation.placeId || null, // Gửi null nếu không có
      };
      console.log(
        "[handleConfirm] Input chuẩn bị cho Create/Update Address Mutation:",
        JSON.stringify(addressInputForBackend, null, 2)
      );

      if (currentAddressId) {
        // --- TRƯỜNG HỢP CẬP NHẬT ADDRESS ĐÃ CÓ ---
        console.log(
          `[handleConfirm] Đang cập nhật Address ID: ${currentAddressId}`
        );
        const updateInput = { id: currentAddressId, ...addressInputForBackend };
        const updateResult = await callGraphQL(UPDATE_ADDRESS_MUTATION, {
          input: updateInput,
        });

        if (!updateResult?.updateAddress?.id) {
          // Kiểm tra response chặt chẽ hơn
          console.error(
            "[handleConfirm] Lỗi khi cập nhật địa chỉ, không có ID trả về:",
            updateResult
          );
          throw new Error("Cập nhật địa chỉ thất bại trên máy chủ.");
        }
        finalAddressId = updateResult.updateAddress.id;
        console.log(
          "[handleConfirm] Địa chỉ đã được cập nhật thành công, ID:",
          finalAddressId
        );
        // Trong trường hợp cập nhật Address đã có và User đã được liên kết với currentAddressId này,
        // chúng ta không cần gọi mutation để liên kết lại User.
        // AddressScreen khi refetch findUserById sẽ thấy nội dung Address được cập nhật.
      } else {
        // --- TRƯỜNG HỢP TẠO ADDRESS MỚI VÀ LIÊN KẾT VỚI USER ---
        console.log(
          `[handleConfirm] Đang tạo Address mới cho User ID: ${userId}`
        );
        // CreateAddressInput của bạn không có userId, backend phải tự xử lý gán user
        const createResult = await callGraphQL(CREATE_ADDRESS_MUTATION, {
          input: addressInputForBackend,
        });

        if (!createResult?.createAddress?.id) {
          // Kiểm tra response chặt chẽ hơn
          console.error(
            "[handleConfirm] Lỗi khi tạo địa chỉ mới, không có ID trả về:",
            createResult
          );
          throw new Error("Tạo địa chỉ mới thất bại trên máy chủ.");
        }
        finalAddressId = createResult.createAddress.id;
        console.log(
          "[handleConfirm] Địa chỉ mới đã được tạo, ID:",
          finalAddressId
        );

        // Liên kết Address ID mới này với User bằng mutation mới (linkUserAddress)
        console.log(
          `[handleConfirm] Đang liên kết User ID: ${userId} với Address ID mới: ${finalAddressId}`
        );
        const linkUserVariables = { userId: userId, addressId: finalAddressId }; // addressId là tên biến trong mutation
        console.log(
          "[handleConfirm] Gọi mutation linkUserAddress với variables:",
          linkUserVariables
        );
        const linkUserResult = await callGraphQL(
          LINK_USER_TO_ADDRESS_MUTATION_FINAL,
          linkUserVariables
        ); // Sử dụng mutation đúng

        console.log(
          "[handleConfirm] Response từ linkUserAddress mutation:",
          JSON.stringify(linkUserResult, null, 2)
        );
        if (!linkUserResult?.linkUserAddress?.id) {
          // Kiểm tra theo tên mutation mới
          console.error(
            "[handleConfirm] Phản hồi từ linkUserAddress không như mong đợi (thiếu user.id)."
          );
          throw new Error("Liên kết địa chỉ với người dùng thất bại.");
        }
        // Kiểm tra xem address có được populate không sau khi link
        if (linkUserResult.linkUserAddress.address) {
          console.log(
            "[handleConfirm] Thông tin địa chỉ trả về từ linkUserAddress:",
            linkUserResult.linkUserAddress.address
          );
        } else if (finalAddressId) {
          console.warn(
            "[handleConfirm] linkUserAddress không trả về object Address chi tiết. User.addressId có thể đã được cập nhật trong DB. AddressScreen sẽ cần query lại User đầy đủ."
          );
        }
        console.log(
          "[handleConfirm] User đã được liên kết với địa chỉ mới thông qua linkUserAddress."
        );
      }

      Alert.alert("Thành công", "Địa chỉ của bạn đã được cập nhật thành công!");
      navigation.navigate({
        name: "AddressScreen",
        params: { addressUpdated: true, newAddressId: finalAddressId },
        merge: true,
      });
    } catch (error) {
      console.error(
        "[handleConfirm] Lỗi trong quá trình lưu địa chỉ:",
        error.name,
        error.message,
        error.stack
      );
      Alert.alert(
        "Lỗi lưu địa chỉ",
        `${
          error.message || "Không thể lưu địa chỉ."
        }\nVui lòng thử lại hoặc liên hệ hỗ trợ.`
      );
      // Xử lý lỗi xác thực cụ thể
      if (
        error.message.includes("Phiên đăng nhập") ||
        error.message.includes("Token không được tìm thấy")
      ) {
        // Cân nhắc điều hướng người dùng về màn hình đăng nhập nếu lỗi là do token
        // navigation.replace('LoginScreen');
        navigation.goBack(); // Tạm thời chỉ quay lại
      }
    } finally {
      setIsSavingAddress(false);
      console.log("[handleConfirm] Kết thúc xử lý.");
    }
  };
  // Phần return JSX (UI)
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn địa chỉ trên bản đồ</Text>
      </View>

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
    maxHeight: height * 0.35,
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
