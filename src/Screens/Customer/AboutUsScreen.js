import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants";

const JADE_GREEN = Colors.DEFAULT_GREEN; // xanh ngọc bích

const AboutUsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header với nút back */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Text style={styles.headerTitle}>Chính Sách Ứng Dụng</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.container}>
        <Text style={styles.title}>Chính Sách Ứng Dụng Đặt Đồ Ăn FoodieGo</Text>

        <Text style={styles.sectionTitle}>1. Giới thiệu</Text>
        <Text style={styles.text}>
          FoodieGo là ứng dụng đặt đồ ăn nhanh chóng, tiện lợi, kết nối khách
          hàng với hàng trăm nhà hàng, quán ăn uy tín.
        </Text>

        <Text style={styles.sectionTitle}>2. Chính sách đặt hàng</Text>
        <Text style={styles.text}>
          - Khách hàng có thể đặt món từ nhiều nhà hàng khác nhau trên hệ thống.
          {"\n"}- Đơn hàng chỉ được xác nhận khi khách hàng nhận được thông báo
          xác nhận từ hệ thống.
          {"\n"}- Vui lòng kiểm tra kỹ thông tin trước khi đặt hàng.
        </Text>

        <Text style={styles.sectionTitle}>3. Chính sách thanh toán</Text>
        <Text style={styles.text}>
          - Hỗ trợ thanh toán tiền mặt khi nhận hàng hoặc qua các ví điện tử,
          thẻ ngân hàng.
          {"\n"}- Đảm bảo bảo mật thông tin thanh toán của khách hàng.
        </Text>

        <Text style={styles.sectionTitle}>4. Chính sách giao hàng</Text>
        <Text style={styles.text}>
          - Thời gian giao hàng dự kiến từ 20-45 phút tùy vị trí và tình trạng
          đơn hàng.
          {"\n"}- Phí giao hàng được hiển thị rõ trước khi xác nhận đơn.
        </Text>

        <Text style={styles.sectionTitle}>
          5. Chính sách đổi trả & hoàn tiền
        </Text>
        <Text style={styles.text}>
          - Nếu đơn hàng bị sai, thiếu món hoặc không đúng yêu cầu, khách hàng
          liên hệ tổng đài hỗ trợ trong vòng 30 phút kể từ khi nhận hàng.
          {"\n"}- FoodieGo sẽ hỗ trợ đổi trả hoặc hoàn tiền theo quy định.
        </Text>

        <Text style={styles.sectionTitle}>6. Hỗ trợ khách hàng</Text>
        <Text style={styles.text}>
          - Tổng đài hỗ trợ: 1900 1234 (8:00 - 22:00)
          {"\n"}- Email: support@foodiego.vn
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
    justifyContent: "space-between",
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 18,
    color: JADE_GREEN,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 6,
    color: JADE_GREEN,
  },
  text: {
    fontSize: 15,
    color: "#333",
    marginBottom: 8,
    lineHeight: 22,
  },
});

export default AboutUsScreen;
