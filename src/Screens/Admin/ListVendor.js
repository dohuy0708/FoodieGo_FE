import { React, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
} from "react-native";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { Picker } from "@react-native-picker/picker"; // Import Picker
import  Colors  from "../../constants/Colors";
import Display from "../../utils/Display";
import NavAdmin from "../../components/NavAdmin";

const NAV_HEIGHT = Display.setHeight(8);
const restaurant = [
  { id: 1, name: "Cháo ếch Singapore", status: "Đã xác nhận " },
  { id: 2, name: "Cháo gà Singapore", status: "Chờ xác nhận " },
  { id: 3, name: "Phở gà", status: "Đình chỉ " },
  { id: 4, name: "Cơm tấm", status: "Chờ xác nhận " },
  { id: 5, name: "Bánh mì", status: "Đã xác nhận " },
  { id: 6, name: "Cháo ếch Singapore", status: "Đã xác nhận " },
];
const status = [
  { id: 4, name: "Tất cả trạng thái" },
  { id: 1, name: "Đã xác nhận" },
  { id: 2, name: "Chờ xác nhận" },
  { id: 3, name: "Đình chỉ" },
];

export default function ListVendor({ navigation }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(restaurant);
  const [selectedStatus, setSelectedStatus] = useState(4); 

 
  useEffect(() => {
    let filteredData = restaurant; 

   
    if (selectedStatus !== 4) {
      const selectedStatusName = status.find(s => s.id === selectedStatus)?.name.trim(); 
      if (selectedStatusName) {
        filteredData = filteredData.filter(item =>
          item.status.trim().toLowerCase() === selectedStatusName.toLowerCase() 
        );
      }
    }

    
    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
    if (lowerCaseSearchTerm !== "") {
      filteredData = filteredData.filter(item =>
        item.name.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    setSearchResults(filteredData); 

  }, [searchTerm, selectedStatus]);


  const renderItem = ({ item }) => {
    const statusTrimmed = item.status.trim();

    let statusColor = Colors.DEFAULT_BLACK;
    if (statusTrimmed === "Đã xác nhận") statusColor = Colors.DEFAULT_GREEN;
    else if (statusTrimmed === "Chờ xác nhận") statusColor = Colors.DEFAULT_ORANGE;
    else if (statusTrimmed === "Đình chỉ") statusColor = Colors.DEFAULT_RED;

    return (
      <View style={styles.listItemContainer}>
        <View style={styles.divider} />
        <Text style={styles.itemNameText}>{item.name}</Text>
        <View style={styles.itemStatusRow}>
          <Text style={[styles.itemStatusText, { color: statusColor }]}>
            {item.status}
          </Text>
          <TouchableOpacity onPress={() => console.log("View Details:", item.id)}>
            <Text style={styles.detailsLinkText}>Xem chi tiết</Text>
          </TouchableOpacity>
        </View>

        {statusTrimmed === "Chờ xác nhận" && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.deleteButton]}>
              <Text style={styles.buttonText}>Xóa</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.confirmButton]}>
              <Text style={styles.buttonText}>Xác nhận</Text>
            </TouchableOpacity>
          </View>
        )}
        {statusTrimmed === "Đã xác nhận" && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.suspendButton]}>
              <Text style={styles.buttonText}>Đình chỉ</Text>
            </TouchableOpacity>
          </View>
        )}
        {statusTrimmed === "Đình chỉ" && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.reactivateButton]}>
              <Text style={styles.buttonText}>Kích hoạt lại</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
   };


  return (
    <View style={styles.container}>
      <Text style={styles.header}>Danh sách nhà hàng</Text>

      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Tìm kiếm cửa hàng..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor={Colors.LIGHT_GREY2}
        />
        <TouchableOpacity>
          <EvilIcons name="search" size={28} color={Colors.SECONDARY_BLACK} />
        </TouchableOpacity>
      </View>

      
      <View style={styles.picker_container}>
        <Picker
          selectedValue={selectedStatus}
          onValueChange={(itemValue, itemIndex) => setSelectedStatus(itemValue)}
          style={styles.picker}
          mode="dropdown"
        >
          {status.map((stat) => (
            <Picker.Item key={stat.id} label={stat.name} value={stat.id} style={styles.pickerItem}/>
          ))}
        </Picker>
      </View>

      <FlatList
        data={searchResults}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContentContainer}
        style={styles.flatListStyle}
        ListEmptyComponent={ 
          <Text style={styles.emptyListText}>Không tìm thấy nhà hàng phù hợp.</Text>
        }
      />
      <View style={styles.navContainer}>
        <NavAdmin nav={navigation} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: NAV_HEIGHT,
    backgroundColor: Colors.DEFAULT_WHITE,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: Display.setWidth(5),
    paddingTop: Display.setHeight(1.2),
    paddingBottom: NAV_HEIGHT,
  },
  header: {
    marginTop: Display.setHeight(5),
    textAlign: "center",
    color: Colors.DEFAULT_GREEN,
    fontWeight: "bold",
    fontSize: 24,
    marginBottom: Display.setHeight(1.8),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.GRAY_BORDER,
    borderRadius: 8,
    paddingHorizontal: Display.setWidth(2.5),
    backgroundColor: "#fafafa",
    marginBottom: Display.setHeight(1.5), 
  },
  textInput: {
    flex: 1,
    height: Display.setHeight(5.5),
    fontSize: 16,
    paddingVertical: Display.setHeight(0.6),
    color: Colors.DEFAULT_BLACK,
  },
  picker_container: { 
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.GRAY_BORDER,
    borderRadius: 8,
    backgroundColor: "#fafafa",
    marginBottom: Display.setHeight(2), 
    justifyContent: 'center', 
    height: Display.setHeight(6), 
  },
  picker: { 
    width: "100%",
    height: '100%', 
    color: Colors.SECONDARY_BLACK,
    backgroundColor: 'transparent', 
  },
  pickerItem: { 
    fontSize: 14,
    color: Colors.SECONDARY_BLACK,
  },
  flatListStyle: {
      flex: 1,
  },
  listContentContainer: {
      paddingBottom: Display.setHeight(2),
      gap: Display.setHeight(0.5),
  },
  listItemContainer: {
      paddingVertical: Display.setHeight(1.2),
      paddingHorizontal: Display.setWidth(2),
      backgroundColor: '#fff',
     
      gap: Display.setHeight(1),
  },
  divider: {
    height: 1,
    backgroundColor: Colors.LIGHT_GREY2,
  },
  itemNameText: {
      fontSize: 18,
      color: Colors.DEFAULT_GREEN,
      fontWeight: 'bold',
  },
  itemStatusRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: 'center',
  },
  itemStatusText: {
      fontSize: 16,
      flex: 1,
      marginRight: Display.setWidth(2),
  },
  detailsLinkText: {
      color: Colors.DEFAULT_GREEN,
      textDecorationLine: "underline",
      fontSize: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: Display.setWidth(2.5),
    justifyContent: "flex-end",
    marginTop: Display.setHeight(1.2),
  },
  button: {
    paddingHorizontal: Display.setWidth(5),
    paddingVertical: Display.setHeight(1.2),
    minHeight: Display.setHeight(5),
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 15,
  },
  deleteButton: {
      backgroundColor: Colors.DEFAULT_YELLOW,
  },
  confirmButton: {
      backgroundColor: Colors.DEFAULT_GREEN,
  },
  suspendButton: {
       backgroundColor: Colors.DEFAULT_YELLOW,
  },
  reactivateButton: {
      backgroundColor: Colors.DEFAULT_GREEN,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: Display.setHeight(5),
    fontSize: 16,
    color: Colors.DEFAULT_GREY,
  },
});