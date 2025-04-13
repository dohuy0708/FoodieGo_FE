import React from "react";
import { Color } from "../../constants";
import { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Picker } from "@react-native-picker/picker";
import Dish from "../../components/Dish";
import Nav from "../../components/Nav";

const NAV_HEIGHT = 60;
const IMAGE_ASPECT_RATIO = 16 / 9;
const IMAGE_HEIGHT = Dimensions.get("window").width / IMAGE_ASPECT_RATIO;

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
      description: "...",
    },
    {
      id: 2,
      name: "Cháo ếch om",
      price: "45.000đ",
      status: "Đang bán",
      numSell: "500",
      description: "...",
    },
    {
      id: 3,
      name: "Cháo ếch xào",
      price: "60.000đ",
      status: "Đang bán",
      numSell: "200",
      description: "...",
    },
    {
      id: 4,
      name: "Cháo ếch chiên",
      price: "40.000đ",
      status: "Đang bán",
      numSell: "300",
      description: "...",
    },
    {
      id: 5,
      name: "Cháo ếch hấp",
      price: "55.000đ",
      status: "Đang bán",
      numSell: "800",
      description: "...",
    },
    {
      id: 6,
      name: "Cháo ếch nướng",
      price: "70.000đ",
      status: "Đang bán",
      numSell: "600",
      description: "...",
    },
    {
      id: 7,
      name: "Cháo ếch xào lăn",
      price: "80.000đ",
      status: "Đang bán",
      numSell: "400",
      description: "...",
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
          <View style={styles.ratingStars}>
            <FontAwesome name="star" size={20} color={Color.DEFAULT_YELLOW} />
            <FontAwesome name="star" size={20} color={Color.DEFAULT_YELLOW} />
            <FontAwesome name="star" size={20} color={Color.DEFAULT_YELLOW} />
            <FontAwesome name="star" size={20} color={Color.DEFAULT_YELLOW} />
            <FontAwesome name="star-o" size={20} color={Color.DEFAULT_YELLOW} />
            <Text style={styles.ratingText}>(4.0)</Text>
          </View>
          <Text style={styles.reviewCount}>(300 Bình luận)</Text>
        </View>
        <Text style={styles.descriptionText}>Cháo ếch ngon nhất, rẻ nhất</Text>
        <Text style={styles.addressText}>
          VQCX+Q8M, Phường Linh Trung, Thủ Đức, Hồ Chí Minh
        </Text>
        <Text style={styles.openingHoursText}>Mở cửa: 6h30 am - 21h30 pm</Text>
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
            mode="dropdown"
          >
            <Picker.Item
              label="-- Chọn danh mục --"
              style={{ fontSize: 14, color: Color.GRAY_BORDER }}
              value={null}
              enabled={false}
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
            style={styles.addDishButton}
            onPress={() => navigation.navigate("AddDish")}
          >
            <Text style={{ color: Color.DEFAULT_WHITE }}>Thêm món ăn mới</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <Image
        source={
          selectedImage
            ? { uri: selectedImage.uri }
            : require("../../assets/images/store.png")
        }
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.view_information}>
        <FlatList
          ListHeaderComponent={HeaderComponent}
          data={dishes}
          renderItem={({ item }) => (
            <Dish data={item} navigation={navigation} />
          )}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContentContainer,
            { paddingBottom: NAV_HEIGHT + 10 },
          ]}
        />
      </View>

      <View style={styles.navContainer}>
        <Nav nav={navigation} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: IMAGE_HEIGHT,
  },
  view_information: {
    width: "100%",
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: "absolute",

    top: IMAGE_HEIGHT - 20,
    left: 0,
    right: 0,
    bottom: 0,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  listContentContainer: {
    paddingTop: 20,
    gap: 15,
  },

  name_vendor: {
    fontWeight: "bold",
    fontSize: 22,
    textAlign: "center",
    color: "#333",
    marginTop: 10,
  },
  evaluation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
    marginTop: 8,
    marginBottom: 8,
  },
  ratingStars: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#555",
  },
  reviewCount: {
    fontSize: 14,
    color: "#555",
  },
  descriptionText: {
    fontSize: 15,
    color: "#444",
    textAlign: "center",
    marginTop: 5,
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
  },
  openingHoursText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 5,
    marginBottom: 15,
  },
  edit_button: {
    backgroundColor: Color.DEFAULT_GREEN,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    alignSelf: "flex-end",
  },
  addDishButton: {
    backgroundColor: Color.DEFAULT_ORANGE || "#FFA500",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    alignSelf: "flex-end",
    marginTop: 15,
  },
  picker_container: {
    width: "100%",
    borderWidth: 1,
    borderColor: Color.GRAY_BORDER || "#ccc",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 15,
    backgroundColor: "#fafafa",
  },
  picker: {
    height: 50,
    width: "100%",
    color: Color.SECONDARY_BLACK || "#333",
    backgroundColor: "transparent",
  },
  navContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: NAV_HEIGHT,
    backgroundColor: Color.DEFAULT_WHITE || "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
});
