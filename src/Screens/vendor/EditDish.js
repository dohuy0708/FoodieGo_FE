import React, { useState, useEffect } from "react";
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
import { Color } from "../../constants";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import Display from "../../utils/Display";
import { uploadImageToServer, updateMenu } from "../../services/vendorService";
import useSessionStore from "../../utils/store";

export default function EditDish({ navigation, route }) {
  const { dishData } = route.params;
  const categoriesFromStore = useSessionStore((state) => state.categories);

  const [category, setCategory] = useState(categoriesFromStore || []);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [status, setStatus] = useState([
    { id: "available", name: "Đang bán" },
    { id: "unavailable", name: "Tạm dừng bán" },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [imageChanged, setImageChanged] = useState(false);

  useEffect(() => {
    if (dishData) {
      setName(dishData.name);
      setDescription(dishData.description || "");
      setPrice(dishData.price.toLocaleString("de-DE"));
      setQuantity(dishData.quantity.toString());
      setSelectedCategoryId(dishData.categoryId);
      setSelectedStatus(dishData.available ? "available" : "unavailable");
      setSelectedImage({ uri: dishData.imageUrl });
      setImageChanged(false);
      setCategory(categoriesFromStore || []);
      setIsLoading(false);
    } else {
      Alert.alert("Lỗi", "Không có dữ liệu món ăn để chỉnh sửa.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    }
  }, [dishData, categoriesFromStore, navigation]);

  const formatPrice = (text) => {
    if (text === "") {
      setPrice("");
      return;
    }
    const numericValue = text.replace(/[^0-9]/g, "");
    const numberValue = parseInt(numericValue || "0", 10);

    if (isNaN(numberValue)) {
      setPrice("");
      return;
    }
    const formattedPrice = numberValue.toLocaleString("de-DE");
    setPrice(formattedPrice);
  };

  const handleQuantityChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, "");
     if (numericValue.length > 1 && numericValue.startsWith('0')) {
       setQuantity(parseInt(numericValue, 10).toString());
     } else {
       setQuantity(numericValue);
     }
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
        setImageChanged(true);
      }
    } catch (error) {
      console.log("ImagePicker Error: ", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi chọn ảnh.");
    }
  };

  const handleUpdateDish = async () => {
    Keyboard.dismiss();

    if (!name.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tên món ăn.");
      return;
    }
    const quantityValue = parseInt(quantity.trim() || "-1", 10);
    if (
      !quantity.trim() ||
      isNaN(quantityValue) ||
      quantityValue < 0
    ) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng nhập số lượng hợp lệ (là số >= 0)."
      );
      return;
    }

    const numericPriceString = price.replace(/\./g, "");
    const priceValue = parseInt(numericPriceString, 10);
    if (
      !numericPriceString ||
      isNaN(priceValue) ||
      priceValue <= 0
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
    if (!selectedImage || !selectedImage.uri) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn ảnh cho món ăn.");
      return;
    }
     if (!category || category.length === 0) {
       Alert.alert("Lỗi", "Không có danh mục nào để chọn.");
       return;
     }

    setIsSaving(true);
    let finalImageUrl = dishData.imageUrl;

    try {
      if (imageChanged) {
        console.log("Image changed, uploading new image...");
        if (!selectedImage.assetId) {
           throw new Error("Đối tượng ảnh không hợp lệ để tải lên.");
        }
        const uploadedUrl = await uploadImageToServer(selectedImage);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl.split(" ")[0];
          console.log("New image uploaded:", finalImageUrl);
        } else {
          throw new Error("Không thể tải ảnh mới lên. Vui lòng thử lại.");
        }
      } else {
         console.log("Image not changed, using old URL:", finalImageUrl);
      }

      const updateData = {
        id: dishData.id,
        name: name.trim(),
        description: description?.trim() || null,
        price: priceValue,
        quantity: quantityValue,
        imageUrl: finalImageUrl,
        available: selectedStatus,
        categoryId: selectedCategoryId,
      };

      console.log("Updating menu with data:", updateData);

      const updatedMenu = await updateMenu(updateData);

      if (updatedMenu) {
        console.log("Menu updated successfully:", updatedMenu);
        Alert.alert("Thành công", "Đã cập nhật món ăn thành công!", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
         throw new Error(
           "Không thể cập nhật món ăn. Vui lòng kiểm tra thông tin và thử lại."
         );
      }
    } catch (error) {
      console.error("Error during dish update:", error);
      Alert.alert("Lỗi", error.message || "Đã xảy ra lỗi khi cập nhật. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Color.DEFAULT_GREEN} />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }
  if (isSaving) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Color.DEFAULT_GREEN} />
        <Text style={styles.loadingText}>Đang lưu thay đổi...</Text>
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
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.view_image}>
              <Image
                source={selectedImage ? { uri: selectedImage.uri } : null}
                style={styles.previewImage}
                resizeMode={"cover"}
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
                <Text style={styles.buttonText}>Thay đổi ảnh</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.input_container}>
              <TextInput
                style={styles.input_text}
                placeholder="Tên món ăn (*)"
                value={name}
                onChangeText={setName}
                placeholderTextColor={Color.LIGHT_GREY2}
                editable={!isSaving}
              />
            </View>
            <View style={styles.input_container}>
              <TextInput
                style={styles.input_text}
                placeholder="Số lượng (*)"
                value={quantity}
                onChangeText={handleQuantityChange}
                keyboardType="numeric"
                placeholderTextColor={Color.LIGHT_GREY2}
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
                placeholderTextColor={Color.LIGHT_GREY2}
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
                placeholderTextColor={Color.LIGHT_GREY2}
                editable={!isSaving}
              />
            </View>

            <View style={styles.picker_container}>
              {(!category || category.length === 0) ? (
                <View style={[styles.picker, styles.pickerDisabled]}>
                  <Text style={styles.pickerPlaceholder}>
                    Không có danh mục để chọn
                  </Text>
                </View>
              ) : (
                <Picker
                  selectedValue={selectedCategoryId}
                  onValueChange={(itemValue) => {
                    if (itemValue !== null) setSelectedCategoryId(itemValue);
                  }}
                  style={styles.picker}
                  mode="dropdown"
                  enabled={!isSaving}
                >
                  <Picker.Item
                    label="-- Chọn danh mục (*) --"
                    value={null}
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
                  (isSaving || !category || category.length === 0) && styles.disabledButton,
                ]}
                onPress={handleUpdateDish}
                disabled={isSaving || !category || category.length === 0}
              >
                <Text style={styles.buttonText}>Lưu thay đổi</Text>
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
    backgroundColor: Color.DEFAULT_WHITE,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: Color.DEFAULT_WHITE,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Color.DEFAULT_WHITE,
  },
  scrollViewContent: {
    paddingHorizontal: Display.setWidth(4),
    paddingVertical: Display.setHeight(2.5),
    paddingBottom: Display.setHeight(5),
    gap: Display.setHeight(2.2),
    backgroundColor: Color.DEFAULT_WHITE,
    flexGrow: 1,
  },
  bottomButtonContainer: {
    flexDirection: "row",
    gap: Display.setWidth(3),
    justifyContent: "flex-end",
    paddingVertical: Display.setHeight(1.8),
    paddingHorizontal: Display.setWidth(4),
    backgroundColor: Color.DEFAULT_WHITE,
    
  },
  view_image: {
    position: "relative",
    width: "100%",
    aspectRatio: 8 / 7,
    borderWidth: 1,
    borderColor: Color.LIGHT_GREY2,
    borderRadius: 10,
    backgroundColor: Color.LIGHT_GREY,
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
    color: Color.DEFAULT_WHITE,
    fontSize: 16,
    fontWeight: "500",
  },
  addImageButton: {
    position: "absolute",
    bottom: Display.setHeight(1.2),
    right: Display.setWidth(2.5),
    backgroundColor: Color.DEFAULT_GREEN,
    opacity: 0.9,
    paddingHorizontal: Display.setWidth(3),
    paddingVertical: Display.setHeight(1),
    height: "auto",
    minHeight: Display.setHeight(4.5),
    borderRadius: 8,
  },
  input_container: {
    width: "100%",
    borderWidth: 1,
    borderColor: Color.GRAY_BORDER,
    borderRadius: 10,
    paddingHorizontal: Display.setWidth(3),
    paddingVertical:
      Platform.OS === "ios" ? Display.setHeight(1.2) : Display.setHeight(0.6),
    backgroundColor: Color.DEFAULT_WHITE,
    minHeight: Display.setHeight(6),
    justifyContent: "center",
  },
  input_text: {
    color: Color.SECONDARY_BLACK,
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
    borderColor: Color.GRAY_BORDER,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: Color.DEFAULT_WHITE,
    justifyContent: "center",
    minHeight: Display.setHeight(7),
  },
  pickerDisabled: {
    paddingHorizontal: Display.setWidth(3),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Color.LIGHT_GREY,
    minHeight: Display.setHeight(7),
  },
  picker: {
    width: "100%",
    height: Platform.OS === 'ios' ? undefined : Display.setHeight(7),
    color: Color.SECONDARY_BLACK,
    backgroundColor: 'transparent',
  },
  pickerPlaceholder: {
    color: Color.LIGHT_GREY2,
    fontSize: 16,
  },
  pickerItem: {
    fontSize: 16,
    color: Color.SECONDARY_BLACK,
  },
  cancelButton: {
    backgroundColor: Color.DEFAULT_YELLOW,
    paddingHorizontal: Display.setWidth(7),
  },
  addButton: {
    backgroundColor: Color.DEFAULT_GREEN,
    paddingHorizontal: Display.setWidth(7),
  },
  disabledButton: {
    backgroundColor: Color.LIGHT_GREY,
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Color.DEFAULT_WHITE,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    color: Color.SECONDARY_BLACK,
    fontWeight: "500",
  },
});