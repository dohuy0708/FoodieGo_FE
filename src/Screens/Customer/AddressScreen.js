import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert, // Giữ lại Alert để thông báo lỗi cuối cùng nếu cần
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../../components"; // Giả sử bạn có component Header
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GRAPHQL_ENDPOINT from "../../../config"; // Đảm bảo đường dẫn này đúng

// Component con để hiển thị địa chỉ
const AddressDisplay = ({ addressDetail, userName, userPhone, onEdit }) => {
  if (!addressDetail || !addressDetail.street) {
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
  const fullAddressString = [
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
      <TouchableOpacity onPress={onEdit} style={styles.editButton}>
        <Text style={styles.editButtonText}>Thay đổi</Text>
      </TouchableOpacity>
    </View>
  );
};

// Component chính của màn hình
const AddressScreen = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [userAddressDetail, setUserAddressDetail] = useState(null);
  const [loading, setLoading] = useState(true); // Ban đầu luôn loading để lấy userInfo
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Cờ cho lần load đầu tiên

  const handleAuthenticationError = useCallback(() => {
    setError(
      "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại."
    );
    setLoading(false);
    // Xóa token và thông tin người dùng để buộc đăng nhập lại
    AsyncStorage.removeItem("token");
    AsyncStorage.removeItem("userInfo");
    setUserInfo(null); // Reset userInfo state
    setUserAddressDetail(null);
    // Cân nhắc điều hướng về màn hình đăng nhập
    // navigation.replace('LoginScreen'); // Ví dụ
  }, [navigation]);

  // Hàm gọi API GraphQL
  const fetchUserDataAndAddress = useCallback(
    async (currentUserId) => {
      if (!currentUserId) {
        // Chỉ cần userId để gọi
        console.log("fetchUserDataAndAddress: currentUserId không hợp lệ.");
        // Không set loading hay error ở đây vì useEffect gọi nó sẽ xử lý
        return;
      }

      console.log(`Đang lấy thông tin địa chỉ cho User ID: ${currentUserId}`);
      setLoading(true); // Bắt đầu loading cho việc fetch địa chỉ
      // Không reset error ở đây ngay, chỉ reset khi bắt đầu một request mới hoàn toàn
      // setError(null);

      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          console.error("fetchUserDataAndAddress: Không tìm thấy token.");
          // Nếu token không tìm thấy, kích hoạt xử lý lỗi xác thực
          handleAuthenticationError();
          return; // Dừng thực thi
        }

        const query = `
        query {
          findUserById(id: ${currentUserId}) {
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
          body: JSON.stringify({ query: query }),
        });

        const responseData = await res.json();
        console.log("GraphQL Response:", JSON.stringify(responseData, null, 2));

        if (res.status === 401 || res.status === 403) {
          console.error(
            "Lỗi xác thực từ server (401/403). Token có thể đã hết hạn."
          );
          handleAuthenticationError();
          return; // Dừng thực thi
        }

        if (!res.ok) {
          let errorMessage = `Lỗi HTTP: ${res.status}`;
          if (responseData?.errors?.length > 0) {
            errorMessage = responseData.errors.map((e) => e.message).join("\n");
          } else if (typeof responseData.message === "string") {
            errorMessage = responseData.message;
          }
          console.error(
            "Lỗi HTTP hoặc từ server (không phải 401/403):",
            errorMessage
          );
          throw new Error(errorMessage);
        }

        if (responseData.errors) {
          // Lỗi từ GraphQL server (ví dụ: query sai, resolver có vấn đề)
          const errorMessage = responseData.errors
            .map((e) => e.message)
            .join("\n");
          console.error("Lỗi GraphQL:", errorMessage);
          throw new Error(errorMessage);
        }

        if (responseData.data?.findUserById) {
          const fetchedUserData = responseData.data.findUserById;
          // Cập nhật lại userInfo nếu cần, đặc biệt là tên và sđt có thể thay đổi
          if (userInfo?.id === fetchedUserData.id) {
            // Đảm bảo cập nhật đúng user
            setUserInfo((prev) => ({
              ...prev,
              name: fetchedUserData.name,
              phone: fetchedUserData.phone,
            }));
          }
          setUserAddressDetail(fetchedUserData.address);
          setError(null); // Xóa lỗi nếu thành công
        } else {
          console.warn("Không tìm thấy 'findUserById' trong dữ liệu trả về.");
          setUserAddressDetail(null); // Không có địa chỉ
          // Có thể không cần setError ở đây nếu đây là trường hợp user chưa có địa chỉ
        }
      } catch (err) {
        console.error(
          "Lỗi trong fetchUserDataAndAddress (catch block):",
          err.message
        );
        // Nếu lỗi không phải là lỗi đã được handleAuthenticationError xử lý, thì set error
        if (
          error !==
          "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại."
        ) {
          setError(err.message || "Không thể tải dữ liệu địa chỉ.");
        }
        setUserAddressDetail(null);
      } finally {
        setLoading(false);
        setIsInitialLoad(false); // Đánh dấu lần load đầu đã hoàn tất (dù thành công hay thất bại)
      }
    },
    [userInfo, handleAuthenticationError, error]
  ); // Thêm error để useCallback biết khi error thay đổi

  // 1. Lấy userInfo từ AsyncStorage khi component mount
  useEffect(() => {
    console.log("useEffect: Lấy userInfo từ AsyncStorage");
    const loadInitialUserInfo = async () => {
      setIsInitialLoad(true); // Bắt đầu quá trình load ban đầu
      setLoading(true);
      setError(null);
      try {
        const userInfoString = await AsyncStorage.getItem("userInfo");
        if (userInfoString) {
          const parsedUserInfo = JSON.parse(userInfoString);
          if (parsedUserInfo && typeof parsedUserInfo.id === "number") {
            console.log(
              "useEffect: UserInfo hợp lệ, setUserInfo:",
              parsedUserInfo
            );
            setUserInfo(parsedUserInfo);
            // Không gọi fetchUserDataAndAddress ở đây ngay, để useEffect tiếp theo xử lý
          } else {
            throw new Error(
              "Thông tin người dùng trong AsyncStorage không hợp lệ."
            );
          }
        } else {
          // Nếu không có userInfo, coi như là lỗi xác thực ban đầu
          handleAuthenticationError();
        }
      } catch (e) {
        console.error("useEffect: Lỗi khi tải userInfo từ AsyncStorage:", e);
        handleAuthenticationError(); // Xử lý như lỗi xác thực
      }
      // Không setLoading(false) ở đây vì fetchUserDataAndAddress sẽ xử lý
    };
    loadInitialUserInfo();
  }, [handleAuthenticationError]); // Chỉ chạy 1 lần, phụ thuộc vào handleAuthenticationError

  // 2. Fetch dữ liệu địa chỉ khi userInfo đã sẵn sàng (và chỉ một lần nếu không có lỗi)
  useEffect(() => {
    console.log("useEffect: Kiểm tra userInfo để fetch data:", userInfo);
    if (userInfo && userInfo.id && isInitialLoad && !error) {
      // Chỉ fetch nếu có userInfo, là lần load đầu, và chưa có lỗi nghiêm trọng
      fetchUserDataAndAddress(userInfo.id);
    } else if (!userInfo && isInitialLoad) {
      // Nếu không có userInfo sau khi load initial, và là lần load đầu
      // thì không làm gì cả, vì loadInitialUserInfo đã set lỗi hoặc điều hướng
      setLoading(false); // Đảm bảo dừng loading nếu không có userInfo
    }
  }, [userInfo, fetchUserDataAndAddress, isInitialLoad, error]);

  // 3. Refetch dữ liệu khi màn hình được focus lại (và không có lỗi xác thực)
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      console.log(
        "AddressScreen được focus, kiểm tra userInfo và error:",
        userInfo,
        error
      );
      // Chỉ refetch nếu đã có thông tin user và không có lỗi xác thực nghiêm trọng
      if (
        userInfo &&
        userInfo.id &&
        error !==
          "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại."
      ) {
        console.log("Refetching data on focus...");
        setError(null); // Reset lỗi trước khi refetch
        fetchUserDataAndAddress(userInfo.id);
      }
    });
    return unsubscribe;
  }, [navigation, userInfo, fetchUserDataAndAddress, error]); // Thêm error

  const handleNavigateToAddEditAddress = () => {
    if (!userInfo || !userInfo.id) {
      Alert.alert(
        "Lỗi",
        "Không tìm thấy thông tin người dùng để thực hiện hành động này."
      );
      return;
    }
    navigation.navigate("AddAddressScreen", {
      userId: userInfo.id,
    });
  };

  // Render UI
  if (loading && isInitialLoad) {
    // Loading cho lần tải đầu tiên
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

  if (error && !userAddressDetail) {
    // Hiển thị lỗi nếu không có dữ liệu nào để hiển thị
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
            {/* Chỉ hiển thị nút thử lại nếu lỗi không phải do chưa đăng nhập */}
            {!(
              error &&
              (error.includes("Vui lòng đăng nhập") ||
                error.includes("Phiên đăng nhập"))
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
            {error &&
              (error.includes("Vui lòng đăng nhập") ||
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
            userAddressDetail && ( // Loading inline khi refetch
              <View style={styles.inlineLoading}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.statusText}>Đang cập nhật...</Text>
              </View>
            )}
          {/* Không hiển thị lỗi inline nếu lỗi là về xác thực, vì đã có thông báo toàn màn hình */}
          {error &&
            userAddressDetail &&
            !loading &&
            !(
              error &&
              (error.includes("Vui lòng đăng nhập") ||
                error.includes("Phiên đăng nhập"))
            ) && (
              <View style={styles.inlineError}>
                <Text style={styles.errorTextSmall}>
                  Không thể cập nhật: {error}
                </Text>
              </View>
            )}
          <AddressDisplay
            addressDetail={userAddressDetail}
            userName={userInfo?.name}
            userPhone={userInfo?.phone}
            onEdit={handleNavigateToAddEditAddress}
          />
        </ScrollView>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleNavigateToAddEditAddress}
          disabled={!userInfo}
        >
          <Text style={styles.actionButtonText}>
            {userAddressDetail && userAddressDetail.street
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
    marginTop: 40,
    paddingTop: 10,
  },
  centeredMessage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20, // Thêm padding ngang cho text lỗi dài
  },
  statusText: {
    marginTop: 10,
    fontSize: 15, // Giảm font một chút
    color: "#6c757d", // Màu xám hơn
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    color: "#dc3545", // Màu đỏ đậm hơn
    textAlign: "center",
    paddingHorizontal: 10, // Thêm padding để không sát viền
    lineHeight: 22, // Tăng khoảng cách dòng cho dễ đọc
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
    backgroundColor: "#f8d7da", // Màu nền đỏ nhạt hơn
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    borderColor: "#f5c6cb", // Thêm border
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
    shadowOffset: { width: 0, height: 1 }, // Giảm shadow
    shadowOpacity: 0.03, // Giảm opacity
    shadowRadius: 2, // Giảm radius
    elevation: 2, // Giảm elevation
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
    marginBottom: 10, // Đã có SafeAreaView edges bottom, không cần quá nhiều
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
    // Style cho nút đăng nhập lại
    marginTop: 15,
    backgroundColor: "#28a745", // Màu xanh lá
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
