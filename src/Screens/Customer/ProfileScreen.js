import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { Avatar, Button } from "react-native-elements";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Header } from "../../components";
import { SafeAreaView } from "react-native-safe-area-context";
import { UserContext } from "../../context/UserContext";
import React, { useState, useContext, useEffect } from "react";
import EditInfoModal from "../../components/EditInfoModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateUser } from "../../services/userService";
import AlertModal from "../../components/AlertModal";

const ProfileScreen = ({ navigation }) => {
  const { userInfo } = useContext(UserContext); // Lấy thông tin user từ context
  const { setUserInfo } = useContext(UserContext); // Lấy hàm setUserInfo từ context
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false); // Trạng thái hiển thị modal
  const [email, setEmail] = useState("Bạn chưa đăng nhập tài khoản!");
  const [name, setName] = useState("---");
  const [gender, setGender] = useState("---");
  const [dob, setDob] = useState("12/04/2003");
  const [phone, setPhone] = useState("---");
  const [avatar, setAvatar] = useState(null); // Hoặc đường dẫn đến ảnh đại diện nếu có
  // Giả định dữ liệu người dùng (có thể thay bằng context hoặc props)
  const [editField, setEditField] = useState(null); // "name", "gender", etc.
  const [editLabel, setEditLabel] = useState("");
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name || "---");
      setGender(userInfo.gender || "---");
      setPhone(userInfo.phone || "---");
      setAvatar(userInfo.avatar || null); // Nếu có ảnh đại diện
      setEmail(userInfo.email || "N/A");
    }
  }, [userInfo]); // Cập nhật lại khi userInfo thay đổi
  const openEditModal = (field, label, value) => {
    setEditField(field);
    setEditLabel(label);
    setEditValue(value);
  };
  const handleSave = async (newValue) => {
    const userId = userInfo.id; // Lấy ID người dùng từ context

    try {
      // Gọi GraphQL mutation để cập nhật thông tin
      await updateUser(userId, editField, newValue);

      // Cập nhật state cục bộ (UI)
      switch (editField) {
        case "name":
          setName(newValue);
          break;
        case "gender":
          setGender(newValue);
          break;
        case "phone":
          setPhone(newValue);
          break;
      }
      // Cập nhật lại context với thông tin mới
      setUserInfo({
        ...userInfo,
        [editField]: newValue, // chỉ cập nhật field đã chỉnh sửa
      });
      // cập nhật lại AsyncStorage nếu cần thiết
      console.log("userInfo", userInfo);
      await AsyncStorage.setItem("userInfo", JSON.stringify(userInfo));

      setIsAlertModalVisible(true);
      setEditField(null);
    } catch (err) {
      console.error("Cập nhật thất bại:", err.message);
      // Có thể show Toast hoặc Alert ở đây
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Header */}
        <Header
          title="Thông tin cá nhân"
          onBackPress={() => navigation.goBack()}
        />

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Avatar
            rounded
            size={70}
            source={require("../../assets/images/user.png")}
            containerStyle={styles.avatar}
          ></Avatar>
          <Text style={styles.email}>{name}</Text>
          <TouchableOpacity>
            <Text style={styles.changeAvatarText}>Đổi ảnh đại diện</Text>
          </TouchableOpacity>
        </View>

        {/* Info rows */}
        <View style={styles.infoContainer}>
          <InfoRow label="Email" value={email} disabled />
          <InfoRow
            label="Họ tên"
            value={name}
            onPress={() => openEditModal("name", "Họ tên", name)}
          />
          <InfoRow
            label="Giới tính"
            value={gender}
            onPress={() => openEditModal("gender", "Giới tính", gender)}
          />
          <InfoRow label="Ngày sinh" value={dob} />
          <InfoRow
            label="Số điện thoại"
            value={phone}
            onPress={() => openEditModal("phone", "Số điện thoại", phone)}
          />
        </View>
        <EditInfoModal
          visible={!!editField}
          label={editLabel}
          value={editValue}
          field={editField}
          onClose={() => setEditField(null)}
          onSave={handleSave}
        />
        <AlertModal
          visible={isAlertModalVisible}
          onClose={() => setIsAlertModalVisible(false)} // Đóng modal
          info="Cập nhật thành công!" // Thông báo cho người dùng
        />
      </View>
    </SafeAreaView>
  );
};

// Component dòng thông tin
const InfoRow = ({ label, value, onPress, disabled }) => (
  <TouchableOpacity
    style={styles.row}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={disabled ? 1 : 0.6}
  >
    <Text style={styles.label}>{label}</Text>
    <View style={styles.valueContainer}>
      <Text style={styles.value}>{value}</Text>
      {!disabled && (
        <Ionicons name="chevron-forward-outline" style={styles.chevron} />
      )}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  avatarContainer: {
    marginTop: 70,
    alignItems: "center",
  },
  email: {
    color: "#333",
    fontSize: 14,
    marginTop: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ddd",
  },
  changeAvatarText: {
    color: "#007baf",
    marginTop: 8,
  },
  infoContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  label: {
    fontSize: 16,
    color: "#333",
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  value: {
    fontSize: 16,
    color: "#888",
    marginRight: 8,
  },
  chevron: {
    fontSize: 18,
    color: "#888",
  },
});

export default ProfileScreen;
