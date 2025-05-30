// ChatListScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Platform, // Thêm Platform để sử dụng cho padding
} from "react-native";
import Colors from "../../constants/Colors"; // Đường dẫn này giả định file nằm trong /screens
import Display from "../../utils/Display";   // Đường dẫn này giả định file nằm trong /screens
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Nav from "../../components/Nav"; // Đường dẫn này giả định file nằm trong /screens
import { listenUserChats } from '../../services/chatService';

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

export default function ChatListScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [chatList, setChatList] = useState([]);
  const vendorId = 1; // Giả định id nhà hàng là 1

  // Lắng nghe danh sách chat realtime
  useEffect(() => {
    const unsubscribe = listenUserChats(vendorId.toString(), setChatList);
    return unsubscribe;
  }, [vendorId]);

  const renderChatItem = ({ item }) => {
    const getAvatarContent = () => {
      if (item.contactAvatar) {
        return <Image source={{ uri: item.contactAvatar }} style={styles.avatar} />;
      } else if (item.contactInitials) {
        return <Text style={styles.avatarText}>{item.contactInitials}</Text>;
      }
      return <View style={[styles.avatar, {backgroundColor: Colors.PLACEHOLDER_AVATAR_BG }]} />;
    };

    // Lấy thông tin hiển thị từ lastMessage
    const lastMsg = item.lastMessage;
    let lastMessageText = lastMsg ? lastMsg.text : '';
    let lastMessageTime = lastMsg ? new Date(lastMsg.timestamp).toLocaleDateString() : '';

    return (
      <TouchableOpacity
        style={styles.chatItemContainer}
        onPress={() =>
          navigation.navigate("IndividualChatVendor", {
            chatId: item.id,
            userId: vendorId.toString(),
            contactName: item.contactName || '',
            contactAvatar: item.contactAvatar || '',
            contactInitials: item.contactInitials || '',
          })
        }
      >
        <View style={[styles.avatarContainer, item.contactAvatar ? {} : {backgroundColor: Colors.PLACEHOLDER_AVATAR_BG}]}> 
          {getAvatarContent()}
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.contactName}>{item.contactName || 'Đối tác'}</Text>
            <Text style={styles.timestamp}>{lastMessageTime}</Text>
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>{lastMessageText}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Tin nhắn</Text>
      <FlatList
        data={chatList}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        // Thêm paddingBottom cho FlatList để nội dung cuối không bị che bởi Nav
        contentContainerStyle={{ paddingBottom: NAV_HEIGHT + Display.setHeight(1) }}
        style={{flex: 1}} // Đảm bảo FlatList chiếm không gian
      />
      {/* Navigation Bar cố định ở dưới cùng */}
      <View style={[styles.navContainerFixed, { paddingBottom: insets.bottom, height: NAV_HEIGHT + insets.bottom }]}>
        {Nav ? <Nav nav={navigation} /> : <MockNav nav={navigation}/>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.DEFAULT_WHITE,
    // paddingBottom: NAV_HEIGHT, // Loại bỏ paddingBottom ở đây, sẽ xử lý bằng contentContainerStyle của FlatList và height của Nav
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.DEFAULT_BLACK,
    paddingHorizontal: Display.setWidth(4),
    paddingTop: Display.setHeight(2) + (Platform.OS === 'ios' ? insets.top : 0), // Điều chỉnh padding theo insets.top
    paddingBottom: Display.setHeight(1.5),
    backgroundColor: Colors.DEFAULT_WHITE, // Đảm bảo title có nền nếu cần
  },
  chatItemContainer: {
    flexDirection: "row",
    paddingHorizontal: Display.setWidth(4),
    paddingVertical: Display.setHeight(1.5),
    alignItems: "center",
    backgroundColor: Colors.DEFAULT_WHITE,
  },
  avatarContainer: {
    width: Display.setWidth(13),
    height: Display.setWidth(13),
    borderRadius: Display.setWidth(6.5),
    justifyContent: "center",
    alignItems: "center",
    marginRight: Display.setWidth(3),
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: Display.setWidth(6.5),
  },
  avatarText: {
    fontSize: Display.setWidth(5),
    color: Colors.DEFAULT_WHITE,
    fontWeight: 'bold',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.DEFAULT_WHITE,
    borderRadius: 10,
    padding: 1,
  },
  chatInfo: {
    flex: 1,
    justifyContent: "center",
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Display.setHeight(0.5),
  },
  contactName: {
    fontSize: 17,
    fontWeight: "500",
    color: Colors.DEFAULT_BLACK,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.DEFAULT_GREY,
  },
  lastMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageIcon: {
    marginRight: Display.setWidth(1),
  },
  lastMessage: {
    fontSize: 14,
    color: Colors.DARK_GREY_TEXT,
  },
  unreadBadge: {
    backgroundColor: Colors.DEFAULT_GREEN,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    marginLeft: Display.setWidth(2)
  },
  unreadText: {
    color: Colors.DEFAULT_WHITE,
    fontSize: 12,
    fontWeight: 'bold'
  },
  separator: {
    height: 1,
    backgroundColor: Colors.GRAY_BORDER,
    marginLeft: Display.setWidth(13) + Display.setWidth(4) + Display.setWidth(3),
  },
  navContainerFixed: {
    // position: "absolute", // Không cần nếu không có KeyboardAvoidingView phức tạp
    // bottom: 0,             // Đã được tính vào height và paddingBottom
    left: 0,
    right: 0,
    backgroundColor: Colors.DEFAULT_WHITE || "#fff",
    borderTopWidth: 1,
    borderTopColor: Colors.GRAY_BORDER || "#e0e0e0", // Sử dụng Colors.GRAY_BORDER nếu có
    // zIndex: 10, // Chỉ cần nếu có thành phần khác có thể che phủ
  },
});