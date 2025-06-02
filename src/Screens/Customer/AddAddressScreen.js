import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView, // Đổi View thành ScrollView cho content
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform, // Thêm Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { Header } from "../../components"; // Giả sử bạn có component Header
import { Picker } from "@react-native-picker/picker"; // Import Picker

// --- API Hành chính ---
const API_BASE_URL = "https://provinces.open-api.vn/api";

const fetchProvinces = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/p/`);
    if (!response.ok) throw new Error("Lỗi tải danh sách tỉnh/thành phố");
    return await response.json();
  } catch (error) {
    console.error(error);
    Alert.alert("Lỗi", "Không thể tải danh sách tỉnh/thành phố.");
    return [];
  }
};

const fetchDistricts = async (provinceCode) => {
  if (!provinceCode) return [];
  try {
    const response = await fetch(`${API_BASE_URL}/p/${provinceCode}?depth=2`);
    if (!response.ok) throw new Error("Lỗi tải danh sách quận/huyện");
    const data = await response.json();
    return data.districts || [];
  } catch (error) {
    console.error(error);
    Alert.alert("Lỗi", "Không thể tải danh sách quận/huyện.");
    return [];
  }
};

const fetchWards = async (districtCode) => {
  if (!districtCode) return [];
  try {
    const response = await fetch(`${API_BASE_URL}/d/${districtCode}?depth=2`);
    if (!response.ok) throw new Error("Lỗi tải danh sách phường/xã");
    const data = await response.json();
    return data.wards || [];
  } catch (error) {
    console.error(error);
    Alert.alert("Lỗi", "Không thể tải danh sách phường/xã.");
    return [];
  }
};
// --- Kết thúc API Hành chính ---

// --- API Lưu địa chỉ (giữ nguyên) ---
const callApiToSaveAddress = async (addressData) => {
  console.log("Đang gọi API để lưu địa chỉ:", addressData);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "Địa chỉ đã được lưu thành công trên server.",
      });
    }, 1500);
  });
};
// --- Kết thúc API Lưu địa chỉ ---

const AddAddressScreen = ({ navigation, route }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    street: "", // Thêm trường số nhà, tên đường
  });
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  // Tải danh sách tỉnh/thành phố khi component mount
  useEffect(() => {
    const loadProvinces = async () => {
      setIsLoadingProvinces(true);
      const data = await fetchProvinces();
      setProvinces(data);
      setIsLoadingProvinces(false);
    };
    loadProvinces();
  }, []);

  // Tải danh sách quận/huyện khi tỉnh được chọn
  useEffect(() => {
    if (selectedProvince) {
      const loadDistricts = async () => {
        setIsLoadingDistricts(true);
        setDistricts([]); // Reset
        setWards([]); // Reset
        setSelectedDistrict(null);
        setSelectedWard(null);
        const data = await fetchDistricts(selectedProvince.code);
        setDistricts(data);
        setIsLoadingDistricts(false);
      };
      loadDistricts();
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [selectedProvince]);

  // Tải danh sách phường/xã khi quận/huyện được chọn
  useEffect(() => {
    if (selectedDistrict) {
      const loadWards = async () => {
        setIsLoadingWards(true);
        setWards([]); // Reset
        setSelectedWard(null);
        const data = await fetchWards(selectedDistrict.code);
        setWards(data);
        setIsLoadingWards(false);
      };
      loadWards();
    } else {
      setWards([]);
    }
  }, [selectedDistrict]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (
      !formData.name.trim() ||
      !formData.phone.trim() ||
      !selectedProvince ||
      !selectedDistrict ||
      !selectedWard ||
      !formData.street.trim()
    ) {
      Alert.alert("Thông báo", "Vui lòng điền đầy đủ thông tin địa chỉ.");
      return;
    }

    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})\b$/;
    if (!phoneRegex.test(formData.phone)) {
      Alert.alert("Thông báo", "Số điện thoại không hợp lệ.");
      return;
    }

    setIsSaving(true);
    try {
      const fullAddress = `${formData.street.trim()}, ${selectedWard.name}, ${
        selectedDistrict.name
      }, ${selectedProvince.name}`;
      const addressPayload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: fullAddress,
        street: formData.street.trim(),
        ward: selectedWard.name,
        ward_code: selectedWard.code,
        district: selectedDistrict.name,
        district_code: selectedDistrict.code,
        province: selectedProvince.name,
        province_code: selectedProvince.code,
        // Bạn có thể không cần gửi latitude/longitude nếu chỉ dùng địa chỉ dạng text
        // Hoặc bạn có thể dùng Geocoding API để lấy tọa độ từ `fullAddress` nếu cần
      };

      await callApiToSaveAddress(addressPayload);

      Alert.alert("Thành công", "Lưu địa chỉ thành công!", [
        {
          text: "OK",
          onPress: () => {
            setFormData({ name: "", phone: "", street: "" });
            setSelectedProvince(null);
            setSelectedDistrict(null);
            setSelectedWard(null);
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error("Lỗi khi lưu địa chỉ:", error);
      Alert.alert("Lỗi", error.message || "Có lỗi xảy ra khi lưu địa chỉ.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderPickerItem = (label, value) => (
    <Picker.Item
      key={value || "placeholder"}
      label={label}
      value={value}
      style={styles.pickerItem}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <Header
          title="Thêm địa chỉ mới"
          onBackPress={() => navigation.goBack()}
        />

        <ScrollView
          style={styles.contentContainer} // Đổi tên để tránh nhầm với styles.content của input
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Người liên hệ</Text>
            <View style={styles.inputWrapper}>
              <Icon
                name="person-outline"
                size={20}
                color="#888"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Họ và tên"
                value={formData.name}
                onChangeText={(text) => handleInputChange("name", text)}
                placeholderTextColor="#aaa"
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Phone Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <View style={styles.inputWrapper}>
              <Icon
                name="call-outline"
                size={20}
                color="#888"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Số điện thoại"
                value={formData.phone}
                onChangeText={(text) => handleInputChange("phone", text)}
                keyboardType="phone-pad"
                placeholderTextColor="#aaa"
                maxLength={10}
              />
            </View>
          </View>

          {/* Province Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tỉnh/Thành phố</Text>
            <View style={styles.pickerContainer}>
              {isLoadingProvinces ? (
                <ActivityIndicator style={styles.pickerLoading} />
              ) : (
                <Picker
                  selectedValue={selectedProvince}
                  onValueChange={(itemValue) => setSelectedProvince(itemValue)}
                  style={styles.picker}
                  prompt="Chọn Tỉnh/Thành phố"
                >
                  {renderPickerItem("Chọn Tỉnh/Thành phố...", null)}
                  {provinces.map((p) => renderPickerItem(p.name, p))}
                </Picker>
              )}
            </View>
          </View>

          {/* District Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Quận/Huyện</Text>
            <View style={styles.pickerContainer}>
              {isLoadingDistricts ? (
                <ActivityIndicator style={styles.pickerLoading} />
              ) : (
                <Picker
                  selectedValue={selectedDistrict}
                  onValueChange={(itemValue) => setSelectedDistrict(itemValue)}
                  enabled={!!selectedProvince && districts.length > 0}
                  style={styles.picker}
                  prompt="Chọn Quận/Huyện"
                >
                  {renderPickerItem("Chọn Quận/Huyện...", null)}
                  {districts.map((d) => renderPickerItem(d.name, d))}
                </Picker>
              )}
            </View>
          </View>

          {/* Ward Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phường/Xã</Text>
            <View style={styles.pickerContainer}>
              {isLoadingWards ? (
                <ActivityIndicator style={styles.pickerLoading} />
              ) : (
                <Picker
                  selectedValue={selectedWard}
                  onValueChange={(itemValue) => setSelectedWard(itemValue)}
                  enabled={!!selectedDistrict && wards.length > 0}
                  style={styles.picker}
                  prompt="Chọn Phường/Xã"
                >
                  {renderPickerItem("Chọn Phường/Xã...", null)}
                  {wards.map((w) => renderPickerItem(w.name, w))}
                </Picker>
              )}
            </View>
          </View>

          {/* Street Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số nhà, tên đường</Text>
            <View style={styles.inputWrapper}>
              <Icon
                name="home-outline"
                size={20}
                color="#888"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Ví dụ: 123 Nguyễn Văn Cừ"
                value={formData.street}
                onChangeText={(text) => handleInputChange("street", text)}
                placeholderTextColor="#aaa"
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (isSaving ||
                !formData.name.trim() ||
                !formData.phone.trim() ||
                !selectedProvince ||
                !selectedDistrict ||
                !selectedWard ||
                !formData.street.trim()) &&
                styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={
              isSaving ||
              !formData.name.trim() ||
              !formData.phone.trim() ||
              !selectedProvince ||
              !selectedDistrict ||
              !selectedWard ||
              !formData.street.trim()
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
    backgroundColor: "#f9fafb",
  },
  // Header styles sẽ do component Header của bạn quản lý
  contentContainer: {
    // Style cho ScrollView
    marginTop: 64,
    flex: 1,
    paddingHorizontal: 5, // Giảm padding ngang một chút
  },
  inputGroup: {
    marginHorizontal: 16,
    marginBottom: 18, // Tăng khoảng cách giữa các group
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4A5568", // Màu xám đậm hơn cho label
    marginBottom: 6,
  },
  inputWrapper: {
    // Đổi tên từ inputContainer để tránh nhầm với container của Picker
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0", // Màu border nhạt hơn
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#2D3748", // Màu text đậm hơn
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    height: 56, // Chiều cao cố định
    justifyContent: "center", // Căn giữa Picker
  },
  picker: {
    width: "100%",
    height: "100%",
    color: "#2D3748",
  },
  pickerItem: {
    fontSize: 16,
  },
  pickerLoading: {
    alignSelf: "center",
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: "#fff", // Nền trắng cho button container
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingBottom: Platform.OS === "ios" ? 24 : 16, // Thêm padding dưới cho iOS
  },
  saveButton: {
    backgroundColor: "#14b8a6",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  saveButtonDisabled: {
    backgroundColor: "#A0AEC0", // Màu xám nhạt hơn khi disabled
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AddAddressScreen;
