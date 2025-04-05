import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Color } from "../../constants";
import { useState } from "react";
export default function OrderDetail() {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const [order, setOrder] = useState({
    id: "DH1",
    customer: "Hoàng Huy",
    status: "Đang giao",
    date: "2023-10-01",
    price: "100.000đ",
    hour: 10,
    minute: 30,
    dishList: [
      {
        id: 1,
        name: "Cháo ếch Singapore",
        num: 3,
        price: "50.000đ",
      },
      {
        id: 2,
        name: "Cháo ếch om",
        num: 2,
        price: "45.000đ",
      },
      {
        id: 3,
        name: "Phở bò",
        num: 2,
        price: "60.000đ",
      },
      {
        id: 4,
        name: "Cháo ếch xào",
        num: 2,
        price: "40.000đ",
      },
      {
        id: 5,
        name: "Cháo ếch chiên",
        num: 2,
        price: "40.000đ",
      },
      {
        id: 6,
        name: "Phở bò",
        num: 2,
        price: "60.000đ",
      },
      {
        id: 7,
        name: "Cháo ếch xào",
        num: 2,
        price: "40.000đ",
      },
      {
        id: 8,
        name: "Cháo ếch chiên",
        num: 2,
        price: "40.000đ",
      },
    ],
  });
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chi tiết đơn hàng</Text>
      <View style={styles.itemorder}>
        <View style={styles.viewText}>
          <Text>Mã đơn hàng</Text>
          <Text style={{ fontWeight: "bold" }}>{order.id}</Text>
        </View>
        <View style={styles.viewText}>
          <Text>Người đặt</Text>
          <Text>{order.customer}</Text>
        </View>
        <View style={styles.viewText}>
          <Text>Tổng tiền</Text>
          <Text>{order.price}</Text>
        </View>
        <View style={styles.viewText}>
          <Text>Thời gian</Text>
          <Text>
            {order.hour}h{order.minute}p
          </Text>
        </View>
        <View style={styles.viewText}>
          <Text>Ngày</Text>
          <Text>{formatDate(order.date)}</Text>
        </View>
        <View style={styles.viewText}>
          <Text>Tình trạng</Text>
          <Text style={{ color: Color.DEFAULT_GREEN, fontWeight: "bold" }}>
            {order.status}
          </Text>
        </View>
      </View>
      <Text style={{ fontWeight: "bold", textAlign: "center", fontSize: 20 }}>
        Danh sách món ăn
      </Text>
      <View style={styles.listContainer}>
        <FlatList
          data={order.dishList}
          renderItem={({ item }) => (
            <View style={styles.itemorder}>
              <View style={styles.viewText}>
                <Text>{item.name}</Text>
                <Text style={{ color: Color.DEFAULT_GREEN }}>x {item.num} </Text>
              </View>
              <Text style={{ color: Color.DEFAULT_YELLOW }}>{item.price}</Text>
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContentContainer}
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: Color.DEFAULT_YELLOW, paddingHorizontal: 30 },
          ]}
          onPress={() => navigation.navigate("HomeVendor")}
        >
          <Text style={{ color: "white" }}>Hủy đơn</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: Color.DEFAULT_GREEN }]}
        >
          <Text style={{ color: "white" }}>Xác nhận</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 40,
    flex: 1,
    width: "100%",
    backgroundColor: "#fff",
    alignorders: "center",
    gap: 20,
  },
  header: {
    textAlign: "center",

    alignorders: "center",
    color: Color.DEFAULT_GREEN,
    fontWeight: "bold",
    fontSize: 30,
  },
  viewText: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  itemorder: {
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    gap: 10,
  },
  buttonContainer: {
   
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "white",

    justifyContent: "flex-end",
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
  listContainer: {
    flex: 1,
    width: '100%',
  },
});
