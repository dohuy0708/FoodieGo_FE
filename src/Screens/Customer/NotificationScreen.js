import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import Colors from "../../constants/Colors";
import { useState } from "react";
import Nav from "../../components/Nav";
import Display from "../../utils/Display";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NAV_COMPONENT_HEIGHT = Display.setHeight(7);

export default function Notification({ navigation }) {
  const insets = useSafeAreaInsets();
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
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.orderItem}>
        <View style={styles.divider} />
        <View>
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>{item.id}</Text>
        </View>
        <View style={styles.viewText}>
          <Text style={styles.textStyle}>Tổng tiền</Text>
          <Text style={styles.textStyle}>{item.price}</Text>
        </View>
        <View style={styles.viewText}>
          <Text style={styles.textStyle}>Thời gian</Text>
          <Text style={styles.textStyle}>
            {item.hour}h{item.minute}p
          </Text>
        </View>
        <View style={styles.viewText}>
          <Text style={styles.textStyle}>Ngày</Text>
          <Text style={styles.textStyle}>{formatDate(item.date)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Thông báo</Text>

      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        style={styles.flatListStyle}
        contentContainerStyle={[
          styles.listContentContainer,
          { paddingBottom: NAV_COMPONENT_HEIGHT + Display.setHeight(2) },
        ]}
      />

      <View style={[styles.navContainer, { bottom: insets.bottom }]}>
        <Nav nav={navigation} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    height: NAV_COMPONENT_HEIGHT,
    backgroundColor: Colors.DEFAULT_WHITE || "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    zIndex: 10,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: Colors.LIGHT_GREY2,
  },
  container: {
    paddingHorizontal: Display.setWidth(3),
    paddingTop: Display.setHeight(5),
    paddingBottom: NAV_COMPONENT_HEIGHT,
    flex: 1,
    width: "100%",
    backgroundColor: "#fff",
    alignItems: "center",
    gap: Display.setHeight(2.5),
  },
  header: {
    textAlign: "center",
    color: Colors.DEFAULT_GREEN,
    fontWeight: "bold",
    fontSize: 28,
    width: "100%",
  },
  flatListStyle: {
    width: "100%",
  },
  listContentContainer: {
    gap: Display.setHeight(1.2),
  },
  orderItem: {
    width: "100%",
    paddingVertical: Display.setHeight(1.2),
    paddingHorizontal: Display.setWidth(5),
    backgroundColor: "#fff",

    gap: Display.setHeight(1.2),
  },
  viewText: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  textStyle: {
    fontSize: 15,
    color: Colors.DEFAULT_BLACK,
  },
  button: {
    backgroundColor: Colors.DEFAULT_GREEN,
    paddingVertical: Display.setHeight(1.2),
    paddingHorizontal: Display.setWidth(5),
    borderRadius: 5,
    alignSelf: "flex-end",
    marginTop: Display.setHeight(0.5),
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
});
