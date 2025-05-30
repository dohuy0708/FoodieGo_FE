import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import Colors from "../../constants/Colors";
import Display from "../../utils/Display";
import {
  findOrderDetailByOrderId,
  updateOrderStatus
} from "../../services/vendorService";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const formatPrice = (price) => {
  if (typeof price !== "number") return "N/A";
  return price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) throw new Error("Invalid Date");
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (e) {
    console.error("Error formatting date:", e);
    return "N/A";
  }
};
const handleConfirmOrder = async (orderId) => {
  try {
    const response = await updateOrderStatus(orderId, "confirmed");
    if (response.status === 200) {
      console.log("Đơn hàng đã được xác nhận thành công.");
    } else {
      console.error("Lỗi khi xác nhận đơn hàng:", response.data.message);
    }
  } catch (error) {
    console.error("Lỗi khi xác nhận đơn hàng:", error.message);
  }
};
const handleCancelOrder = async (orderId) => {
  try {
    const response = await updateOrderStatus(orderId, "cancelled");
    
  } catch (error) {
    console.error("Lỗi khi hủy đơn hàng:", error.message);
  }
};
const formatTime = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) throw new Error("Invalid Date");
    const hour = date.getHours().toString().padStart(2, "0");
    const minute = date.getMinutes().toString().padStart(2, "0");
    return `${hour}h${minute}p`;
  } catch (e) {
    console.error("Error formatting time:", e);
    return "N/A";
  }
};

