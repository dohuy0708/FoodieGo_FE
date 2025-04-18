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
import Display from "../../utils/Display"; 

export default function OrderDetail({ navigation }) { 
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const order = {
    id: "DH1",
    customer: "Hoàng Huy",
    status: "Đang giao",
    date: "2023-10-01",
    price: "100.000đ",
    hour: 10,
    minute: 30,
    dishList: [
      { id: 1, name: "Cháo ếch Singapore", num: 3, price: "50.000đ" },
      { id: 2, name: "Cháo ếch om", num: 2, price: "45.000đ" },
      { id: 3, name: "Phở bò", num: 2, price: "60.000đ" },
      { id: 4, name: "Cháo ếch xào", num: 2, price: "40.000đ" },
      { id: 5, name: "Cháo ếch chiên", num: 2, price: "40.000đ" },
      { id: 6, name: "Phở bò", num: 2, price: "60.000đ" },
      { id: 7, name: "Cháo ếch xào", num: 2, price: "40.000đ" },
      { id: 8, name: "Cháo ếch chiên", num: 2, price: "40.000đ" },
    ],
  };

  const renderDishItem = ({ item }) => ( 
    <View style={styles.dishItem}>
      <View style={styles.viewText}>
        <Text style={styles.dishNameText}>{item.name}</Text>
        <Text style={styles.dishQuantityText}>x {item.num}</Text>
      </View>
      <Text style={styles.dishPriceText}>{item.price}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chi tiết đơn hàng</Text>

     
      <View style={styles.orderInfoContainer}>
        <View style={styles.viewText}>
          <Text style={styles.infoLabel}>Mã đơn hàng</Text>
          <Text style={[styles.infoValue, { fontWeight: "bold" }]}>{order.id}</Text>
        </View>
        <View style={styles.viewText}>
          <Text style={styles.infoLabel}>Người đặt</Text>
          <Text style={styles.infoValue}>{order.customer}</Text>
        </View>
        <View style={styles.viewText}>
          <Text style={styles.infoLabel}>Tổng tiền</Text>
          <Text style={styles.infoValue}>{order.price}</Text>
        </View>
        <View style={styles.viewText}>
          <Text style={styles.infoLabel}>Thời gian</Text>
          <Text style={styles.infoValue}>
            {order.hour}h{order.minute}p
          </Text>
        </View>
        <View style={styles.viewText}>
          <Text style={styles.infoLabel}>Ngày</Text>
          <Text style={styles.infoValue}>{formatDate(order.date)}</Text>
        </View>
        <View style={styles.viewText}>
          <Text style={styles.infoLabel}>Tình trạng</Text>
          <Text style={[styles.infoValue, { color: Color.DEFAULT_GREEN, fontWeight: "bold" }]}>
            {order.status}
          </Text>
        </View>
      </View>

      <Text style={styles.listHeader}>
        Danh sách món ăn
      </Text>

     
      <View style={styles.listContainer}>
        <FlatList
          data={order.dishList}
          renderItem={renderDishItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContentContainer} 
        />
      </View>

      
      {order.status==="Chờ xác nhận"&&(<View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.cancelButton, 
            
          ]}
          onPress={() => {
            console.log("Cancel order:", order.id);
          
            navigation.goBack(); 
          }}
        >
          <Text style={styles.buttonText}>Hủy đơn</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.confirmButton]} 
          onPress={() => {
            console.log("Confirm order:", order.id);
          
            navigation.goBack(); 
          }}
        >
          <Text style={styles.buttonText}>Xác nhận</Text>
        </TouchableOpacity>
      </View>)}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Display.setWidth(2.5), 
    paddingTop: Display.setHeight(5), 
   
    flex: 1,
    width: "100%",
    backgroundColor: "#fff",
   
    gap: Display.setHeight(2.5), 
  },
  header: {
    textAlign: "center",
    color: Color.DEFAULT_GREEN,
    fontWeight: "bold",
    fontSize: 28,
    width: '100%', 
  },
  orderInfoContainer: {
    width: "100%",
    paddingVertical: Display.setHeight(1.2), 
    paddingHorizontal: Display.setWidth(5), 
    
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Color.LIGHT_GREY2,
    gap: Display.setHeight(1.2), 
  },
  viewText: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: 'center', 
  },
  infoLabel: {
    fontSize: 16, 
    color: Color.DEFAULT_BLACK,
  },
  infoValue: {
    fontSize: 16,
    color: Color.SECONDARY_BLACK,
    textAlign: 'right',
  },
  listHeader: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 20, 
    color: Color.DEFAULT_BLACK, 
    width: '100%', 
   
  },
  listContainer: {
    flex: 1, 
    width: '100%',
    borderWidth: 1,
    borderColor: Color.LIGHT_GREY2,
    borderRadius: 8,
    marginBottom: Display.setHeight(2.5),
  },
  listContentContainer: {
    paddingHorizontal: Display.setWidth(3), 
    paddingVertical: Display.setHeight(1.5),
    gap: Display.setHeight(1.5), 
  },
  dishItem: { 
    width: "100%",
    paddingVertical: Display.setHeight(1), 
    paddingHorizontal: Display.setWidth(2), 
    backgroundColor: "#fff",
    borderRadius: 6,
   
  },
  dishNameText: {
    fontSize: 15,
    color: Color.DEFAULT_BLACK,
    flex: 1, 
  },
  dishQuantityText: {
    fontSize: 15,
    color: Color.DEFAULT_GREEN,
    fontWeight: 'bold',
    marginLeft: Display.setWidth(2), 
  },
  dishPriceText: {
    fontSize: 15,
    color: Color.DEFAULT_ORANGE, 
    marginTop: Display.setHeight(0.5), 
    alignSelf: 'flex-end', 
  },
  buttonContainer: {
    flexDirection: "row",
    gap: Display.setWidth(2.5), 
    paddingHorizontal: Display.setWidth(5), 
    paddingVertical: Display.setHeight(2), 
    backgroundColor: "white", 
    justifyContent: "flex-end",
    borderTopWidth: 1, 
    borderTopColor: Color.LIGHT_GREY2,
    width: '100%', 
    alignSelf: 'center', 
  },
  button: {
    paddingHorizontal: Display.setWidth(5),
    paddingVertical: Display.setHeight(1.2), 
   
    height: Display.setHeight(6), 
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minWidth: Display.setWidth(25), 
  },
  buttonText: {
    color: "white",
    fontSize: 16, 
    fontWeight: '500',
  },
  cancelButton: {
      backgroundColor: Color.DEFAULT_YELLOW,
      paddingHorizontal: Display.setWidth(7.5), 
  },
  confirmButton: {
      backgroundColor: Color.DEFAULT_GREEN,
      paddingHorizontal: Display.setWidth(7.5), 
  },
});