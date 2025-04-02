import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Color } from "../../constants";
import React, { useState, useEffect } from "react";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from 'expo-image-picker';
import {
  getProvinces,
  getDistrictsByProvinceCode,
  getWardsByDistrictCode,
} from "../../services/locationService";
export default function Register() {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const selectImage = async () => {
    try {
      // Xin quyền truy cập thư viện ảnh
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Xin lỗi, chúng tôi cần quyền truy cập thư viện ảnh!');
        return;
      }
  
      // Mở thư viện ảnh
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
      console.log('ImagePicker Error: ', error);
    }
  };
  useEffect(() => {
    const fetchProvinces = async () => {
      const data = await getProvinces();
      setProvinces(data);
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (selectedProvince) {
        const data = await getDistrictsByProvinceCode(selectedProvince.code);
        setDistricts(data);
        setSelectedDistrict(null);
        setWards([]);
      }
    };
    fetchDistricts();
  }, [selectedProvince]);

  useEffect(() => {
    const fetchWards = async () => {
      if (selectedDistrict) {
        const data = await getWardsByDistrictCode(selectedDistrict.code);
        setWards(data);
        setSelectedWard(null);
      }
    };
    fetchWards();
  }, [selectedDistrict]);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <Text style={styles.header}>Đăng ký nhà hàng</Text>
          <Text style={styles.input_text}>
            (*) Vui lòng nhập thông tin chính xác
          </Text>
          <View style={styles.input_container}>
            <TextInput
              style={styles.input_text}
              placeholder="Tên Nhà Hàng/Quán ăn"
            ></TextInput>
          </View>
          <View style={styles.input_container}>
            <TextInput
              style={styles.input_text}
              placeholder="Mô tả Nhà Hàng/Quán ăn"
              multiline={true}
              numberOfLines={4}
            ></TextInput>
          </View>
          <View style={styles.picker_container}>
            <Picker
              selectedValue={selectedProvince}
              onValueChange={(itemValue) => setSelectedProvince(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Chọn tỉnh/thành phố" value={null} />
              {provinces.map((province) => (
                <Picker.Item
                  key={province.code}
                  label={province.name}
                  value={province}
                />
              ))}
            </Picker>
          </View>

          <View style={styles.picker_container}>
            <Picker
              selectedValue={selectedDistrict}
              onValueChange={(itemValue) => setSelectedDistrict(itemValue)}
              style={styles.picker}
              enabled={!!selectedProvince}
            >
              <Picker.Item label="Chọn quận/huyện" value={null} />
              {districts.map((district) => (
                <Picker.Item
                  key={district.code}
                  label={district.name}
                  value={district}
                />
              ))}
            </Picker>
          </View>

          <View style={styles.picker_container}>
            <Picker
              selectedValue={selectedWard}
              onValueChange={(itemValue) => setSelectedWard(itemValue)}
              style={styles.picker}
              enabled={!!selectedDistrict}
            >
              <Picker.Item label="Chọn phường/xã" value={null} />
              {wards.map((ward) => (
                <Picker.Item key={ward.code} label={ward.name} value={ward} />
              ))}
            </Picker>
          </View>
          <View style={styles.input_container}>
            <View style={styles.input_time_container}>
              <Text>Giờ mở cửa</Text>
              <TextInput
                style={styles.input_time}
                keyboardType="numeric"
                maxLength={2}
              ></TextInput>
              <Text>giờ</Text>
              <TextInput
                style={styles.input_time}
                keyboardType="numeric"
                maxLength={2}
              ></TextInput>
              <Text>phút</Text>
            </View>
          </View>
          <View style={styles.input_container}>
            <View style={styles.input_time_container}>
              <Text>Giờ đóng cửa</Text>
              <TextInput
                style={styles.input_time}
                keyboardType="numeric"
                maxLength={2}
              ></TextInput>
              <Text>giờ</Text>
              <TextInput
                style={styles.input_time}
                keyboardType="numeric"
                maxLength={2}
              ></TextInput>
              <Text>phút</Text>
            </View>
          </View>
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
              <Text style={{ color: "white" }}>{selectImage?"Thay đổi ảnh":"Thêm ảnh bìa"}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, { marginTop: 10, width: "100%" }]}
          >
            <Text style={{ color: "white" }}>Đăng ký</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 30,
    flex: 1,
    width: "100%",
    backgroundColor: "#fff",
    alignItems: "center",
    gap: 20,
  },
  header: {
    textAlign: "center",

    alignItems: "center",
    color: Color.DEFAULT_GREEN,
    fontWeight: "bold",
    fontSize: 30,
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
  scrollView: {
    flex: 1,
    width: "100%",
  },
  picker: {
    width: "100%",

    color: Color.SECONDARY_BLACK,
  },
  input_time_container: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: "center",
    gap: 10,
  },
  input_time: {
    width: "15%",
    borderWidth: 1,
    borderColor: Color.GRAY_BORDER,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  view_image: {
    position: "relative",
    width: "100%",
    height: 200,
    borderWidth: 1,
    borderColor: Color.GRAY_BORDER,
    borderRadius: 10,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Color.DEFAULT_GREEN,
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
    width: '100%',
    height: '100%',
    borderRadius: 10,
  }
});
