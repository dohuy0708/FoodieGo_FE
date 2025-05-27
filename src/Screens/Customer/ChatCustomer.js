// ChatListScreen.js
import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Platform, // Thêm Platform để sử dụng cho padding
  Button,
  Alert
} from "react-native";
import Colors from "../../constants/Colors"; // Đường dẫn này giả định file nằm trong /screens
import Display from "../../utils/Display";   // Đường dẫn này giả định file nằm trong /screens
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UserContext } from "../../context/UserContext";
import { listenUserChats } from '../../services/chatService';
import { getDatabase, ref, set, push, get } from "firebase/database";
// Giả lập Display và Colors nếu bạn chưa có các file này
// (Trong dự án thực, bạn nên có các file này và xóa phần mock)
if (typeof Display === 'undefined') {
  global.Display = {
    setHeight: val => val * 8,
    setWidth: val => val * 4,
  };
}
if (typeof Colors === 'undefined') {
  global.Colors = {
    DEFAULT_WHITE: '#FFFFFF',
    DEFAULT_GREEN: '#2ecc71',
    DEFAULT_BLACK: '#000000',
    LIGHT_GREY: '#DDDDDD',
    GRAY_BORDER: '#CCCCCC',
    DEFAULT_GREY: '#A9A9A9',
    DARK_GREY_TEXT: '#555555',
    PLACEHOLDER_AVATAR_BG: '#C0C0C0',
    // Thêm các màu mà ChatListScreen có thể sử dụng từ Notification.js nếu cần
    LIGHT_GREY2: '#EEEEEE', // Giả sử từ Notification.js nếu cần
  };
}

const NAV_HEIGHT = Display.setHeight(7);

// Mock Nav component nếu chưa có
const MockNav = ({ nav }) => (
  <View style={{ height: '100%', backgroundColor: Colors.LIGHT_GREY, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Navigation Bar</Text>
  </View>
);

// Dữ liệu mẫu cho danh sách chat


export default function ChatCustomer({ navigation }) {
  const { userInfo } = useContext(UserContext);
  const customerId = userInfo.id;
  const [chatList, setChatList] = useState([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const unsubscribe = listenUserChats(customerId.toString(), setChatList);
    return unsubscribe;
  }, [customerId]);

  // Hàm lấy thông tin vendor từ contactId (tạm thời mock)
  const getVendorInfo = (vendorId) => {
    // TODO: Lấy thông tin vendor từ API hoặc local, ví dụ:
    // return { name: "Tên nhà hàng", avatar: "url" }
    return { name: `Nhà hàng ${vendorId}`, avatar: null, initials: "V" };
  };

  // Hàm tạo node chat mẫu với vendorId = 1
  const createSampleChat = async () => {
    try {
      const vendorId = 1;
      const database = getDatabase();
      const chatId = `customer_${customerId}_vendor_${vendorId}`;
      const chatRef = ref(database, `chats/${chatId}`);
      const snapshot = await get(chatRef);
      if (!snapshot.exists()) {
        await set(chatRef, {
          members: {
            [customerId]: true,
            [vendorId]: true
          },
          messages: {}
        });
      }
      const messagesRef = ref(database, `chats/${chatId}/messages`);
      await push(messagesRef, {
        receiverId: vendorId.toString(),
        senderId: customerId.toString(),
        text: "Xin chào, đây là tin nhắn mẫu!",
        timestamp: Date.now()
      });
      Alert.alert("Thành công", "Đã tạo chat mẫu với vendor 1!");
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể tạo chat mẫu");
    }
  };

  const renderChatItem = ({ item }) => {
    const vendor = getVendorInfo(item.contactId);
    return (
      <TouchableOpacity
        style={styles.chatItemContainer}
        onPress={() =>
          navigation.navigate("IndividualChatCustomer", {
            chatId: item.id,
            userId: customerId.toString(),
            contactName: vendor.name,
            contactAvatar: vendor.avatar,
            contactInitials: vendor.initials,
            vendorId: item.contactId,
          })
        }
      >
        <View style={styles.avatarContainer}>
          {vendor.avatar
            ? <Image source={{ uri: vendor.avatar }} style={styles.avatar} />
            : <Text style={styles.avatarText}>{vendor.initials}</Text>
          }
        </View>
        <View style={styles.chatInfo}>
          <Text style={styles.contactName}>{vendor.name}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage ? item.lastMessage.text : ""}
          </Text>
        </View>
        <Text style={styles.timestamp}>
          {item.lastMessage ? new Date(item.lastMessage.timestamp).toLocaleDateString() : ""}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Tin nhắn với nhà hàng</Text>
      <Button title="Tạo chat mẫu với vendor 1" onPress={createSampleChat} />
      <FlatList
        data={chatList}
        renderItem={renderChatItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 20 + insets.bottom }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.DEFAULT_WHITE },
  screenTitle: { fontSize: 24, fontWeight: "bold", margin: 16 },
  chatItemContainer: {
    flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderColor: Colors.GRAY_BORDER
  },
  avatarContainer: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.PLACEHOLDER_AVATAR_BG,
    justifyContent: "center", alignItems: "center", marginRight: 12
  },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarText: { color: Colors.DEFAULT_WHITE, fontWeight: "bold", fontSize: 20 },
  chatInfo: { flex: 1 },
  contactName: { fontWeight: "bold", fontSize: 16 },
  lastMessage: { color: Colors.DARK_GREY_TEXT, fontSize: 14 },
  timestamp: { color: Colors.DEFAULT_GREY, fontSize: 12, marginLeft: 8 }
});