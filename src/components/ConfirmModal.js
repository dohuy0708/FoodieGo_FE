import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Để sử dụng icon thông báo

const ConfirmModal = ({ visible, onClose, onAction, info, actionText }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Ionicons
            name="information-circle-outline"
            size={50}
            color="#007B7F"
            style={styles.icon}
          />
          <Text style={styles.modalText}>
            {info || "Bạn có chắc chắn muốn thực hiện hành động này?"}
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
            {/* Button Action với màu nền xanh và chữ trắng */}
            <TouchableOpacity style={styles.actionButton} onPress={onAction}>
              <Text style={styles.actionButtonText}>
                {actionText || "Đăng nhập"}
              </Text>
            </TouchableOpacity>
            {/* Button Đóng với nền trắng, viền xanh, chữ xanh */}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Màu nền mờ
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    alignItems: "center",
  },
  icon: {
    marginBottom: 20,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center", // Căn giữa text
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 10, // Khoảng cách giữa các nút
  },
  actionButton: {
    backgroundColor: "#007B7F", // Nền màu xanh
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff", // Chữ màu trắng
    fontSize: 14,
  },
  closeButton: {
    backgroundColor: "#fff", // Nền màu trắng
    borderWidth: 1,
    borderColor: "#007B7F", // Viền xanh
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#007B7F", // Chữ màu xanh
    fontSize: 14,
  },
});

export default ConfirmModal;
