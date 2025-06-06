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
  ActivityIndicator,
  Platform,
  Alert
} from "react-native";
import  Colors  from "../../constants/Colors";
import React, { useState, useEffect } from "react";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/Ionicons";
import Display from "../../utils/Display";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  uploadImageToServer,
  updateRestaurantAPI,
  getAllRestaurantNames
} from "../../services/vendorService";

const IMAGE_ASPECT_RATIO = 16 / 11;
const screenWidth = Dimensions.get("window").width;
const calculatedImageHeight = screenWidth / IMAGE_ASPECT_RATIO;
const changeImageButtonOverlap = Display.setHeight(3);

export default function EditVendor({ navigation, route }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const restaurant = route?.params?.restaurantData || null;
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [minuteOpenTime, setMinuteOpenTime] = useState("");
  const [minuteCloseTime, setMinuteCloseTime] = useState("");

  const [selectedImage, setSelectedImage] = useState(null);
  const [imageChangedByUser, setImageChangedByUser] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const selectAddress=route?.params?.selectedAddress || null;
  const [status, setStatus] = useState([
    { id: 'open', name: "Đang mở cửa" },
    { id: 'close', name: "Tạm đóng cửa" },
  ]);
 
  const [allRestaurant, setAllRestaurant] = useState([]);
  const selectImage = async () => {
    if (isSaving) return;
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Thông báo", "Xin lỗi, chúng tôi cần quyền truy cập thư viện ảnh!");
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
        setImageChangedByUser(true);
      }
    } catch (error) {
      console.log("ImagePicker Error: ", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi chọn ảnh.");
    }
  };
  useEffect(() => {
    if (selectAddress) {
      console.log("selectAddress", selectAddress);
    }
  }, [selectAddress]);
  useEffect(() => {
    if (restaurant && isLoading) {
    
      setName(restaurant.name || "");
      setPhone(restaurant.phone || "");
      setDescription(restaurant.description || "");
      const openTimeParts = (restaurant.openTime || "00:00").split(':');
      const closeTimeParts = (restaurant.closeTime || "00:00").split(':');
      setOpenTime(openTimeParts[0] || "");
      setMinuteOpenTime(openTimeParts[1] || "");
      setCloseTime(closeTimeParts[0] || "");
      setMinuteCloseTime(closeTimeParts[1] || "");
     
      const initialStatus = status.find(s => s.id === restaurant.status);
      setSelectedStatus(initialStatus ? initialStatus.id : null);
      setSelectedImage(restaurant.avatar ? { uri: restaurant.avatar } : null);
      setImageChangedByUser(false);
      setIsLoading(false);
    } else if (!restaurant && isLoading) {
       setIsLoading(false);
       console.error("EditVendor: Restaurant data is missing in route params.");
       Alert.alert("Lỗi", "Không thể tải dữ liệu nhà hàng để chỉnh sửa.", [
           { text: "OK", onPress: () => navigation.goBack() }
       ]);
    }
  }, [restaurant, isLoading, status]);

  useEffect(() => {
    const fetchAllRestaurantNames = async () => {
      const allRestaurantNames = await getAllRestaurantNames();
    
      setAllRestaurant(allRestaurantNames);
    };
    fetchAllRestaurantNames();
    
  }, []);
  
  const handleUpdate = async () => {
    console.log("start update")
     if (!restaurant || !restaurant.id || !restaurant.address?.id) {
         Alert.alert("Lỗi", "Thiếu thông tin nhà hàng hoặc địa chỉ gốc.");
         return;
     }

    
     if (!name.trim() || !phone.trim() ||  !openTime || !minuteOpenTime || !closeTime || !minuteCloseTime || !selectedStatus) {
         Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ các trường bắt buộc (*).");
         return;
     }
     if(allRestaurant
      .filter(restaurant => restaurant.id !== restaurant.id)
      .some(restaurant => restaurant.name.toLowerCase() === name.trim().toLowerCase())){
      Alert.alert("Thông báo", "Tên nhà hàng đã tồn tại.");
      return;
     }
     if (!selectedImage?.uri) {
         Alert.alert("Thiếu thông tin", "Vui lòng chọn ảnh bìa cho nhà hàng.");
         return;
     }

    
     const trimmedPhone = phone.trim();
     const phoneRegex = /^\d+$/; 
     if (
         !phoneRegex.test(trimmedPhone) ||
         !(trimmedPhone.length === 10 || trimmedPhone.length === 11) ||
         !trimmedPhone.startsWith('0') 
        ) {
         Alert.alert("Lỗi", "Số điện thoại không hợp lệ. Vui lòng kiểm tra lại (phải bắt đầu bằng 0, có 10 hoặc 11 chữ số).");
         return; 
     }
     

    setIsSaving(true);
    let finalImageUrl = restaurant.imageUrl;
   
     console.log("start update image")
    try {
      if (imageChangedByUser && selectedImage) {
        console.log("Uploading new image...");
        const uploadedUrl = await uploadImageToServer(selectedImage);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl.split(" ")[0];
          console.log("New image uploaded:", finalImageUrl);
        } else {
          throw new Error("Không thể upload ảnh mới.");
        }
      } else {
          console.log("Keeping existing image or no image selected.");
          finalImageUrl = selectedImage?.uri || null; 
          if (!finalImageUrl) { 
              throw new Error("Không có ảnh bìa hợp lệ để lưu.");
          }
      }

     console.log("start update address")

     
    
      console.log("status", selectedStatus);
      console.log("start update restaurant")
      const restaurantUpdateData = {
        id: restaurant.id,
        name: name.trim(),
        phone: trimmedPhone,
        description: description.trim(),
        openTime: `${openTime.padStart(2, '0')}:${minuteOpenTime.padStart(2, '0')}`,
        closeTime: `${closeTime.padStart(2, '0')}:${minuteCloseTime.padStart(2, '0')}`,
        status: selectedStatus,
        avatar: finalImageUrl,
      };

      console.log("Updating restaurant with data:", restaurantUpdateData);
      const updatedRestaurant = await updateRestaurantAPI(restaurantUpdateData);
      if (!updatedRestaurant) {
        throw new Error("Không thể cập nhật thông tin nhà hàng.");
      }
      console.log("Restaurant update successful:", updatedRestaurant);
     

      Alert.alert("Thành công", "Đã cập nhật thông tin nhà hàng thành công!", [
          { text: "OK", onPress: () => navigation.navigate("HomeVendor") }
      ]);

    } catch (error) {
      console.error("Error during update process:", error);
      Alert.alert("Lỗi", `Đã xảy ra lỗi khi lưu: ${error.message || 'Vui lòng thử lại.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.DEFAULT_GREEN}/>
      </View>
    );
  }

  if (!restaurant && !isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', textAlign: 'center' }}>Lỗi: Không tải được dữ liệu nhà hàng để chỉnh sửa.</Text>
         <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: 15, padding: 10, backgroundColor: Colors.DEFAULT_YELLOW, borderRadius: 5}}>
            <Text style={{color: Colors.DEFAULT_WHITE}}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container1}>
       <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.header}>Chỉnh sửa thông tin nhà hàng</Text>
      </View>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
     
        <View style={styles.imageContainer}>
          <Image
            source={
              selectedImage?.uri
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
              isSaving && styles.disabledButton
            ]}
            onPress={selectImage}
            disabled={isSaving}
          >
            <Text style={{ color: Colors.DEFAULT_WHITE }}>Thay đổi ảnh</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.container}>
          
          <View style={styles.input_container}>
            <TextInput
              style={styles.input_text}
              placeholder="Tên Nhà Hàng/Quán ăn (*)"
              value={name}
              onChangeText={setName}
              placeholderTextColor={Colors.LIGHT_GREY2}
              editable={!isSaving}
            />
          </View>
          <View style={styles.input_container}>
            <TextInput
              style={styles.input_text}
              placeholder="Số điện thoại (*)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="numeric"
              placeholderTextColor={Colors.LIGHT_GREY2}
              editable={!isSaving}
              maxLength={11} 
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
              placeholderTextColor={Colors.LIGHT_GREY2}
              editable={!isSaving}
            />
          </View>
             
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
                 placeholderTextColor={Colors.LIGHT_GREY2}
                 editable={!isSaving}
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
                 editable={!isSaving}
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
                 placeholderTextColor={Colors.LIGHT_GREY2}
                 editable={!isSaving}
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
                 editable={!isSaving}
              />
            </View>
          </View>
          <View style={styles.picker_container}>
            <Picker
              selectedValue={selectedStatus}
              onValueChange={(itemValue, itemIndex) => {
                  if (itemIndex !== 0) {
                      setSelectedStatus(itemValue)
                  } else {
                      setSelectedStatus(null);
                  }
                 
              }}
              style={styles.picker}
              enabled={!isSaving}
              mode="dropdown"
            >
              <Picker.Item label="-- Chọn tình trạng cửa hàng --" value={null} enabled={false} style={styles.pickerPlaceholder}/>
              {status.map((statusItem) => (
                <Picker.Item
                  key={statusItem.id}
                  label={statusItem.name}
                  value={statusItem.id}
                  style={styles.pickerItem}
                />
              ))}
            </Picker>
          </View>
            
              
          <View style={[styles.buttonContainer,{paddingBottom: insets.bottom + Display.setHeight(1)}]}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, isSaving && styles.disabledButton]}
              onPress={() => navigation.navigate("HomeVendor")}
              disabled={isSaving}
            >
              <Text style={styles.buttonText}>Hủy bỏ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, isSaving && styles.disabledButton]}
              onPress={handleUpdate}
              disabled={isSaving}
            >
              {isSaving ? (
                 <ActivityIndicator size="small" color={Colors.DEFAULT_WHITE} />
              ) : (
                 <Text style={styles.buttonText}>Lưu Thay đổi</Text>
              )}
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
    backgroundColor: Colors.DEFAULT_WHITE,
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
    backgroundColor: Colors.DEFAULT_GREEN,
    paddingHorizontal: Display.setWidth(4),
    paddingVertical: Display.setHeight(1.2),
    borderRadius: 10,
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
    paddingTop: Display.setHeight(6),
    paddingBottom: Display.setHeight(2),
    width: "100%",
    backgroundColor: Colors.DEFAULT_WHITE,
    alignItems: "center",
    gap: Display.setHeight(2.2),
  },
  header: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 21,
    color: Colors.PRIMARY || Colors.DEFAULT_GREEN,
   
  },
  input_container: {
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.GRAY_BORDER || '#ccc',
    borderRadius: 8,
    paddingHorizontal: Display.setWidth(4),
    paddingVertical: Display.setHeight(0.6),
    backgroundColor: Colors.DEFAULT_WHITE,
  },
  textAreaContainer: {
    paddingVertical: Display.setHeight(1.2),
  },
  input_text: {
    color: Colors.SECONDARY_BLACK || '#333',
    fontSize: 15,
    paddingVertical: Platform.OS === 'ios' ? Display.setHeight(1.2) : Display.setHeight(0.8),
  },
  textArea: {
    height: Display.setHeight(12),
    textAlignVertical: "top",
  },
  picker_container: {
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.GRAY_BORDER || "#ccc",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f9f9f9",
    justifyContent: 'center',
    height: Display.setHeight(7),
  },
  picker: {
    width: "100%",
    height: '100%',
    color: Colors.SECONDARY_BLACK || "#333",
    backgroundColor: 'transparent',
     marginTop: Platform.OS === 'android' ? -Display.setHeight(1) : 0,
     marginBottom: Platform.OS === 'android' ? -Display.setHeight(1) : 0,
  },
  pickerPlaceholder: {
    fontSize: 14,
    color: Colors.LIGHT_GREY2 || '#aaa',
  },
  pickerItem: {
    fontSize: 15,
    color: Colors.LIGHT_GREY2 || '#333',
  },
  input_time_container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Display.setHeight(0.6),
    gap: Display.setWidth(1.2),
  },
  timeLabel: {
    fontSize: 15,
    color: Colors.SECONDARY_BLACK || '#555',
    marginRight: Display.setWidth(2.5),
  },
  input_time: {
    borderWidth: 1,
    borderColor: Colors.GRAY_BORDER || '#ccc',
    borderRadius: 5,
    paddingHorizontal: Display.setWidth(2.5),
    paddingVertical: Display.setHeight(1),
    width: Display.setWidth(18),
    textAlign: "center",
    fontSize: 15,
    backgroundColor: Colors.DEFAULT_WHITE,
  },
  timeSeparator: {
    fontSize: 15,
    color: Colors.SECONDARY_BLACK || '#333',
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
   disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.DEFAULT_WHITE,
    fontSize: 15,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: Colors.DEFAULT_YELLOW,
  },
  saveButton: {
    backgroundColor: Colors.DEFAULT_GREEN,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
      paddingHorizontal: Display.setWidth(2),
      paddingVertical: Display.setHeight(1.2),
      backgroundColor: "#ffffff",
      borderBottomWidth: 1,
      borderBottomColor: "#e5e7eb",
  },
  backButton: { padding: 8, marginRight: 12 },
});