import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants";

const JADE_GREEN = Colors.DEFAULT_GREEN; // màu chủ đạo

const FAQS = [
  {
    question: "Làm thế nào để đặt món trên FoodieGo?",
    answer:
      "Bạn chỉ cần chọn nhà hàng, chọn món ăn yêu thích, thêm vào giỏ hàng và tiến hành đặt hàng theo hướng dẫn.",
  },
  {
    question: "Tôi có thể thanh toán bằng những phương thức nào?",
    answer:
      "Bạn có thể thanh toán bằng tiền mặt khi nhận hàng, thẻ ngân hàng hoặc các ví điện tử hỗ trợ.",
  },
  {
    question: "Làm sao để kiểm tra trạng thái đơn hàng?",
    answer:
      "Bạn vào mục Đơn hàng của tôi để xem trạng thái đơn hàng và lịch sử đặt hàng.",
  },
  {
    question: "Tôi muốn hủy đơn hàng thì phải làm sao?",
    answer:
      "Bạn có thể hủy đơn hàng trong mục Đơn hàng của tôi nếu đơn chưa được nhà hàng xác nhận.",
  },
  {
    question: "Nếu nhận sai món hoặc thiếu món thì xử lý thế nào?",
    answer:
      "Bạn vui lòng liên hệ tổng đài 1900 1234 hoặc email support@foodiego.vn để được hỗ trợ đổi trả hoặc hoàn tiền.",
  },
  {
    question: "Làm sao để liên hệ bộ phận hỗ trợ?",
    answer:
      "Bạn có thể gọi tổng đài 1900 1234 (8:00 - 22:00) hoặc gửi email về support@foodiego.vn.",
  },
];

const HelpScreen = ({ navigation }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trợ giúp</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.container}>
        <Text style={styles.title}>Câu hỏi thường gặp</Text>
        {FAQS.map((faq, idx) => (
          <View key={idx} style={styles.faqItem}>
            <TouchableOpacity
              onPress={() => handleToggle(idx)}
              style={styles.questionRow}
            >
              <Text style={styles.question}>{faq.question}</Text>
              <Ionicons
                name={openIndex === idx ? "chevron-up" : "chevron-down"}
                size={20}
                color={JADE_GREEN}
              />
            </TouchableOpacity>
            {openIndex === idx && (
              <Text style={styles.answer}>{faq.answer}</Text>
            )}
          </View>
        ))}
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
  faqItem: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
    paddingVertical: 12,
  },
  questionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  question: {
    fontSize: 16,
    fontWeight: "bold",
    color: JADE_GREEN,
    flex: 1,
    marginRight: 10,
  },
  answer: {
    fontSize: 15,
    color: "#333",
    marginTop: 8,
    lineHeight: 22,
  },
});

export default HelpScreen;
