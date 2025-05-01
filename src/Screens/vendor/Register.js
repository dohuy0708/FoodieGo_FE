import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from "react-native";
import { Color } from "../../constants";
import React, { useState, useEffect } from "react";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import {
  getProvinces,
  getDistricts,
  getWards,
} from "../../services/locationService";
import Display from "../../utils/Display";
import {
  uploadImageToServer,
  getCoordinatesOfLocation,
  createNewAddress,
  createNewRestaurant,
} from "../../services/vendorService";
export default function Register({ navigation }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [minuteOpenTime, setMinuteOpenTime] = useState("");
  const [minuteCloseTime, setMinuteCloseTime] = useState("");
  const [phone, setPhone] = useState("");
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [detailAddress, setDetailAddress] = useState("");
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const ownerId = 193; 
  let location=null;
  let addressId=null;
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
  const handleUpload = async () => {
    if (!selectedImage) {
      Alert.alert("Thông báo", "Vui lòng chọn ảnh trước khi upload.");
      return;
    }
    console.log("Selected Image:", selectedImage);
    setUploadedImageUrl(null);
    try {
      const resultUrl = await uploadImageToServer(selectedImage);
      if (resultUrl) {
        console.log("Image uploaded successfully:", resultUrl);
        setUploadedImageUrl(resultUrl);
        console.log("Returned URL from server:", resultUrl);

        const parts = resultUrl.split(" ");
        const secureUrl = parts[0];
        const publicId = parts[1];
        console.log("Secure URL:", secureUrl);
        console.log("Public ID:", publicId);
      }
    } finally {
    }
  };
  const getCoordinates = async () => {
    const address = `${detailAddress}, ${selectedWard?.WardName}, ${selectedDistrict?.DistrictName}, ${selectedProvince?.ProvinceName}`;
    console.log("Full Address:", address);
    try {
      const response = await getCoordinatesOfLocation(address);
      if (response ) {
         location = response;
        console.log("Coordinates:", location);
      } else {
        console.error("No results found for the address:", address);
        return null;
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      return null;
    }
  };
  const createAddress = async () => {
    console.log("Creating new address...");
    await getCoordinates();
    console.log("Location:", location);
    const address=
    {
      label:"restaurant",
      province: selectedProvince?.ProvinceName,
      district: selectedDistrict?.DistrictName,
      ward: selectedWard?.WardName,
      street:detailAddress,
      latitude: parseFloat(location.latitude),
      longitude: parseFloat(location.longitude),
      placeId: location.placeId,
  }
    console.log("Address to create:", address);
    try {
      const response = await createNewAddress(address);
      if (response) {
        console.log("Address created successfully:", response);
        addressId = response.id;
        return response;
      } else {
        console.error("Failed to create address:", response);
        return null;
      }
    } catch (error) {
      console.error("Error creating address:", error);
      return null;
    }
  };
  const createRestaurant = async () => {
    await handleUpload();
    await createAddress();
    console.log("Creating new restaurant...");
    const restaurant = {
      name,
      description,
      phone,
      openTime: `${openTime}:${minuteOpenTime}`,
      closeTime: `${closeTime}:${minuteCloseTime}`,
      avatar: uploadedImageUrl,
      status:"open",
      addressId:addressId,
      ownerId: ownerId,
    };
    console.log("Restaurant to create:", restaurant);
    try {
      const response = await createNewRestaurant(restaurant);
      if (response) {
        console.log("Restaurant created successfully:", response);
        navigation.navigate("HomeVendor", {
          ownerId: ownerId,
        });

        return response;
      } else {
        console.error("Failed to create restaurant:", response);
        return null;
      }
    }
    catch (error) {
      console.error("Error creating restaurant:", error);
      return null;
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
      if (selectedProvince?.ProvinceID) {
        try {
          console.log("Selected Province Code:", selectedProvince.ProvinceID);
          const data = await getDistricts(selectedProvince.ProvinceID);
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
      if (selectedDistrict?.DistrictID) {
        try {
          const data = await getWards(selectedDistrict.DistrictID);
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
  // ---------------------------------------

  const handleRegister = () => {
    if (
      !name ||
      !description ||
      !selectedProvince ||
      !selectedDistrict ||
      !selectedWard ||
      !openTime ||
      !minuteOpenTime ||
      !closeTime ||
      !minuteCloseTime ||
      !selectedImage ||
      !selectedLocation
    ) {
      alert("Vui lòng điền đầy đủ thông tin và chọn vị trí.");
      return;
    }
    console.log("Registering Data:", {
      name,
      description,
      province: selectedProvince.name,
      district: selectedDistrict.name,
      ward: selectedWard.name,
      openTime: `${openTime}:${minuteOpenTime}`,
      closeTime: `${closeTime}:${minuteCloseTime}`,
      imageUrl: selectedImage.uri,
      location: selectedLocation,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>Đăng ký nhà hàng</Text>
        <Text style={styles.subHeaderText}>
          (*) Vui lòng nhập thông tin chính xác
        </Text>

        <View style={styles.input_container}>
          <TextInput
            style={styles.input_text}
            placeholder="Tên Nhà Hàng/Quán ăn (*)"
            value={name}
            onChangeText={setName}
            placeholderTextColor={Color.LIGHT_GREY2}
          />
        </View>
        <View style={styles.input_container}>
          <TextInput
            style={styles.input_text}
            placeholder="Số điện thoại (*)"
            keyboardType="numeric"
            value={phone}
            onChangeText={setPhone}
            placeholderTextColor={Color.LIGHT_GREY2}
          />
        </View>
        <View style={[styles.input_container, styles.textAreaContainer]}>
          <TextInput
            style={[styles.input_text, styles.textArea]}
            placeholder="Mô tả Nhà Hàng/Quán ăn (*)"
            value={description}
            onChangeText={setDescription}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor={Color.LIGHT_GREY2}
          />
        </View>

        <View style={styles.picker_container}>
          <Picker
            selectedValue={selectedProvince}
            onValueChange={(itemValue, itemIndex) => {
              if (itemIndex !== 0) setSelectedProvince(itemValue);
            }}
            style={styles.picker}
            mode="dropdown"
          >
            <Picker.Item
              label="-- Chọn tỉnh/thành phố (*) --"
              value={null}
              enabled={false}
              style={styles.pickerPlaceholder}
            />
            {provinces.map((province) => (
              <Picker.Item
                key={province.ProvinceID}
                label={province.ProvinceName}
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
              if (itemIndex !== 0) setSelectedDistrict(itemValue);
            }}
            style={styles.picker}
            enabled={!!selectedProvince}
            mode="dropdown"
          >
            <Picker.Item
              label="-- Chọn quận/huyện (*) --"
              value={null}
              enabled={false}
              style={styles.pickerPlaceholder}
            />
            {districts.map((district) => (
              <Picker.Item
                key={district.DistrictID}
                label={district.DistrictName}
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
              if (itemIndex !== 0) setSelectedWard(itemValue);
            }}
            style={styles.picker}
            enabled={!!selectedDistrict}
            mode="dropdown"
          >
            <Picker.Item
              label="-- Chọn phường/xã (*) --"
              value={null}
              enabled={false}
              style={styles.pickerPlaceholder}
            />
            {wards.map((ward) => (
              <Picker.Item
                key={ward.WardCode}
                label={ward.WardName}
                value={ward}
                style={styles.pickerItem}
              />
            ))}
          </Picker>
        </View>
        <View style={[styles.input_container, styles.textAreaContainer]}>
          <TextInput
            style={[styles.input_text, styles.textArea]}
            placeholder="Địa chỉ chi tiết(Số nhà,Tổ dân phố/Xóm) (*)"
            value={detailAddress}
            onChangeText={setDetailAddress}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor={Color.LIGHT_GREY2}
          />
        </View>

        <View style={styles.input_container}>
          <View style={styles.input_time_container}>
            <Text style={styles.timeLabel}>Giờ mở cửa (*):</Text>
            <TextInput
              style={styles.input_time}
              placeholder="Giờ"
              keyboardType="numeric"
              value={openTime}
              onChangeText={(text) => setOpenTime(text.replace(/[^0-9]/g, ""))}
              maxLength={2}
              placeholderTextColor={Color.LIGHT_GREY2}
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
              placeholderTextColor={Color.LIGHT_GREY2}
            />
          </View>
        </View>
        <View style={styles.input_container}>
          <View style={styles.input_time_container}>
            <Text style={styles.timeLabel}>Giờ đóng cửa (*):</Text>
            <TextInput
              style={styles.input_time}
              placeholder="Giờ"
              keyboardType="numeric"
              value={closeTime}
              onChangeText={(text) => setCloseTime(text.replace(/[^0-9]/g, ""))}
              maxLength={2}
              placeholderTextColor={Color.LIGHT_GREY2}
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
              placeholderTextColor={Color.LIGHT_GREY2}
            />
          </View>
        </View>

        <View style={styles.view_image}>
          <Image
            source={selectedImage ? { uri: selectedImage.uri } : {}}
            style={styles.previewImage}
            resizeMode={selectedImage ? "cover" : "center"}
          />
          <TouchableOpacity
            style={[styles.button, styles.addImageButton]}
            onPress={selectImage}
          >
            <Text style={styles.buttonText}>
              {selectedImage ? "Thay đổi ảnh bìa (*)" : "Thêm ảnh bìa (*)"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={createRestaurant}
        >
          <Text style={styles.buttonText}>Đăng ký</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Color.DEFAULT_WHITE,
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollContentContainer: {
    paddingHorizontal: Display.setWidth(4),
    paddingVertical: Display.setHeight(3),
    alignItems: "center",
    gap: Display.setHeight(2),
  },
  header: {
    textAlign: "center",
    color: Color.DEFAULT_GREEN,
    fontWeight: "bold",
    fontSize: 28,
    width: "100%",
    marginBottom: Display.setHeight(1),
  },
  subHeaderText: {
    fontSize: 14,
    color: Color.DEFAULT_RED,
    width: "100%",
    textAlign: "center",
    marginBottom: Display.setHeight(1.5),
  },
  input_container: {
    width: "100%",
    borderWidth: 1,
    borderColor: Color.GRAY_BORDER,
    borderRadius: 8,
    paddingHorizontal: Display.setWidth(3.5),
    paddingVertical:
      Platform.OS === "ios" ? Display.setHeight(1.2) : Display.setHeight(0.6),
    backgroundColor: Color.DEFAULT_WHITE,
  },
  textAreaContainer: {
    paddingVertical: Display.setHeight(1.2),
  },
  input_text: {
    color: Color.SECONDARY_BLACK,
    fontSize: 16,
    paddingVertical: Platform.OS === "ios" ? 0 : Display.setHeight(0.6),
  },
  textArea: {
    minHeight: Display.setHeight(10),
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
  },
  picker: {
    width: "100%",
    height: Display.setHeight(7),
    color: Color.SECONDARY_BLACK,
    backgroundColor: "transparent",
  },
  pickerPlaceholder: {
    color: Color.LIGHT_GREY2,
    fontSize: 12,
  },
  pickerItem: {
    fontSize: 12,
    color: Color.SECONDARY_BLACK,
  },
  input_time_container: {
    flexDirection: "row",
    alignItems: "center",

    gap: Display.setWidth(1.5),
  },
  timeLabel: {
    fontSize: 16,
    color: Color.SECONDARY_BLACK,
    marginRight: Display.setWidth(2),
  },
  input_time: {
    borderWidth: 1,
    borderColor: Color.GRAY_BORDER,
    borderRadius: 5,
    paddingHorizontal: Display.setWidth(2.5),
    paddingVertical: Display.setHeight(1),
    width: Display.setWidth(18),
    textAlign: "center",
    fontSize: 16,
    backgroundColor: Color.DEFAULT_WHITE,
  },
  timeSeparator: {
    fontSize: 16,
    color: Color.SECONDARY_BLACK,
    fontWeight: "bold",
  },
  view_image: {
    position: "relative",
    width: "100%",
    aspectRatio: 16 / 9,
    borderWidth: 1,
    borderColor: Color.GRAY_BORDER,
    borderRadius: 10,
    backgroundColor: Color.LIGHT_GREY,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
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
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  addImageButton: {
    position: "absolute",
    bottom: Display.setHeight(1.2),
    right: Display.setWidth(2.5),
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    height: "auto",
    minHeight: Display.setHeight(4.5),
    paddingHorizontal: Display.setWidth(3),
    paddingVertical: Display.setHeight(0.8),
  },

  submitButton: {
    backgroundColor: Color.DEFAULT_GREEN,

    width: "100%",
  },
});
