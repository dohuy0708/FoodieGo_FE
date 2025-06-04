import React, { useState, useEffect, useCallback, useContext } from "react";
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
import { Header } from "../../components";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GRAPHQL_ENDPOINT from "../../../config";
import { UserContext } from "../../context/UserContext";

const AddressDisplay = ({ addressDetail, userName, userPhone, onEdit }) => {
  if (!addressDetail || (!addressDetail.street && !addressDetail.address)) {
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

  const fullAddressString =
    addressDetail.address ||
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
      {/* Nút "Thay đổi" nhỏ có thể được kích hoạt bởi onEdit prop */}
      <TouchableOpacity onPress={onEdit} style={styles.editButton}>
        <Text style={styles.editButtonText}>Thay đổi</Text>
      </TouchableOpacity>
    </View>
  );
};

const AddressScreen = ({ navigation, route }) => {
  const userContext = useContext(UserContext);

  if (!userContext) {
    console.error(
      "AddressScreen: UserContext is not available. Make sure UserProvider wraps your app."
    );

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredMessage}>
          <Text style={styles.errorText}>Lỗi Context</Text>
        </View>
      </SafeAreaView>
    );
  }
  const { userInfo, setUserInfo: updateContextUserInfo } = userContext;

  const [userAddressDetail, setUserAddressDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleAuthenticationError = useCallback(() => {
    console.warn("AddressScreen: Xử lý lỗi xác thực.");
    setError(
      "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại."
    );
    setLoading(false);
    AsyncStorage.multiRemove(["token", "userInfo"]);
    if (updateContextUserInfo) {
      updateContextUserInfo(null);
    }
    setUserAddressDetail(null);
  }, [navigation, updateContextUserInfo]);

  const fetchUserDataAndAddress = useCallback(async () => {
    if (!userInfo || !userInfo.id || !userInfo.token) {
      console.log(
        "AddressScreen.fetchUserDataAndAddress: Thiếu userInfo, ID, hoặc token từ context."
      );
      if (userInfo && userInfo.id && !userInfo.token) {
        handleAuthenticationError();
      } else if (!userInfo) {
        setError("Vui lòng đăng nhập để xem địa chỉ.");
        setLoading(false);
      } else {
        setLoading(false);
      }
      return;
    }

    console.log(`AddressScreen: Fetching address cho User ID: ${userInfo.id}`);
    setLoading(true);

    try {
      const query = `
        query FindUserByIdForAddressDisplay($id: Int!) {
          findUserById(id: $id) {
            id
            name
            phone
            address { # Object Address từ User entity
              id
              label
              province
              district
              ward
              street
              # formattedAddress # Nếu backend có trường này và bạn muốn dùng
              latitude
              longitude
              placeId
            }
          }
        }
      `;

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInfo.token}`,
      };

      const res = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ query: query, variables: { id: userInfo.id } }),
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

        if (
          updateContextUserInfo &&
          (fetchedUserData.name !== userInfo.name ||
            fetchedUserData.phone !== userInfo.phone)
        ) {
          updateContextUserInfo((prev) => ({
            ...prev,
            id: fetchedUserData.id,
            name: fetchedUserData.name,
            phone: fetchedUserData.phone,
          }));
        }
        setUserAddressDetail(fetchedUserData.address);
        setError(null);
      } else {
        console.warn(
          "AddressScreen: Không tìm thấy 'findUserById' trong dữ liệu trả về."
        );
        setUserAddressDetail(null);
      }
    } catch (err) {
      console.error(
        "AddressScreen - Lỗi trong fetchUserDataAndAddress:",
        err.message
      );
      if (error !== err.message) {
        setError(err.message || "Không thể tải dữ liệu địa chỉ.");
      }
      setUserAddressDetail(null);
    } finally {
      setLoading(false);
    }
  }, [userInfo, handleAuthenticationError, updateContextUserInfo, error]);

  useEffect(() => {
    console.log(
      "AddressScreen: useEffect[userInfo] - userInfo từ context:",
      userInfo
    );
    if (userInfo && userInfo.id && userInfo.token) {
      fetchUserDataAndAddress();
    } else if (!userInfo && !loading) {
      console.log(
        "AddressScreen: Không có userInfo từ context, có thể cần hiển thị thông báo đăng nhập."
      );

      setLoading(false);
      setUserAddressDetail(null);
    }
  }, [userInfo, fetchUserDataAndAddress]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      const { addressUpdated } = route.params || {};
      console.log(
        "AddressScreen: Focus event, addressUpdated:",
        addressUpdated
      );

      if (addressUpdated) {
        if (userInfo && userInfo.id && userInfo.token) {
          console.log(
            "AddressScreen: Địa chỉ đã được cập nhật từ SelectAddressScreen, refetching..."
          );
          setError(null);
          fetchUserDataAndAddress();
        }
        navigation.setParams({
          addressUpdated: undefined,
          newAddressId: undefined,
        });
      }
    });
    return unsubscribe;
  }, [navigation, route.params, userInfo, fetchUserDataAndAddress]);

  const handleNavigateToSelectAddress = () => {
    if (!userInfo || !userInfo.id) {
      Alert.alert(
        "Yêu cầu đăng nhập",
        "Vui lòng đăng nhập để quản lý địa chỉ."
      );

      return;
    }
    navigation.navigate("SelectAddressScreen", {
      userId: userInfo.id,
      currentAddressId: userAddressDetail?.id,
    });
  };

  if (loading && !userAddressDetail && !error) {
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
            ) &&
              userInfo?.id && (
                <TouchableOpacity
                  onPress={fetchUserDataAndAddress}
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
          {loading && userAddressDetail && (
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
          disabled={!userInfo || loading}
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
    marginTop: 40,
    paddingTop: 15,
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
    paddingVertical: 40,
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
    marginTop: 15,
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
