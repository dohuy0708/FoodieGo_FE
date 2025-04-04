import React from "react";
import { Color } from "../../constants";
import { View, Text, Image, StyleSheet,TouchableOpacity } from "react-native";
export default function DishDetail({ navigation, route }) {
  const { data } = route.params;
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/dish.png")}
        style={styles.image}
      />

      <View style={styles.information}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>{data.name}</Text>
        <Text style={{ fontSize: 16, color: "#000" }}>{data.description}</Text>
        <View style={{ flexDirection: "row", gap: 50 }}>
          <Text style={{ fontSize: 18, color: "#000" }}>{data.numSell}</Text>
          <Text
            style={{
              fontSize: 18,
              color: Color.DEFAULT_YELLOW,
              fontWeight: "bold",
            }}
          >
            {data.price}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 18,
            color: Color.DEFAULT_GREEN,
            fontWeight: "bold",
          }}
        >
          {data.status}
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: Color.DEFAULT_YELLOW },
          ]}
          onPress={() => navigation.navigate("HomeVendor")}
        >
          <Text style={{ color: "white" }}>Xóa món ăn</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button,{paddingHorizontal: 30}]}
         onPress={() => navigation.navigate("EditDish")} >
          <Text style={{ color: "white" }}>Chỉnh sửa</Text>
        </TouchableOpacity>
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
    aspectRatio: 16 / 9,
    borderRadius: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignSelf: "flex-end"
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Color.DEFAULT_GREEN,
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  information: {
    padding: 20,
    gap: 10,
  },
});
