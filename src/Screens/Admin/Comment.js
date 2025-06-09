import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
  Alert,
  Keyboard,
} from "react-native";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import Colors from "../../constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import DateTimePicker from "@react-native-community/datetimepicker";
import NavAdmin from "../../components/NavAdmin";
import Display from "../../utils/Display";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GRAPHQL_ENDPOINT from "../../../config";

const NAV_HEIGHT = Display.setHeight(8);

const GET_COMPLAINTS_PAGINATED_QUERY = `
  query GetComplaints($page: Int, $limit: Int) {
    complaints(page: $page, limit: $limit) {
      data {
        id
        content
        imageUrl
        response
        createdAt
        seller {
          id
          name
        }
        admin {
          id
          name
        }
        review {
          id
          rating
          content
        }
      }
      total # Tổng số lượng tất cả các complaint
    }
  }
`;

const callGraphQL = async (query, variables) => {
  const token = await AsyncStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    console.warn("callGraphQL - Complaints: Token không được tìm thấy.");
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

export default function ComplaintScreen({ navigation }) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  const [allComplaints, setAllComplaints] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [isListEnd, setIsListEnd] = useState(false);

  const formatDateForDisplay = (dateObj) => {
    if (!dateObj) return "Tất cả ngày";

    const day = dateObj.getDate().toString().padStart(2, "0");
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const fetchComplaintsAPI = useCallback(
    async (currentPage) => {
      console.log(
        `API Call: Fetching complaints - Page: ${currentPage}, Limit: ${limit}`
      );
      try {
        const variables = { page: currentPage, limit };
        const data = await callGraphQL(
          GET_COMPLAINTS_PAGINATED_QUERY,
          variables
        );
        if (data && data.complaints) {
          return {
            items: data.complaints.data || [],
            total: data.complaints.total || 0,
          };
        }
        return { items: [], total: 0 };
      } catch (err) {
        console.error("Lỗi khi fetch complaints từ API:", err);
        setError(err.message || "Đã xảy ra lỗi khi tải danh sách báo cáo.");
        return { items: [], total: 0, error: err };
      }
    },
    [limit]
  );

  const loadComplaints = useCallback(
    async (isRefreshing = false, isLoadingMoreOperation = false) => {
      if (isLoadingMoreOperation && isListEnd) return;
      if ((loading || loadingMore) && !isRefreshing) return;

      const nextPage = isRefreshing ? 1 : isLoadingMoreOperation ? page + 1 : 1;

      if (isRefreshing) {
        setLoading(true);
        setError(null);
        setPage(1);
        setIsListEnd(false);
        setAllComplaints([]);
      } else if (isLoadingMoreOperation) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
        setPage(1);
        setIsListEnd(false);
        setAllComplaints([]);
      }

      const {
        items,
        total,
        error: fetchError,
      } = await fetchComplaintsAPI(nextPage);

      if (fetchError) {
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      if (items) {
        setAllComplaints((prev) =>
          isRefreshing ? items : [...prev, ...items]
        );
        if (total !== undefined) {
          setTotalItems(total);
          const calculatedTotalPages = Math.ceil(total / limit) || 1;
          setTotalPages(calculatedTotalPages);
          if (nextPage >= calculatedTotalPages || items.length === 0) {
            setIsListEnd(true);
          }
        } else {
          if (items.length < limit) setIsListEnd(true);
          setTotalPages((prev) =>
            items.length < limit ? nextPage : nextPage + 1
          );
        }
        setPage(nextPage);
      }
      setLoading(false);
      setLoadingMore(false);
    },
    [page, limit, isListEnd, loading, loadingMore, fetchComplaintsAPI]
  );

  useEffect(() => {
    loadComplaints(false, false);
  }, []);

  const filteredComplaints = useMemo(() => {
    let dataToFilter = [...allComplaints];

    const selectedDay = selectedDate ? selectedDate.getDate() : null;
    const selectedMonth = selectedDate ? selectedDate.getMonth() : null;
    const selectedYear = selectedDate ? selectedDate.getFullYear() : null;

    if (selectedDay !== null) {
      dataToFilter = dataToFilter.filter((item) => {
        if (!item.createdAt) return false;

        const itemDate = new Date(item.createdAt);

        return (
          itemDate.getDate() === selectedDay &&
          itemDate.getMonth() === selectedMonth &&
          itemDate.getFullYear() === selectedYear
        );
      });
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
    if (lowerCaseSearchTerm) {
      dataToFilter = dataToFilter.filter((item) => {
        const sellerName = item.seller?.name?.toLowerCase() || "";
        const complaintContent = item.content?.toLowerCase() || "";
        const reviewContent = item.review?.content?.toLowerCase() || "";
        return (
          sellerName.includes(lowerCaseSearchTerm) ||
          complaintContent.includes(lowerCaseSearchTerm) ||
          reviewContent.includes(lowerCaseSearchTerm)
        );
      });
    }

    return dataToFilter;
  }, [allComplaints, searchTerm, selectedDate]);

  const handleLoadMore = () => {
    if (!loading && !loadingMore && !isListEnd) {
      console.log(
        `handleLoadMore (button press): Yêu cầu tải trang ${page + 1}`
      );
      loadComplaints(false, true);
    }
  };

  const handleRefresh = () => {
    console.log("handleRefresh: Yêu cầu làm mới, tải lại từ trang 1.");

    loadComplaints(true, false);
  };

  const onDateChange = (event, newSelectedDate) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    } else {
      if (event.type !== "set") {
        setShowDatePicker(false);
      }
    }

    if (event.type === "set" && newSelectedDate) {
      setSelectedDate(newSelectedDate);
    }
  };

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.footerLoading}>
          <ActivityIndicator size="small" color={Colors.DEFAULT_GREEN} />
          <Text style={styles.footerText}>Đang tải thêm...</Text>
        </View>
      );
    }

    if (
      !isListEnd &&
      !loading &&
      !loadingMore &&
      allComplaints.length > 0 &&
      allComplaints.length < totalItems
    ) {
      return (
        <TouchableOpacity
          style={styles.loadMoreButton}
          onPress={handleLoadMore}
        >
          <Text style={styles.loadMoreButtonText}>Xem thêm</Text>
        </TouchableOpacity>
      );
    }

    if (isListEnd && allComplaints.length > 0) {
      return <Text style={styles.listEndText}>Đã tải hết khiếu nại.</Text>;
    }
    return null;
  };

  const renderItem = ({ item }) => (
    <View style={styles.listItem}>
      <View style={styles.divider} />
      <Text style={styles.complaintHeader}>
        Báo cáo từ{" "}
        <Text style={styles.sellerName}>
          {item.seller?.name || "Người bán ẩn danh"}
        </Text>
        :
      </Text>
      <Text
        style={styles.complaintContent}
        numberOfLines={3}
        ellipsizeMode="tail"
      >
        {item.content || "(Không có nội dung báo cáo)"}
      </Text>
      {item.review && (
        <View style={styles.reviewSection}>
          <Text style={styles.reviewContentLabel}>Nội dung bị báo cáo:</Text>
          <Text
            style={styles.reviewContentText}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.review.content || "(Không có nội dung review)"}
          </Text>
        </View>
      )}
      <View style={styles.itemFooter}>
        <Text style={styles.itemDate}>
          Ngày:{" "}
          {item.createdAt
            ? new Date(item.createdAt).toLocaleDateString("vi-VN")
            : "N/A"}
        </Text>
        {/* <TouchableOpacity
          style={styles.detailsLink}
          
        >
          <Text style={styles.detailsLinkText}>Xóa</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );

  const renderListEmptyComponent = () => {
    if (loading) return null;
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyListText}>
          {searchTerm || selectedDate
            ? "Không tìm thấy khiếu nại nào phù hợp."
            : "Chưa có khiếu nại nào."}
        </Text>
      </View>
    );
  };

  if (loading && allComplaints.length === 0 && !error) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.DEFAULT_GREEN} />
        <Text style={styles.statusText}>Đang tải danh sách...</Text>
      </View>
    );
  }

  if (error && allComplaints.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons
          name="cloud-offline-outline"
          size={60}
          color={Colors.DEFAULT_GREY}
        />
        <Text style={styles.errorText}>Lỗi: {error}</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
        {/* ... (nút đăng nhập lại nếu cần) ... */}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Danh sách Khiếu nại</Text>
      <View style={styles.dateSelector}>
        <Text style={styles.dateText}>
          {formatDateForDisplay(selectedDate)}
        </Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Feather name="calendar" size={24} color={Colors.SECONDARY_BLACK} />
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={selectedDate}
          mode="date"
          is24Hour={true}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onDateChange}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Tìm theo người bán, nội dung..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor={Colors.GRAY_BORDER}
        />
        <TouchableOpacity onPress={() => Keyboard.dismiss()}>
          <EvilIcons name="search" size={28} color={Colors.SECONDARY_BLACK} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredComplaints}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContentContainer}
        style={styles.flatListStyle}
        ListEmptyComponent={renderListEmptyComponent}
        ListFooterComponent={renderFooter}
        onRefresh={handleRefresh}
        refreshing={loading && !loadingMore && allComplaints.length > 0}
      />
      {error && allComplaints.length > 0 && !loadingMore && !loading && (
        <View style={styles.inlineErrorView}>
          <Text style={styles.inlineErrorText}>
            Lỗi tải thêm:{" "}
            {error.length > 70 ? error.substring(0, 70) + "..." : error}
          </Text>
        </View>
      )}
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
    paddingHorizontal: Display.setWidth(4),
    paddingTop: Display.setHeight(1),
    paddingBottom: NAV_HEIGHT,
  },
  header: {
    marginTop: Display.setHeight(5),
    textAlign: "center",
    color: Colors.DEFAULT_GREEN,
    fontWeight: "bold",
    fontSize: 24,
    marginBottom: Display.setHeight(1.5),
  },
  dateSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Display.setHeight(1.5),
    paddingVertical: Display.setHeight(1.2),
    paddingHorizontal: Display.setWidth(3.5),
    borderWidth: 1,
    borderColor: Colors.GRAY_BORDER,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  dateText: { fontSize: 16, color: Colors.SECONDARY_BLACK },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.GRAY_BORDER,
    borderRadius: 8,
    paddingHorizontal: Display.setWidth(2.5),
    backgroundColor: "#f9f9f9",
    marginBottom: Display.setHeight(1.5),
  },
  textInput: {
    flex: 1,
    height: Display.setHeight(5.5),
    fontSize: 16,
    color: Colors.SECONDARY_BLACK,
  },
  flatListStyle: { flex: 1 },
  listContentContainer: { paddingBottom: Display.setHeight(2) },
  divider: {
    height: 1,
    backgroundColor: Colors.LIGHT_GREY2,
    marginVertical: Display.setHeight(1.2),
  },
  listItem: {
    paddingBottom: Display.setHeight(1),
    backgroundColor: "#fff",
    borderRadius: 5,
    marginVertical: 5,
  },
  complaintHeader: {
    fontSize: 16,
    marginBottom: 6,
    color: Colors.DARK_ONE,
    fontWeight: "500",
  },
  sellerName: { fontWeight: "bold", color: Colors.DEFAULT_GREEN },
  complaintContent: {
    fontSize: 15,
    color: "#454545",
    marginBottom: 10,
    lineHeight: 21,
  },
  reviewSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.LIGHT_GREY2,
    marginLeft: 10,
  },
  reviewContentLabel: {
    fontSize: 13,
    color: Colors.DEFAULT_GREY,
    marginBottom: 3,
    fontStyle: "italic",
  },
  reviewContentText: { fontSize: 14, color: "#555", lineHeight: 19 },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Display.setHeight(1),
  },
  itemDate: { fontSize: 13, color: "#888", fontStyle: "italic" },
  detailsLink: {
    paddingVertical: Display.setHeight(0.5),
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: Colors.DEFAULT_RED,
  },
  detailsLinkText: {
    color: Colors.DEFAULT_WHITE,
    fontSize: 14,
    fontWeight: "500",
  },
  emptyListText: {
    textAlign: "center",
    marginTop: Display.setHeight(10),
    fontSize: 16,
    color: "#999",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  statusText: { marginTop: 10, fontSize: 16, color: Colors.DEFAULT_GREY },
  footerLoading: {
    paddingVertical: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  footerText: { fontSize: 14, color: Colors.DEFAULT_GREY },
  loadMoreButton: {
    backgroundColor: Colors.DEFAULT_GREEN,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 20,
    marginHorizontal: 50,
  },
  loadMoreButtonText: {
    color: Colors.DEFAULT_WHITE,
    fontSize: 16,
    fontWeight: "500",
  },
  listEndText: {
    textAlign: "center",
    color: Colors.DEFAULT_GREY,
    paddingVertical: 20,
    fontSize: 14,
  },
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
    backgroundColor: "#ffebee",
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
