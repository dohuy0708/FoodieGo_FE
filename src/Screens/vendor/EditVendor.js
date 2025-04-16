import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Color } from "../../constants";
import React, { useState, useEffect } from "react";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import {
  getProvinces,
  getDistrictsByProvinceCode,
  getWardsByDistrictCode,
} from "../../services/locationService";
import Display from "../../utils/Display";

const IMAGE_ASPECT_RATIO = 16 / 9;

const screenWidth = Dimensions.get("window").width;
const calculatedImageHeight = screenWidth / IMAGE_ASPECT_RATIO;

const changeImageButtonOverlap = Display.setHeight(3);

export default function EditVendor({ navigation }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [minuteOpenTime, setMinuteOpenTime] = useState("");
  const [minuteCloseTime, setMinuteCloseTime] = useState("");
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [status, setStatus] = useState([
    {
      id: 1,
      name: "Đang mở cửa",
    },
    {
      id: 2,
      name: "Tạm đóng cửa",
    },
  ]);
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

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await getProvinces();
        setProvinces(data || []);
      } catch (error) {
        console.error("Failed to fetch provinces:", error);
        setProvinces([]);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (selectedProvince && selectedProvince.code) {
        try {
          const data = await getDistrictsByProvinceCode(selectedProvince.code);
          setDistricts(data || []);
          setSelectedDistrict(null);
          setWards([]);
        } catch (error) {
          console.error("Failed to fetch districts:", error);
          setDistricts([]);
          setWards([]);
        }
      } else {
        setDistricts([]);
        setWards([]);
      }
    };
    fetchDistricts();
  }, [selectedProvince]);

  useEffect(() => {
    const fetchWards = async () => {
      if (selectedDistrict && selectedDistrict.code) {
        try {
          const data = await getWardsByDistrictCode(selectedDistrict.code);
          setWards(data || []);
          setSelectedWard(null);
        } catch (error) {
          console.error("Failed to fetch wards:", error);
          setWards([]);
        }
      } else {
        setWards([]);
      }
    };
    fetchWards();
  }, [selectedDistrict]);

  return (
    <SafeAreaView style={styles.container1}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.imageContainer}>
          <Image
            source={
              selectedImage
                ? { uri: selectedImage.uri }
                : require("../../assets/images/store.png")
            }
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={[
              styles.changeImageButton,
              { top: calculatedImageHeight - changeImageButtonOverlap },
            ]} // Sử dụng giá trị đã tính
            onPress={selectImage}
          >
            <Text style={{ color: Color.DEFAULT_WHITE }}>Thay đổi ảnh</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.container}>
          <Text style={styles.header}>Chỉnh sửa thông tin nhà hàng</Text>
          <View style={styles.input_container}>
            <TextInput
              style={styles.input_text}
              placeholder="Tên Nhà Hàng/Quán ăn"
              value={name}
              onChangeText={setName}
            />
          </View>
          <View style={styles.input_container}>
            <TextInput
              style={styles.input_text}
              placeholder="Số điện thoại"
              value={phone}
              onChangeText={setPhone}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.input_container, styles.textAreaContainer]}>
            <TextInput
              style={[styles.input_text, styles.textArea]}
              placeholder="Mô tả Nhà Hàng/Quán ăn"
              value={description}
              onChangeText={setDescription}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.picker_container}>
            <Picker
              selectedValue={selectedProvince}
              onValueChange={(itemValue, itemIndex) => {
                if (itemIndex === 0) {
                  setSelectedProvince(null);
                } else {
                  setSelectedProvince(itemValue);
                }
              }}
              style={styles.picker}
              mode="dropdown"
            >
              <Picker.Item
                label="-- Chọn tỉnh/thành phố --"
                value={null}
                style={styles.pickerPlaceholder}
                enabled={false}
              />
              {provinces.map((province) => (
                <Picker.Item
                  key={province.code}
                  label={province.name}
                  value={province}
                  style={styles.pickerItem}
                />
              ))}
            </Picker>
          </View>

          <View style={styles.picker_container}>
            <Picker
              selectedValue={selectedDistrict}
              onValueChange={(itemValue, itemIndex) => {
                if (itemIndex === 0) {
                  setSelectedDistrict(null);
                } else {
                  setSelectedDistrict(itemValue);
                }
              }}
              style={styles.picker}
              enabled={!!selectedProvince}
              mode="dropdown"
            >
              <Picker.Item
                label="-- Chọn quận/huyện --"
                value={null}
                style={styles.pickerPlaceholder}
                enabled={false}
              />
              {districts.map((district) => (
                <Picker.Item
                  key={district.code}
                  label={district.name}
                  value={district}
                  style={styles.pickerItem}
                />
              ))}
            </Picker>
          </View>

          <View style={styles.picker_container}>
            <Picker
              selectedValue={selectedWard}
              onValueChange={(itemValue, itemIndex) => {
                if (itemIndex === 0) {
                  setSelectedWard(null);
                } else {
                  setSelectedWard(itemValue);
                }
              }}
              style={styles.picker}
              enabled={!!selectedDistrict}
              mode="dropdown"
            >
              <Picker.Item
                label="-- Chọn phường/xã --"
                value={null}
                style={styles.pickerPlaceholder}
                enabled={false}
              />
              {wards.map((ward) => (
                <Picker.Item
                  key={ward.code}
                  label={ward.name}
                  value={ward}
                  style={styles.pickerItem}
                />
              ))}
            </Picker>
          </View>
          {/* --------------------------------- */}

          <View style={styles.input_container}>
            <View style={styles.input_time_container}>
              <Text style={styles.timeLabel}>Giờ mở cửa:</Text>
              <TextInput
                style={styles.input_time}
                placeholder="Giờ"
                keyboardType="numeric"
                value={openTime}
                onChangeText={(text) =>
                  setOpenTime(text.replace(/[^0-9]/g, ""))
                }
                maxLength={2}
              />
              <Text style={styles.timeSeparator}>:</Text>
              <TextInput
                style={styles.input_time}
                placeholder="Phút"
                keyboardType="numeric"
                value={minuteOpenTime}
                onChangeText={(text) =>
                  setMinuteOpenTime(text.replace(/[^0-9]/g, ""))
                }
                maxLength={2}
              />
            </View>
          </View>
          <View style={styles.input_container}>
            <View style={styles.input_time_container}>
              <Text style={styles.timeLabel}>Giờ đóng cửa:</Text>
              <TextInput
                style={styles.input_time}
                placeholder="Giờ"
                keyboardType="numeric"
                value={closeTime}
                onChangeText={(text) =>
                  setCloseTime(text.replace(/[^0-9]/g, ""))
                }
                maxLength={2}
              />
              <Text style={styles.timeSeparator}>:</Text>
              <TextInput
                style={styles.input_time}
                placeholder="Phút"
                keyboardType="numeric"
                value={minuteCloseTime}
                onChangeText={(text) =>
                  setMinuteCloseTime(text.replace(/[^0-9]/g, ""))
                }
                maxLength={2}
              />
            </View>
          </View>
          <View style={styles.picker_container}>
            <Picker
              selectedValue={selectedStatus}
              onValueChange={(itemValue) => setSelectedStatus(itemValue)}
              style={styles.picker}
              enabled={true}
            >
              <Picker.Item label="Tình trạng cửa hàng" value={null} />
              {status.map((status) => (
                <Picker.Item
                  key={status.id}
                  label={status.name}
                  value={status.id}
                />
              ))}
            </Picker>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonText}>Hủy bỏ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={() => {
                console.log({
                  name,
                  description,
                  province: selectedProvince?.name,
                  district: selectedDistrict?.name,
                  ward: selectedWard?.name,
                  openTime,
                  minuteOpenTime,
                  closeTime,
                  minuteCloseTime,
                  selectedImageUri: selectedImage?.uri,
                });
                navigation.goBack();
              }}
            >
              <Text style={styles.buttonText}>Lưu Thay đổi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container1: {
    flex: 1,
    backgroundColor: Color.DEFAULT_WHITE,
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  imageContainer: {
    width: "100%",
    position: "relative",
  },
  image: {
    width: "100%",

    aspectRatio: IMAGE_ASPECT_RATIO,
  },
  changeImageButton: {
    position: "absolute",
    right: Display.setWidth(4),
    backgroundColor: Color.DEFAULT_GREEN,
    paddingHorizontal: Display.setWidth(4),
    paddingVertical: Display.setHeight(1.2),
    borderRadius: 10,
    height: Display.setHeight(6),
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  container: {
    paddingHorizontal: Display.setWidth(5),
    paddingVertical: Display.setHeight(4),
    width: "100%",
    backgroundColor: Color.DEFAULT_WHITE,
    alignItems: "center",
    gap: Display.setHeight(2.2),
  },
  header: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 22,
    color: Color.PRIMARY,
    marginBottom: Display.setHeight(1.2),
  },
  input_container: {
    width: "100%",
    borderWidth: 1,
    borderColor: Color.GRAY_BORDER,
    borderRadius: 8,
    paddingHorizontal: Display.setWidth(4),
    paddingVertical: Display.setHeight(0.6),
  },
  textAreaContainer: {
    paddingVertical: Display.setHeight(1.2),
  },
  input_text: {
    color: Color.SECONDARY_BLACK,
    fontSize: 15,

    paddingVertical: Display.setHeight(1),
  },
  textArea: {
    height: Display.setHeight(12),
    textAlignVertical: "top",
  },
  picker_container: {
    width: "100%",
    borderWidth: 1,
    borderColor: Color.GRAY_BORDER,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f9f9f9",
  },
  picker: {
    width: "100%",
    height: Display.setHeight(6),
    color: Color.SECONDARY_BLACK,
    backgroundColor: "transparent",
  },
  pickerPlaceholder: {
    fontSize: 14,
    color: Color.GRAY_BORDER,
  },
  pickerItem: {
    fontSize: 15,
  },
  input_time_container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Display.setHeight(0.6),
    gap: Display.setWidth(1.2),
  },
  timeLabel: {
    fontSize: 15,
    color: Color.SECONDARY_BLACK,
    marginRight: Display.setWidth(2.5),
  },
  input_time: {
    borderWidth: 1,
    borderColor: Color.GRAY_BORDER,
    borderRadius: 5,
    paddingHorizontal: Display.setWidth(2.5),
    paddingVertical: Display.setHeight(1),
    width: Display.setWidth(20),
    textAlign: "center",
    fontSize: 15,
    backgroundColor: Color.DEFAULT_WHITE,
  },
  timeSeparator: {
    fontSize: 15,
    color: Color.SECONDARY_BLACK,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: Display.setWidth(4),
    alignSelf: "flex-end",
    marginTop: Display.setHeight(2.5),
    width: "100%",
    justifyContent: "flex-end",
  },
  button: {
    paddingHorizontal: Display.setWidth(6),
    paddingVertical: Display.setHeight(1.5),
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: Display.setWidth(25),
  },
  buttonText: {
    color: Color.DEFAULT_WHITE,
    fontSize: 15,
  },
  cancelButton: {
    backgroundColor: Color.DEFAULT_YELLOW,
  },
  saveButton: {
    backgroundColor: Color.DEFAULT_GREEN,
  },
});
