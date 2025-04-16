import React, { useState } from "react";
import { Color } from "../../constants";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import Display from "../../utils/Display";

export default function EditCategory() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isModalAddVisible, setModalAddVisible] = useState(false);
  const [isModalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [categoryInput, setCategoryInput] = useState("");
  const [categoryName, setCategoryName] = useState([
    { id: 1, name: "Cháo ếch Singapore" },
    { id: 2, name: "Bánh mì" },
    { id: 3, name: "Phở" },
    { id: 4, name: "Tráng miệng" },
  ]);

  const openEditModal = (item) => {
    setEditingCategory(item);
    setCategoryInput(item.name);
    setModalVisible(true);
  };

  const openDeleteModal = (item) => {
    setCategoryToDelete(item);
    setModalDeleteVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalAddVisible(false);
    setModalDeleteVisible(false);
    setEditingCategory(null);
    setCategoryToDelete(null);
    setCategoryInput("");
  };

  const handleSaveChanges = () => {
    if (editingCategory && categoryInput.trim()) {
      setCategoryName((prev) =>
        prev.map((cat) =>
          cat.id === editingCategory.id
            ? { ...cat, name: categoryInput.trim() }
            : cat
        )
      );
    }
    closeModal();
  };

  const handleAddCategory = () => {
    if (categoryInput.trim()) {
      const newId = categoryName.length > 0 ? Math.max(...categoryName.map(c => c.id)) + 1 : 1;
      setCategoryName((prev) => [
        ...prev,
        { id: newId, name: categoryInput.trim() },
      ]);
    }
    closeModal();
  };

  const handleDeleteCategory = () => {
      if (categoryToDelete) {
          setCategoryName((prev) =>
              prev.filter((cat) => cat.id !== categoryToDelete.id)
          );
      }
      closeModal();
  };


  const renderItem = ({ item }) => (
    <View style={styles.categoryItem}>
      <Text style={styles.categoryText} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
      <View style={styles.categoryItemActions}>
        <TouchableOpacity onPress={() => openEditModal(item)} style={styles.iconButton}>
          <Feather
            name="edit-2"
            size={24}
            color="black"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openDeleteModal(item)} style={styles.iconButton}>
          <Ionicons
            name="remove-circle-outline" 
            size={24}
            color="black" 
          />
        </TouchableOpacity>
      </View>
    </View>
  );


  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chỉnh sửa danh mục</Text>
      <TouchableOpacity
        style={styles.addCategoryButton}
        onPress={() => setModalAddVisible(true)}
      >
        <Text style={styles.buttonText}>Thêm danh mục</Text>
      </TouchableOpacity>
      <FlatList
        data={categoryName}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContentContainer}
        style={styles.listStyle}
      />

      <Modal
        transparent={true}
        animationType="fade"
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chỉnh sửa danh mục</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Tên danh mục"
              value={categoryInput}
              onChangeText={setCategoryInput}
              autoCapitalize="sentences"
              placeholderTextColor={Color.LIGHT_GREY2}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: Color.DEFAULT_YELLOW }]} 
                onPress={closeModal}
              >
                <Text style={styles.buttonText}>Hủy bỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: Color.DEFAULT_GREEN }]} 
                onPress={handleSaveChanges}
              >
                <Text style={styles.buttonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        animationType="fade"
        visible={isModalAddVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm danh mục</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Tên danh mục"
              value={categoryInput}
              onChangeText={setCategoryInput}
              autoCapitalize="sentences"
              placeholderTextColor={Color.LIGHT_GREY2}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                 style={[styles.modalButton, { backgroundColor: Color.DEFAULT_YELLOW }]} 
                onPress={closeModal}
              >
                <Text style={styles.buttonText}>Hủy bỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: Color.DEFAULT_GREEN }]} 
                onPress={handleAddCategory}
              >
                <Text style={styles.buttonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        animationType="fade"
        visible={isModalDeleteVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Xóa danh mục</Text>
            <Text style={styles.deleteConfirmationText}>
              Bạn có chắc chắn muốn xóa danh mục "{categoryToDelete?.name}" không?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: Color.DEFAULT_YELLOW }]} 
                onPress={closeModal}
              >
                <Text style={styles.buttonText}>Hủy bỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: Color.DEFAULT_GREEN }]} 
                onPress={handleDeleteCategory}
              >
                <Text style={styles.buttonText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Display.setWidth(2.5), 
        paddingTop: Display.setHeight(6),
        paddingBottom: Display.setHeight(2),
        flex: 1,
        width: "100%",
        backgroundColor: "#fff",
        alignItems: "center",
        gap: Display.setHeight(2.5),
    },
    addCategoryButton: {
        backgroundColor: Color.DEFAULT_GREEN,
        paddingVertical: Display.setHeight(1.2),
        paddingHorizontal: Display.setWidth(5),
        borderRadius: 5, 
        alignSelf: "flex-end",
        marginRight: Display.setWidth(2.5), 
    },
    header: {
        textAlign: "center",
        color: Color.DEFAULT_GREEN,
        fontWeight: "bold",
        fontSize: 25,
        width: '100%',
    },
    listStyle: {
      width: '100%',
    },
    listContentContainer: {
      paddingBottom: Display.setHeight(2),
      gap: Display.setHeight(1.2),
      paddingHorizontal: Display.setWidth(2.5), 
    },
    categoryItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: Display.setHeight(1.2), 
        paddingHorizontal: Display.setWidth(2.5), 
        backgroundColor: "#f8f8f8", 
        borderRadius: 10,
        width: "100%",
    },
    categoryText: {
        fontSize: 16,
        color: Color.DEFAULT_BLACK,
        flex: 1,
        marginRight: Display.setWidth(2),
    },
    categoryItemActions: {
        flexDirection: 'row',
        gap: Display.setWidth(5), 
        alignItems: 'center',
    },
    iconButton: {
      padding: Display.setWidth(1),
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)", 
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: Display.setWidth(5),
    },
    modalContent: {
        width: "90%", 
        maxWidth: 500,
        backgroundColor: "white",
        borderRadius: 10,
        paddingVertical: Display.setHeight(2.5), 
        paddingHorizontal: Display.setWidth(5),
        gap: Display.setHeight(2.5),
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalTitle: {
        fontSize: 18, 
        fontWeight: "bold",
        textAlign: "center",
        color: Color.DEFAULT_GREEN,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: Color.GRAY_BORDER,
        borderRadius: 5, 
        paddingVertical: Display.setHeight(1.2),
        paddingHorizontal: Display.setWidth(2.5), 
        fontSize: 16,
        color: Color.DEFAULT_BLACK,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: Display.setWidth(2.5), 
        marginTop: Display.setHeight(1),
    },
    modalButton: {
        paddingVertical: Display.setHeight(1.2),
        paddingHorizontal: Display.setWidth(5),
        borderRadius: 5, 
        minWidth: Display.setWidth(20),
        alignItems: 'center',
    },
    buttonText: {
        color: "white",
        fontWeight: "500",
        fontSize: 16,
    },
    deleteConfirmationText: {
        fontSize: 16,
        color: Color.DEFAULT_BLACK,
        textAlign: 'center',
        lineHeight: Display.setHeight(2.5),
    },
});