import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView, // <<< THAY ĐỔI: Import ScrollView
  Modal,
  TextInput,
  Alert,
} from "react-native";
import Colors from "../../constants/Colors";
import Display from "../../utils/Display";
import {
  findOrderDetailByOrderId,
  updateOrderStatus,
  sendNotification,
  getReviewByOrderId,
  createComplaint,
} from "../../services/vendorService";
import Icon from "react-native-vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Các hàm format (formatPrice, formatDate, formatTime) giữ nguyên
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

// Các hàm xử lý logic (handleConfirmOrder, etc.) giữ nguyên
const handleConfirmOrder = async (orderId) => {
  try {
    const response = await updateOrderStatus(orderId, "confirmed");
    if (response.success) {
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
    await updateOrderStatus(orderId, "cancelled");
  } catch (error) {
    console.error("Lỗi khi hủy đơn hàng:", error.message);
  }
};
const handleSendNotification = async (notificationData) => {
  try {
    await sendNotification(notificationData);
  } catch (error) {
    console.error("Lỗi khi gửi thông báo:", error.message);
  }
};

export default function OrderDetail({ navigation, route }) {
  const { orderId, orderBaseInfo } = route.params;
  const insets = useSafeAreaInsets();
  const [orderDetails, setOrderDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isReview, setIsReview] = useState(false);
  const [complaint, setComplaint] = useState(null);
  const [isModalComplaint, setIsModalComplaint] = useState(false);
  const [isModalComplaintLoading, setIsModalComplaintLoading] = useState(false);
  const fetchDetails = useCallback(async () => {
    // ... logic fetchDetails giữ nguyên
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
      const reviews = await getReviewByOrderId(orderId);
      if(reviews)
      {
        setReviews(reviews);
        setIsReview(true);
      }
      else
      {
        setReviews([{content:"Không có đánh giá"}]);
      }
      if (details && Array.isArray(details)) {
        setOrderDetails(details);
      } else if (details === null) {
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
  const handleComplaint = async (reviewId) => {
    console.log("start")
   setIsModalComplaintLoading(true);
    console.log("reviewId", reviewId);
    console.log("complaint", complaint);
    console.log("adminId", 251);
    try {
      const complaintData = {
        reviewId: reviewId,
        content: complaint,
        adminId:251,
        sellerId:1
       
       
  
      };
      console.log("complaintData", complaintData);
      await createComplaint(complaintData);
      setIsModalComplaint(false);
      setComplaint("");
      setIsModalComplaintLoading(false);
      Alert.alert("Thành công", "Báo cáo đã được gửi thành công");
    } catch (error) {
      console.error("Lỗi khi báo cáo:", error.message);
    }
  };
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
      {/* Phần header giữ nguyên, không cuộn */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.header}>Chi tiết đơn hàng</Text>
      </View>
      
      {/* <<< THAY ĐỔI: Bọc toàn bộ nội dung cần cuộn trong ScrollView */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Display.setHeight(2) }}
      >
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

        <View style={styles.listContainer}>
          {isLoading ? (
            <ActivityIndicator
              style={styles.loadingIndicator}
              size="large"
              color={Colors.DEFAULT_GREEN}
            />
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                onPress={fetchDetails}
                style={styles.retryButton}
              >
                <Text style={styles.retryButtonText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={orderDetails}
              renderItem={renderDishItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false} // <<< THAY ĐỔI: Tắt cuộn của FlatList vì đã có ScrollView bên ngoài
              contentContainerStyle={styles.listContentContainer}
              ListEmptyComponent={
                <Text style={styles.emptyListText}>
                  Đơn hàng này không có món ăn nào.
                </Text>
              }
            />
          )}
        </View>
        {orderBaseInfo?.status==="Đã giao"&&(
        <View
          style={[
            styles.reviewContainer, // <<< THAY ĐỔI: Sử dụng style mới để dễ quản lý hơn
            { marginTop: Display.setHeight(2) },
          ]}
        >
          <Text style={styles.listHeader}>Đánh giá:</Text>
          <Text style={styles.reviewContent}>
              {reviews[0]?.content || "Không có đánh giá"}
            </Text>
            {isReview&&(
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={()=>{
              setIsModalComplaint(true);
            }}>
              <Text style={styles.buttonText}>Báo cáo</Text>
             
            </TouchableOpacity>
          )}
        </View>
          )}
      </ScrollView>
      {isModalComplaint&&(
       <Modal
       transparent={true}
       animationType="fade"
       visible={isModalComplaint}
       onRequestClose={()=>{
        setIsModalComplaint(false);
       }} >
       <View style={styles.modalOverlay}>
         <View style={styles.modalContent}>
           <Text style={styles.modalTitle}>Báo cáo</Text>
           <TextInput
             style={styles.modalInput}
             placeholder="Nội dung báo cáo"
             value={complaint}
             onChangeText={setComplaint}
             autoCapitalize="sentences"
             placeholderTextColor={Colors.LIGHT_GREY2}
             editable={!isModalComplaintLoading} />
            {isModalComplaintLoading && <ActivityIndicator size="small" color={Colors.DEFAULT_GREEN} style={{marginTop: 5}}/>}
           <View style={styles.modalButtons}>
             <TouchableOpacity
               style={[ styles.modalButton, { backgroundColor: Colors.DEFAULT_YELLOW }, isModalComplaintLoading && styles.disabledButton ]}
               onPress={()=>{
                setIsModalComplaint(false);
               }}
               disabled={isModalComplaintLoading} >
               <Text style={styles.buttonText}>Hủy bỏ</Text>
             </TouchableOpacity>
             <TouchableOpacity
               style={[ styles.modalButton, { backgroundColor: Colors.DEFAULT_GREEN }, isModalComplaintLoading && styles.disabledButton ]}
               onPress={()=>{
                handleComplaint(reviews[0]?.id);
               }}
               disabled={isModalComplaintLoading} >
               <Text style={styles.buttonText}>Gửi</Text>
             </TouchableOpacity>
           </View>
         </View>
       </View>
     </Modal>
      )}
      {/* Phần nút bấm giữ nguyên, không cuộn */}
      {!isLoading && !error && orderBaseInfo?.status === "Chờ xác nhận" && (
        <View
          style={[
            styles.buttonContainer,
            { marginBottom: insets.bottom > 0 ? insets.bottom : Display.setHeight(2) },
          ]}
        >
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={async () => {
              await handleCancelOrder(orderId);
              await handleSendNotification({
                title: "Đơn hàng đã được hủy",
                content:
                  "Đơn hàng đã được hủy, chúng tôi xin lỗi vì sự bất tiện này",
                type: "push",
                userId: orderBaseInfo?.userId,
              });
              navigation.goBack();
            }}
          >
            <Text style={styles.buttonText}>Hủy đơn</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.confirmButton]}
            onPress={async () => {
              await handleConfirmOrder(orderId);
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
  // ... các styles khác giữ nguyên ...
  container: {
    flex: 1,
    paddingHorizontal: Display.setWidth(2.5),
    backgroundColor: "#fff",
    // <<< THAY ĐỔI: Xóa gap ở đây vì ScrollView sẽ quản lý khoảng cách
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Display.setWidth(5),
  },
  modalContent: {
    width: "90%",
    maxWidth: 500,
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: Display.setHeight(2.5),
    paddingHorizontal: Display.setWidth(5),
    gap: Display.setHeight(2),
    alignItems: 'center',
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: Colors.DEFAULT_GREEN,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.GRAY_BORDER || '#ccc',
    borderRadius: 5,
    paddingVertical: Display.setHeight(1.2),
    paddingHorizontal: Display.setWidth(2.5),
    fontSize: 16,
    color: Colors.DEFAULT_BLACK,
    width: '100%',
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Display.setWidth(2.5),
    marginTop: Display.setHeight(1),
    width: '100%',
  },
  modalButton: {
    paddingVertical: Display.setHeight(1.2),
    paddingHorizontal: Display.setWidth(5),
    borderRadius: 5,
    minWidth: Display.setWidth(20),
    alignItems: 'center',
  },
  header: {
    flex: 1, // <<< THAY ĐỔI: Cho phép text chiếm không gian còn lại để căn giữa
    textAlign: "center",
    color: Colors.DEFAULT_GREEN,
    fontWeight: "bold",
    fontSize: 24,
    // marginBottom đã bị xóa để căn chỉnh tốt hơn
    marginRight: 32, // <<< THAY ĐỔI: Bù lại không gian cho nút back để title vẫn ở giữa
  },
  headerContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Display.setHeight(1.2),
    backgroundColor: "#ffffff",
    marginTop: Display.setHeight(1),
  },
  backButton: {
    padding: 8,
  },
  orderInfoContainer: {
    paddingVertical: Display.setHeight(1.5),
    paddingHorizontal: Display.setWidth(4),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GREY2,
    gap: Display.setHeight(1),
    marginTop: Display.setHeight(1), // Thêm margin top để tạo khoảng cách với header
  },
  listContainer: {
    // flex: 1, // <<< THAY ĐỔI QUAN TRỌNG: Bỏ flex: 1
    borderWidth: 1,
    borderColor: Colors.LIGHT_GREY2,
    borderRadius: 8,
    marginTop: Display.setHeight(1), // Thêm margin top để tạo khoảng cách
  },
  listHeader: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 18,
    color: Colors.DEFAULT_BLACK,
    marginTop: Display.setHeight(2), // Tăng khoảng cách
  },
  // <<< THAY ĐỔI: Thêm style cho phần đánh giá
  reviewContainer: {
    paddingVertical: Display.setHeight(1.5),
    paddingHorizontal: Display.setWidth(4),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GREY2,
    gap: Display.setHeight(1),
  },
  reviewContent: {
    fontSize: 15,
    color: Colors.DEFAULT_BLACK,
    lineHeight: 22, // Giúp văn bản dài dễ đọc hơn
  },
  // ... các styles khác giữ nguyên ...
  labelText: {
    fontSize: 15,
    color: Colors.GRAY_DARK,
    marginBottom: 4,
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
  loadingIndicator: {
    marginVertical: Display.setHeight(10), // Thêm margin dọc
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: Display.setHeight(20), // Đảm bảo có chiều cao tối thiểu
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
    paddingVertical: Display.setHeight(5), // Dùng padding thay margin
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