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


const IMAGE_ASPECT_RATIO = 16/9;


export default function EditVendor({ navigation }) {
  const [name, setName] = useState("");
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
      } catch(error) {
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
        } catch(error) {
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
        } catch(error) {
            console.error("Failed to fetch wards:", error);
            setWards([]); 
        }
      } else {
        setWards([]); 
      }
    };
    fetchWards();
  }, [selectedDistrict]);

  
  const screenWidth = Dimensions.get('window').width;
  const calculatedImageHeight = screenWidth / IMAGE_ASPECT_RATIO;

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
            resizeMode="Cover" 
          />
          <TouchableOpacity
           
            style={[styles.changeImageButton, { top: calculatedImageHeight - 25 }]} 
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
              <Picker.Item label="-- Chọn tỉnh/thành phố --" value={null} style={styles.pickerPlaceholder} enabled={false} />
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
              <Picker.Item label="-- Chọn quận/huyện --" value={null} style={styles.pickerPlaceholder} enabled={false}/>
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
                 if(itemIndex === 0){
                    setSelectedWard(null);
                 } else {
                    setSelectedWard(itemValue);
                 }
              }}
              style={styles.picker}
              enabled={!!selectedDistrict} 
              mode="dropdown"
            >
              <Picker.Item label="-- Chọn phường/xã --" value={null} style={styles.pickerPlaceholder} enabled={false}/>
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
         
          <View style={styles.input_container}>
            <View style={styles.input_time_container}>
              <Text style={styles.timeLabel}>Giờ mở cửa:</Text>
              <TextInput
                style={styles.input_time}
                placeholder="Giờ"
                keyboardType="numeric"
                value={openTime}
                onChangeText={(text) => setOpenTime(text.replace(/[^0-9]/g, ''))} 
                maxLength={2}
              />
              <Text style={styles.timeSeparator}>:</Text>
              <TextInput
                style={styles.input_time}
                placeholder="Phút"
                keyboardType="numeric"
                value={minuteOpenTime}
                onChangeText={(text) => setMinuteOpenTime(text.replace(/[^0-9]/g, ''))} 
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
                onChangeText={(text) => setCloseTime(text.replace(/[^0-9]/g, ''))} 
                maxLength={2}
              />
               <Text style={styles.timeSeparator}>:</Text>
              <TextInput
                style={styles.input_time}
                placeholder="Phút"
                keyboardType="numeric"
                value={minuteCloseTime}
                onChangeText={(text) => setMinuteCloseTime(text.replace(/[^0-9]/g, ''))} 
                maxLength={2}
              />
            </View>
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
                    selectedProvince,
                    selectedDistrict,
                    selectedWard,
                    openTime, minuteOpenTime,
                    closeTime, minuteCloseTime,
                    selectedImageUri: selectedImage?.uri
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
    width: '100%',
    position: 'relative',
  
  },
  image: {
    width: "100%", 
    aspectRatio: IMAGE_ASPECT_RATIO, 
   
  },
  changeImageButton: {
    position: "absolute", 
    right: 15,
    backgroundColor: Color.DEFAULT_GREEN, 
    paddingHorizontal: 15, 
    paddingVertical: 10,
    borderRadius: 10, 
    height: 50, 
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
    paddingHorizontal: 20, 
    paddingVertical: 30,
    width: "100%",
    backgroundColor: Color.DEFAULT_WHITE, 
    alignItems: "center",
    gap: 18,
  },
  header: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 22, 
    color: Color.PRIMARY, 
    marginBottom: 10, 
  },
  input_container: {
    width: "100%",
    borderWidth: 1,
    borderColor: Color.GRAY_BORDER,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 5,
   
  },
   textAreaContainer: {
     paddingVertical: 10, 
   },
  input_text: {
    color: Color.SECONDARY_BLACK,
    fontSize: 15,
    paddingVertical: 8,
  },
   textArea: {
      height: 100, 
      textAlignVertical: 'top', 
   },
  picker_container: {
    width: "100%",
    borderWidth: 1,
    borderColor: Color.GRAY_BORDER,
    borderRadius: 8,
    overflow: "hidden", 
    backgroundColor: '#f9f9f9'
  },
  picker: {
    width: "100%",
    height: 50, 
    color: Color.SECONDARY_BLACK,
    backgroundColor: 'transparent', 
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
    paddingVertical: 5,
    gap: 5, 
  },
  timeLabel: {
    fontSize: 15,
    color: Color.SECONDARY_BLACK,
    marginRight: 10, 
  },
  input_time: {
    borderWidth: 1,
    borderColor: Color.GRAY_BORDER,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: 80, 
    textAlign: 'center',
    fontSize: 15,
    backgroundColor: Color.DEFAULT_WHITE, 
  },
  timeSeparator: {
    fontSize: 15,
    color: Color.SECONDARY_BLACK,
    fontWeight: 'bold',
  },
  buttonContainer: { 
    flexDirection: "row",
    gap: 15,
    alignSelf: "flex-end",
    marginTop: 20,
    width: '100%', 
    justifyContent: 'flex-end',
  },
  button: {
    paddingHorizontal: 25, 
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100, 
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