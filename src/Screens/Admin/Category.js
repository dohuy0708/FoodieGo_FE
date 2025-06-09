import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator, // Thêm ActivityIndicator
  Alert, // Thêm Alert
} from "react-native";
import Colors from "../../constants/Colors"; // Giả sử đường dẫn này đúng
import AsyncStorage from "@react-native-async-storage/async-storage"; // Để lấy token
import GRAPHQL_ENDPOINT from "../../../config"; // Đường dẫn đến config của bạn

// GraphQL Query
const GET_CATEGORIES_PAGINATED_QUERY = `
  query GetCategories($page: Int, $limit: Int) {
    categories(page: $page, limit: $limit) {
      data {
        id
        name
        restaurant { id }
      }
     
    }
  }
`;

// Hàm callGraphQL (tương tự như đã dùng ở các màn hình khác)
const callGraphQL = async (query, variables) => {
  console.log(
    "callGraphQL - Categories - Query:",
    query.substring(0, 60) + "...",
    "Variables:",
    variables
  );
  const token = await AsyncStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    // Xử lý nếu API categories yêu cầu token mà không có
    // console.warn("callGraphQL - Categories: Token không được tìm thấy.");
    // throw new Error("Vui lòng đăng nhập để xem danh mục.");
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
      "callGraphQL - Categories - Parsed Response:",
      JSON.stringify(responseData, null, 2)
    );

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

