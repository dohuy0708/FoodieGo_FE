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
} from "react-native";
import { Color } from "../../constants";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import Display from "../../utils/Display"; 

export default function EditDish({ navigation }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [name, setName] = useState(null);
  const [description, setDescription] = useState(null);
  const [price, setPrice] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [status, setStatus] = useState([
    { id: 1, name: "Đang bán" },
    { id: 2, name: "Ngừng bán" },
  ]);

  const formatPrice = (text) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    const formattedPrice = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setPrice(formattedPrice);
  };

  const selectImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Xin lỗi, chúng tôi cần quyền truy cập thư viện ảnh!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.log("ImagePicker Error: ", error);
      alert("Đã xảy ra lỗi khi chọn ảnh.");
    }
  };

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
          >
            <View style={styles.view_image}>
              <Image
                  source={
                      selectedImage
                          ? { uri: selectedImage.uri }
                          :{} 
                  }
                  style={styles.previewImage}
                  resizeMode={selectedImage ? "cover" : "center"} 
              />
              <TouchableOpacity
                style={[styles.button, styles.addImageButton]}
                onPress={selectImage}
              >
                <Text style={styles.buttonText}>
                  {selectedImage ? "Thay đổi ảnh" : "Thêm ảnh món ăn"}
                </Text>
              </TouchableOpacity>
            </View>

           
            <View style={styles.input_container}>
              <TextInput
                style={styles.input_text}
                placeholder="Tên món ăn"
                value={name}
                onChangeText={setName}
                placeholderTextColor={Color.LIGHT_GREY2}
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
              />
            </View>
            <View style={styles.input_container}>
              <TextInput
                style={styles.input_text}
                placeholder="Giá món ăn (VNĐ)"
                value={price}
                keyboardType="numeric"
                onChangeText={formatPrice}
                placeholderTextColor={Color.LIGHT_GREY2}
              />
            </View>
            <View style={styles.picker_container}>
              <Picker
                selectedValue={selectedStatus}
                onValueChange={(itemValue, itemIndex) => {
                    if (itemIndex !== 0) { 
                        setSelectedStatus(itemValue);
                    }
                }}
                style={styles.picker}
                enabled={true}
                mode="dropdown"
              >
                
                <Picker.Item label="-- Chọn tình trạng món ăn --" value={null} enabled={false} style={styles.pickerPlaceholder} />
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
          </ScrollView>

          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonText}>Hủy bỏ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.addButton]}
              onPress={() => {
               
                console.log({ name, description, price, selectedStatus, image: selectedImage?.uri });
                navigation.goBack();
              }}
            >
              <Text style={styles.buttonText}>Chỉnh sửa</Text>
            </TouchableOpacity>
          </View>
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
        justifyContent: 'space-between', 
    },
    scrollView: {
        flex: 1, 
    },
    scrollViewContent: {
        paddingHorizontal: Display.setWidth(4), 
        paddingVertical: Display.setHeight(2.5),
        gap: Display.setHeight(2.2), 
    },
    bottomButtonContainer: {
        flexDirection: "row",
        gap: Display.setWidth(3), 
        justifyContent: "flex-end",
        paddingVertical: Display.setHeight(1.8), 
        paddingHorizontal: Display.setWidth(4), 
        borderTopWidth: 1,
        borderTopColor: Color.LIGHT_GREY2,
        backgroundColor: Color.DEFAULT_WHITE, 
    },
    view_image: {
        position: "relative",
        width: "100%",
        aspectRatio: 16 / 9,
        borderWidth: 1,
        borderColor: Color.LIGHT_GREY2, 
        borderRadius: 10,
        backgroundColor: Color.LIGHT_GREY, 
        overflow: 'hidden', 
        alignItems: 'center', 
        justifyContent: 'center', 
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
        fontWeight: '500',
    },
    addImageButton: {
        position: "absolute",
        bottom: Display.setHeight(1.2), 
        right: Display.setWidth(2.5), 
        backgroundColor: 'rgba(0, 0, 0, 0.6)', 
        paddingHorizontal: Display.setWidth(3), 
        paddingVertical: Display.setHeight(1),
        height: 'auto', 
        minHeight: Display.setHeight(4.5), 
    },
    input_container: {
        width: "100%",
        borderWidth: 1,
        borderColor: Color.GRAY_BORDER,
        borderRadius: 10,
        paddingHorizontal: Display.setWidth(3),
        paddingVertical: Platform.OS === 'ios' ? Display.setHeight(1.2) : Display.setHeight(0.6), 
        backgroundColor: Color.DEFAULT_WHITE, 
    },
    input_text: {
        color: Color.SECONDARY_BLACK,
        fontSize: 16,
        paddingVertical: Platform.OS === 'ios' ? 0 : Display.setHeight(0.6), 
    },
    textAreaContainer: {
        paddingVertical: Display.setHeight(1.2), 
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
        justifyContent: 'center', 
    },
    picker: {
        width: "100%",
        height: Display.setHeight(6), 
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
});