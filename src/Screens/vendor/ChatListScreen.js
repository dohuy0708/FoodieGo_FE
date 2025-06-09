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
import { GetUserById } from '../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useSessionStore from "../../utils/store";
import Icon from "react-native-vector-icons/Ionicons";
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
  const vendorId = useSessionStore((state) => state.restaurantId);
  const [isLoading, setIsLoading] = useState(true);
 
  // Lắng nghe danh sách chat realtime
  useEffect(() => {
    const unsubscribe = listenUserChats(vendorId.toString(), async (rawList) => {
      const token = await AsyncStorage.getItem("token");
      const newList = await Promise.all(rawList.map(async (item) => {
        // Lấy customerId từ members (id khác với vendorId)
        const memberIds = Object.keys(item.members);
        const customerId = memberIds.find(id => id !== vendorId.toString());
        let userInfo = null;
        if (customerId) {
          try {
            // Nếu cần token, truyền vào hàm GetUserById
            const userData = await GetUserById(Number(customerId), token);
            console.log("userData",userData);
            // userData có thể là { data: { findUserById: ... } }
            userInfo = userData?.data?.findUserById || null;
          } catch (e) {
            userInfo = null;
          }
        }
        return { ...item, userInfo, customerId };
      }));
      setChatList(newList);
      setIsLoading(false);
    });
    return unsubscribe;
  }, [vendorId]);

  const renderChatItem = ({ item }) => {
    const user = item.userInfo;
    return (
      <TouchableOpacity
        style={styles.chatItemContainer}
        onPress={() =>
          navigation.navigate("IndividualChat", {
            chatId: item.id,
            userId: vendorId.toString(),
            contactName: user ? user.name : "Đang tải...",
            contactAvatar: user?.avatar || null,
            contactInitials: user?.name ? user.name[0] : "U",
            customerId: item.customerId,
          })
        }
      >
        <View style={styles.avatarContainer}>
          {user?.avatar
            ? <Image source={{ uri: user.avatar }} style={styles.avatar} />
            : <MaterialIcons name="person" size={24} color="black" />
          }
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.contactName}>{user ? user.name : `Khách hàng ${item.customerId}`}</Text>
            <Text style={styles.timestamp}>{item.lastMessage ? new Date(item.lastMessage.timestamp).toLocaleDateString() : ''}</Text>
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage ? item.lastMessage.text : ''}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={{flex:1}}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Tin nhắn</Text>
      </View>
      
      {isLoading ? (<Text style={{fontSize: 20, fontWeight: "bold", alignSelf: "center", marginTop: Display.setHeight(10),flex:1}}>Đang tải...</Text>) :
      chatList.length > 0 ? (
        <FlatList
          data={chatList}
          renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        // Thêm paddingBottom cho FlatList để nội dung cuối không bị che bởi Nav
        contentContainerStyle={{ paddingBottom: NAV_HEIGHT + Display.setHeight(1) }}
        style={{flex: 1}} // Đảm bảo FlatList chiếm không gian
      />
      ) : (
        <Text style={{fontSize: 20, fontWeight: "bold", alignSelf: "center", marginTop: Display.setHeight(10)}}>Không có tin nhắn</Text>
      )}
      </View>
     
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
  headerContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
   justifyContent: "flex-start",
    paddingVertical: Display.setHeight(1.2),
    backgroundColor: "#ffffff",
    
  },
  backButton: { padding: 8 },
});