export default function OrderDetail({ navigation, route }) {
  const { orderId, orderBaseInfo } = route.params;
  const insets = useSafeAreaInsets();
  const [orderDetails, setOrderDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetails = useCallback(async () => {
    if (!orderId) {
      setError("Không có ID đơn hàng hợp lệ.");
      setIsLoading(false);
      return;
    }
    console.log(`Đang lấy chi tiết cho đơn hàng ID: ${orderId}`);
    setIsLoading(true);
    setError(null);
    try {
      const details = await findOrderDetailByOrderId(orderId);
      console.log("Phản hồi API (Chi tiết đơn hàng):", details);

      if (details && Array.isArray(details)) {
        setOrderDetails(details);
      } else if (details === null) {
        console.log(`Không tìm thấy chi tiết cho đơn hàng ID: ${orderId}`);
        setOrderDetails([]);
      } else {
        throw new Error("Dữ liệu chi tiết đơn hàng trả về không hợp lệ.");
      }
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết đơn hàng:", err);
      setError(err.message || "Không thể tải chi tiết đơn hàng.");
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const renderDishItem = ({ item }) => (
    <View style={styles.dishItem}>
      <View style={styles.dishNameContainer}>
        <Text style={styles.dishNameText}>
          {item.menu?.name || "Tên món ăn không xác định"}
        </Text>
        {item.note && (
          <Text style={styles.dishNoteText}>Ghi chú: {item.note}</Text>
        )}
      </View>
      <View style={styles.dishQuantityPriceContainer}>
        <Text style={styles.dishQuantityText}>x {item.quantity}</Text>
        <Text style={styles.dishPriceText}>
          {formatPrice(item.menu?.price)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chi tiết đơn hàng</Text>

      <View style={styles.orderInfoContainer}>
        <View style={styles.viewText}>
          <Text style={styles.infoLabel}>Mã đơn hàng</Text>
          <Text style={[styles.infoValue, { fontWeight: "bold" }]}>
            {orderBaseInfo?.id || `DH${orderId}`}
          </Text>
        </View>
        <View style={styles.viewText}>
          <Text style={styles.infoLabel}>Người đặt</Text>
          <Text style={styles.infoValue}>
            {orderBaseInfo?.customer || "N/A"}
          </Text>
        </View>
        <View style={styles.viewText}>
          <Text style={styles.infoLabel}>Tổng tiền</Text>
          <Text style={[styles.infoValue, styles.totalPriceText]}>
            {orderBaseInfo?.price || "N/A"}
          </Text>
        </View>
        <View style={styles.viewText}>
          <Text style={styles.infoLabel}>Thời gian</Text>
          <Text style={styles.infoValue}>
            {orderBaseInfo?.originalDate
              ? formatTime(orderBaseInfo.originalDate)
              : orderBaseInfo?.hour !== undefined
              ? `${orderBaseInfo.hour}h${orderBaseInfo.minute}p`
              : "N/A"}
          </Text>
        </View>
        <View style={styles.viewText}>
          <Text style={styles.infoLabel}>Ngày</Text>
          <Text style={styles.infoValue}>
            {orderBaseInfo?.originalDate
              ? formatDate(orderBaseInfo.originalDate)
              : orderBaseInfo?.date
              ? formatDate(orderBaseInfo.date)
              : "N/A"}
          </Text>
        </View>
        <View>
          <Text style={styles.labelText}>Địa chỉ:</Text>
          <Text>{orderBaseInfo.address || "N/A"}</Text>
        </View>
        <View style={styles.viewText}>
          <Text style={styles.infoLabel}>Tình trạng</Text>
          <Text
            style={[
              styles.infoValue,
              styles.statusTextBase,
              orderBaseInfo?.status === "Đã giao"
                ? styles.statusCompleted
                : orderBaseInfo?.status === "Đang giao"
                ? styles.statusDelivering
                : orderBaseInfo?.status === "Chờ xác nhận"
                ? styles.statusPending
                : orderBaseInfo?.status === "Đã hủy"
                ? styles.statusCancelled
                : orderBaseInfo?.status === "Đã xác nhận"
                ? styles.statusConfirmed
                : styles.statusDefault,
            ]}
          >
            {orderBaseInfo?.status || "N/A"}
          </Text>
        </View>
      </View>

      <Text style={styles.listHeader}>Danh sách món ăn</Text>

      <View style={[styles.listContainer,{marginBottom:insets.bottom+Display.setHeight(2)}]}>
        {isLoading ? (
          <ActivityIndicator
            style={styles.loadingIndicator}
            size="large"
            color={Colors.DEFAULT_GREEN}
          />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchDetails} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={orderDetails}
            renderItem={renderDishItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContentContainer}
            ListEmptyComponent={
              <Text style={styles.emptyListText}>
                Đơn hàng này không có món ăn nào.
              </Text>
            }
          />
        )}
      </View>

      {!isLoading && !error && orderBaseInfo?.status === "Chờ xác nhận" && (
        <View
          style={[
            styles.buttonContainer,
            { marginBottom: insets.bottom + Display.setHeight(2) },
          ]}
        >
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => {
              handleCancelOrder(orderId);
              navigation.goBack();
            }}
          >
            <Text style={styles.buttonText}>Hủy đơn</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.confirmButton]}
            onPress={() => {
              handleConfirmOrder(orderId);
              navigation.goBack();
            }}
          >
            <Text style={styles.buttonText}>Xác nhận</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Display.setWidth(2.5),
    paddingTop: Display.setHeight(5),
    backgroundColor: "#fff",
    gap: Display.setHeight(2),
  },
  header: {
    textAlign: "center",
    color: Colors.DEFAULT_GREEN,
    fontWeight: "bold",
    fontSize: 24,
    marginBottom: Display.setHeight(1),
  },
  orderInfoContainer: {
    paddingVertical: Display.setHeight(1.5),
    paddingHorizontal: Display.setWidth(4),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GREY2,
    gap: Display.setHeight(1),
  },
  viewText: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 15,
    color: Colors.GRAY_DARK,
  },
  infoValue: {
    fontSize: 15,
    color: Colors.DEFAULT_BLACK,
    fontWeight: "500",
    textAlign: "right",
    flexShrink: 1,
  },
  totalPriceText: {
    color: Colors.DEFAULT_GREEN,
    fontWeight: "bold",
  },
  statusTextBase: {
    fontWeight: "bold",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
    fontSize: 14,
    minWidth: 90,
    textAlign: "center",
  },
  statusPending: {
    backgroundColor: Colors.DEFAULT_ORANGE + "30",
    color: Colors.DEFAULT_ORANGE,
  },
  statusConfirmed: {
    backgroundColor: Colors.INFO + "30",
    color: '#2196f3',
  },
  statusDelivering: {
    backgroundColor: Colors.WARNING + "30",
    color: Colors.WARNING,
  },
  statusCompleted: {
    backgroundColor: Colors.DEFAULT_GREEN + "30",
    color: Colors.DEFAULT_GREEN,
  },
  statusCancelled: {
    backgroundColor: Colors.DEFAULT_RED + "30",
    color: Colors.DEFAULT_RED,
  },
  statusDefault: {
    backgroundColor: Colors.LIGHT_GREY2,
    color: Colors.GRAY_DARK,
  },
  listHeader: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 18,
    color: Colors.DEFAULT_BLACK,
    marginTop: Display.setHeight(1),
  },
  listContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GREY2,
    borderRadius: 8,
  },
  loadingIndicator: {
    marginTop: Display.setHeight(10),
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.DEFAULT_RED,
    textAlign: "center",
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: Colors.DEFAULT_GREEN,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: Colors.DEFAULT_WHITE,
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyListText: {
    textAlign: "center",
    marginTop: Display.setHeight(5),
    fontSize: 16,
    color: Colors.GRAY_DARK,
  },
  listContentContainer: {
    paddingHorizontal: Display.setWidth(3),
    paddingVertical: Display.setHeight(1.5),
    gap: Display.setHeight(1.5),
  },
  dishItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    paddingVertical: Display.setHeight(0.8),
    borderBottomWidth: 1,
    borderBottomColor: Colors.LIGHT_GREY2,
  },
  dishNameContainer: {
    flex: 1,
    marginRight: Display.setWidth(2),
  },
  dishQuantityPriceContainer: {
    alignItems: "flex-end",
    minWidth: Display.setWidth(15),
  },
  dishNameText: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.DEFAULT_BLACK,
    marginBottom: 3,
  },
  dishNoteText: {
    fontSize: 13,
    color: Colors.GRAY_DARK,
    fontStyle: "italic",
  },
  dishQuantityText: {
    fontSize: 15,
    color: Colors.DEFAULT_GREEN,
    fontWeight: "bold",
    marginBottom: 3,
  },
  dishPriceText: {
    fontSize: 14,
    color: Colors.DEFAULT_ORANGE,
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: Display.setWidth(5),
    paddingHorizontal: Display.setWidth(5),
    paddingVertical: Display.setHeight(1.5),
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.LIGHT_GREY2,
    backgroundColor: "#fff",
  },
  button: {
    flex: 1,
    paddingVertical: Display.setHeight(1.5),
    height: Display.setHeight(6),
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: Colors.DEFAULT_YELLOW,
  },
  confirmButton: {
    backgroundColor: Colors.DEFAULT_GREEN,
  },
});
