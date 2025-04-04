import React from "react";
import { Color } from "../../constants";
import { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Picker } from "@react-native-picker/picker";
import Dish from "../../components/Dish";
export default function HomeVendor({ navigation }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [category, setCategory] = useState([
    { id: 1, name: "Cháo ếch" },
    { id: 2, name: "Bánh mì" },
    { id: 3, name: "Phở" },
  ]);
  const [dishes, setDishes] = useState([
    {
      id: 1,
      name: "Cháo ếch Singapore",
      price: "50.000đ",
      status: "Đang bán",
      numSell: "1000",
    },
    {
      id: 2,
      name: "Cháo ếch om",
      price: "45.000đ",
      status: "Đang bán",
      numSell: "500",
    },
    {
      id: 3,
      name: "Cháo ếch xào",
      price: "60.000đ",
      status: "Đang bán",
      numSell: "200",
    },
    {
      id: 4,
      name: "Cháo ếch chiên",
      price: "40.000đ",
      status: "Đang bán",
      numSell: "300",
    },
    {
      id: 5,
      name: "Cháo ếch hấp",
      price: "55.000đ",
      status: "Đang bán",
      numSell: "800",
    },
    {
      id: 6,
      name: "Cháo ếch nướng",
      price: "70.000đ",
      status: "Đang bán",
      numSell: "600",
    },
    {
      id: 7,
      name: "Cháo ếch xào lăn",
      price: "80.000đ",
      status: "Đang bán",
      numSell: "400",
    },
  ]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const HeaderComponent = () => (
    <>
      <View style={{ gap: 10 }}>
        <View style={{ alignItems: "flex-end" }}>
          <TouchableOpacity
            style={styles.edit_button}
            onPress={() => navigation.navigate("EditVendor")}
          >
            <Text style={{ color: Color.DEFAULT_WHITE }}>
              Chỉnh sửa thông tin
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.name_vendor}>Cháo ếch Singapore</Text>

        <View style={styles.evaluation}>
          <View style={styles.evaluation}>
            <View style={styles.evaluation}>
              <FontAwesome name="star" size={24} color={Color.DEFAULT_YELLOW} />
              <FontAwesome name="star" size={24} color={Color.DEFAULT_YELLOW} />
              <FontAwesome name="star" size={24} color={Color.DEFAULT_YELLOW} />
              <FontAwesome name="star" size={24} color={Color.DEFAULT_YELLOW} />
              <Text>(4.0)</Text>
            </View>
            <Text>(300 Bình luận)</Text>
          </View>
        </View>
        <Text>Cháo ếch ngon nhất, rẻ nhất</Text>
        <Text>VQCX+Q8M, Phường Linh Trung, Thủ Đức, Hồ Chí Minh</Text>
        <Text>Mở cửa: 6h30 am - 21h30 pm</Text>
        <View style={{ alignItems: "flex-end" }}>
          <TouchableOpacity
            style={styles.edit_button}
            onPress={() => navigation.navigate("EditCategory")}
          >
            <Text style={{ color: Color.DEFAULT_WHITE }}>
              Chỉnh sửa danh mục
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.picker_container}>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
            style={styles.picker}
          >
            <Picker.Item
              label="Danh mục món ăn"
              style={{ fontSize: 14 }}
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
        <View style={{ alignItems: "flex-end" }}>
          <TouchableOpacity
            style={styles.edit_button}
            onPress={() => navigation.navigate("EditVendor")}
          >
            <Text style={{ color: Color.DEFAULT_WHITE }}>Chỉnh sửa món ăn</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/store.png")}
        style={styles.image}
      />
      <View style={styles.view_information}>
        <FlatList
          ListHeaderComponent={HeaderComponent}
          data={dishes}
          renderItem={({ item }) => (
            <View style={styles.dishContainer}>
              <Dish data={item} />
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContentContainer}
        />
      </View>
    </View>
  );
}
const styles = {
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#fff",
    position: "relative",
  },
  name_vendor: {
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "center",
  },
  image: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 10,
  },

  evaluation: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  edit_button: {
    backgroundColor: Color.DEFAULT_YELLOW,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  picker_container: {
    width: "100%",
    borderWidth: 1,
    borderColor: Color.GRAY_BORDER,
    borderRadius: 10,
    overflow: "hidden",
  },

  picker: {
    height: 50,
    width: "100%",
    color: Color.SECONDARY_BLACK,
  },
  view_information: {
    flex: 1,
    width: "100%",
    height: "72%",
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    position: "absolute",
    top: "28%",
    left: 0,
    right: 0,
    elevation: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  listContentContainer: {
    paddingVertical: 20,
    gap: 10,
  },
};
