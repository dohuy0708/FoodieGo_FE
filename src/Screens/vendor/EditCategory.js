import React, { useState, useEffect, useMemo } from "react";
import  Colors  from "../../constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import Display from "../../utils/Display";
import Icon from "react-native-vector-icons/Ionicons";

import {
  createCategory,
  updateCategory,
  updateCategoryStatus,
  getMenusIdByCategoryId,
  updateMenuStatus
} from "../../services/vendorService"; 



export default function EditCategory({ route, navigation }) {
  const initialCategory =
    route?.params?.category && Array.isArray(route.params.category)
      ? route.params.category
      : [];
  const restaurantId = route?.params?.restaurantId;

  const [isModalEditVisible, setModalEditVisible] = useState(false);
  const [isModalAddVisible, setModalAddVisible] = useState(false);
  const [isModalBlockVisible, setModalBlockVisible] = useState(false);
  const [isModalUnblockVisible, setModalUnblockVisible] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToBlock, setCategoryToBlock] = useState(null);
  const [categoryToUnblock, setCategoryToUnblock] = useState(null);
  const [categoryInput, setCategoryInput] = useState("");
  const [allCategories, setAllCategories] = useState(initialCategory);

  const [isLoading, setIsLoading] = useState(false);

  const acceptedCategories = useMemo(() =>
    allCategories.filter(cat => cat.isActive === 'accepted'),
    [allCategories]
  );

  const blockedCategories = useMemo(() =>
    allCategories.filter(cat => cat.isActive === 'blocked'),
    [allCategories]
  );


  useEffect(() => {
    if (restaurantId === null || restaurantId === undefined) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin nhà hàng. Vui lòng thử lại.", [
        { text: "OK", onPress: () => navigation?.goBack() }
      ]);
    }
  }, [restaurantId, navigation]);

  const openEditModal = (item) => {
    if (isLoading) return;
    setEditingCategory(item);
    setCategoryInput(item.name);
    setModalEditVisible(true);
  };

  const openBlockModal = (item) => {
    if (isLoading) return;
    setCategoryToBlock(item);
    setModalBlockVisible(true);
  };

   const openUnblockModal = (item) => {
    if (isLoading) return;
    setCategoryToUnblock(item);
    setModalUnblockVisible(true);
  };

  const openAddModal = () => {
     if (isLoading) return;
     setCategoryInput("");
     setModalAddVisible(true);
  }

  const closeModal = () => {
    if (isLoading) return;
    setModalEditVisible(false);
    setModalAddVisible(false);
    setModalBlockVisible(false);
    setModalUnblockVisible(false);
    setEditingCategory(null);
    setCategoryToBlock(null);
    setCategoryToUnblock(null);
    setCategoryInput("");
  };

  const handleSaveChanges = async () => {
    if (!editingCategory || !categoryInput.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập tên danh mục.");
      return;
    }
    if(allCategories
      .filter(cat => cat.id !== editingCategory.id)
      .some(cat => cat.name.toLowerCase() === categoryInput.trim().toLowerCase())){
      Alert.alert("Thông báo", "Tên danh mục đã tồn tại.");
      return;
    }
    if (isLoading) return;
    setIsLoading(true);

    try {
      const updatedCategory = await updateCategory(
        editingCategory.id,
        categoryInput.trim()
      );

      if (updatedCategory) {
        setAllCategories((prev) =>
          prev.map((cat) =>
            cat.id === updatedCategory.id
            ? { ...cat, name: updatedCategory.name }
            : cat
          )
        );
        Alert.alert("Thành công", "Đã cập nhật tên danh mục.");
        closeModal();
      } else {
        Alert.alert("Lỗi", "Không thể cập nhật tên danh mục.");
      }
    } catch (error) {
      console.error("Error updating category name:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi cập nhật tên.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!categoryInput.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập tên danh mục.");
      return;
    }
    if(allCategories.some(cat => cat.name === categoryInput.trim())){
      Alert.alert("Thông báo", "Tên danh mục đã tồn tại.");
      return;
    }
     if (restaurantId === null || restaurantId === undefined) {
      Alert.alert("Lỗi", "Thiếu thông tin nhà hàng.");
      return;
    }
    if (isLoading) return;
    setIsLoading(true);

    try {
      const newCategory = await createCategory(
        categoryInput.trim(),
        restaurantId
      );

      if (newCategory) {
         const categoryWithStatus = { ...newCategory, isActive: 'accepted' };
        setAllCategories((prev) => [...prev, categoryWithStatus]);
        Alert.alert("Thành công", "Đã thêm danh mục mới.");
        closeModal();
      } else {
        Alert.alert("Lỗi", "Không thể thêm danh mục.");
      }
    } catch (error) {
      console.error("Error adding category:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi thêm danh mục.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockCategory = async () => {
    if (!categoryToBlock) return;
    if (isLoading) return;
    setIsLoading(true);

    try {
      const menusId = await getMenusIdByCategoryId(categoryToBlock.id);
      menusId.forEach(async (menuId) => {
        console.log("menuId", menuId);
        await updateMenuStatus(menuId, 'unavailable');
      });
      const success = await updateCategoryStatus(categoryToBlock.id, 'blocked');

      if (success) {
        setAllCategories((prev) =>
          prev.map((cat) =>
            cat.id === categoryToBlock.id ? { ...cat, isActive: 'blocked' } : cat
          )
        );
        Alert.alert("Thành công", `Đã ẩn danh mục "${categoryToBlock.name}".`);
        closeModal();
      } else {
        Alert.alert("Lỗi", `Không thể ẩn danh mục "${categoryToBlock.name}".`);
      }
    } catch (error) {
      console.error("Error blocking category:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi ẩn danh mục.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnblockCategory = async () => {
    if (!categoryToUnblock) return;
    if (isLoading) return;
    setIsLoading(true);

    try {
      const success = await updateCategoryStatus(categoryToUnblock.id, 'accepted');

      if (success) {
        setAllCategories((prev) =>
          prev.map((cat) =>
            cat.id === categoryToUnblock.id ? { ...cat, isActive: 'accepted' } : cat
          )
        );
        Alert.alert("Thành công", `Đã hiển thị lại danh mục "${categoryToUnblock.name}".`);
        closeModal();
      } else {
        Alert.alert("Lỗi", `Không thể hiển thị lại danh mục "${categoryToUnblock.name}".`);
      }
    } catch (error) {
      console.error("Error unblocking category:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi hiển thị lại danh mục.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.categoryItem}>
      <Text style={[styles.categoryText, item.isActive !== 'accepted' && styles.blockedText]} numberOfLines={1} ellipsizeMode="tail">
        {item.name}
      </Text>
      <View style={styles.categoryItemActions}>
        {item.isActive === 'accepted' ? (
          <>
            <TouchableOpacity
              onPress={() => openEditModal(item)}
              style={styles.iconButton}
              disabled={isLoading}
            >
              <Feather name="edit-2" size={22} color={isLoading ? Colors.LIGHT_GREY2 : Colors.DARK_FIVE} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => openBlockModal(item)}
              style={styles.iconButton}
              disabled={isLoading}
            >
              <MaterialCommunityIcons name="eye-off-outline" size={24} color={isLoading ? Colors.LIGHT_GREY2 : Colors.DEFAULT_RED} />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            onPress={() => openUnblockModal(item)}
            style={styles.iconButton}
            disabled={isLoading}
          >
             <MaterialCommunityIcons name="eye-outline" size={24} color={isLoading ? Colors.LIGHT_GREY2 : Colors.DEFAULT_GREEN} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.header}>Quản lý danh mục</Text>
      </View>
    
      <TouchableOpacity
        style={[styles.addCategoryButton, isLoading && styles.disabledButton]}
        onPress={openAddModal}
        disabled={isLoading || restaurantId === null || restaurantId === undefined}
      >
        <Text style={styles.buttonText}>Thêm danh mục</Text>
      </TouchableOpacity>

      <Text style={styles.sectionHeader}>Danh mục đang hoạt động</Text>
      <FlatList
        data={acceptedCategories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContentContainer}
        style={styles.listStyle}
        ListEmptyComponent={<Text style={styles.emptyListText}>Chưa có danh mục nào hoạt động.</Text>}
      />

      <View style={styles.divider} />

      <Text style={styles.sectionHeader}>Danh mục đã ẩn</Text>
       <FlatList
        data={blockedCategories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContentContainer}
        style={styles.listStyle}
        ListEmptyComponent={<Text style={styles.emptyListText}>Chưa có danh mục nào bị ẩn.</Text>}
      />

      <Modal
        transparent={true}
        animationType="fade"
        visible={isModalEditVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chỉnh sửa tên danh mục</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Tên danh mục mới"
              value={categoryInput}
              onChangeText={setCategoryInput}
              autoCapitalize="sentences"
              placeholderTextColor={Colors.LIGHT_GREY2}
              editable={!isLoading}
            />
            {isLoading && <ActivityIndicator size="small" color={Colors.DEFAULT_GREEN} style={{marginTop: 5}}/>}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: Colors.DEFAULT_YELLOW }, isLoading && styles.disabledButton ]}
                onPress={closeModal}
                disabled={isLoading} >
                <Text style={styles.buttonText}>Hủy bỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: Colors.DEFAULT_GREEN }, isLoading && styles.disabledButton ]}
                onPress={handleSaveChanges}
                disabled={isLoading} >
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
        onRequestClose={closeModal} >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm danh mục mới</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Tên danh mục"
              value={categoryInput}
              onChangeText={setCategoryInput}
              autoCapitalize="sentences"
              placeholderTextColor={Colors.LIGHT_GREY2}
              editable={!isLoading} />
             {isLoading && <ActivityIndicator size="small" color={Colors.DEFAULT_GREEN} style={{marginTop: 5}}/>}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[ styles.modalButton, { backgroundColor: Colors.DEFAULT_YELLOW }, isLoading && styles.disabledButton ]}
                onPress={closeModal}
                disabled={isLoading} >
                <Text style={styles.buttonText}>Hủy bỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[ styles.modalButton, { backgroundColor: Colors.DEFAULT_GREEN }, isLoading && styles.disabledButton ]}
                onPress={handleAddCategory}
                disabled={isLoading} >
                <Text style={styles.buttonText}>Thêm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        animationType="fade"
        visible={isModalBlockVisible}
        onRequestClose={closeModal} >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ẩn danh mục</Text>
            <Text style={styles.confirmationText}>
              Bạn có chắc chắn muốn ẩn danh mục "{categoryToBlock?.name}" không? Khách hàng sẽ không thấy danh mục và các món trong đó.
            </Text>
             {isLoading && <ActivityIndicator size="small" color={Colors.DEFAULT_RED} style={{marginTop: 5}}/>}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[ styles.modalButton, { backgroundColor: Colors.DEFAULT_YELLOW }, isLoading && styles.disabledButton ]}
                onPress={closeModal}
                disabled={isLoading} >
                <Text style={styles.buttonText}>Hủy bỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[ styles.modalButton, { backgroundColor: Colors.DEFAULT_RED }, isLoading && styles.disabledButton ]}
                onPress={handleBlockCategory}
                disabled={isLoading} >
                <Text style={styles.buttonText}>Ẩn danh mục</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

        <Modal
        transparent={true}
        animationType="fade"
        visible={isModalUnblockVisible}
        onRequestClose={closeModal} >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Hiển thị lại danh mục</Text>
            <Text style={styles.confirmationText}>
              Bạn có chắc chắn muốn hiển thị lại danh mục "{categoryToUnblock?.name}" không?
            </Text>
             {isLoading && <ActivityIndicator size="small" color={Colors.DEFAULT_GREEN} style={{marginTop: 5}}/>}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[ styles.modalButton, { backgroundColor: Colors.DEFAULT_YELLOW }, isLoading && styles.disabledButton ]}
                onPress={closeModal}
                disabled={isLoading} >
                <Text style={styles.buttonText}>Hủy bỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[ styles.modalButton, { backgroundColor: Colors.DEFAULT_GREEN }, isLoading && styles.disabledButton ]}
                onPress={handleUnblockCategory}
                disabled={isLoading} >
                <Text style={styles.buttonText}>Hiển thị lại</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  disabledButton: {
    opacity: 0.6,
  },
  container: {
    flex: 1,
    paddingHorizontal: Display.setWidth(2.5),
    paddingTop: Display.setHeight(3),
    paddingBottom: Display.setHeight(2),
    width: "100%",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  addCategoryButton: {
    backgroundColor: Colors.DEFAULT_GREEN,
    paddingVertical: Display.setHeight(1.2),
    paddingHorizontal: Display.setWidth(5),
    borderRadius: 5,
    alignSelf: "flex-end",
    marginRight: Display.setWidth(2.5),
    marginBottom: Display.setHeight(2),
  },
  header: {
    textAlign: "center",
    color: Colors.DEFAULT_GREEN,
    fontWeight: "bold",
    fontSize: 25,
   
    marginBottom: Display.setHeight(1.5),
  },
  sectionHeader: {
      fontSize: 18,
      fontWeight: '600',
      color: Colors.DARK_TWO,
      width: '100%',
      marginTop: Display.setHeight(2),
      marginBottom: Display.setHeight(1),
      paddingHorizontal: Display.setWidth(2.5),
  },
  listStyle: {
    width: '100%',
    flexGrow: 0,
    maxHeight: Display.setHeight(30),
  },
  listContentContainer: {
    paddingBottom: Display.setHeight(1),
    gap: Display.setHeight(1.2),
    paddingHorizontal: Display.setWidth(2.5),
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Display.setHeight(1.5),
    paddingHorizontal: Display.setWidth(3.5),
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    width: "100%",
  },
  categoryText: {
    fontSize: 16,
    color: Colors.DEFAULT_BLACK,
    flex: 1,
    marginRight: Display.setWidth(2),
  },
   blockedText: {
    color: Colors.DARK_THREE,
    fontStyle: 'italic',
  },
  categoryItemActions: {
    flexDirection: 'row',
    gap: Display.setWidth(4),
    alignItems: 'center',
  },
  iconButton: {
    padding: Display.setWidth(1),
  },
   divider: {
    height: 1,
    backgroundColor: Colors.LIGHT_GREY2,
    width: '90%',
    marginVertical: Display.setHeight(2.5),
  },
  emptyListText: {
      textAlign: 'center',
      marginTop: 15,
      color: Colors.GRAY,
      fontStyle: 'italic',
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
    gap: Display.setHeight(2),
    alignItems: 'center',
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: Colors.DEFAULT_GREEN,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.GRAY_BORDER || '#ccc',
    borderRadius: 5,
    paddingVertical: Display.setHeight(1.2),
    paddingHorizontal: Display.setWidth(2.5),
    fontSize: 16,
    color: Colors.DEFAULT_BLACK,
    width: '100%',
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Display.setWidth(2.5),
    marginTop: Display.setHeight(1),
    width: '100%',
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
  confirmationText: {
    fontSize: 16,
    color: Colors.DARK_TWO,
    textAlign: 'center',
    lineHeight: Display.setHeight(2.5),
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
   
    paddingVertical: Display.setHeight(1.2),
    backgroundColor: "#ffffff",
    width: "100%",
    
  },
  backButton: { padding: 8, marginRight: 12 },
});