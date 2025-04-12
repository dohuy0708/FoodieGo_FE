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
import { Color } from "../../constants";
import Feather from "@expo/vector-icons/Feather";
import DateTimePicker from "@react-native-community/datetimepicker";

const restaurant = [
  {
    id: 1,
    name: "Cháo ếch Singapore",
    content: "Ngon",
    user: "Nguyễn Văn A",
  },
  {
    id: 2,
    name: "Cháo gà Singapore",
    content: "Cháo gà ngon",
    user: "Nguyễn Văn B",
  },
  {
    id: 3,
    name: "Phở gà",
    content: "Phở gà ngon",
    user: "Nguyễn Văn C",
  },
  {
    id: 4,
    name: "Cơm tấm",
    content: "Cơm tấm ngon",
    user: "Nguyễn Văn D",
  },
  {
    id: 5,
    name: "Bánh mì",
    content: "Bánh mì ngon",
    user: "Nguyễn Văn E",
  },
  {
    id: 6,
    name: "Cháo ếch Singapore",
    content:
      "Ngon quá Ngon quá Ngon quá Ngon quá Ngon quá Ngon quá Ngon quá Ngon quá ",
    user: "Đỗ Nguyễn Hoàng Huy",
  },
];

export default function Comment() {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(restaurant);

  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    if (searchTerm === "") {
      setSearchResults(restaurant);
    } else {
      const filtered = restaurant.filter((item) => {
        const lowerCaseName = item.name.toLowerCase();

        const lowerCaseContent = item.content ? item.content.toLowerCase() : "";

        return (
          lowerCaseName.includes(lowerCaseSearchTerm) ||
          lowerCaseContent.includes(lowerCaseSearchTerm)
        );
      });
      setSearchResults(filtered);
    }
  }, [searchTerm]);

  const formatDate = (dateObj) => {
    if (!dateObj) return "";
    const day = dateObj.getDate().toString().padStart(2, "0");
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const onDateChange = (event, selected) => {
    setShowDatePicker(false);
    if (event.type === "set" && selected) {
      setSelectedDate(selected);
    }
  };

  const showMode = () => {
    setShowDatePicker(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Danh sách bình luận</Text>
      <View style={styles.dateSelector}>
        <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
        <TouchableOpacity onPress={showMode}>
          <Feather name="calendar" size={24} color={Color.SECONDARY_BLACK} />
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={selectedDate}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={onDateChange}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Tìm kiếm tên quán/bình luận..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor={Color.GRAY_BORDER}
        />
        <TouchableOpacity>
          <EvilIcons name="search" size={28} color={Color.SECONDARY_BLACK} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={searchResults}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={styles.divider} />
            <Text style={styles.itemName}>{item.name}</Text>
            <Text
              style={styles.itemContent}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.content}
            </Text>
            <View style={styles.itemFooter}>
              <Text style={styles.itemUser}>Bình luận bởi: {item.user}</Text>
            </View>
            <TouchableOpacity style={styles.detailsLink}>
              <Text style={styles.detailsLinkText}>Xem chi tiết</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyListText}>Không tìm thấy kết quả nào.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    marginTop: 40, // Hoặc sử dụng SafeAreaView
    textAlign: "center",
    color: Color.DEFAULT_GREEN,
    fontWeight: "bold",
    fontSize: 24,
    marginBottom: 15,
  },
  dateSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15, 
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Color.GRAY_BORDER,
    borderRadius: 8,
    backgroundColor: "#fafafa",
  },
  dateText: {
    fontSize: 16,
    color: Color.SECONDARY_BLACK,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Color.GRAY_BORDER,
    borderRadius: 8,
   
    paddingHorizontal: 10,
    backgroundColor: "#fafafa",
    marginBottom: 15, 
  },
  textInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    paddingVertical: 5,
    color: Color.SECONDARY_BLACK, 
  },
  divider: {
    height: 1,
    backgroundColor: Color.LIGHT_GREY2,
    marginBottom: 15,
  },
  
  listItem: {

    paddingVertical: 10, 
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Color.DEFAULT_GREEN,
    marginBottom: 5,
  },
  itemContent: {
    fontSize: 15,
    color: "#555",
    marginBottom: 8,
    lineHeight: 20, 
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  itemUser: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
  },
  detailsLink: {
    alignSelf: "flex-end",
    paddingVertical: 4,
  },
  detailsLinkText: {
    color: Color.DEFAULT_GREEN,
    textDecorationLine: "underline",
    fontSize: 14,
  },
  emptyListText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    color: "#999",
  },

});
