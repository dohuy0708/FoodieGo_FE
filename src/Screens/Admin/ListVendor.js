import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Keyboard,
} from "react-native";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { Picker } from "@react-native-picker/picker";
import Colors from "../../constants/Colors";
import Display from "../../utils/Display";
import NavAdmin from "../../components/NavAdmin";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GRAPHQL_ENDPOINT from "../../../config";

const NAV_HEIGHT = Display.setHeight(8);

const GET_RESTAURANTS_PAGINATED_QUERY = `
  query GetRestaurants($page: Int, $limit: Int) {
    restaurants(page: $page, limit: $limit) {
      data {
        id
        name
        status
      }
      total
    }
  }
`;
const UPDATE_RESTAURANT_STATUS_MUTATION = `
  mutation UpdateRestaurantStatus($updateRestaurantInput: UpdateRestaurantInput!) {
    updateRestaurant(updateRestaurantInput: $updateRestaurantInput) {
      id
      name
      status
    }
  }
`;

const updateRestaurantStatus = async (restaurantId, newStatus) => {
  // Vì InputType yêu cầu `id` là Int, chúng ta cần đảm bảo nó là number
  const numericId = parseInt(restaurantId, 10);

  if (isNaN(numericId)) {
    throw new Error("ID nhà hàng không hợp lệ.");
  }

  const variables = {
    updateRestaurantInput: {
      id: numericId,
      status: newStatus,
    },
  };

  console.log(
    `Đang gửi yêu cầu cập nhật trạng thái cho nhà hàng ID: ${numericId} thành '${newStatus}'`
  );

  try {
    // Tận dụng lại hàm callGraphQL đã có
    const responseData = await callGraphQL(
      UPDATE_RESTAURANT_STATUS_MUTATION,
      variables
    );

    // Kiểm tra xem dữ liệu trả về có đúng không
    if (responseData && responseData.updateRestaurant) {
      console.log(
        "Cập nhật trạng thái thành công:",
        responseData.updateRestaurant
      );
      return responseData.updateRestaurant;
    } else {
      throw new Error("Phản hồi từ API không chứa dữ liệu cập nhật.");
    }
  } catch (error) {
    console.error(
      `Lỗi khi cập nhật trạng thái cho nhà hàng ${numericId}:`,
      error
    );
    // Ném lại lỗi để component cha có thể xử lý (ví dụ: hiển thị Alert)
    throw error;
  }
};
const callGraphQL = async (query, variables) => {
  const token = await AsyncStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    console.warn("callGraphQL - Restaurants: Token không được tìm thấy.");
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
    if (response.status === 401 || response.status === 403) {
      throw new Error("Phiên đăng nhập không hợp lệ.");
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
};

const statusFiltersForUI = [
  { id: "all", name: "Tất cả trạng thái", apiValue: null },
  { id: "open", name: "Hoạt động", apiValue: "open" },
  { id: "close", name: "Đã đóng/Đình chỉ", apiValue: "close" },
  { id: "pending", name: "Chờ duyệt", apiValue: "pending" },
  { id: "rejected", name: "Bị từ chối", apiValue: "rejected" },
];

export default function ListVendor({ navigation }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusFilterId, setSelectedStatusFilterId] = useState("all");

  const [restaurantsFromAPI, setRestaurantsFromAPI] = useState([]);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [isListEnd, setIsListEnd] = useState(false);

  const fetchRestaurants = useCallback(
    async (fetchPage, isLoadMore = false) => {
      if (isLoadMore && isListEnd) {
        console.log("fetchRestaurants: Đã ở cuối danh sách, không tải thêm.");
        return;
      }

      console.log(`Bắt đầu gọi API cho trang: ${fetchPage}`);
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);

        if (fetchPage === 1) {
          setRestaurantsFromAPI([]);
          setIsListEnd(false);
        }
      }

      try {
        const variables = { page: fetchPage, limit };
        const data = await callGraphQL(
          GET_RESTAURANTS_PAGINATED_QUERY,
          variables
        );

        if (data && data.restaurants) {
          const newItems = data.restaurants.data || [];
          const totalItems = data.restaurants.total || 0;
          const calculatedTotalPages = Math.ceil(totalItems / limit) || 1;

          if (newItems.length > 0) {
            setRestaurantsFromAPI((prev) =>
              isLoadMore ? [...prev, ...newItems] : newItems
            );
            setPage(fetchPage);
            setTotalPages(calculatedTotalPages);
          }

          if (fetchPage >= calculatedTotalPages || newItems.length < limit) {
            console.log("Đã tải đến cuối danh sách API.");
            setIsListEnd(true);
          }
        } else {
          if (!isLoadMore) setRestaurantsFromAPI([]);
          setIsListEnd(true);
        }
      } catch (err) {
        console.error("Lỗi khi fetch restaurants:", err);
        setError(err.message || "Lỗi tải danh sách.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    console.log("ListVendor: Gọi API lần đầu tiên (trang 1)");
    fetchRestaurants(1, false);
  }, [fetchRestaurants]);

  const searchResults = useMemo(() => {
    console.log("useMemo: Đang tính toán lại danh sách hiển thị...");
    let dataToFilter = [...restaurantsFromAPI];

    const statusFilterObject = statusFiltersForUI.find(
      (s) => s.id === selectedStatusFilterId
    );
    if (statusFilterObject && statusFilterObject.apiValue) {
      dataToFilter = dataToFilter.filter(
        (item) => item.status === statusFilterObject.apiValue
      );
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
    if (lowerCaseSearchTerm !== "") {
      dataToFilter = dataToFilter.filter(
        (item) =>
          item.name && item.name.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
    console.log("useMemo: Tính toán xong. Số kết quả:", dataToFilter.length);
    return dataToFilter;
  }, [restaurantsFromAPI, searchTerm, selectedStatusFilterId]);

  const handleLoadMore = () => {
    if (!loadingMore && !isListEnd) {
      console.log(`handleLoadMore: Yêu cầu tải trang tiếp theo ${page + 1}`);
      fetchRestaurants(page + 1, true);
    }
  };

  const handleRefresh = () => {
    console.log("handleRefresh: Yêu cầu làm mới, tải lại từ trang 1.");
    setPage(1);
    fetchRestaurants(1, false);
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color={Colors.DEFAULT_GREEN} />
        <Text style={styles.footerText}>Đang tải nhà hàng...</Text>
      </View>
    );
  };

  // Thay thế hoàn toàn hàm cũ bằng hàm này
  const handleItemAction = (actionType, item) => {
    // Luôn đặt một console.log ở đầu để kiểm tra hàm có được gọi không
    console.log(
      `handleItemAction được gọi với action: '${actionType}' cho item: '${item.name}'`
    );

    let newStatus = null;
    let confirmationTitle = actionType;
    let confirmationMessage = `Bạn có chắc muốn ${actionType.toLowerCase()} nhà hàng "${
      item.name
    }" không?`;

    // Xác định trạng thái mới nếu đây là hành động cập nhật status
    if (actionType === "Đình chỉ") {
      newStatus = "close";
    } else if (actionType === "Kích hoạt lại") {
      newStatus = "open";
    } else if (actionType === "Duyệt") {
      newStatus = "open";
    } else if (actionType === "Xóa") {
      newStatus = "rejected";
    }

    // Bây giờ, chỉ gọi MỘT Alert duy nhất
    Alert.alert(confirmationTitle, confirmationMessage, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đồng ý",
        // Đặt log ngay dòng đầu tiên của onPress để kiểm tra
        onPress: async () => {
          console.log(`Nút 'Đồng ý' đã được nhấn cho action: '${actionType}'`);

          try {
            await updateRestaurantStatus(item.id, newStatus);
            console.log("đã update");
            handleRefresh(); // Tải lại danh sách
          } catch (error) {
            Alert.alert(
              "Lỗi",
              `Không thể thực hiện hành động. Vui lòng thử lại.\nChi tiết: ${error.message}`
            );
          } finally {
            setIsActionLoading(false);
          }
        },
      },
    ]);
  };
  const renderItem = ({ item }) => {
    let statusText = "Không rõ";
    let statusColor = Colors.DEFAULT_BLACK;
    let ActionButtonsComponent = null;

    if (item.status === "open") {
      statusText = "Hoạt động";
      statusColor = Colors.DEFAULT_GREEN;
      ActionButtonsComponent = (
        <TouchableOpacity
          style={[styles.button, styles.suspendButton]}
          onPress={() => handleItemAction("Đình chỉ", item)}
        >
          <Text style={styles.buttonText}>Đình chỉ</Text>
        </TouchableOpacity>
      );
    } else if (item.status === "close") {
      statusText = "Đã đóng";
      statusColor = Colors.DEFAULT_RED;
      ActionButtonsComponent = (
        <TouchableOpacity
          style={[styles.button, styles.reactivateButton]}
          onPress={() => handleItemAction("Kích hoạt lại", item)}
        >
          <Text style={styles.buttonText}>Kích hoạt lại</Text>
        </TouchableOpacity>
      );
    } else if (item.status === "pending") {
      statusText = "Chờ duyệt";
      statusColor = Colors.DEFAULT_YELLOW;
      ActionButtonsComponent = (
        <View style={styles.buttonContainerRow}>
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={() => handleItemAction("Xóa", item)}
          >
            <Text style={styles.buttonText}>Xóa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.confirmButton]}
            onPress={() => handleItemAction("Duyệt", item)}
          >
            <Text style={styles.buttonText}>Duyệt</Text>
          </TouchableOpacity>
        </View>
      );
    } else if (item.status === "rejected") {
      statusText = "Bị từ chối";
      statusColor = Colors.DEFAULT_GREY;
      ActionButtonsComponent = (
        // <TouchableOpacity
        //   style={[styles.button, styles.reactivateButton]}
        //   onPress={() => handleItemAction("Kích hoạt lại", item)}
        // >
        //   <Text style={styles.buttonText}>Kích hoạt lại</Text>
        // </TouchableOpacity>
        <></>
      );
    }

    return (
      <View style={styles.listItemContainer}>
        <View style={styles.divider} />
        <Text style={styles.itemNameText}>{item.name || "N/A"}</Text>
        <View style={styles.itemStatusRow}>
          <Text style={[styles.itemStatusText, { color: statusColor }]}>
            {statusText}
          </Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("SeeRestaurantScreen", {
                restaurantId: item.id,
              })
            }
          >
            <Text style={styles.detailsLinkText}>Xem chi tiết</Text>
          </TouchableOpacity>
        </View>
        {ActionButtonsComponent && (
          <View style={styles.buttonContainer}>{ActionButtonsComponent}</View>
        )}
      </View>
    );
  };

  if (loading && restaurantsFromAPI.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.DEFAULT_GREEN} />
        <Text style={styles.statusText}>Đang tải danh sách nhà hàng...</Text>
      </View>
    );
  }

  if (error && restaurantsFromAPI.length === 0) {
    return (
      <View style={styles.centered}>
        <EvilIcons name="exclamation" size={60} color={Colors.DEFAULT_GREY} />
        <Text style={styles.errorText}>Lỗi: {error}</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
        {error.includes("Phiên đăng nhập") && (
          <TouchableOpacity
            onPress={() => navigation.replace("LoginScreen")}
            style={styles.loginButton}
          >
            <Text style={styles.loginButtonText}>Đăng nhập lại</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Danh sách nhà hàng</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Tìm kiếm cửa hàng..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor={Colors.LIGHT_GREY2}
        />
        <TouchableOpacity onPress={() => Keyboard.dismiss()}>
          <EvilIcons name="search" size={28} color={Colors.SECONDARY_BLACK} />
        </TouchableOpacity>
      </View>
      <View style={styles.picker_container}>
        <Picker
          selectedValue={selectedStatusFilterId}
          onValueChange={(itemValue) => {
            console.log("Bộ lọc trạng thái đã thay đổi thành:", itemValue);

            setSelectedStatusFilterId(itemValue);
          }}
          style={styles.picker}
          mode="dropdown"
        >
          {statusFiltersForUI.map((stat) => (
            <Picker.Item
              key={stat.id}
              label={stat.name}
              value={stat.id}
              style={styles.pickerItem}
            />
          ))}
        </Picker>
      </View>

      <FlatList
        data={searchResults}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContentContainer}
        style={styles.flatListStyle}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyListText}>
              Không tìm thấy nhà hàng nào phù hợp.
            </Text>
          ) : null
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshing={loading && !loadingMore}
      />
      <View style={styles.navContainer}>
        <NavAdmin nav={navigation} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: NAV_HEIGHT,
    backgroundColor: Colors.DEFAULT_WHITE,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: Display.setWidth(3),
    paddingTop: Display.setHeight(1.2),
    paddingBottom: NAV_HEIGHT,
  },
  header: {
    marginTop: Display.setHeight(4),
    textAlign: "center",
    color: Colors.DEFAULT_GREEN,
    fontWeight: "bold",
    fontSize: 24,
    marginBottom: Display.setHeight(1.8),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.GRAY_BORDER,
    borderRadius: 8,
    paddingHorizontal: Display.setWidth(2.5),
    backgroundColor: "#fafafa",
    marginBottom: Display.setHeight(1.5),
  },
  textInput: {
    flex: 1,
    height: Display.setHeight(5.5),
    fontSize: 16,
    paddingVertical: Display.setHeight(0.6),
    color: Colors.DEFAULT_BLACK,
  },
  picker_container: {
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.GRAY_BORDER,
    borderRadius: 8,
    backgroundColor: "#fafafa",
    marginBottom: Display.setHeight(2),
    justifyContent: "center",
    height: Display.setHeight(6),
  },
  picker: {
    width: "100%",
    height: "100%",
    color: Colors.SECONDARY_BLACK,
    backgroundColor: "transparent",
  },
  pickerItem: { fontSize: 14, color: Colors.SECONDARY_BLACK },
  flatListStyle: { flex: 1 },
  listContentContainer: { paddingBottom: Display.setHeight(2) },
  listItemContainer: {
    paddingVertical: Display.setHeight(1.2),
    paddingHorizontal: Display.setWidth(3),
    backgroundColor: "#fff",
    gap: Display.setHeight(0.8),
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: 10,
    marginVertical: Display.setHeight(0.7),
    marginHorizontal: Display.setWidth(2),
  },
  divider: {
    height: 1,
    backgroundColor: Colors.LIGHT_GREY2 + "70",
    marginVertical: Display.setHeight(0.5),
  },
  itemNameText: {
    fontSize: 17,
    color: Colors.DEFAULT_GREEN,
    fontWeight: "600",
  },
  itemStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemStatusText: {
    fontSize: 15,
    flexShrink: 1,
    marginRight: Display.setWidth(2),
    fontWeight: "500",
  },
  detailsLinkText: {
    color: Colors.DEFAULT_BLUE,
    textDecorationLine: "underline",
    fontSize: 14,
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: Display.setWidth(2.5),
    justifyContent: "flex-end",
    marginTop: Display.setHeight(1.2),
  },
  buttonContainerRow: { flexDirection: "row", gap: Display.setWidth(2.5) },
  button: {
    paddingHorizontal: Display.setWidth(5),
    paddingVertical: Display.setHeight(1.2),
    minHeight: Display.setHeight(5),
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 15,
  },
  deleteButton: {
    backgroundColor: Colors.DEFAULT_YELLOW,
  },
  confirmButton: {
    backgroundColor: Colors.DEFAULT_GREEN,
  },
  suspendButton: {
    backgroundColor: Colors.DEFAULT_YELLOW,
  },
  reactivateButton: {
    backgroundColor: Colors.DEFAULT_GREEN,
  },
  emptyListText: {
    textAlign: "center",
    marginTop: Display.setHeight(10),
    fontSize: 16,
    color: Colors.DEFAULT_GREY,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  statusText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.DEFAULT_GREY,
  },
  footerLoading: {
    paddingVertical: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  footerText: { fontSize: 14, color: Colors.DEFAULT_GREY },
  errorText: {
    color: Colors.DEFAULT_RED,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  retryButton: {
    marginTop: 15,
    backgroundColor: Colors.DEFAULT_GREEN,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.DEFAULT_WHITE,
    fontSize: 16,
    fontWeight: "500",
  },
  inlineErrorView: {
    backgroundColor: "#f8d7da",
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
    borderColor: "#f5c6cb",
    borderWidth: 1,
  },
  inlineErrorText: { color: Colors.DEFAULT_RED, fontSize: 14 },
  loginButton: {
    marginTop: 15,
    backgroundColor: Colors.DEFAULT_GREEN,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: Colors.DEFAULT_WHITE,
    fontSize: 16,
    fontWeight: "500",
  },
});
