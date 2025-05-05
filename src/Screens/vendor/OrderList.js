import React, { useState, useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  RefreshControl 
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Color } from "../../constants";
import Feather from "@expo/vector-icons/Feather";
import Nav from "../../components/Nav";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getAllOrdersByRestaurantId } from "../../services/vendorService";
import useSessionStore from "../../utils/store";

const formatPrice = (price) => {
  if (typeof price !== 'number') return "N/A";
  return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

const mapStatus = (status) => {
  switch (status) {
    case 'pending': return 'Chờ xác nhận';
    case 'confirmed': return 'Đã xác nhận';
    case 'delivering': return 'Đang giao';
    case 'completed': return 'Đã giao';
    case 'cancelled': return 'Đã hủy';
    default: return status;
  }
};

const extractDateInfo = (isoStringOrTimestamp) => {
    if (!isoStringOrTimestamp) return { dateStr: 'N/A', hour: 'N/A', minute: 'N/A', dateObj: null };
    try {
        const dateObj = new Date(isoStringOrTimestamp);
        if (isNaN(dateObj.getTime())) throw new Error("Invalid Date");

        const year = dateObj.getFullYear();
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const day = dateObj.getDate().toString().padStart(2, '0');
        const hour = dateObj.getHours();
        const minute = dateObj.getMinutes();
        return { dateStr: `${year}-${month}-${day}`, hour, minute, dateObj };
    } catch (e) {
        console.error("Error parsing date:", e);
        return { dateStr: 'N/A', hour: 'N/A', minute: 'N/A', dateObj: null };
    }
};

export default function OrderList({ navigation }) {
  const restaurantId = useSessionStore((state) => state.restaurantId);
  const insets = useSafeAreaInsets();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [errorOrders, setErrorOrders] = useState(null);
  const [orders, setOrders] = useState([]);

  const fetchOrdersCallback = useCallback(() => {
    async function fetchData() {
      if (restaurantId === null || restaurantId === undefined) {
        console.log(
          "fetchOrdersCallback: Bỏ qua vì restaurantId không hợp lệ."
        );
        setOrders([]);
        return;
      }

      console.log(
        `fetchOrdersCallback: Bắt đầu lấy đơn hàng cho restaurantId: ${restaurantId}`
      );
      setIsLoadingOrders(true);
      setErrorOrders(null);

      try {
        const allOrders = await getAllOrdersByRestaurantId(restaurantId);

        console.log(
          "fetchOrdersCallback: Kết quả gốc từ getAllOrdersByRestaurantId:",
          allOrders
        );

        if (Array.isArray(allOrders)) {
           const transformedOrders = allOrders.map(order => {
                const { dateStr, hour, minute, dateObj } = extractDateInfo(order.createdAt);
                return {
                    id: `DH${order.id}`,
                    customer: order.user?.name || "Khách ẩn danh",
                    status: mapStatus(order.status),
                    date: dateStr,
                    price: formatPrice(order.totalPrice),
                    hour: hour,
                    minute: minute,
                    originalDate: dateObj,
                    
                };
           });

          console.log("fetchOrdersCallback: Dữ liệu sau khi biến đổi:", transformedOrders);
          setOrders(transformedOrders);

          if (transformedOrders.length === 0) {
            console.log(
              `fetchOrdersCallback: Không tìm thấy đơn hàng nào cho restaurantId: ${restaurantId}.`
            );
          }
        } else {
          console.error(
            "fetchOrdersCallback: getAllOrdersByRestaurantId không trả về mảng."
          );
          setErrorOrders("Không thể tải danh sách đơn hàng (dữ liệu không hợp lệ).");
          setOrders([]);
        }
      } catch (err) {
        console.error(
          "fetchOrdersCallback: Lỗi khi gọi hoặc xử lý getAllOrdersByRestaurantId:",
          err
        );
        setErrorOrders(`Đã xảy ra lỗi: ${err.message || 'Không thể tải đơn hàng'}`);
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
    return (
      orderDate.getFullYear() === selectedDate.getFullYear() &&
      orderDate.getMonth() === selectedDate.getMonth() &&
      orderDate.getDate() === selectedDate.getDate()
    );
  });

  const formatDate = (dateObj) => {
    if (!dateObj || isNaN(dateObj.getTime())) return "Chọn ngày";
    const day = dateObj.getDate().toString().padStart(2, "0");
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const onDateChange = (event, selected) => {
    const currentDate = selected || selectedDate;
    setShowDatePicker(Platform.OS === "ios");
    setSelectedDate(currentDate);
     if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.orderItem}>
        <View style={styles.divider} />
        <View style={styles.viewText}>
          <Text style={styles.orderIdText}>{item.id}</Text>
          <Text
            style={[
                styles.statusText,
                item.status === 'Đã giao' ? styles.statusCompleted :
                item.status === 'Đang giao' ? styles.statusDelivering :
                item.status === 'Chờ xác nhận' ? styles.statusPending :
                item.status === 'Đã hủy' ? styles.statusCancelled :
                styles.statusDefault
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
          <Text style={styles.valueText}>{item.hour !== 'N/A' ? `${String(item.hour).padStart(2,'0')}h${String(item.minute).padStart(2,'0')}p` : 'N/A'}</Text>
        </View>
        <View style={styles.viewText}>
          <Text style={styles.labelText}>Ngày</Text>
          <Text style={styles.valueText}>{item.originalDate ? formatDate(item.originalDate) : 'N/A'}</Text>
        </View>
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() =>
            navigation.navigate("OrderDetail", { orderId: parseInt(item.id.replace('DH',''), 10),orderBaseInfo: item })
          }
        >
          <Text style={styles.detailsButtonText}>
            Xem chi tiết
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, {paddingTop: insets.top + 10}]}>
        <Text style={styles.header}>Danh sách đơn hàng</Text>
        <View style={styles.dateSelector}>
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Feather name="calendar" size={24} color={Color.DEFAULT_GREEN} />
          </TouchableOpacity>
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
        />
      )}

      {isLoadingOrders && (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Color.DEFAULT_GREEN} />
            <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
        </View>
      )}

      {!isLoadingOrders && errorOrders && (
           <View style={styles.errorContainer}>
             <Text style={styles.errorText}>{errorOrders}</Text>
             <TouchableOpacity onPress={fetchOrdersCallback} style={styles.retryButton}>
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
                {orders.length === 0 && !isLoadingOrders ? "Chưa có đơn hàng nào." : "Không có đơn hàng nào cho ngày đã chọn."}
                </Text>
            </View>
          }
          // refreshControl={
          //   <RefreshControl refreshing={isLoadingOrders} onRefresh={fetchOrdersCallback} />
          // }
        />
      )}

      <View style={[styles.navContainer, { bottom: insets.bottom }]}>
        <Nav nav={navigation} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.BG_COLOR || "#f8f9fa",
  },
  headerContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: Color.DEFAULT_WHITE || "#fff",
    borderBottomWidth: 1,
    borderBottomColor: Color.GRAY_BORDER || "#eee",
  },
  header: {
    textAlign: "center",
    color: Color.PRIMARY_DARK || Color.DEFAULT_GREEN,
    fontWeight: "bold",
    fontSize: 22,
    marginBottom: 15,
  },
  dateSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Color.LIGHT_GRAY_BG || '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  dateText: {
      fontSize: 16,
      fontWeight: '500',
      color: Color.TEXT_DARK || '#333',
  },
  listStyle: {
    flex: 1,
  },
  listContentContainer: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 100,
  },
  orderItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: Color.DEFAULT_WHITE || "#fff",
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
     backgroundColor: Color.GRAY_BORDER || "#eee",
     marginVertical: 5,
  },
  viewText: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    minHeight: 20,
  },
  labelText: {
      fontSize: 14,
      color: Color.GRAY_DARK || '#555',
      marginRight: 5,
  },
  valueText: {
      fontSize: 14,
      fontWeight: '500',
      color: Color.TEXT_DARK || '#333',
      flexShrink: 1,
      textAlign: 'right',
  },
  orderIdText: {
      fontSize: 15,
      fontWeight: 'bold',
      color: Color.PRIMARY || Color.DEFAULT_GREEN,
  },
  statusText: {
      fontSize: 13,
      fontWeight: 'bold',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 5,
      overflow: 'hidden',
      textAlign: 'center',
      minWidth: 110,
      color: Color.DEFAULT_WHITE,
  },
  statusPending: {
      backgroundColor: Color.DEFAULT_ORANGE || '#ff9800',
  },
  statusConfirmed: {
      backgroundColor: Color.INFO || '#2196f3',
  },
  statusDelivering: {
      backgroundColor: Color.WARNING || '#ffc107',
      color: '#333',
  },
  statusCompleted: {
      backgroundColor: Color.DEFAULT_GREEN || '#4caf50',
  },
  statusCancelled: {
      backgroundColor: Color.DEFAULT_RED || '#f44336',
  },
  statusDefault: {
       backgroundColor: Color.GRAY_MEDIUM || '#9e9e9e',
  },
   priceText: {
      fontWeight: 'bold',
      color: Color.SUCCESS || Color.DEFAULT_GREEN,
   },
   detailsButton: {
       marginTop: 10,
       alignSelf: 'flex-end',
       paddingVertical: 5,
   },
   detailsButtonText: {
       color: Color.PRIMARY || Color.DEFAULT_GREEN,
       textDecorationLine: "underline",
       fontSize: 14,
       fontWeight: 'bold',
   },
  loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 60,
  },
  loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: Color.GRAY_DARK,
  },
  errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      paddingBottom: 60,
  },
  errorText: {
      textAlign: 'center',
      fontSize: 16,
      color: Color.DEFAULT_RED,
      marginBottom: 15,
  },
   retryButton: {
      backgroundColor: Color.PRIMARY || Color.DEFAULT_GREEN,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
   },
   retryButtonText: {
       color: Color.DEFAULT_WHITE,
       fontSize: 16,
       fontWeight: 'bold',
   },
  emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 50,
      paddingBottom: 100,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: Color.GRAY_DARK,
  },
  navContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: Color.DEFAULT_WHITE || "#fff",
    borderTopWidth: 1,
    borderTopColor: Color.GRAY_BORDER || "#e0e0e0",
    height: 60,
  },
});