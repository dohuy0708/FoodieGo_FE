import React from "react";
import { useState, useEffect } from "react";
import { Color } from "../../constants";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
export default function EditCategory() {
  const renderItem = ({ item }) => (
    <View style={styles.categoryItem}>
      <Text style={styles.categoryText}>{item.name}</Text>
      <View style={{ flexDirection: "row", gap: 20 }}>
        <Feather name="edit-2" size={24} color="black" />
        <Ionicons name="remove-circle-outline" size={24} color="black" />
      </View>
    </View>
  );
  const [categoryName, setCategoryName] = useState([
    {
      id: 1,
      name: "Cháo ếch Singapore",
    },
    {
      id: 2,
      name: "Bánh mì",
    },
    {
      id: 3,
      name: "Phở",
    },
    {
      id: 4,
      name: "Tráng miệng",
    },
  ]);
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chỉnh sửa danh mục</Text>
      <TouchableOpacity
        style={styles.edit_button}
        onPress={() => navigation.navigate("EditCategory")}
      >
        <Text style={{ color: Color.DEFAULT_WHITE }}>Thêm danh mục</Text>
      </TouchableOpacity>
      <FlatList
        data={categoryName}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 50,
    flex: 1,
    width: "100%",
    backgroundColor: "#fff",
    alignItems: "center",
    gap: 20,
  },
  edit_button: {
    backgroundColor: Color.DEFAULT_GREEN,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: "flex-end",
    marginTop: 10,
    marginRight: 10,
  },
  header: {
    textAlign: "center",

    alignItems: "center",
    color: Color.DEFAULT_GREEN,
    fontWeight: "bold",
    fontSize: 25,
  },
  listContainer: {
    width: "100%",
    paddingHorizontal: 10,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    marginBottom: 10,
    width: "100%",
  },
  categoryText: {
    fontSize: 16,
  },
});
