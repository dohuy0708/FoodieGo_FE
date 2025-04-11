import { React, useState, useEffect } from "react"; 
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { Color } from "../../constants"; 
import { Picker } from "@react-native-picker/picker";

const category = [
  { id: 1, name: "Cháo ếch" },
  { id: 2, name: "Bánh mì" },
  { id: 3, name: "Phở" },
];

const restaurant = [
  {
    id: 1,
    name: "Cháo ếch Singapore",
    status: "Đã xác nhận ",
  },
  {
    id: 2,
    name: "Cháo gà Singapore",
    status: "Chờ xác nhận ",
  },
  {
    id: 3,
    name: "Phở gà",
    status: "Đình chỉ ",
  },
  {
    id: 4,
    name: "Cơm tấm",
    status: "Chờ xác nhận ",
  },
  {
    id: 5,
    name: "Bánh mì",
    status: "Đã xác nhận ",
  },
  {
    id: 6,
    name: "Cháo ếch Singapore",
    status: "Đã xác nhận ",
  },
];

export default function ListVendor() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(restaurant);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    if (searchTerm === "") {
      setSearchResults(restaurant);
    } else {
      const filtered = restaurant.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filtered);
    }
  }, [searchTerm]);

  useEffect(() => {
    let filteredData = restaurant;

    if (selectedCategory) {
      filteredData = filteredData.filter(
        (item) => item.categoryId === selectedCategory
      );

      const categoryName = category.find(
        (c) => c.id === selectedCategory
      )?.name;
      if (categoryName) {
        filteredData = filteredData.filter((item) =>
          item.name.toLowerCase().includes(categoryName.toLowerCase())
        );
      }
    }

    if (searchTerm !== "") {
      filteredData = filteredData.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setSearchResults(filteredData);
  }, [searchTerm, selectedCategory]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Danh sách nhà hàng</Text>
      <View style={styles.picker_container}>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          style={styles.picker}
          mode="dropdown"
        >
          <Picker.Item
            label="-- Loại cửa hàng --"
            style={{ fontSize: 14, color: Color.GRAY_BORDER }}
            value={null}
          />
          {category.map((item) => (
            <Picker.Item
              key={item.id}
              label={item.name}
              value={item.id}
              style={{ fontSize: 14 }}
            />
          ))}
        </Picker>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Tìm kiếm cửa hàng"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />

        <TouchableOpacity>
          <EvilIcons name="search" size={28} color="black" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={searchResults}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 10,
              marginVertical: 5,
            }}
          >
            <View style={styles.divider} />
            <Text style={{ fontSize: 18, color: Color.DEFAULT_GREEN }}>
              {item.name}
            </Text>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={{ fontSize: 16 }}>{item.status}</Text>
              <TouchableOpacity>
                <Text
                  style={{
                    color: Color.DEFAULT_GREEN,
                    textDecorationLine: "underline",
                  }}
                >
                  Xem chi tiết
                </Text>
              </TouchableOpacity>
            </View>
            {item.status.trim() === "Chờ xác nhận" && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    {
                      backgroundColor: Color.DEFAULT_YELLOW,
                      paddingHorizontal: 40,
                    },
                  ]}
                >
                  <Text style={styles.buttonText}>Xóa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    { backgroundColor: Color.DEFAULT_GREEN },
                  ]}
                >
                  <Text style={styles.buttonText}>Xác nhận</Text>
                </TouchableOpacity>
              </View>
            )}
            {item.status.trim() === "Đã xác nhận" && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    {
                      backgroundColor: Color.DEFAULT_YELLOW,
                    },
                  ]}
                >
                  <Text style={styles.buttonText}>Đình chỉ</Text>
                </TouchableOpacity>
              </View>
            )}
            {item.status.trim() === "Đình chỉ" && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    { backgroundColor: Color.DEFAULT_GREEN },
                  ]}
                >
                  <Text style={styles.buttonText}>Xác nhận</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
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
    marginTop: 40,
    textAlign: "center",
    color: Color.DEFAULT_GREEN,
    fontWeight: "bold",
    fontSize: 24,
    marginBottom: 15,
  },
  picker_container: {
    width: "100%",
    borderWidth: 1,
    borderColor: Color.GRAY_BORDER || "#ccc",
    borderRadius: 8,

    marginTop: 15,
    backgroundColor: "#fafafa",

    justifyContent: "center",
  },
  picker: {
    height: 50,
    width: "100%",
    color: Color.SECONDARY_BLACK || "#333",
    backgroundColor: "transparent",
  },
  divider: {
    height: 1,
    backgroundColor: Color.LIGHT_GREY2,
    marginBottom: 10,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: 10,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,

    minHeight: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Color.GRAY_BORDER || "#ccc",
    borderRadius: 8,
    marginTop: 20,
    paddingHorizontal: 10,
    backgroundColor: "#fafafa",
  },
  textInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    paddingVertical: 5,
  },
});
