import React from "react";
import { View, Text, StyleSheet, FlatList,TouchableOpacity } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Color } from "../../constants";
import Feather from "@expo/vector-icons/Feather";
import { useState } from "react";
export default function OrderList({navigation }) {
    const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [orders, setOrders] = useState([
    {
      id: "DH1",
      customer: "Hoàng Huy",
      status: "Đang giao",
      date: "2023-10-01",
      price: "100.000đ",
      hour: 10,
      minute: 30,
    },

    {
      id: "DH2",
      customer: "Hoàng Huy",
      status: "Đã giao",
      date: "2023-10-02",
      price: "200.000đ",
      hour: 10,
      minute: 30,
    },
    {
      id: "DH3",
      customer: "Hoàng Huy",
      status: "Đang giao",
      date: "2023-10-03",
      price: "300.000đ",
      hour: 10,
      minute: 30,
    },
    {
      id: "DH4",
      customer: "Hoàng Huy",
      status: "Đã giao",
      date: "2023-10-04",
      price: "400.000đ",
      hour: 10,
      minute: 30,
    },
    {
      id: "DH5",
      customer: "Hoàng Huy",
      status: "Đang giao",
      date: "2023-10-05",
      price: "500.000đ",
      hour: 10,
      minute: 30,
    },
    {
      id: "DH6",
      customer: "Hoàng Huy",
      status: "Đang giao",
      date: "2023-10-01",
      price: "100.000đ",
      hour: 10,
      minute: 30,
    },
    {
      id: "DH7",
      customer: "Hoàng Huy",
      status: "Đã giao",
      date: "2023-10-02",
      price: "200.000đ",
      hour: 10,
      minute: 30,
    },
  ]);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const onDateChange = (event, selected) => {
    setShowDatePicker(false);
    if (selected) {
      setSelectedDate(selected);
     
    }
  };
  const renderItem = ({ item }) => {
    return (
      <View style={styles.orderItem}>
        <View style={styles.divider} />
        <View style={styles.viewText}>
          <Text>{item.id}</Text>
          <Text style={{ color:Color.DEFAULT_GREEN,fontWeight:"bold" }}>{item.status}</Text>
        </View>
        <View style={styles.viewText}>
          <Text>Người đặt</Text>
          <Text>{item.customer}</Text>
        </View>
        <View style={styles.viewText}>
          <Text>Tổng tiền</Text>
          <Text>{item.price}</Text>
        </View>
        <View style={styles.viewText}>
          <Text>Thời gian</Text>
          <Text>
            {item.hour}h{item.minute}p
          </Text>
        </View>
        <View style={styles.viewText}>
          <Text>Ngày</Text>
          <Text>{formatDate(item.date)}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })}>
          <Text
            style={{
              color: Color.DEFAULT_GREEN,
              textDecorationLine: "underline",
              textAlign: "right",
            }}
          >
            Xem chi tiết
          </Text>
        </TouchableOpacity >
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Danh sách đơn hàng</Text>
      <View style={{ width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 15 }}>
        <Text style={{ fontSize:16 }}>{formatDate(selectedDate)}</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}  >
          <Feather
            name="calendar"
            size={24}
            color="black"
           
          />
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        style={{ width: "100%" }}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: Color.GRAY_BORDER, 
  },
  container: {
    paddingHorizontal: 10,
    paddingVertical: 40,
    flex: 1,
    width: "100%",
    backgroundColor: "#fff",
    alignItems: "center",
    gap: 20,
  },
  header: {
    textAlign: "center",

    alignItems: "center",
    color: Color.DEFAULT_GREEN,
    fontWeight: "bold",
    fontSize: 30,
  },
  viewText: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  orderItem: {
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    gap: 10,
  },
  listContentContainer: {
    paddingVertical: 20,
    gap: 10,
  },
});
