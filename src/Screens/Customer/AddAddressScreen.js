import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const AddAddressScreen = ({ navigation, route }) => {
  const [formData, setFormData] = useState({
    name: "Hoàng Huy",
    phone: "0365553121",
    address: "",
  });
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Handle data from SelectAddressScreen
  useEffect(() => {
    if (route?.params?.selectedLocation) {
      const location = route.params.selectedLocation;
      setSelectedLocation(location);
      setFormData((prev) => ({
        ...prev,
        address: location.address,
      }));
    }
  }, [route?.params?.selectedLocation]);

  const handleSelectAddress = () => {
    navigation.navigate("SelectAddressScreen");
  };

  const handleSave = async () => {
    if (
      !formData.name.trim() ||
      !formData.phone.trim() ||
      !formData.address.trim()
    ) {
      Alert.alert("Thông báo", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.phone)) {
      Alert.alert("Thông báo", "Số điện thoại không hợp lệ");
      return;
    }

    try {
      // TODO: Call your API here
      console.log("Saving address:", {
        ...formData,
        location: selectedLocation,
      });

      Alert.alert("Thành công", "Lưu địa chỉ thành công!", [
        {
          text: "OK",
          onPress: () => {
            setFormData({ name: "", phone: "", address: "" });
            setSelectedLocation(null);
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra khi lưu địa chỉ");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm địa chỉ mới</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Name Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <View style={styles.iconPlaceholder} />
            <TextInput
              style={styles.textInput}
              placeholder="Họ và tên"
              value={formData.name}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, name: text }))
              }
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Phone Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <View style={styles.phoneIconPlaceholder} />
            <TextInput
              style={styles.textInput}
              placeholder="Số điện thoại"
              value={formData.phone}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, phone: text }))
              }
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Address Selection */}
        <TouchableOpacity
          style={styles.addressContainer}
          onPress={handleSelectAddress}
        >
          <View style={styles.addressRow}>
            <View style={styles.addressLeft}>
              <Icon name="location-outline" size={20} color="#999" />
              <View style={styles.addressTextContainer}>
                <Text style={styles.addressText}>
                  {formData.address || "Chọn địa chỉ"}
                </Text>
                {selectedLocation && (
                  <Text style={styles.locationName}>
                    {selectedLocation.name}
                  </Text>
                )}
              </View>
            </View>
            <Icon name="chevron-forward" size={16} color="#999" />
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!formData.name.trim() ||
              !formData.phone.trim() ||
              !formData.address.trim()) &&
              styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={
            !formData.name.trim() ||
            !formData.phone.trim() ||
            !formData.address.trim()
          }
        >
          <Text style={styles.saveButtonText}>Lưu</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const SelectAddressScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelectLocation = (location) => {
    navigation.navigate("AddAddressScreen", { selectedLocation: location });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn địa chỉ</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm vị trí"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mapCenter}>
          <View style={styles.mapPin}>
            <Icon name="location" size={24} color="#14b8a6" />
          </View>
        </View>

        <TouchableOpacity style={styles.navigationButton}>
          <Icon name="navigate" size={16} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Simple Address List */}
      <View style={styles.listContainer}>
        <ScrollView>
          <View style={styles.listContent}>
            <Text style={styles.suggestionTitle}>Địa chỉ gợi ý</Text>

            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() =>
                handleSelectLocation({
                  id: 1,
                  name: "Chung cư C7 Man Thiện",
                  address: "Đường Man Thiện, Phường Tân Phú, Quận 9, TP. HCM",
                })
              }
            >
              <View style={styles.suggestionRow}>
                <Icon name="location-outline" size={16} color="#999" />
                <View style={styles.suggestionTextContainer}>
                  <Text style={styles.suggestionName}>
                    Chung cư C7 Man Thiện
                  </Text>
                  <Text style={styles.suggestionAddress}>
                    Đường Man Thiện, Phường Tân Phú, Quận 9, TP. HCM
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() =>
                handleSelectLocation({
                  id: 2,
                  name: "SCS Building",
                  address:
                    "Lô T2-4 đường D1, Khu Công Nghệ Cao, Phường Tân Phú, Quận 9, TP. HCM",
                })
              }
            >
              <View style={styles.suggestionRow}>
                <Icon name="location-outline" size={16} color="#999" />
                <View style={styles.suggestionTextContainer}>
                  <Text style={styles.suggestionName}>SCS Building</Text>
                  <Text style={styles.suggestionAddress}>
                    Lô T2-4 đường D1, Khu Công Nghệ Cao, Phường Tân Phú, Quận 9,
                    TP. HCM
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  inputContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconPlaceholder: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#9ca3af",
    marginRight: 12,
  },
  phoneIconPlaceholder: {
    width: 16,
    height: 12,
    borderRadius: 3,
    backgroundColor: "#9ca3af",
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    padding: 0,
  },
  addressContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addressLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  addressTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  addressText: {
    fontSize: 16,
    color: "#111827",
  },
  locationName: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  saveButton: {
    backgroundColor: "#14b8a6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#d1d5db",
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    padding: 0,
  },
  mapContainer: {
    height: 200,
    backgroundColor: "#dbeafe",
    position: "relative",
  },
  mapCenter: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  mapPin: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 20,
    elevation: 4,
  },
  navigationButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#ffffff",
    padding: 8,
    borderRadius: 20,
    elevation: 4,
  },
  listContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  listContent: {
    padding: 16,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    marginBottom: 12,
  },
  suggestionItem: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    marginBottom: 8,
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  suggestionTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  suggestionAddress: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
});

export default AddAddressScreen;
export { SelectAddressScreen };
