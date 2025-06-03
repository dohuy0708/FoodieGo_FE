import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../../components"; // Giả sử bạn có component Header
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GRAPHQL_ENDPOINT from "../../../config"; // Đảm bảo đường dẫn này đúng

// Component con để hiển thị địa chỉ (giống như bạn đã có)
const AddressDisplay = ({ addressDetail, userName, userPhone, onEdit }) => {
  if (!addressDetail || (!addressDetail.street && !addressDetail.address)) {
    // Kiểm tra street hoặc address (nếu address là formatted_address)
    return (
      <View style={styles.noAddressContainer}>
        <Ionicons name="sad-outline" size={60} color="#ccc" />
        <Text style={styles.noAddressText}>Bạn chưa có địa chỉ giao hàng.</Text>
        <Text style={styles.noAddressSubText}>
          Vui lòng thêm hoặc chọn địa chỉ.
        </Text>
      </View>
    );
  }

  // Ưu tiên hiển thị formatted_address nếu có, nếu không thì ghép từ các thành phần
  const fullAddressString =
    addressDetail.address || // Nếu backend trả về trường address là formatted_address
    [
      addressDetail.street,
      addressDetail.ward,
      addressDetail.district,
      addressDetail.province,
    ]
      .filter(Boolean)
      .join(", ");

  const displayName = userName;
  const displayPhone = userPhone;

  return (
    <View style={styles.addressItemContainer}>
      <View style={styles.addressIconContainer}>
        <Ionicons name="location-sharp" size={24} color="#007AFF" />
      </View>
      <View style={styles.addressContent}>
        <Text style={styles.addressTextLabel}>Địa chỉ giao hàng:</Text>
        <Text style={styles.addressTextValue} numberOfLines={3}>
          {fullAddressString || "Thông tin địa chỉ không đầy đủ"}
        </Text>
        <Text style={styles.personInfo}>
          {displayName || "N/A"} | {displayPhone || "N/A"}
        </Text>
      </View>
      {/* Nút onEdit sẽ được xử lý bởi nút actionButton lớn ở dưới */}
      {/* Nếu bạn vẫn muốn nút "Chỉnh sửa" nhỏ ở đây, có thể giữ lại và gọi cùng hàm onEdit */}
      <TouchableOpacity onPress={onEdit} style={styles.editButton}>
        <Text style={styles.editButtonText}>Thay đổi</Text>
      </TouchableOpacity>
    </View>
  );
};

