import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator, // Thêm ActivityIndicator cho trạng thái loading khi lưu
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { Header } from "../../components";

// --- BẮT ĐẦU PHẦN BẠN SẼ TỰ TRIỂN KHAI API ---
// Giả lập hàm gọi API để lưu địa chỉ
// Bạn sẽ thay thế hàm này bằng logic gọi API thực tế của mình
const callApiToSaveAddress = async (addressData) => {
  console.log("Đang gọi API để lưu địa chỉ:", addressData);
  // addressData sẽ bao gồm:
  // {
  //   name: String,
  //   phone: String,
  //   address: String, // Địa chỉ dạng text
  //   latitude: Number,
  //   longitude: Number
  // }

  // Ví dụ:
  // const response = await fetch('YOUR_API_ENDPOINT/addresses', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     // 'Authorization': 'Bearer YOUR_AUTH_TOKEN', // Nếu cần xác thực
  //   },
  //   body: JSON.stringify(addressData),
  // });
  // if (!response.ok) {
  //   const errorData = await response.json();
  //   throw new Error(errorData.message || "Lỗi khi lưu địa chỉ từ server");
  // }
  // return await response.json(); // Hoặc response.text() tùy vào API của bạn

  // Giả lập độ trễ mạng
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Giả lập thành công
      resolve({
        success: true,
        message: "Địa chỉ đã được lưu thành công trên server.",
      });
      // Hoặc giả lập lỗi
      // reject(new Error("Lỗi giả lập từ server."));
    }, 1500);
  });
};
// --- KẾT THÚC PHẦN BẠN SẼ TỰ TRIỂN KHAI API ---

