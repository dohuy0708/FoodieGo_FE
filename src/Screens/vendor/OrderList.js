import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from "react-native"; // Import Platform
import DateTimePicker from '@react-native-community/datetimepicker';
import { Color } from "../../constants";
import Feather from "@expo/vector-icons/Feather";
import Nav from "../../components/Nav";

export default function OrderList({ navigation }) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [orders, setOrders] = useState([

    {
      id: "DH1",
      customer: "Hoàng Huy",
      status: "Đang giao",
      date: "2025-04-10",
      price: "100.000đ",
      hour: 10,
      minute: 30,
    },
    {
      id: "DH2",
      customer: "Hoàng Huy",
      status: "Đã giao",
      date: "2025-04-10",
      price: "200.000đ",
      hour: 10,
      minute: 30,
    },
    {
      id: "DH3",
      customer: "Hoàng Huy",
      status: "Đang giao",
      date: "2025-04-11",
      price: "100.000đ",
      hour: 10,
      minute: 30,
    },
    {
      id: "DH4",
      customer: "Hoàng Huy",
      status: "Đã giao",
      date: "2025-04-09",
      price: "200.000đ",
      hour: 10,
      minute: 30,
    },
    
  ]);

 
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.date);
   
    return orderDate.getFullYear() === selectedDate.getFullYear() &&
           orderDate.getMonth() === selectedDate.getMonth() &&
           orderDate.getDate() === selectedDate.getDate();
  });


  const formatDate = (dateObj) => { 
    if (!dateObj) return '';
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); 
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const onDateChange = (event, selected) => {
   
    setShowDatePicker(Platform.OS === 'ios'); 

    if (selected) {
      setSelectedDate(selected);
    }
    
    if (Platform.OS === 'android') {
        setShowDatePicker(false);
    }
  };

  const renderItem = ({ item }) => {
    
    const itemDate = new Date(item.date);

    return (
      <View style={styles.orderItem}>
        <View style={styles.divider} />
        <View style={styles.viewText}>
          <Text>{item.id}</Text>
          <Text style={{ color: item.status === 'Đã giao' ? Color.DEFAULT_GREEN : Color.DEFAULT_ORANGE /* Example */, fontWeight: "bold" }}>{item.status}</Text>
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
        
          <Text>{formatDate(itemDate)}</Text>
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
      
      <View style={styles.headerContainer}>
         <Text style={styles.header}>Danh sách đơn hàng</Text>
         <View style={styles.dateSelector}>
           <Text style={{ fontSize: 16 }}>{formatDate(selectedDate)}</Text>
           <TouchableOpacity onPress={() => setShowDatePicker(true)}>
             <Feather name="calendar" size={24} color="black" />
           </TouchableOpacity>
         </View>
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
        data={filteredOrders} 
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        style={styles.listStyle} 
        contentContainerStyle={styles.listContentContainer} 
         ListEmptyComponent={<Text style={styles.emptyText}>Không có đơn hàng nào cho ngày này.</Text>} 
      />

     
      <View style={styles.navContainer}>
        <Nav nav={navigation} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
   
  },
   headerContainer: {
    paddingHorizontal: 15,
    paddingTop: 40, 
    paddingBottom: 10, 
    backgroundColor: '#fff', 
   
  },
  header: {
    textAlign: "center",
    color: Color.DEFAULT_GREEN,
    fontWeight: "bold",
    fontSize: 24, 
    marginBottom: 15, 
  },
  dateSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listStyle: {
     flex: 1, 
  },
  listContentContainer: {
    paddingHorizontal: 10, 
    paddingTop: 10,
    paddingBottom: 80, 
     gap: 0, 
  },
  orderItem: {
   
    paddingVertical: 15, 
    paddingHorizontal: 15, 
    backgroundColor: "#fff",
    gap: 10,
    marginBottom: 10, 
   
  },
  divider: {
    height: 1,
    backgroundColor: Color.GRAY_BORDER,
  },
  viewText: {
    flexDirection: "row",
    justifyContent: "space-between",
   
  },
   emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: Color.GRAY_DARK, 
  },
  navContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Color.DEFAULT_WHITE || '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    height: 60, 
  },
  
});