export default function Category({ navigation }) {
  // Thêm navigation nếu cần cho các nút
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10); // Số lượng item mỗi trang
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [isListEnd, setIsListEnd] = useState(false);

  const fetchCategories = useCallback(
    async (currentPage, isLoadMore = false) => {
      if (isLoadMore && isListEnd) return;

      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
        if (currentPage === 1) {
          setCategories([]);
          setIsListEnd(false);
        }
      }
      console.log(
        `Fetching categories - Page: ${currentPage}, Limit: ${limit}`
      );

      try {
        // Sử dụng GET_CATEGORIES_PAGINATED_QUERY đã được sửa ở trên
        const data = await callGraphQL(GET_CATEGORIES_PAGINATED_QUERY, {
          page: currentPage,
          limit,
        });

        // QUAN TRỌNG: Điều chỉnh cách bạn truy cập dữ liệu dựa trên cấu trúc response mới
        if (data && data.categories) {
          // Giả sử PaginatedCategoryResponse trả về { data: Category[], total: number, page: number, limit: number, totalPages?: number }
          const itemsArray = data.categories.data; // HOẶC data.categories.categories tùy theo tên trường
          const totalItems = data.categories.total;
          const responsePage = data.categories.page;
          const itemsPerPage = data.categories.limit;
          // Tính totalPages nếu backend không trả về trực tiếp
          const calculatedTotalPages =
            data.categories.totalPages || Math.ceil(totalItems / itemsPerPage);

          if (itemsArray && itemsArray.length > 0) {
            setCategories((prevCategories) =>
              isLoadMore ? [...prevCategories, ...itemsArray] : itemsArray
            );
            setPage(responsePage); // Cập nhật trang hiện tại từ response
            setTotalPages(calculatedTotalPages);
            if (responsePage >= calculatedTotalPages) {
              setIsListEnd(true);
            }
          } else {
            if (!isLoadMore) setCategories([]);
            setIsListEnd(true);
          }
        } else {
          if (!isLoadMore) setCategories([]);
          setIsListEnd(true);
          console.warn("Không nhận được dữ liệu 'categories' hợp lệ từ API.");
          // Không nhất thiết phải throw error nếu rỗng là một trường hợp hợp lệ
        }
      } catch (err) {
        console.error("Lỗi khi fetch categories:", err);
        setError(err.message || "Đã xảy ra lỗi khi tải danh mục.");
        if (err.message.includes("Phiên đăng nhập")) {
          // Xử lý điều hướng đăng nhập nếu cần
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [limit, isListEnd, callGraphQL]
  ); // Thêm callGraphQL vào dependencies nếu chưa có
  // Tải dữ liệu lần đầu
  useEffect(() => {
    fetchCategories(1); // Tải trang đầu tiên
  }, [fetchCategories]); // Chỉ gọi lại nếu fetchCategories thay đổi (do limit thay đổi)

  const handleLoadMore = () => {
    if (!loadingMore && !isListEnd && page < totalPages) {
      fetchCategories(page + 1, true);
    }
  };

  const handleRefresh = () => {
    setPage(1); // Reset về trang 1
    setIsListEnd(false); // Cho phép tải lại
    fetchCategories(1, false); // Gọi fetch trang đầu, không phải load more
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color={Colors.DEFAULT_GREEN} />
      </View>
    );
  };

  const handleAddItem = () => {
    navigation.navigate("Comment");
  };

  const handleDeleteItem = (item) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa loại "${item.name}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          onPress: () => console.log("Xóa:", item.id),
          style: "destructive",
        },
      ]
    );
    // Gọi API xóa ở đây
  };

  const handleEditItem = (item) => {
    console.log("Chỉnh sửa:", item.id);
    // Ví dụ: navigation.navigate('EditCategoryScreen', { categoryId: item.id });
    Alert.alert("Thông báo", "Chức năng chỉnh sửa chưa được triển khai.");
  };

  const renderCategoryItem = (
    { item } // Đổi tên hàm render
  ) => (
    <View>
      <View style={styles.divider} />
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Tên loại</Text>
        <Text style={styles.infoValue}>{item.name}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Số cửa hàng</Text>
        {/* Giả sử 'num' không có trong API, hiển thị 'N/A' hoặc query từ backend */}
        <Text style={styles.infoValue}>{item.num || "N/A"}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => handleDeleteItem(item)}
        >
          <Text style={styles.buttonText}>Xóa loại</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => handleEditItem(item)}
        >
          <Text style={styles.buttonText}>Chỉnh sửa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && categories.length === 0 && !error) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.DEFAULT_GREEN} />
        <Text style={{ marginTop: 10, color: Colors.DEFAULT_GREY }}>
          Đang tải danh mục...
        </Text>
      </View>
    );
  }

  if (error && categories.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Lỗi: {error}</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Loại nhà hàng</Text>
      <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
        <Text style={styles.addButtonText}>Thêm loại</Text>
      </TouchableOpacity>

      {categories.length === 0 && !loading && !error ? (
        <View style={styles.centered}>
          <Text style={{ fontSize: 16, color: Colors.DEFAULT_GREY }}>
            Không có danh mục nào.
          </Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          renderItem={renderCategoryItem} // Sử dụng hàm render mới
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          style={styles.listStyle}
          contentContainerStyle={styles.listContentContainer}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          onRefresh={handleRefresh} // Kéo để làm mới
          refreshing={loading && !loadingMore} // Chỉ hiển thị icon refresh khi đang tải lại trang 1
        />
      )}
      {/* Hiển thị lỗi inline nếu có lỗi trong khi đã có dữ liệu */}
      {error && categories.length > 0 && !loadingMore && (
        <View style={styles.inlineErrorView}>
          <Text style={styles.inlineErrorText}>
            Lỗi tải thêm:{" "}
            {error.length > 70 ? error.substring(0, 70) + "..." : error}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    marginTop: 40, // Hoặc sử dụng SafeAreaView nếu cần
    textAlign: "center",
    color: Colors.DEFAULT_GREEN,
    fontWeight: "bold",
    fontSize: 24,
    marginBottom: 15,
  },
  addButton: {
    alignSelf: "flex-end",
    marginRight: 20, // Tăng margin để không quá sát
    marginBottom: 10, // Thêm margin bottom
    paddingHorizontal: 20,
    backgroundColor: Colors.DEFAULT_GREEN,
    paddingVertical: 10,
    borderRadius: 8, // Bo tròn hơn
    elevation: 2,
  },
  addButtonText: {
    color: Colors.DEFAULT_WHITE,
    fontSize: 16, // Tăng font
    fontWeight: "500",
  },
  listStyle: {
    paddingHorizontal: 10, // Di chuyển padding vào đây
  },
  listContentContainer: {
    paddingBottom: 20, // Đảm bảo có không gian cho footer
  },
  divider: {
    height: 1,
    backgroundColor: Colors.DEFAULT_GREY,
    marginVertical: 10,
    marginHorizontal: 10, // Thêm margin ngang cho divider
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10, // Giữ padding cho từng row
    paddingVertical: 8, // Giảm padding dọc một chút
    alignItems: "center", // Căn giữa các item trong row
  },
  infoLabel: {
    fontSize: 17, // Giảm font một chút
    color: Colors.DEFAULT_GREEN,
    fontWeight: "500", // Thêm đậm
  },
  infoValue: {
    fontSize: 17,
    color: Colors.DARK_ONE, // Màu chữ đậm hơn
    flexShrink: 1, // Cho phép text co lại nếu quá dài
    textAlign: "right",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
    marginVertical: 15, // Giảm margin
    paddingHorizontal: 10, // Thêm padding ngang
  },
  button: {
    paddingHorizontal: 18, // Giảm padding ngang
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100, // Đặt chiều rộng tối thiểu
    alignItems: "center",
    justifyContent: "center",
    elevation: 1,
  },
  buttonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "500",
  },
  deleteButton: {
    backgroundColor: Colors.DEFAULT_RED, // Sử dụng màu đỏ cho nút xóa
  },
  editButton: {
    backgroundColor: Colors.DEFAULT_ORANGE, // Sử dụng màu cam cho nút sửa (ví dụ)
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  footerLoading: {
    paddingVertical: 20,
    alignItems: "center",
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
  },
  inlineErrorText: {
    color: Colors.DEFAULT_RED,
    fontSize: 14,
  },
});
