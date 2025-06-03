// ChatListScreen.js
import React, { useState } from "react";
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
const initialChatListData = [
  {
    id: "chat1",
    name: "Phạm Phố",
    lastMessage: "WEBGROUP.pptx",
    timestamp: "09/05/24",
    avatar: null,
    messageType: "file",
    unreadCount: 0,
  },
  {
    id: "chat2",
    name: "Hồ Thị Mỹ Tâm",
    lastMessage: "Oke",
    timestamp: "02/05/24",
    avatar: "https://via.placeholder.com/50/00FF00/808080?Text=HTMT",
    messageType: "text",
    unreadCount: 2,
  },
  {
    id: "chat3",
    name: "Phạm Hoàng Duy",
    lastMessage: "2024-04-28 13-58-50.mp4",
    timestamp: "28/04/24",
    avatarInitials: "PD",
    messageType: "file",
    unreadCount: 0,
  },
  {
    id: "chat4",
    name: "Ngữ Văn 12A1",
    lastMessage: "Hồ Minh Khôi: [Tin nhắn đã tự xóa]",
    timestamp: "28/04/24",
    avatarInitials: "NV",
    messageType: "text_special",
    unreadCount: 0,
  },
  {
    id: "chat5",
    name: "Lê Quốc Thái",
    lastMessage: "Bạn: 📍 A14 KTX A ĐHQG TPHCM, Đô...",
    timestamp: "06/04/24",
    avatar: "https://via.placeholder.com/50/FF0000/FFFFFF?Text=LQT",
    messageType: "location",
    isSender: true,
    unreadCount: 0,
  },
  {
    id: "chat6",
    name: "CELLPHONES",
    lastMessage: "các bạn sẽ giao hàng trước 12h trưa ...",
    timestamp: "04/04/24",
    avatar: "https://via.placeholder.com/50/FFA500/000000?Text=S",
    messageType: "text",
    isVerified: true,
    unreadCount: 1,
  },
];

export default function ChatListScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [chatList, setChatList] = useState(initialChatListData);
  const customerId = 251; // Giả định id khách hàng là 251

  const renderChatItem = ({ item }) => {
    const getAvatarContent = () => {
      if (item.avatar) {
        return <Image source={{ uri: item.avatar }} style={styles.avatar} />;
      } else if (item.avatarInitials) {
        return <Text style={styles.avatarText}>{item.avatarInitials}</Text>;
      }
      return <View style={[styles.avatar, {backgroundColor: Colors.PLACEHOLDER_AVATAR_BG }]} />;
    };

    const renderLastMessage = () => {
      let prefix = "";
      if (item.isSender) prefix = "Bạn: ";
      let icon = null;
      if (item.messageType === "file") icon = <MaterialIcons name="attach-file" size={14} color={Colors.DARK_GREY_TEXT} style={styles.messageIcon} />;
      if (item.messageType === "location") icon = <MaterialIcons name="location-on" size={14} color={Colors.DARK_GREY_TEXT} style={styles.messageIcon} />;
      return (
        <View style={styles.lastMessageContainer}>
          {icon}
          <Text style={styles.lastMessage} numberOfLines={1}>
            {prefix}{item.lastMessage}
          </Text>
        </View>
      );
    };

    return (
      <TouchableOpacity
        style={styles.chatItemContainer}
        onPress={() =>
          navigation.navigate("IndividualChatCustomer", {
            chatId: `customer_${customerId}_vendor_${item.id}`,
            userId: customerId.toString(),
            contactName: item.name,
            contactAvatar: item.avatar,
            contactInitials: item.avatarInitials
          })
        }
      >
        <View style={[styles.avatarContainer, item.avatar ? {} : {backgroundColor: Colors.PLACEHOLDER_AVATAR_BG}]}> 
          {getAvatarContent()}
          {item.isVerified && (
            <View style={styles.verifiedBadge}>
              <MaterialIcons name="check-circle" size={16} color={Colors.DEFAULT_GREEN} />
            </View>
          )}
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.contactName}>{item.name}</Text>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>
          {renderLastMessage()}
        </View>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadCount}</Text>
          </View>
        )}
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