const AddAddressScreen = ({ navigation, route }) => {
  const [formData, setFormData] = useState({
    name: "", // Bỏ giá trị mặc định để người dùng tự nhập
    phone: "", // Bỏ giá trị mặc định
    address: "",
  });
  // selectedLocation sẽ lưu trữ { address: string, latitude: number, longitude: number }
  const [selectedLocationData, setSelectedLocationData] = useState(null);
  const [isSaving, setIsSaving] = useState(false); // State cho trạng thái loading khi lưu

  // Xử lý dữ liệu từ SelectAddressScreen
  useEffect(() => {
    // Đổi 'selectedLocation' thành 'pickedLocation' cho khớp với SelectAddressScreen
    if (route.params?.pickedLocation) {
      const location = route.params.pickedLocation;
      setSelectedLocationData(location); // Lưu toàn bộ object { address, latitude, longitude }
      setFormData((prev) => ({
        ...prev,
        address: location.address, // Chỉ cập nhật address vào formData
      }));
      // (Tùy chọn) Xóa param để không xử lý lại khi quay lại màn hình này
      // mà không chọn lại địa chỉ
      navigation.setParams({ pickedLocation: undefined });
    }
  }, [route.params?.pickedLocation, navigation]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectAddressOnMap = () => {
    navigation.navigate("SelectAddressScreen");
  };

  const handleSave = async () => {
    if (
      !formData.name.trim() ||
      !formData.phone.trim() ||
      !formData.address.trim() // Kiểm tra address từ formData (đã được set từ bản đồ)
    ) {
      Alert.alert(
        "Thông báo",
        "Vui lòng điền đầy đủ thông tin họ tên, số điện thoại và chọn địa chỉ."
      );
      return;
    }

    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})\b$/; // Regex chuẩn hơn cho SĐT Việt Nam
    if (!phoneRegex.test(formData.phone)) {
      Alert.alert(
        "Thông báo",
        "Số điện thoại không hợp lệ. Số điện thoại Việt Nam thường bắt đầu bằng 0 và có 10 chữ số."
      );
      return;
    }

    if (
      !selectedLocationData ||
      !selectedLocationData.latitude ||
      !selectedLocationData.longitude
    ) {
      Alert.alert("Thông báo", "Vui lòng chọn địa chỉ cụ thể trên bản đồ.");
      return;
    }

    setIsSaving(true);
    try {
      const addressPayload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: selectedLocationData.address, // Lấy địa chỉ từ selectedLocationData để đảm bảo là địa chỉ từ bản đồ
        latitude: selectedLocationData.latitude,
        longitude: selectedLocationData.longitude,
        // Bạn có thể thêm các trường khác nếu cần, ví dụ:
        // address_detail: "Tầng 5, tòa nhà ABC" // Nếu có ô nhập chi tiết địa chỉ
        // type: "Nhà riêng" / "Công ty" // Nếu có lựa chọn loại địa chỉ
      };

      // Gọi hàm API của bạn
      const apiResponse = await callApiToSaveAddress(addressPayload);

      // console.log("API Response:", apiResponse); // Log kết quả từ API (nếu có)

      Alert.alert("Thành công", "Lưu địa chỉ thành công!", [
        {
          text: "OK",
          onPress: () => {
            setFormData({ name: "", phone: "", address: "" });
            setSelectedLocationData(null);
            // TODO: Cân nhắc việc có nên goBack hay navigate đến một màn hình danh sách địa chỉ
            // Nếu goBack, người dùng có thể quay lại màn hình trước đó (ví dụ: Checkout)
            // với địa chỉ mới đã được chọn (cần cơ chế cập nhật lại)
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error("Lỗi khi lưu địa chỉ:", error);
      Alert.alert(
        "Lỗi",
        error.message || "Có lỗi xảy ra khi lưu địa chỉ. Vui lòng thử lại."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <Header
          title="Thêm địa chỉ mới"
          onBackPress={() => navigation.goBack()}
        />

        <View
          style={styles.content}
          keyboardShouldPersistTaps="handled" // Để đóng bàn phím khi chạm ra ngoài input
        >
          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Người liên hệ</Text>
            <View style={styles.inputContainer}>
              <Icon
                name="person-outline"
                size={20}
                color="#999"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Họ và tên"
                value={formData.name}
                onChangeText={(text) => handleInputChange("name", text)}
                placeholderTextColor="#999"
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Phone Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <View style={styles.inputContainer}>
              <Icon
                name="call-outline"
                size={20}
                color="#999"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Số điện thoại"
                value={formData.phone}
                onChangeText={(text) => handleInputChange("phone", text)}
                keyboardType="phone-pad"
                placeholderTextColor="#999"
                maxLength={10}
              />
            </View>
          </View>

          {/* Address Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa chỉ</Text>
            <TouchableOpacity
              style={styles.addressSelectionContainer}
              onPress={handleSelectAddressOnMap}
            >
              <View style={styles.addressRow}>
                <Icon
                  name="location-outline"
                  size={20}
                  color="#14b8a6"
                  style={styles.inputIcon}
                />
                <View style={styles.addressTextContainer}>
                  <Text
                    style={
                      formData.address
                        ? styles.addressText
                        : styles.addressPlaceholderText
                    }
                    numberOfLines={2}
                  >
                    {formData.address || "Chạm để chọn địa chỉ trên bản đồ"}
                  </Text>
                  {/* Không cần hiển thị selectedLocation.name vì formData.address đã đủ */}
                </View>
                <Icon name="chevron-forward" size={20} color="#999" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (isSaving || // Disable khi đang lưu
                !formData.name.trim() ||
                !formData.phone.trim() ||
                !formData.address.trim() ||
                !selectedLocationData) && // Disable nếu chưa chọn địa chỉ trên map
                styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={
              isSaving ||
              !formData.name.trim() ||
              !formData.phone.trim() ||
              !formData.address.trim() ||
              !selectedLocationData
            }
          >
            {isSaving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.saveButtonText}>Lưu địa chỉ</Text>
            )}
          </TouchableOpacity>
        </View>
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
    backgroundColor: "#f9fafb", // Màu nền chung
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb", // Màu border nhạt hơn
  },
  backButton: {
    padding: 8,
    marginRight: 12, // Tăng khoảng cách
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937", // Màu text đậm hơn
  },
  content: {
    flex: 1,
    marginTop: 30,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  inputGroup: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151", // Màu label
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8, // Bo góc ít hơn
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#d1d5db", // Border cho input
  },
  inputIcon: {
    marginRight: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    padding: 8,
  },
  addressSelectionContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addressTextContainer: {
    flex: 1,
    marginLeft: 10, // Khoảng cách từ icon tới text
  },
  addressText: {
    fontSize: 16,
    color: "#111827",
    lineHeight: 22, // Cải thiện đọc cho nhiều dòng
  },
  addressPlaceholderText: {
    fontSize: 16,
    color: "#9ca3af", // Màu placeholder
    lineHeight: 22,
  },
  // locationName: { // Không cần nữa vì formData.address đã đủ
  //   fontSize: 14,
  //   color: "#6b7280",
  //   marginTop: 4,
  // },
  buttonContainer: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  saveButton: {
    backgroundColor: "#14b8a6", // Màu teal quen thuộc
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48, // Chiều cao tối thiểu cho nút
  },
  saveButtonDisabled: {
    backgroundColor: "#9ca3af", // Màu xám khi disabled
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AddAddressScreen;
