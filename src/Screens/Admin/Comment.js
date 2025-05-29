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
import  Colors  from "../../constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import DateTimePicker from "@react-native-community/datetimepicker";
import NavAdmin from "../../components/NavAdmin";
import Display from "../../utils/Display";

const NAV_HEIGHT = Display.setHeight(8);
const restaurant = [
  { id: 1, name: "Cháo ếch Singapore", content: "Ngon", user: "Nguyễn Văn A" },
  { id: 2, name: "Cháo gà Singapore", content: "Cháo gà ngon", user: "Nguyễn Văn B" },
  { id: 3, name: "Phở gà", content: "Phở gà ngon", user: "Nguyễn Văn C" },
  { id: 4, name: "Cơm tấm", content: "Cơm tấm ngon", user: "Nguyễn Văn D" },
  { id: 5, name: "Bánh mì", content: "Bánh mì ngon", user: "Nguyễn Văn E" },
  { id: 6, name: "Cháo ếch Singapore", content: "Ngon quá Ngon quá Ngon quá Ngon quá Ngon quá Ngon quá Ngon quá Ngon quá ", user: "Đỗ Nguyễn Hoàng Huy" },
];

export default function Comment({ navigation }) {
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
    const currentDate = selected || selectedDate;
    setShowDatePicker(Platform.OS === 'ios');
    if (event.type === "set") {
         setSelectedDate(currentDate);
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
          <Feather name="calendar" size={24} color={Colors.SECONDARY_BLACK} />
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
          placeholderTextColor={Colors.GRAY_BORDER}
        />
        <TouchableOpacity>
          <EvilIcons name="search" size={28} color={Colors.SECONDARY_BLACK} />
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
              <TouchableOpacity style={styles.detailsLink}>
                <Text style={styles.detailsLinkText}>Xem chi tiết</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Display.setHeight(2) }}
        ListEmptyComponent={
          <Text style={styles.emptyListText}>Không tìm thấy kết quả nào.</Text>
        }
        style={styles.flatListStyle}
      />
      <View style={styles.navContainer}><NavAdmin nav={navigation} /></View>
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
  dateSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Display.setHeight(1.8),
    paddingVertical: Display.setHeight(1),
    paddingHorizontal: Display.setWidth(3),
    borderWidth: 1,
    borderColor: Colors.GRAY_BORDER,
    borderRadius: 8,
    backgroundColor: "#fafafa",
  },
  dateText: {
    fontSize: 16,
    color: Colors.SECONDARY_BLACK,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.GRAY_BORDER,
    borderRadius: 8,
    paddingHorizontal: Display.setWidth(2.5),
    backgroundColor: "#fafafa",
    marginBottom: Display.setHeight(1.8),
  },
  textInput: {
    flex: 1,
    height: Display.setHeight(5.5),
    fontSize: 16,
    paddingVertical: Display.setHeight(0.6),
    color: Colors.SECONDARY_BLACK,
  },
  flatListStyle: {
      flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.LIGHT_GREY2,
    marginBottom: Display.setHeight(1.8),
  },
  listItem: {
    paddingVertical: Display.setHeight(1.2),
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.DEFAULT_GREEN,
    marginBottom: Display.setHeight(0.6),
  },
  itemContent: {
    fontSize: 15,
    color: "#555",
    marginBottom: Display.setHeight(1),
    lineHeight: Display.setHeight(2.5),
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Display.setHeight(0.6),
  },
  itemUser: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
    flex: 1,
    marginRight: Display.setWidth(2),
  },
  detailsLink: {
    paddingVertical: Display.setHeight(0.5),
  },
  detailsLinkText: {
    color: Colors.DEFAULT_GREEN,
    textDecorationLine: "underline",
    fontSize: 14,
  },
  emptyListText: {
    textAlign: "center",
    marginTop: Display.setHeight(3.7),
    fontSize: 16,
    color: "#999",
  },
});