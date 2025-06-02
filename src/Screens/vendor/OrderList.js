import React, { useState, useCallback, useEffect, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView as RNScrollView, // Alias to avoid conflict if ScrollView is used from gesture-handler
} from "react-native";
// DateTimePicker import is removed as it's replaced by the bottom sheet
import Colors from "../../constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import Nav from "../../components/Nav";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getAllOrdersByRestaurantId } from "../../services/vendorService";
import useSessionStore from "../../utils/store";
import Display from "../../utils/Display";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const NAV_HEIGHT = Display.setHeight(7);

const formatPrice = (price) => {
  if (typeof price !== "number") return "N/A";
  return price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

const mapStatus = (status) => {
  switch (status) {
    case "pending":
      return "Chờ xác nhận";
    case "confirmed":
      return "Đã xác nhận";
    case "delivering":
      return "Đang giao";
    case "completed":
      return "Đã giao";
    case "cancelled":
      return "Đã hủy";
    default:
      return status;
  }
};

const extractDateInfo = (isoStringOrTimestamp) => {
  if (!isoStringOrTimestamp)
    return { dateStr: "N/A", hour: "N/A", minute: "N/A", dateObj: null };
  try {
    const dateObj = new Date(isoStringOrTimestamp);
    if (isNaN(dateObj.getTime())) throw new Error("Invalid Date");

    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const day = dateObj.getDate().toString().padStart(2, "0");
    const hour = dateObj.getHours();
    const minute = dateObj.getMinutes();
    return { dateStr: `${year}-${month}-${day}`, hour, minute, dateObj };
  } catch (e) {
    console.error("Error parsing date:", e);
    return { dateStr: "N/A", hour: "N/A", minute: "N/A", dateObj: null };
  }
};

const getDaysArray = (year, month) => { // month is 1-indexed
  if (!year || !month) return [];
  const numDays = new Date(year, month, 0).getDate();
  return Array.from({ length: numDays }, (_, i) => i + 1);
};


export default function OrderList({ navigation }) {
  const restaurantId = useSessionStore((state) => state.restaurantId);
  const insets = useSafeAreaInsets();
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [errorOrders, setErrorOrders] = useState(null);
  const [orders, setOrders] = useState([]);

  // Bottom Sheet State
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Filter State
  const today = new Date();
  const [filterType, setFilterType] = useState("day"); // 'day' or 'month'
  const [filterYear, setFilterYear] = useState(today.getFullYear());
  const [filterMonth, setFilterMonth] = useState(today.getMonth() + 1); // 1-indexed
  const [filterDay, setFilterDay] = useState(today.getDate());

  // Temporary state for bottom sheet pickers
  const [bsPickerType, setBsPickerType] = useState(filterType);
  const [bsTempYear, setBsTempYear] = useState(filterYear);
  const [bsTempMonth, setBsTempMonth] = useState(filterMonth);
  const [bsTempDay, setBsTempDay] = useState(filterDay);


  const fetchOrdersCallback = useCallback(() => {
    console.log("OrderList: fetchOrdersCallback called");
    async function fetchData() {
      if (restaurantId === null || restaurantId === undefined) {
        setOrders([]);
        return;
      }
      setIsLoadingOrders(true);
      setErrorOrders(null);
      try {
        const allOrders = await getAllOrdersByRestaurantId(restaurantId);
        if (Array.isArray(allOrders)) {
          const transformedOrders = allOrders.map((order) => {
            const { dateStr, hour, minute, dateObj } = extractDateInfo(
              order.createdAt
            );
            return {
              id: `DH${order.id}`,
              customer: order.user?.name || "Khách ẩn danh",
              status: mapStatus(order.status),
              date: dateStr,
              price: formatPrice(order.totalPrice),
              hour: hour+7,
              minute: minute,
              userId: order.user?.id,
              originalDate: dateObj,
              address: `${order.address?.street || "N/A"}, ${
                order.address?.ward || "N/A"
              }, ${order.address?.district || "N/A"}, ${
                order.address?.province || "N/A"
              }`,
            };
          });
          const sortedOrders = transformedOrders.sort((a, b) => new Date(b.originalDate) - new Date(a.originalDate));
          setOrders(sortedOrders);
        } else {
          setErrorOrders(
            "Không thể tải danh sách đơn hàng (dữ liệu không hợp lệ)."
          );
          setOrders([]);
        }
      } catch (err) {
        setErrorOrders(
          `Đã xảy ra lỗi: ${err.message || "Không thể tải đơn hàng"}`
        );
        setOrders([]);
      } finally {
        setIsLoadingOrders(false);
      }
    }
    fetchData();
  }, [restaurantId]);

  useFocusEffect(fetchOrdersCallback);

  const filteredOrders = orders.filter((order) => {
    if (!order.originalDate) return false;
    const orderDate = order.originalDate;
    const orderYear = orderDate.getFullYear();
    const orderMonth = orderDate.getMonth() + 1; // 1-indexed
    const orderDay = orderDate.getDate();

    if (filterType === "day") {
      return (
        orderYear === filterYear &&
        orderMonth === filterMonth &&
        orderDay === filterDay
      );
    } else if (filterType === "month") {
      return orderYear === filterYear && orderMonth === filterMonth;
    }
    return true; // Should not reach here if filterType is always 'day' or 'month'
  });

  const formatFilterDateDisplay = () => {
    if (filterType === "day") {
      return `Ngày ${String(filterDay).padStart(2, "0")}/${String(
        filterMonth
      ).padStart(2, "0")}/${filterYear}`;
    } else if (filterType === "month") {
      return `Tháng ${String(filterMonth).padStart(2, "0")}/${filterYear}`;
    }
    return "Chọn bộ lọc";
  };

  const toggleBottomSheet = () => {
    if (!isBottomSheetOpen) {
      // Sync picker state with current main view state when opening
      setBsPickerType(filterType);
      setBsTempYear(filterYear);
      setBsTempMonth(filterMonth);
      setBsTempDay(filterDay);
    }
    const toValue = isBottomSheetOpen ? 0 : 1;
    Animated.spring(slideAnim, {
      toValue,
      friction: 9,
      tension: 70,
      useNativeDriver: true,
    }).start();
    setIsBottomSheetOpen(!isBottomSheetOpen);
  };

  const handleApplyFilters = () => {
    setFilterType(bsPickerType);
    setFilterYear(bsTempYear);
    setFilterMonth(bsTempMonth);
    if (bsPickerType === "day") {
      setFilterDay(bsTempDay);
    }
    // If bsPickerType is 'month', filterDay is not used for filtering logic,
    // but we might want to reset it or handle it based on requirements.
    // For now, it will retain its last 'day' filter value if not explicitly changed.
    toggleBottomSheet();
  };
  
  // --- Picker Render Functions for Bottom Sheet ---
  const renderFilterPickers = () => {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const daysInSelectedMonth = getDaysArray(bsTempYear, bsTempMonth);

    return (
      <RNScrollView contentContainerStyle={{ paddingBottom: Display.setHeight(5) }} showsVerticalScrollIndicator={false}>
        <View style={styles.bsYearSelector}>
          <TouchableOpacity
            style={styles.bsYearArrowButton}
            onPress={() => setBsTempYear((year) => year - 1)}
          >
            <Feather name="chevron-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.bsYearText}>{bsTempYear}</Text>
          <TouchableOpacity
            style={styles.bsYearArrowButton}
            onPress={() => setBsTempYear((year) => year + 1)}
          >
            <Feather name="chevron-right" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <Text style={styles.bsPickerLabel}>Chọn tháng:</Text>
        <View style={styles.bsMonthsGrid}>
          {months.map((month) => (
            <TouchableOpacity
              key={`month-${month}`}
              style={[
                styles.bsMonthButton,
                bsTempMonth === month && styles.bsSelectedMonth,
              ]}
              onPress={() => {
                setBsTempMonth(month);
                // If switching month and current day is invalid for new month, reset to 1
                const newDaysInMonth = new Date(bsTempYear, month, 0).getDate();
                if (bsTempDay > newDaysInMonth) {
                    setBsTempDay(1);
                }
              }}
            >
              <Text
                style={[
                  styles.bsMonthText,
                  bsTempMonth === month && styles.bsSelectedMonthText,
                ]}
              >
                Tháng {month}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {bsPickerType === "day" && (
          <>
            <Text style={styles.bsPickerLabel}>Chọn ngày:</Text>
            {daysInSelectedMonth.length > 0 ? (
                <View style={styles.bsDaysGrid}>
                {daysInSelectedMonth.map((day) => (
                    <TouchableOpacity
                    key={`day-${day}`}
                    style={[
                        styles.bsDayButton,
                        bsTempDay === day && styles.bsSelectedDay,
                    ]}
                    onPress={() => setBsTempDay(day)}
                    >
                    <Text
                        style={[
                        styles.bsDayText,
                        bsTempDay === day && styles.bsSelectedDayText,
                        ]}
                    >
                        {day}
                    </Text>
                    </TouchableOpacity>
                ))}
                </View>
            ) : (
                <Text style={styles.bsInfoText}>Vui lòng chọn năm và tháng hợp lệ.</Text>
            )}
          </>
        )}
         {bsPickerType === "month" && (
             <View style={{alignItems:'center', marginTop: Display.setHeight(2)}}>
                <Text style={styles.bsInfoText}>
                    Thống kê đơn hàng cho cả tháng {bsTempMonth}/{bsTempYear}
                </Text>
             </View>
         )}
      </RNScrollView>
    );
  };


  const renderItem = ({ item }) => {
    // Helper to format date from originalDate for display if needed
    const displayItemDate = (dateObj) => {
        if (!dateObj || isNaN(dateObj.getTime())) return 'N/A';
        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const year = dateObj.getFullYear();
        return `${day}/${month}/${year}`;
    };

    return (
      <View style={styles.orderItem}>
        <View style={styles.divider} />
        <View style={styles.viewText}>
          <Text style={styles.orderIdText}>{item.id}</Text>
          <Text
            style={[
              styles.statusText,
              item.status === "Đã giao"
                ? styles.statusCompleted
                : item.status === "Đã xác nhận"
                ? styles.statusConfirmed
                : item.status === "Chờ xác nhận"
                ? styles.statusPending
                : item.status === "Đã hủy"
                ? styles.statusCancelled
                : styles.statusDefault, // Includes 'Đang giao' if not specifically styled
            ]}
          >
            {item.status}
          </Text>
        </View>
        <View style={styles.viewText}>
          <Text style={styles.labelText}>Người đặt</Text>
          <Text style={styles.valueText}>{item.customer}</Text>
        </View>
        <View style={styles.viewText}>
          <Text style={styles.labelText}>Tổng tiền</Text>
          <Text style={[styles.valueText, styles.priceText]}>{item.price}</Text>
        </View>
        <View style={styles.viewText}>
          <Text style={styles.labelText}>Thời gian</Text>
          <Text style={styles.valueText}>
            {item.hour !== "N/A"
              ? `${String(item.hour).padStart(2, "0")}h${String(
                  item.minute
                ).padStart(2, "0")}p`
              : "N/A"}
          </Text>
        </View>
        <View style={styles.viewText}>
          <Text style={styles.labelText}>Ngày</Text>
          <Text style={styles.valueText}>{displayItemDate(item.originalDate)}</Text>
        </View>
        <View>
          <Text style={styles.labelText}>Địa chỉ:</Text>
          <Text>{item.address || "N/A"}</Text>
        </View>
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() =>
            navigation.navigate("OrderDetail", {
              orderId: parseInt(item.id.replace("DH", ""), 10),
              orderBaseInfo: item,
            })
          }
        >
          <Text style={styles.detailsButtonText}>Xem chi tiết</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.header}>Danh sách đơn hàng</Text>
        <View style={styles.filterDisplayContainer}>
          <Text style={styles.filterDisplayText}>
            {formatFilterDateDisplay()}
          </Text>
          <TouchableOpacity onPress={toggleBottomSheet}>
            <Feather name="calendar" size={24} color={Colors.DEFAULT_GREEN} />
          </TouchableOpacity>
        </View>
      </View>

      {isLoadingOrders && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.DEFAULT_GREEN} />
          <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
        </View>
      )}

      {!isLoadingOrders && errorOrders && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorOrders}</Text>
          <TouchableOpacity
            onPress={fetchOrdersCallback}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLoadingOrders && !errorOrders && (
        <FlatList
          data={filteredOrders}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          style={styles.listStyle}
          contentContainerStyle={styles.listContentContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {orders.length === 0 && !isLoadingOrders
                  ? "Chưa có đơn hàng nào."
                  : "Không có đơn hàng nào cho bộ lọc đã chọn."}
              </Text>
            </View>
          }
        />
      )}

      <View style={[styles.navContainer, { bottom: insets.bottom }]}>
        <Nav nav={navigation} />
      </View>

      {/* Bottom Sheet for Filtering */}
      <Animated.View
        style={[
          styles.bottomSheet,
          {
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [screenHeight, 0], // Slide from bottom
                }),
              },
            ],
            paddingBottom: insets.bottom > 0 ? insets.bottom : Display.setHeight(2)
          },
        ]}
      >
        <View style={styles.bsContent}>
          <TouchableOpacity
            onPress={toggleBottomSheet}
            style={styles.bsCloseButton}
          >
            <Feather name="x" size={28} color="white" />
          </TouchableOpacity>

          <View style={styles.bsTypeSelector}>
            <TouchableOpacity
              style={[
                styles.bsTypeButton,
                bsPickerType === "day" && styles.bsSelectedType,
              ]}
              onPress={() => setBsPickerType("day")}
            >
              <Text
                style={[
                  styles.bsTypeText,
                  bsPickerType === "day" && styles.bsSelectedTypeText,
                ]}
              >
                Theo Ngày
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.bsTypeButton,
                bsPickerType === "month" && styles.bsSelectedType,
              ]}
              onPress={() => setBsPickerType("month")}
            >
              <Text
                style={[
                  styles.bsTypeText,
                  bsPickerType === "month" && styles.bsSelectedTypeText,
                ]}
              >
                Theo Tháng
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bsDivider} />

          {renderFilterPickers()}
          
          <TouchableOpacity
            style={styles.bsApplyButton}
            onPress={handleApplyFilters}
          >
            <Text style={styles.bsApplyButtonText}>Áp dụng</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BG_COLOR || "#f8f9fa",
  },
  headerContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: Colors.DEFAULT_WHITE || "#fff",
    borderBottomWidth: 1,
    borderBottomColor: Colors.GRAY_BORDER || "#eee",
  },
  header: {
    textAlign: "center",
    color: Colors.PRIMARY_DARK || Colors.DEFAULT_GREEN,
    fontWeight: "bold",
    fontSize: 22,
    marginBottom: 15,
  },
  filterDisplayContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.LIGHT_GRAY_BG || "#f0f0f0",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  filterDisplayText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.TEXT_DARK || "#333",
  },
  listStyle: {
    flex: 1,
  },
  listContentContainer: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: NAV_HEIGHT + Display.setHeight(2), // Adjusted for Nav
  },
  orderItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: Colors.DEFAULT_WHITE || "#fff",
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.GRAY_BORDER || "#eee",
    marginVertical: 5,
  },
  viewText: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 20,
  },
  labelText: {
    fontSize: 14,
    color: Colors.GRAY_DARK || "#555",
    marginRight: 5,
  },
  valueText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.TEXT_DARK || "#333",
    flexShrink: 1,
    textAlign: "right",
  },
  orderIdText: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.PRIMARY || Colors.DEFAULT_GREEN,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    overflow: "hidden",
    textAlign: "center",
    minWidth: 110,
    color: Colors.DEFAULT_WHITE,
  },
  statusPending: {
    backgroundColor: Colors.DEFAULT_ORANGE || "#ff9800",
  },
  statusConfirmed: {
    backgroundColor: Colors.INFO || "#2196f3",
  },
  statusDelivering: { // Assuming DELIVERING might use WARNING color
    backgroundColor: Colors.WARNING || '#ffc107', 
    color: '#333' // Darker text for yellow background
  },
  statusCompleted: {
    backgroundColor: Colors.DEFAULT_GREEN || "#4caf50",
  },
  statusCancelled: {
    backgroundColor: Colors.DEFAULT_RED || "#f44336",
  },
  statusDefault: {
    backgroundColor: Colors.GRAY_MEDIUM || "#9e9e9e",
  },
  priceText: {
    fontWeight: "bold",
    color: Colors.SUCCESS || Colors.DEFAULT_GREEN,
  },
  detailsButton: {
    marginTop: 10,
    alignSelf: "flex-end",
    paddingVertical: 5,
  },
  detailsButtonText: {
    color: Colors.PRIMARY || Colors.DEFAULT_GREEN,
    textDecorationLine: "underline",
    fontSize: 14,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: NAV_HEIGHT,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.GRAY_DARK,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingBottom: NAV_HEIGHT,
  },
  errorText: {
    textAlign: "center",
    fontSize: 16,
    color: Colors.DEFAULT_RED,
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: Colors.PRIMARY || Colors.DEFAULT_GREEN,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: Colors.DEFAULT_WHITE,
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
    paddingBottom: NAV_HEIGHT,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: Colors.GRAY_DARK,
  },
  navContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    height: NAV_HEIGHT,
    backgroundColor: Colors.DEFAULT_WHITE || "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    zIndex: 10,
  },

  // --- Bottom Sheet Styles ---
  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    height: "85%", // Adjusted height
    bottom: 0,
    backgroundColor: Colors.DEFAULT_GREEN,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 10,
    zIndex: 1000, // Ensure it's on top
  },
  bsContent: {
    flex: 1,
    paddingHorizontal: Display.setWidth(5),
    paddingTop: Display.setHeight(1), // Less top padding for content itself
  },
  bsCloseButton: {
    position: "absolute",
    top: Display.setHeight(1.5),
    right: Display.setWidth(4),
    zIndex: 1,
    padding: Display.setWidth(1.5),
  },
  bsTypeSelector: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: Display.setHeight(4), // Ensure it's below close button
    marginBottom: Display.setHeight(2),
  },
  bsTypeButton: {
    paddingVertical: Display.setHeight(1.2),
    paddingHorizontal: Display.setWidth(5),
    borderRadius: 20,
  },
  bsSelectedType: {
    backgroundColor: Colors.DEFAULT_WHITE,
  },
  bsTypeText: {
    color: Colors.DEFAULT_WHITE,
    fontSize: 16,
    fontWeight: "500",
  },
  bsSelectedTypeText: {
    color: Colors.DEFAULT_GREEN,
  },
  bsDivider: {
    width: "100%",
    height: 1,
    backgroundColor: Colors.DEFAULT_WHITE,
    opacity: 0.5,
    marginVertical: Display.setHeight(2),
  },
  bsYearSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Display.setWidth(5),
    marginVertical: Display.setHeight(1.5),
  },
  bsYearArrowButton: {
    padding: Display.setWidth(1.2),
  },
  bsYearText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  bsPickerLabel: {
    color: Colors.DEFAULT_WHITE,
    fontSize: 15,
    fontWeight: '500',
    marginLeft: Display.setWidth(2),
    marginTop: Display.setHeight(1.5),
    marginBottom: Display.setHeight(1),
  },
  bsMonthsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Display.setWidth(2.5),
  },
  bsMonthButton: {
    width: "31%", // Adjust for 3 buttons per row
    paddingVertical: Display.setHeight(1.5),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    alignItems: "center",
    marginBottom: Display.setHeight(1),
  },
  bsSelectedMonth: {
    backgroundColor: Colors.DEFAULT_WHITE,
    borderColor: Colors.DEFAULT_WHITE,
  },
  bsMonthText: {
    color: "white",
    fontSize: 13,
    fontWeight: "500",
  },
  bsSelectedMonthText: {
    color: Colors.DEFAULT_GREEN,
  },
  bsDaysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Display.setWidth(1.5),
    maxHeight: Display.setHeight(25), // Limit height for scrollability
  },
  bsDayButton: {
    width: Display.setWidth(11), // Approx 6-7 per row
    aspectRatio: 1, // Make them square-ish
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Display.setWidth(5.5),
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    margin: Display.setWidth(0.5),
  },
  bsSelectedDay: {
    backgroundColor: Colors.DEFAULT_WHITE,
    borderColor: Colors.DEFAULT_WHITE,
  },
  bsDayText: {
    color: "white",
    fontSize: 12,
  },
  bsSelectedDayText: {
    color: Colors.DEFAULT_GREEN,
    fontWeight: 'bold',
  },
  bsApplyButton: {
    paddingVertical: Display.setHeight(1.8),
    paddingHorizontal: Display.setWidth(8),
    borderRadius: 25,
    marginTop: 'auto', // Pushes button to the bottom if content is scrollable
    marginBottom: Display.setHeight(1), // Space from bottom of sheet or safe area
    alignSelf: "center",
    backgroundColor: Colors.DEFAULT_WHITE,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  bsApplyButtonText: {
    color: Colors.DEFAULT_GREEN,
    fontSize: 18,
    fontWeight: "bold",
  },
  bsInfoText: {
      color: Colors.LIGHT_GREY,
      fontSize: 14,
      textAlign: 'center',
      paddingVertical: Display.setHeight(1)
  }
});