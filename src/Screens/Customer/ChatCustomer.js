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
import {getRestaurantById} from '../../services/vendorService';
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
  const customerId = userInfo?.id;
  const [chatList, setChatList] = useState([]);
  const insets = useSafeAreaInsets();

  // Kiểm tra nếu không có userInfo
  if (!userInfo) {
    return (
      <View style={styles.loginPromptContainer}>
       
        <Text style={styles.loginPromptTitle}>Bạn chưa đăng nhập</Text>
        <Text style={styles.loginPromptText}>
          Vui lòng đăng nhập để sử dụng tính năng chat với nhà hàng
        </Text>
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => navigation.navigate('LoginScreen')}
        >
          <Text style={styles.loginButtonText}>Đăng nhập ngay</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Lắng nghe danh sách chat
  useEffect(() => {
    const unsubscribe = listenUserChats(customerId.toString(), async (rawList) => {
      const newList = await Promise.all(rawList.map(async (item) => {
        // Lấy vendorId từ members (id khác với customerId)
        const memberIds = Object.keys(item.members);

        const vendorId = memberIds.find(id => id !== customerId.toString());
      
        let restaurantInfo = null;
        if (vendorId) {
          const info = await getRestaurantById(Number(vendorId));
         
          restaurantInfo = Array.isArray(info) ? info[0] : info;
          
        }
        return { ...item, restaurantInfo, vendorId };
      }));
      setChatList(newList);
    });
    return unsubscribe;
  }, [customerId]);

  // Hàm tạo node chat mẫu với vendorId = 4
  const createSampleChat = async () => {
    try {
      const vendorId = 4;
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
      Alert.alert("Thành công", "Đã tạo chat mẫu với vendor 4!");
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể tạo chat mẫu");
    }
  };

  const renderChatItem = ({ item }) => {
    const vendor = item.restaurantInfo;
    console.log("vendor",vendor);
    return (
      <TouchableOpacity
        style={styles.chatItemContainer}
        onPress={() =>
          navigation.navigate("IndividualChatCustomer", {
            chatId: item.id,
            userId: customerId.toString(),
            contactName: vendor ? vendor.name : "Đang tải...",
            contactAvatar: vendor?.avatar || null,
            contactInitials: vendor?.name ? vendor.name[0] : "V",
            ownerId: vendor?.owner?.id,
            vendorId: item.vendorId,
          })
        }
      >
        <View style={styles.avatarContainer}>
          {vendor?.avatar
            ? <Image source={{ uri: vendor.avatar }} style={styles.avatar} />
            : <Text style={styles.avatarText}>{vendor?.name ? vendor.name[0] : "V"}</Text>
          }
        </View>
        <View style={styles.chatInfo}>
          <Text style={styles.contactName}>{vendor ? vendor.name : `Nhà hàng ${item.vendorId}`}</Text>
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
  timestamp: { color: Colors.DEFAULT_GREY, fontSize: 12, marginLeft: 8 },
  // Styles cho màn hình thông báo login
  loginPromptContainer: {
    flex: 1,
    backgroundColor: Colors.DEFAULT_WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32
  },
  loginPromptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.DEFAULT_BLACK,
    marginTop: 16,
    marginBottom: 8
  },
  loginPromptText: {
    fontSize: 16,
    color: Colors.DARK_GREY_TEXT,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32
  },
  loginButton: {
    backgroundColor: Colors.DEFAULT_GREEN,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  loginButtonText: {
    color: Colors.DEFAULT_WHITE,
    fontSize: 16,
    fontWeight: 'bold'
  }
});