// Component chính của màn hình AddressScreen
const AddressScreen = ({ navigation, route }) => {
  // Thêm route để nhận params
  const [userInfo, setUserInfo] = useState(null);
  const [userAddressDetail, setUserAddressDetail] = useState(null); // Đây là object Address từ User
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialLoadDone, setIsInitialLoadDone] = useState(false); // Cờ mới

  // Hàm xử lý lỗi xác thực
  const handleAuthenticationError = useCallback(() => {
    setError(
      "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại."
    );
    setLoading(false);
    AsyncStorage.removeItem("token");
    AsyncStorage.removeItem("userInfo");
    setUserInfo(null);
    setUserAddressDetail(null);
    // Cân nhắc navigation.replace('LoginScreen');
  }, [navigation]);

  // Hàm gọi API GraphQL để lấy thông tin người dùng và địa chỉ
  const fetchUserDataAndAddress = useCallback(
    async (currentUserId) => {
      if (!currentUserId) {
        console.log("fetchUserDataAndAddress: currentUserId không hợp lệ.");
        setLoading(false); // Dừng loading nếu không có ID
        return;
      }
      console.log(
        `AddressScreen: Đang lấy thông tin địa chỉ cho User ID: ${currentUserId}`
      );
      setLoading(true);
      // setError(null); // Không reset error ở đây để giữ lỗi cũ nếu refetch lỗi

      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          handleAuthenticationError();
          return;
        }

        // Query để lấy các trường chi tiết của Address entity
        // Đảm bảo các trường trong `address { ... }` khớp với Address entity của bạn
        const query = `
        query FindUserByIdForAddressScreen($id: Int!) {
          findUserById(id: $id) {
            id
            name
            phone
            address {
              id
              label
              province
              district
              ward
              street
              # Thêm trường 'address' nếu backend trả về formatted_address trực tiếp trong Address entity
              # address 
              latitude 
              longitude
              placeId
            }
          }
        }
      `;

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        const res = await fetch(GRAPHQL_ENDPOINT, {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            query: query,
            variables: { id: currentUserId },
          }),
        });

        const responseText = await res.text();
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          throw new Error(`Lỗi parse JSON: ${responseText.substring(0, 100)}`);
        }

        console.log(
          "AddressScreen GraphQL Response:",
          JSON.stringify(responseData, null, 2)
        );

        if (res.status === 401 || res.status === 403) {
          handleAuthenticationError();
          return;
        }
        if (!res.ok) {
          const errorMessage =
            responseData.errors?.map((e) => e.message).join("\n") ||
            responseData.message ||
            `Lỗi API (${res.status})`;
          throw new Error(errorMessage);
        }
        if (responseData.errors) {
          throw new Error(responseData.errors.map((e) => e.message).join("\n"));
        }

        if (responseData.data?.findUserById) {
          const fetchedUserData = responseData.data.findUserById;
          // Cập nhật userInfo để đảm bảo tên và điện thoại là mới nhất
          setUserInfo((prev) => ({
            ...prev,
            name: fetchedUserData.name,
            phone: fetchedUserData.phone,
          }));
          setUserAddressDetail(fetchedUserData.address);
          setError(null); // Xóa lỗi nếu thành công
        } else {
          console.warn(
            "AddressScreen: Không tìm thấy 'findUserById' trong dữ liệu trả về."
          );
          setUserAddressDetail(null); // User có thể không có địa chỉ
        }
      } catch (err) {
        console.error(
          "AddressScreen - Lỗi trong fetchUserDataAndAddress:",
          err.message
        );
        if (!error) {
          // Chỉ set lỗi mới nếu chưa có lỗi, hoặc nếu lỗi khác
          setError(err.message || "Không thể tải dữ liệu địa chỉ.");
        }
        setUserAddressDetail(null);
      } finally {
        setLoading(false);
        if (!isInitialLoadDone) setIsInitialLoadDone(true);
      }
    },
    [handleAuthenticationError, error, isInitialLoadDone]
  ); // Thêm error, isInitialLoadDone

  // 1. Lấy userInfo từ AsyncStorage khi component mount
  useEffect(() => {
    console.log("AddressScreen: useEffect - Lấy userInfo ban đầu.");
    const loadInitialUserInfo = async () => {
      setLoading(true);
      setError(null);
      try {
        const userInfoString = await AsyncStorage.getItem("userInfo");
        if (userInfoString) {
          const parsedUserInfo = JSON.parse(userInfoString);
          if (parsedUserInfo && typeof parsedUserInfo.id === "number") {
            setUserInfo(parsedUserInfo);
            // fetchUserDataAndAddress sẽ được gọi bởi useEffect tiếp theo
          } else {
            throw new Error(
              "Thông tin người dùng trong AsyncStorage không hợp lệ."
            );
          }
        } else {
          // Không có userInfo, coi như lỗi xác thực
          handleAuthenticationError();
        }
      } catch (e) {
        console.error(
          "AddressScreen: Lỗi khi tải userInfo từ AsyncStorage:",
          e
        );
        handleAuthenticationError();
      }
      // Không setLoading(false) ở đây, để useEffect tiếp theo xử lý
    };
    loadInitialUserInfo();
  }, [handleAuthenticationError]); // Chỉ chạy 1 lần

  // 2. Fetch dữ liệu địa chỉ khi userInfo đã sẵn sàng
  useEffect(() => {
    console.log(
      "AddressScreen: useEffect - Kiểm tra userInfo để fetch data:",
      userInfo
    );
    if (userInfo && userInfo.id && !isInitialLoadDone && !error) {
      // Chỉ fetch nếu có userInfo, chưa hoàn tất lần load đầu, và chưa có lỗi
      fetchUserDataAndAddress(userInfo.id);
    } else if (!userInfo && !loading && !isInitialLoadDone) {
      // Nếu không có userInfo và không đang loading, và chưa hoàn tất load đầu
      // (có thể do lỗi từ loadInitialUserInfo)
      setIsInitialLoadDone(true); // Đánh dấu hoàn tất để không lặp lại
      setLoading(false); // Dừng loading nếu chưa dừng
    }
  }, [userInfo, fetchUserDataAndAddress, isInitialLoadDone, error, loading]);

  // 3. Refetch dữ liệu khi màn hình được focus lại VÀ có param addressUpdated
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      const { addressUpdated } = route.params || {};
      console.log(
        "AddressScreen: Focus event, addressUpdated:",
        addressUpdated
      );

      if (addressUpdated) {
        if (userInfo && userInfo.id) {
          console.log("AddressScreen: Địa chỉ đã được cập nhật, refetching...");
          setError(null); // Xóa lỗi cũ
          fetchUserDataAndAddress(userInfo.id);
        }
        navigation.setParams({
          addressUpdated: undefined,
          newAddressId: undefined,
        }); // Reset param
      }
    });
    return unsubscribe;
  }, [navigation, route.params, userInfo, fetchUserDataAndAddress]);

  // Hàm điều hướng SANG SelectAddressScreen
  const handleNavigateToSelectAddress = () => {
    if (!userInfo || !userInfo.id) {
      Alert.alert(
        "Lỗi",
        "Không thể xác định người dùng. Vui lòng thử đăng nhập lại."
      );
      return;
    }
    console.log(
      "AddressScreen: Điều hướng đến SelectAddressScreen với params:",
      {
        userId: userInfo.id,
        currentAddressId: userAddressDetail?.id,
      }
    );
    navigation.navigate("SelectAddressScreen", {
      userId: userInfo.id,
      currentAddressId: userAddressDetail?.id,
    });
  };

  // Render UI
  if (loading && !isInitialLoadDone) {
    // Chỉ hiển thị loading toàn màn hình cho lần load đầu
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.container}>
          <Header
            title="Địa chỉ giao hàng"
            onBackPress={() => navigation.goBack()}
          />
          <View style={styles.centeredMessage}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.statusText}>Đang tải thông tin...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !userAddressDetail && isInitialLoadDone) {
    // Hiển thị lỗi nếu không có dữ liệu nào để hiển thị và lần load đầu đã xong
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.container}>
          <Header
            title="Địa chỉ giao hàng"
            onBackPress={() => navigation.goBack()}
          />
          <View style={styles.centeredMessage}>
            <Ionicons name="alert-circle-outline" size={60} color="#dc3545" />
            <Text style={styles.errorText}>{error}</Text>
            {!(
              error.includes("Vui lòng đăng nhập") ||
              error.includes("Phiên đăng nhập")
            ) && (
              <TouchableOpacity
                onPress={() => {
                  if (userInfo && userInfo.id)
                    fetchUserDataAndAddress(userInfo.id);
                }}
                style={styles.retryButton}
              >
                <Text style={styles.retryButtonText}>Thử lại</Text>
              </TouchableOpacity>
            )}
            {(error.includes("Vui lòng đăng nhập") ||
              error.includes("Phiên đăng nhập")) && (
              <TouchableOpacity
                onPress={() => navigation.replace("LoginScreen")}
                style={styles.loginButton}
              >
                <Text style={styles.loginButtonText}>Đăng nhập lại</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Render nội dung chính
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <Header
          title="Địa chỉ giao hàng"
          onBackPress={() => navigation.goBack()}
        />
        <ScrollView
          style={styles.contentArea}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {loading &&
            isInitialLoadDone && ( // Loading inline khi refetch
              <View style={styles.inlineLoading}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.statusText}>Đang cập nhật...</Text>
              </View>
            )}
          {error &&
            userAddressDetail &&
            !loading &&
            !(
              error.includes("Vui lòng đăng nhập") ||
              error.includes("Phiên đăng nhập")
            ) && (
              <View style={styles.inlineError}>
                <Text style={styles.errorTextSmall}>
                  Lỗi cập nhật:{" "}
                  {error.length > 100 ? error.substring(0, 100) + "..." : error}
                </Text>
              </View>
            )}
          <AddressDisplay
            addressDetail={userAddressDetail}
            userName={userInfo?.name}
            userPhone={userInfo?.phone}
            onEdit={handleNavigateToSelectAddress}
          />
        </ScrollView>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleNavigateToSelectAddress}
          disabled={!userInfo || loading} // Vô hiệu hóa nếu đang loading hoặc chưa có userInfo
        >
          <Text style={styles.actionButtonText}>
            {userAddressDetail &&
            (userAddressDetail.street || userAddressDetail.address)
              ? "Thay đổi địa chỉ"
              : "Thêm địa chỉ mới"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  contentArea: {
    flex: 1,
    marginTop: 40, // Bỏ marginTop này nếu Header của bạn không position: absolute
    // Nếu Header của bạn là một phần của luồng bình thường, ScrollView sẽ tự nằm dưới
    paddingTop: 15, // Thêm chút padding trên cho ScrollView
  },
  centeredMessage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  statusText: {
    marginTop: 10,
    fontSize: 15,
    color: "#6c757d",
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    color: "#dc3545",
    textAlign: "center",
    paddingHorizontal: 10,
    lineHeight: 22,
  },
  errorTextSmall: {
    fontSize: 14,
    color: "#dc3545",
    textAlign: "center",
  },
  inlineLoading: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    marginHorizontal: 16,
  },
  inlineError: {
    marginVertical: 10,
    marginHorizontal: 16,
    backgroundColor: "#f8d7da",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    borderColor: "#f5c6cb",
    borderWidth: 1,
  },
  addressItemContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dee2e6",
    alignItems: "flex-start",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 2,
  },
  addressIconContainer: {
    marginRight: 16,
    paddingTop: 3,
  },
  addressContent: {
    flex: 1,
  },
  addressTextLabel: {
    fontSize: 13,
    color: "#6c757d",
    marginBottom: 5,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  addressTextValue: {
    fontSize: 16,
    color: "#343a40",
    fontWeight: "500",
    marginBottom: 8,
    lineHeight: 24,
  },
  personInfo: {
    fontSize: 15,
    color: "#495057",
  },
  editButton: {
    paddingLeft: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  editButtonText: {
    color: "#007bff",
    fontSize: 15,
    fontWeight: "600",
  },
  actionButton: {
    backgroundColor: "#007bff",
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  noAddressContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dee2e6",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 2,
  },
  noAddressText: {
    fontSize: 18,
    color: "#343a40",
    marginTop: 20,
    fontWeight: "500",
    textAlign: "center",
  },
  noAddressSubText: {
    fontSize: 15,
    color: "#6c757d",
    marginTop: 8,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 25,
    backgroundColor: "#007bff",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  loginButton: {
    marginTop: 15,
    backgroundColor: "#28a745",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default AddressScreen;
