import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { Color } from "../../constants";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
export default function EditDish({ navigation }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [name, setName] = useState(null);
  const [description, setDescription] = useState(null);
  const [price, setPrice] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [status, setStatus] = useState([
    {
      id: 1,
      name: "Đang bán",
    },
    {
      id: 2,
      name: "Ngừng bán",
    },
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

      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.log("ImagePicker Error: ", error);
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.view_image}>
        {selectedImage && (
          <Image
            source={{ uri: selectedImage.uri }}
            style={styles.previewImage}
          />
        )}
        <TouchableOpacity
          style={[styles.button, styles.addImageButton]}
          onPress={selectImage}
        >
          <Text style={{ color: "white", paddingHorizontal: 15 }}>
            Chỉnh sửa
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ width: "100%", paddingHorizontal: 20, gap: 20 }}>
        <View style={styles.input_container}>
          <TextInput
            style={styles.input_text}
            placeholder="Tên món ăn"
            value={name}
            onChangeText={(Text) => setName(Text)}
          ></TextInput>
        </View>
        <View style={styles.input_container}>
          <TextInput
            style={styles.input_text}
            placeholder="Mô tả món ăn"
            value={description}
            onChangeText={(Text) => setDescription(Text)}
            multiline={true}
            numberOfLines={4}
          ></TextInput>
        </View>
        <View style={styles.input_container}>
          <TextInput
            style={styles.input_text}
            placeholder="Giá món ăn"
            value={price}
            keyboardType="numeric"
            onChangeText={formatPrice}
          ></TextInput>
        </View>
        <View style={styles.picker_container}>
          <Picker
            selectedValue={selectedStatus}
            onValueChange={(itemValue) => setSelectedStatus(itemValue)}
            style={styles.picker}
            enabled={true}
          >
            <Picker.Item label="Tình trạng món ăn" value={null} />
            {status.map((status) => (
              <Picker.Item
                key={status.id}
                label={status.name}
                value={status.id}
              />
            ))}
          </Picker>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: Color.DEFAULT_YELLOW, paddingHorizontal: 30 },
          ]}
          onPress={() => navigation.navigate("HomeVendor")}
        >
          <Text style={{ color: "white" }}>Hủy bỏ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: Color.DEFAULT_GREEN }]}
        >
          <Text style={{ color: "white" }}>Chấp nhận</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#fff",
    gap: 30,
  },
  buttonContainer: {
    marginTop: 150,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "white",

    justifyContent: "flex-end",
  },
  view_image: {
    position: "relative",
    width: "100%",
    aspectRatio: 16 / 9,
    borderWidth: 1,
    borderColor: Color.GRAY_BORDER,
    borderRadius: 10,
    backgroundColor: Color.GRAY_BORDER,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Color.DEFAULT_YELLOW,
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  addImageButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  input_container: {
    width: "100%",
    alignItems: "left",
    borderWidth: 1,
    borderColor: Color.GRAY_BORDER,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  input_text: {
    color: Color.SECONDARY_BLACK,
  },
  picker_container: {
    width: "100%",
    borderWidth: 1,
    borderColor: Color.GRAY_BORDER,
    borderRadius: 10,
    overflow: "hidden",
  },

  picker: {
    width: "100%",

    color: Color.SECONDARY_BLACK,
  },
});
