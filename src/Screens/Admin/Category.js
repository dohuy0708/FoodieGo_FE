import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Color } from "../../constants";
export default function Category() {
  const category = [
    { id: 1, name: "Cháo ếch", num: 1000 },
    { id: 2, name: "Bánh mì", num: 500 },
    { id: 3, name: "Phở", num: 200 },
    { id: 4, name: "Cơm tấm", num: 300 },
    { id: 5, name: "Bún bò", num: 800 },
    { id: 6, name: "Mì Quảng", num: 600 },
    { id: 7, name: "Hủ tiếu", num: 400 },
  ];
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Loại nhà hàng</Text>
      <TouchableOpacity
        style={{
          alignSelf: "flex-end",
          marginRight: 10,
          paddingHorizontal: 20,
          width: "fix-content",
          backgroundColor: Color.DEFAULT_GREEN,
          paddingVertical: 10,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: Color.DEFAULT_WHITE }}>Thêm loại</Text>
      </TouchableOpacity>
      <FlatList
        data={category}
        renderItem={({ item }) => (
          <View>
            <View style={styles.divider} />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                padding: 10,
                gap: 10,
              }}
            >
              <Text style={{ fontSize: 18, color: Color.DEFAULT_GREEN }}>
                Tên loại
              </Text>
              <Text style={{ fontSize: 18 }}>{item.name}</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                padding: 10,
              }}
            >
              <Text style={{ fontSize: 18, color: Color.DEFAULT_GREEN }}>
                Số cửa hàng
              </Text>
              <Text style={{ fontSize: 18 }}>{item.num}</Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: Color.DEFAULT_YELLOW,
                    paddingHorizontal: 30,
                  },
                ]}
                
              >
                <Text style={{ color: "white" }}>Xóa loại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: Color.DEFAULT_GREEN },
                ]}
              >
                <Text style={{ color: "white" }}>Chỉnh sửa</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        style={{ paddingHorizontal: 10 }}
      ></FlatList>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    marginTop: 40,
    textAlign: "center",
    color: Color.DEFAULT_GREEN,
    fontWeight: "bold",
    fontSize: 24,
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: Color.DEFAULT_GREY,
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
    marginVertical: 20,
  },
 
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Color.DEFAULT_YELLOW,
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
