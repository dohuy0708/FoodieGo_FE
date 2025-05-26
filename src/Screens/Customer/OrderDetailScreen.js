import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "../../components";
import { SafeAreaView } from "react-native-safe-area-context";

const OrderDetailScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Header
          title="Xác nhận đơn hàng"
          onBackPress={() => navigation.goBack()}
        />

        {/* Địa chỉ và thông tin người nhận */}
        <View style={styles.AddressSection}>
          <View style={styles.row}>
            <Ionicons name="location-outline" size={20} color="#333" />
            <Text style={styles.addressText}>
              KTX khu A, Phường Đông Hòa, Dĩ An, Bình Dương
            </Text>
            <Text style={styles.editText}>Chỉnh sửa</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="person-outline" size={20} color="#333" />
            <Text style={styles.text}>Hoàng Huy | 0654428222</Text>
          </View>
        </View>

        {/* Chi tiết món */}
        <View style={styles.section}>
          <Text style={styles.shopTitle}>Bún đậu Akiso - Làng Đại học</Text>

          <View style={styles.itemRow}>
            {/* <Image source={require("./bun1.png")} style={styles.image} /> */}
            <View style={styles.itemDetail}>
              <Text style={styles.quantity}>
                2 x Bún đậu đặc biệt (1 người)
              </Text>
              <Text style={styles.price}>96.000 đ</Text>
            </View>
          </View>

          <View style={styles.itemRow}>
            {/* <Image source={require("./bun2.png")} style={styles.image} /> */}
            <View style={styles.itemDetail}>
              <Text style={styles.quantity}>1 x Bún đậu chả cốm</Text>
              <Text style={styles.price}>45.000 đ</Text>
            </View>
          </View>

          <Text style={styles.viewMore}>Xem thêm</Text>
        </View>

        {/* Thanh toán */}
        <View style={styles.section}>
          <Text style={styles.paymentTitle}>Chi tiết thanh toán</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.text}>Tổng giá món</Text>
            <Text style={styles.text}>141.000 đ</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.text}>Phí giao hàng</Text>
            <Text style={styles.text}>15.000 đ</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalPrice}>156.000 đ</Text>
          </View>
        </View>

        {/* Thanh toán và nút */}
        <View style={styles.footer}>
          <View style={styles.row}>
            <Ionicons name="wallet-outline" size={20} color="#333" />
            <Text style={styles.text}>Phương thức thanh toán: </Text>
            {/* <Image source={require("./paypal.png")} style={styles.paypalIcon} /> */}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
    padding: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    alignSelf: "center",
    marginVertical: 10,
  },
  AddressSection: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginTop: 40,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  addressText: {
    flex: 1,
    marginLeft: 8,
    color: "#333",
  },
  editText: {
    color: "#00AEEF",
    fontSize: 14,
  },
  text: {
    marginLeft: 8,
    color: "#333",
  },
  shopTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: "row",
    marginVertical: 8,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemDetail: {
    marginLeft: 12,
    justifyContent: "space-between",
  },
  quantity: {
    fontSize: 15,
    fontWeight: "500",
  },
  price: {
    color: "#333",
  },
  viewMore: {
    textAlign: "center",
    color: "#999",
    marginTop: 6,
  },
  paymentTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  totalLabel: {
    fontWeight: "bold",
    fontSize: 15,
  },
  totalPrice: {
    color: "#FFA500",
    fontWeight: "bold",
    fontSize: 16,
  },
  footer: {
    marginTop: 16,
    paddingTop: 10,
  },
  paypalIcon: {
    width: 50,
    height: 20,
    resizeMode: "contain",
  },
  button: {
    backgroundColor: "#008080",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 12,
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
export default OrderDetailScreen;
