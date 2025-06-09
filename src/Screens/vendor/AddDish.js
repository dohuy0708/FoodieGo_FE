import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ActivityIndicator,
} from "react-native";
import  Colors  from "../../constants/Colors";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import Display from "../../utils/Display";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { uploadImageToServer, createMenu } from "../../services/vendorService";
import Icon from "react-native-vector-icons/Ionicons";
export default function AddDish({ navigation, route }) {
  const initialCategory =
    route?.params?.category && Array.isArray(route.params.category)
      ? route.params.category
      : [];
  const [category, setCategory] = useState(initialCategory);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const insets = useSafeAreaInsets();
  const [selectedImage, setSelectedImage] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [status, setStatus] = useState([
    { id: "available", name: "Đang bán" },
    { id: "unavailable", name: "Ngừng bán" },
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const formatPrice = (text) => {
    if (text === "") {
      setPrice("");
      return;
    }
    const numericValue = text.replace(/[^0-9]/g, "");
    const numberValue = parseInt(numericValue, 10);
    if (isNaN(numberValue)) {
      setPrice("");
      return;
    }
    const formattedPrice = numberValue.toLocaleString("de-DE");
    setPrice(formattedPrice);
  };

  const handleQuantityChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    setQuantity(numericValue);
  };

  const selectImage = async () => {
    if (isSaving) return;
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert(
          "Cần quyền truy cập",
          "Bạn cần cấp quyền truy cập thư viện ảnh để chọn ảnh món ăn."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [8, 7],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.log("ImagePicker Error: ", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi chọn ảnh.");
    }
  };

  const handleCreateDish = async () => {
    Keyboard.dismiss();

    if (!name.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tên món ăn.");
      return;
    }
    if (
      !quantity.trim() ||
      isNaN(parseInt(quantity)) ||
      parseInt(quantity) < 0
    ) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng nhập số lượng hợp lệ (là số >= 0)."
      );
      return;
    }
    const numericPriceString = price.replace(/\./g, "");
    if (
      !numericPriceString ||
      isNaN(parseInt(numericPriceString)) ||
      parseInt(numericPriceString) <= 0
    ) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng nhập giá món ăn hợp lệ (lớn hơn 0)."
      );
      return;
    }
    if (selectedCategoryId === null) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn danh mục cho món ăn.");
      return;
    }
    if (!selectedStatus) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn tình trạng món ăn.");
      return;
    }
    if (!selectedImage) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn ảnh cho món ăn.");
      return;
    }
    if (category.length === 0) {
      Alert.alert("Lỗi", "Không có danh mục nào để chọn.");
      return;
    }

    setIsSaving(true);
    let imageUrl = null;

    try {
      console.log("Uploading image...");
      const uploadedUrl = await uploadImageToServer(selectedImage);
      if (uploadedUrl) {
        imageUrl = uploadedUrl.split(" ")[0];
        console.log("Image uploaded:", imageUrl);
      } else {
        throw new Error("Không thể tải ảnh lên. Vui lòng thử lại.");
      }

      const menuData = {
        name: name.trim(),
        description: description?.trim() || null,
        price: parseInt(numericPriceString, 10),
        quantity: parseInt(quantity.trim(), 10),
        imageUrl: imageUrl,
        available: selectedStatus,
        categoryId: selectedCategoryId,
        quantity: parseInt(quantity.trim(), 10),
      };

      console.log("Creating menu with data:", menuData);

      const createdMenu = await createMenu(menuData);

      if (createdMenu) {
        console.log("Menu created successfully:", createdMenu);
        Alert.alert("Thành công", "Đã thêm món ăn mới thành công!", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        throw new Error(
          "Không thể tạo món ăn. Vui lòng kiểm tra thông tin và thử lại."
        );
      }
    } catch (error) {
      console.error("Error during dish creation:", error);
      Alert.alert("Lỗi", error.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };
  if (isSaving) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.DEFAULT_GREEN} />
        <Text style={styles.loadingText}>Đang thêm món ăn...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingContainer}
    >
      <TouchableWithoutFeedback style={{ flex: 1 }} onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
        <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.header}>Thêm món ăn</Text>
      </View>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
             
            <View style={styles.view_image}>
              <Image
                source={selectedImage ? { uri: selectedImage.uri } : {}}
                style={styles.previewImage}
                resizeMode={selectedImage ? "cover" : "contain"}
              />
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.addImageButton,
                  isSaving && styles.disabledButton,
                ]}
                onPress={selectImage}
                disabled={isSaving}
              >
                <Text style={styles.buttonText}>
                  {selectedImage ? "Thay đổi ảnh" : "Thêm ảnh món ăn (*)"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.input_container}>
              <TextInput
                style={styles.input_text}
                placeholder="Tên món ăn (*)"
                value={name}
                onChangeText={setName}
                placeholderTextColor={Colors.LIGHT_GREY2}
                editable={!isSaving}
              />
            </View>
            <View style={styles.input_container}>
              <TextInput
                style={styles.input_text}
                placeholder="Số lượng ban đầu (*)"
                value={quantity}
                onChangeText={handleQuantityChange}
                keyboardType="numeric"
                placeholderTextColor={Colors.LIGHT_GREY2}
                editable={!isSaving}
              />
            </View>
            <View style={[styles.input_container, styles.textAreaContainer]}>
              <TextInput
                style={[styles.input_text, styles.textArea]}
                placeholder="Mô tả món ăn"
                value={description}
                onChangeText={setDescription}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor={Colors.LIGHT_GREY2}
                editable={!isSaving}
              />
            </View>
            <View style={styles.input_container}>
              <TextInput
                style={styles.input_text}
                placeholder="Giá món ăn (VNĐ) (*)"
                value={price}
                keyboardType="numeric"
                onChangeText={formatPrice}
                placeholderTextColor={Colors.LIGHT_GREY2}
                editable={!isSaving}
              />
            </View>
            <View style={styles.picker_container}>
              {category.length === 0 ? (
                <View style={[styles.picker, styles.pickerDisabled]}>
                  <Text style={styles.pickerPlaceholder}>
                    Không có danh mục để chọn
                  </Text>
                </View>
              ) : (
                <Picker
                  selectedValue={selectedCategoryId}
                  onValueChange={(itemValue) =>
                    setSelectedCategoryId(itemValue)
                  }
                  style={styles.picker}
                  mode="dropdown"
                  enabled={!isSaving}
                >
                  <Picker.Item
                    label="-- Chọn danh mục (*) --"
                    value={null}
                    enabled={false}
                    style={styles.pickerPlaceholder}
                  />
                  {category
                    .filter((item) => item.isActive === "accepted")
                    .map((item) => (
                      <Picker.Item
                        key={item.id}
                        label={item.name}
                        value={item.id}
                        style={styles.pickerItem}
                      />
                    ))}
                </Picker>
              )}
            </View>
            <View style={styles.picker_container}>
              <Picker
                selectedValue={selectedStatus}
                onValueChange={(itemValue) => {
                  if (itemValue !== null) setSelectedStatus(itemValue);
                }}
                style={styles.picker}
                enabled={!isSaving}
                mode="dropdown"
              >
                <Picker.Item
                  label="-- Chọn tình trạng món ăn (*) --"
                  value={null}
                  enabled={false}
                  style={styles.pickerPlaceholder}
                />
                {status.map((s) => (
                  <Picker.Item
                    key={s.id}
                    label={s.name}
                    value={s.id}
                    style={styles.pickerItem}
                  />
                ))}
              </Picker>
            </View>
            <View style={styles.bottomButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.cancelButton,
                  isSaving && styles.disabledButton,
                ]}
                onPress={() => navigation.goBack()}
                disabled={isSaving}
              >
                <Text style={styles.buttonText}>Hủy bỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.addButton,
                  isSaving && styles.disabledButton,
                ]}
                onPress={handleCreateDish}
                disabled={isSaving || category.length === 0}
              >
                <Text style={styles.buttonText}>Thêm món</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
 
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: Colors.DEFAULT_WHITE,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: Colors.DEFAULT_WHITE,
    
  },
  scrollView: {
    flex: 1,
     backgroundColor: Colors.DEFAULT_WHITE,
  },
  scrollViewContent: {
    paddingHorizontal: Display.setWidth(4),
    paddingVertical: Display.setHeight(2.5),
    paddingBottom: Display.setHeight(5),
    gap: Display.setHeight(2.2),
     backgroundColor: Colors.DEFAULT_WHITE,
  },
  bottomButtonContainer: {
    flexDirection: "row",
    gap: Display.setWidth(3),
    justifyContent: "flex-end",
    paddingVertical: Display.setHeight(1.8),
    paddingHorizontal: Display.setWidth(4),

    backgroundColor: Colors.DEFAULT_WHITE,
  },
  view_image: {
    position: "relative",
    width: "100%",
    aspectRatio: 8 / 7,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GREY2,
    borderRadius: 10,
    backgroundColor: Colors.LIGHT_GREY,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  button: {
    paddingHorizontal: Display.setWidth(5),
    paddingVertical: Display.setHeight(1.2),
    height: Display.setHeight(6),
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: Colors.DEFAULT_WHITE,
    fontSize: 16,
    fontWeight: "500",
  },
  addImageButton: {
    position: "absolute",
    bottom: Display.setHeight(1.2),
    right: Display.setWidth(2.5),
    backgroundColor: Colors.DEFAULT_GREEN,
    paddingHorizontal: Display.setWidth(3),
    paddingVertical: Display.setHeight(1),
    height: "auto",
    minHeight: Display.setHeight(4.5),
    borderRadius: 8,
  },
  input_container: {
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.GRAY_BORDER,
    borderRadius: 10,
    paddingHorizontal: Display.setWidth(3),
    paddingVertical:
      Platform.OS === "ios" ? Display.setHeight(1.2) : Display.setHeight(0.6),
    backgroundColor: Colors.DEFAULT_WHITE,
    minHeight: Display.setHeight(6),
    justifyContent: "center",
  },
  input_text: {
    color: Colors.SECONDARY_BLACK,
    fontSize: 16,
    paddingVertical: Platform.OS === "ios" ? 0 : Display.setHeight(0.6),
  },
  textAreaContainer: {
    paddingVertical: Display.setHeight(1.2),
    minHeight: Display.setHeight(12),
    justifyContent: "flex-start",
  },
  textArea: {
    height: Display.setHeight(12),
    textAlignVertical: "top",
    paddingVertical: 0,
  },
  picker_container: {
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.GRAY_BORDER,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: Colors.DEFAULT_WHITE,
    justifyContent: "center",
    minHeight: Display.setHeight(7),
  },
  pickerDisabled: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.LIGHT_GREY,
  },
  picker: {
    width: "100%",
    height: Display.setHeight(7),
    color: Colors.SECONDARY_BLACK,
    backgroundColor: "transparent",
  },
  pickerPlaceholder: {
    color: Colors.LIGHT_GREY2,
    fontSize: 16,
  },
  pickerItem: {
    fontSize: 16,
    color: Colors.LIGHT_GREY2,
  },
  cancelButton: {
    backgroundColor: Colors.DEFAULT_YELLOW,
    paddingHorizontal: Display.setWidth(7),
  },
  addButton: {
    backgroundColor: Colors.DEFAULT_GREEN,
    paddingHorizontal: Display.setWidth(7),
  },
  disabledButton: {
    backgroundColor: Colors.LIGHT_GREY2,
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: Colors.DEFAULT_WHITE, 
  },
  loadingText: {
    marginTop: 15, 
    fontSize: 18, 
    color: Colors.SECONDARY_BLACK, 
    fontWeight: '500',
  },
  headerContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
   justifyContent: "flex-start",
    paddingVertical: Display.setHeight(1.2),
    backgroundColor: "#ffffff",
    
  },
  backButton: { padding: 8 },
  header: {
    textAlign: "center",
    color: Colors.DEFAULT_GREEN,
    fontWeight: "bold",
    fontSize: 25,
   
    marginBottom: Display.setHeight(1.5),
  },
});
