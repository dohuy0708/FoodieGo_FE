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
import  Colors  from "../../constants/Colors";
import React, { useState, useEffect, useContext } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from "../../context/UserContext";
import Display from "../../utils/Display";
import {
  uploadImageToServer,
  getAllRestaurantNames,
  createNewRestaurant,
} from "../../services/vendorService";
export default function Register({ navigation }) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [minuteOpenTime, setMinuteOpenTime] = useState("");
  const [minuteCloseTime, setMinuteCloseTime] = useState("");
  const [phone, setPhone] = useState("");
  const { userInfo } = useContext(UserContext);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [restaurantName, setRestaurantName] = useState([]);
  let url=null;
  useEffect(() => {
    const fetchRestaurantNames = async () => {
      const names = await getAllRestaurantNames();
      setRestaurantName(names);
    };
    fetchRestaurantNames();
  }, []);
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
        url=secureUrl;
        console.log("Secure URL:", secureUrl);
        console.log("Public ID:", publicId);
        
      }
    } finally {
    }
  };

 
  const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^0\d{9,10}$/;
    return phoneRegex.test(phone);
  };
  const createRestaurant = async () => {
    console.log("Creating restaurant...");
    if(restaurantName.some(restaurant => restaurant.name.toLowerCase() === name.toLowerCase())){
      Alert.alert("Thông báo", "Tên nhà hàng đã tồn tại.");
      return;
    }
    if (
      !name.trim() ||
      !description.trim() ||
      !phone.trim() ||
      !openTime.trim() ||
      !minuteOpenTime.trim() ||
      !closeTime.trim() ||
      !minuteCloseTime.trim() ||
      !selectedImage
    ) {
      Alert.alert("Thông báo", "Vui lòng điền đầy đủ tất cả các thông tin bắt buộc.");
      return;
    }

    if (!isValidPhoneNumber(phone)) {
      Alert.alert("Thông báo", "Số điện thoại phải từ 10 đến 11 số và bắt đầu bằng số 0.");
      return;
    }
    if(openTime>closeTime){
      Alert.alert("Thông báo", "Giờ mở cửa phải trước giờ đóng cửa.");
      return;
    }
    if(openTime>24 || closeTime>24){
      Alert.alert("Thông báo", "Giờ mở cửa và đóng cửa phải nhỏ hơn 24.");
      return;
    }
    if(minuteOpenTime>59 || minuteCloseTime>59){
      Alert.alert("Thông báo", "Phút mở cửa và đóng cửa phải nhỏ hơn 59.");
      return;
    }
    console.log("Uploading image...");
    await handleUpload();
    
    console.log("Creating new restaurant...");
    const restaurant = {
      name,
      description,
      phone,
      openTime: `${openTime}:${minuteOpenTime}`,
      closeTime: `${closeTime}:${minuteCloseTime}`,
      avatar: url,
      status:"open",
      addressId:1,
      ownerId: userInfo.id,
    };
    console.log("Restaurant to create:", restaurant);
    try {
      const response = await createNewRestaurant(restaurant);
      const restaurantId=response.id;
      if (response) {
        console.log("Restaurant created successfully:", response);
        navigation.navigate("SelectAddress", {
         restaurantId:restaurantId,
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


  // ---------------------------------------



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
            placeholderTextColor={Colors.LIGHT_GREY2}
          />
        </View>
        <View style={styles.input_container}>
          <TextInput
            style={styles.input_text}
            placeholder="Số điện thoại (*)"
            keyboardType="numeric"
            value={phone}
            onChangeText={setPhone}
            placeholderTextColor={Colors.LIGHT_GREY2}
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
            placeholderTextColor={Colors.LIGHT_GREY2}
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
              placeholderTextColor={Colors.LIGHT_GREY2}
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
              placeholderTextColor={Colors.LIGHT_GREY2}
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
              placeholderTextColor={Colors.LIGHT_GREY2}
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
              placeholderTextColor={Colors.LIGHT_GREY2}
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
            <View style={{flexDirection:"row",justifyContent:"flex-end",alignItems:"center",width:"100%",gap:Display.setWidth(2)}}>
              <TouchableOpacity
                style={[styles.button, styles.submitButton,{backgroundColor:Colors.DEFAULT_YELLOW}]}
                onPress={()=>navigation.navigate("LoginScreen")}
              >
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={createRestaurant}
        >
          <Text style={styles.buttonText}>Tiếp theo</Text>
        </TouchableOpacity>
            </View>
        
       
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.DEFAULT_WHITE,
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
    color: Colors.DEFAULT_GREEN,
    fontWeight: "bold",
    fontSize: 28,
    width: "100%",
    marginBottom: Display.setHeight(1),
  },
  subHeaderText: {
    fontSize: 14,
    color: Colors.DEFAULT_RED,
    width: "100%",
    textAlign: "center",
    marginBottom: Display.setHeight(1.5),
  },
  input_container: {
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.GRAY_BORDER,
    borderRadius: 8,
    paddingHorizontal: Display.setWidth(3.5),
    paddingVertical:
      Platform.OS === "ios" ? Display.setHeight(1.2) : Display.setHeight(0.6),
    backgroundColor: Colors.DEFAULT_WHITE,
  },
  textAreaContainer: {
    paddingVertical: Display.setHeight(1.2),
  },
  input_text: {
    color: Colors.SECONDARY_BLACK,
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
    borderColor: Colors.GRAY_BORDER,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: Colors.DEFAULT_WHITE,
    justifyContent: "center",
  },
  picker: {
    width: "100%",
    height: Display.setHeight(7),
    color: Colors.SECONDARY_BLACK,
    backgroundColor: "transparent",
  },
  pickerPlaceholder: {
    color: Colors.LIGHT_GREY2,
    fontSize: 12,
  },
  pickerItem: {
    fontSize: 12,
    color: Colors.SECONDARY_BLACK,
  },
  input_time_container: {
    flexDirection: "row",
    alignItems: "center",

    gap: Display.setWidth(1.5),
  },
  timeLabel: {
    fontSize: 16,
    color: Colors.SECONDARY_BLACK,
    marginRight: Display.setWidth(2),
  },
  input_time: {
    borderWidth: 1,
    borderColor: Colors.GRAY_BORDER,
    borderRadius: 5,
    paddingHorizontal: Display.setWidth(2.5),
    paddingVertical: Display.setHeight(1),
    width: Display.setWidth(18),
    textAlign: "center",
    fontSize: 16,
    backgroundColor: Colors.DEFAULT_WHITE,
  },
  timeSeparator: {
    fontSize: 16,
    color: Colors.SECONDARY_BLACK,
    fontWeight: "bold",
  },
  view_image: {
    position: "relative",
    width: "100%",
    aspectRatio: 16 / 9,
    borderWidth: 1,
    borderColor: Colors.GRAY_BORDER,
    borderRadius: 10,
    backgroundColor: Colors.LIGHT_GREY,
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
    backgroundColor: Colors.DEFAULT_GREEN,
    marginBottom: Display.setHeight(3),
    width: "40%",
  },
});
