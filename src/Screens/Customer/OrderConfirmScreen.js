import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "../../components";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useCart } from "../../context/CartContext";
import { UserContext } from "../../context/UserContext";
const OrderConfirmScreen = ({ navigation, route }) => {
  const { restaurant, totalPrice, totalItems } = route.params;

  const { userInfo } = useContext(UserContext); // Lấy thông tin user
  // Delivery info
  const [shippingFee, setShippingFee] = useState(0);
  const [userLocation, setUserLocation] = useState(
    "KTX khu A, Phường Đông Hòa, Dĩ An, Bình Dương"
  );
  const [userPhone, setUserPhone] = useState("0654428222");
  const [userName, setUserName] = useState("Hoàng Huy");
  const [items, setItems] = useState([]);
  const { getCartItems, clearCart, hasItems } = useCart();

  const handleNoteChange = (itemId, noteText) => {
    const updatedItems = items.map((item) =>
      item.id === itemId ? { ...item, note: noteText } : item
    );
    setItems(updatedItems); // đảm bảo bạn có setItems trong state
  };
  // Products in cart

  // get user location
  // get user info
  // get items in cart
  useEffect(() => {
    if (restaurant.id) {
      const cartItems = getCartItems(restaurant.id);
      setItems(cartItems);
    }
  }, [restaurant.id, getCartItems]);
  // call API calculate shipping fee
  const fetchShippingFee = async ({
    from_district_id,
    to_district_id,
    to_ward_code,
    height,
    length,
    weight,
    width,
    insurance_value = 0,
  }) => {
    try {
      const response = await fetch(
        "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Token: "a991b775-0700-11f0-9d1d-02fc1ab0266e", // thay bằng token thực tế
            ShopId: String(restaurant.restaurantId),
          },
          body: JSON.stringify({
            service_id: 53321,
            insurance_value,
            coupon: null,
            from_district_id,
            to_district_id,
            to_ward_code,
            height,
            length,
            weight,
            width,
          }),
        }
      );

      const result = await response.json();

      if (result?.data?.total) {
        setShippingFee(result.data.total); // cập nhật vào state nếu cần
      } else {
        console.warn("Không lấy được phí vận chuyển:", result);
      }
    } catch (error) {
      console.error("Lỗi khi tính phí vận chuyển:", error);
    }
  };

  useEffect(() => {
    fetchShippingFee({
      from_district_id: 1542,
      to_district_id: 1444,
      to_ward_code: "20314",
      height: 15,
      length: 15,
      weight: 1000,
      width: 15,
      insurance_value: totalPrice, // dùng giá trị đơn hàng
    });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Header
          title="Xác nhận đơn hàng"
          onBackPress={() => navigation.goBack()}
        />

        {/* Địa chỉ và thông tin người nhận - PHẦN ĐẦU CỐ ĐỊNH */}
        <View style={styles.AddressSection}>
          <View style={styles.row}>
            <Ionicons
              name="location-outline"
              size={20}
              color={Colors.DEFAULT_GREEN}
            />
            <Text style={styles.addressText}>{userLocation}</Text>
            <TouchableOpacity style={styles.editText}>
              <Text style={styles.editText}>Chỉnh sửa</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Ionicons
              name="person-outline"
              size={20}
              color={Colors.DEFAULT_GREEN}
            />
            <Text style={styles.text}>
              {userName}
              <Text> | </Text>
              {userPhone}
            </Text>
          </View>
        </View>

        {/* PHẦN CHI TIẾT MÓN - SCROLLABLE */}
        <View style={{ flex: 1, minHeight: 100 }}>
          <View style={styles.section}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <Ionicons
                style={styles.icon}
                name="storefront-outline"
                size={22}
                color={Colors.DEFAULT_GREEN}
              />
              <Text style={styles.shopTitle}>{restaurant?.name}</Text>
            </View>
            <ScrollView
              howsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16 }}
            >
              {items.map((item, index) => (
                <View style={styles.itemRow}>
                  <Image source={{ uri: item.imageUrl }} style={styles.image} />

                  <View style={styles.itemDetail}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 4,
                      }}
                    >
                      {/* Tên món */}
                      <Text style={styles.quantity}>
                        {item.quantity} x {item.name}
                      </Text>
                      <Text style={[styles.price, { marginLeft: 10 }]}>
                        {(item.price * item.quantity).toLocaleString("vi-VN")} đ
                      </Text>
                    </View>
                    {/* Ghi chú + Giá nằm ngang */}

                    {/* Icon + TextInput */}
                    <View
                      style={{
                        flexDirection: "row",
                        marginRight: 80,
                        alignItems: "center",
                        flex: 1,
                      }}
                    >
                      <Ionicons
                        name="document-text-outline"
                        size={16}
                        color="#888"
                        style={{ marginRight: 4 }}
                      />
                      <TextInput
                        placeholder="Ghi chú..."
                        placeholderTextColor="#aaa"
                        value={item.note}
                        onChangeText={(text) => handleNoteChange(item.id, text)} // bạn cần viết hàm này
                        style={{
                          flex: 1,
                          fontSize: 13,
                          color: "#444",
                          borderBottomWidth: 0.5,
                          borderColor: "#ccc",
                          paddingVertical: 2,
                        }}
                      />
                    </View>

                    {/* Giá */}
                  </View>
                </View>
              ))}
              {/* <Text style={styles.viewMore}>Xem thêm</Text> */}
            </ScrollView>
          </View>
        </View>

        {/* PHẦN THANH TOÁN & NÚT - PHẦN CUỐI CỐ ĐỊNH */}
        <View style={styles.footerContainer}>
          <View style={styles.section}>
            <Text style={styles.paymentTitle}>Chi tiết thanh toán</Text>
            <View style={styles.paymentRow}>
              <Text style={styles.text}>Tổng giá món</Text>
              <Text style={styles.text}>
                {totalPrice.toLocaleString("vi-VN")} đ
              </Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.text}>Phí giao hàng</Text>
              <Text style={styles.text}>
                {shippingFee.toLocaleString("vi-VN")} đ
              </Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.totalLabel}>Tổng thanh toán</Text>
              <Text style={styles.totalPrice}>
                {(totalPrice + shippingFee).toLocaleString("vi-VN")} đ
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.paymentMethod}>
              <Ionicons name="wallet-outline" size={20} color="#333" />
              <Text style={styles.text}>Phương thức thanh toán: </Text>
              <FontAwesome name="cc-paypal" size={28} color="blue" />
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("PaymentScreen")}
            >
              <Text style={styles.buttonText}>
                Đặt đơn - {(totalPrice + shippingFee).toLocaleString("vi-VN")} đ
              </Text>
            </TouchableOpacity>
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
  footerContainer: {},

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
    paddingHorizontal: 3,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
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
  },
  itemRow: {
    gap: 10,
    backgroundColor: "#yellow",
    flexDirection: "row",
    marginVertical: 8,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemDetail: {
    flex: 1,
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
    paddingTop: 10,
  },
  paypalIcon: {
    width: 50,
    height: 20,
    resizeMode: "contain",
  },
  button: {
    backgroundColor: "#008080",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 6,
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
export default OrderConfirmScreen;
