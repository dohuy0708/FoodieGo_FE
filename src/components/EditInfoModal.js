// components/EditInfoModal.js
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

const EditInfoModal = ({ visible, label, value, onClose, onSave, field }) => {
  const [inputValue, setInputValue] = useState(value || "");

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Chỉnh sửa {label}</Text>

          {field === "gender" ? (
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={inputValue}
                onValueChange={(gender) => setInputValue(gender)}
                style={styles.picker}
              >
                <Picker.Item
                  label="-- Chọn giới tính --"
                  value=""
                  enabled={false}
                />
                <Picker.Item label="Nam" value="Nam" />
                <Picker.Item label="Nữ" value="Nữ" />
                <Picker.Item label="Khác" value="Khác" />
              </Picker>
            </View>
          ) : (
            <TextInput
              style={styles.input}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder={`Nhập ${label}`}
              keyboardType={field === "phone" ? "number-pad" : "default"}
            />
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onClose} style={styles.buttonCancel}>
              <Text>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onSave(inputValue)}
              style={styles.buttonSave}
            >
              <Text style={{ color: "#fff" }}>Lưu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EditInfoModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    marginBottom: 20,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 20,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  buttonCancel: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#007B7F",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  buttonSave: {
    backgroundColor: "#007B7F",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
});
