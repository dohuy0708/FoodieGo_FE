// IndividualChatScreen.js
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import Colors from "../../constants/Colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Display from "../../utils/Display";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { listenMessages, sendMessage, recallMessage, updateMessage } from '../../services/chatService';
import { sendNotification } from '../../services/vendorService';

if (typeof Display === "undefined") {
  global.Display = {
    setHeight: (val) => val * 8,
    setWidth: (val) => val * 4,
  };
}
if (typeof Colors === "undefined") {
  global.Colors = {
    DEFAULT_WHITE: "#FFFFFF",
    DEFAULT_GREEN: "#2ecc71",
    DEFAULT_BLACK: "#000000",
    LIGHT_GREY: "#E0E0E0",
    GRAY_BORDER: "#CCCCCC",
    DEFAULT_BLUE: "#3498db",
    DEFAULT_RED: "#e74c3c",
    LIGHT_BLUE: "#ADD8E6",
    PLACEHOLDER_AVATAR_BG: "#C0C0C0",
    DARK_GREY_TEXT: "#555555",
    DEFAULT_BLACK_OPACITY_50: "rgba(0,0,0,0.5)",
  };
}


const MessageContextMenu = ({ visible, onEdit, onRecall }) => {
  if (!visible) return null;
  return (
    <View style={{
      position: 'absolute',
      top: '40%',
      left: '50%',
      transform: [
        { translateX: -0.5 * Display.setWidth(70) },
        { translateY: -0.5 * Display.setHeight(7.5) }
      ],
      zIndex: 1000,
      backgroundColor: Colors.DEFAULT_WHITE,
      borderRadius: 8,
      elevation: 5,
      shadowColor: Colors.DEFAULT_BLACK,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      padding: Display.setWidth(2),
      width: Display.setWidth(70),

      justifyContent: "space-around",
    }}>
      <TouchableOpacity style={styles.contextMenuItem} onPress={onEdit}>
        <MaterialIcons name="edit" size={20} color={Colors.DEFAULT_BLACK} />
        <Text style={styles.contextMenuText}>Chỉnh sửa</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.contextMenuItem} onPress={onRecall}>
        <MaterialIcons name="undo" size={20} color={Colors.DEFAULT_BLACK} />
        <Text style={styles.contextMenuText}>Thu hồi</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function IndividualChatScreen({ route, navigation }) {
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    message: null,
  });
  const chatId = route.params?.chatId;
  const contactName = route.params?.contactName;
  const contactAvatar = route.params?.contactAvatar;
  const contactInitials = route.params?.contactInitials;
  const userId = route.params?.userId || 'user1';
  const customerId = route.params?.customerId;
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [editingMessage, setEditingMessage] = useState(null);
  const flatListRef = useRef(null);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    if (!chatId) return;
    const unsubscribe = listenMessages(chatId, setMessages);
    return unsubscribe;
  }, [chatId]);

  useEffect(() => {
    navigation.setOptions({
      title: contactName || "Trò chuyện",
    });
  }, [navigation, contactName]);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100
      );
    }
  }, [messages]);

  useEffect(() => {
    const onKeyboardShow = () => setKeyboardOffset(30); // offset khi bàn phím hiện
    const onKeyboardHide = () => setKeyboardOffset(0);  // offset khi bàn phím ẩn

    const showSub = Keyboard.addListener("keyboardDidShow", onKeyboardShow);
    const hideSub = Keyboard.addListener("keyboardDidHide", onKeyboardHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSend = async () => {
    if (inputText.trim() === "") return;
    if (editingMessage) {
      updateMessage(chatId, editingMessage.id, inputText);
      setEditingMessage(null);
    } else {
      sendMessage(chatId, userId,  inputText);
      await sendNotification({
        title: 'Tin nhắn mới',
        content: 'Bạn có tin nhắn mới',
        type: 'push',
        userId: parseInt(customerId),
      });
    }
    setInputText("");
  };

  const handleRecall = (messageId) => {
    recallMessage(chatId, messageId);
  };

  const renderMessageItem = ({ item, index }) => {
    const isUser = item.sender === userId;
    const showAvatar =
      !isUser &&
      (index === 0 ||
        (messages[index - 1] && messages[index - 1].sender === userId));

    const getAvatarContent = () => {
      if (contactAvatar) {
        return (
          <Image source={{ uri: contactAvatar }} style={styles.messageAvatar} />
        );
      } else if (contactInitials) {
        return (
          <MaterialIcons name="person" size={24} color="black" />
        );
      }
      return (
         <MaterialIcons name="person" size={24} color="black" />
      );
    };

    return (
      <View
        style={[styles.messageRow, isUser ? styles.userRow : styles.otherRow]}
      >
        {showAvatar && (
          <View style={styles.avatarColumn}>{getAvatarContent()}</View>
        )}
        {!showAvatar && !isUser && <View style={styles.avatarPlaceholder} />}
        <View style={{ flexShrink: 1 }}>
          <TouchableOpacity
            onLongPress={() => {
              if (item.recalled || item.sender !== userId) return;
              setContextMenu({ visible: true, message: item });
            }}
            activeOpacity={0.8}
            style={[
              styles.messageBubble,
              isUser ? styles.userMessage : styles.otherMessage,
              item.recalled && styles.recalledMessage,

              styles.bubbleMinWidth,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                isUser ? styles.userMessageText : styles.otherMessageText,
                item.recalled && styles.recalledMessageText,
              ]}
            >
              {item.text}
            </Text>

          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const headerHeight = Platform.select({
    ios: 44 + insets.top,
    android: 56,
    default: 56,
  });

  return (
    <TouchableWithoutFeedback
      onPress={() => setContextMenu({ visible: false, message: null })}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : keyboardOffset}
      >
        <View
          style={[
            styles.container,

          ]}
        >
        <Text style={{fontSize: Display.setWidth(5), fontWeight: "bold", marginBottom: Display.setHeight(2),alignSelf: "center", marginTop: Display.setHeight(2)}}>{contactName}</Text>

          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={(item) => item.id}
            style={styles.messageList}
            contentContainerStyle={{
              paddingBottom: Display.setHeight(1),
              paddingTop: Display.setHeight(1),
            }}

          />
          <View
            style={[
              styles.inputContainer,
              {
                paddingBottom: insets.bottom > 0 ? insets.bottom : Display.setHeight(1),
              },
            ]}
          >
            {editingMessage && (
              <TouchableOpacity
                onPress={() => {
                  setEditingMessage(null);
                  setInputText("");
                }}
                style={styles.cancelEditButton}
              >
                <MaterialIcons
                  name="close"
                  size={Display.setWidth(5)}
                  color={Colors.DEFAULT_RED}
                />
              </TouchableOpacity>
            )}
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder={editingMessage ? "Đang sửa..." : "Nhắn tin..."}
              multiline
              placeholderTextColor={Colors.DEFAULT_BLACK}
            />
            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <MaterialIcons name="send" size={24} color={Colors.DEFAULT_GREEN} />
            </TouchableOpacity>
          </View>
        </View>
        {contextMenu.visible && (
          <MessageContextMenu
            visible={true}
            onEdit={() => {
              if (contextMenu.message) {
                setInputText(contextMenu.message.text);
                setEditingMessage(contextMenu.message);
              }
              setContextMenu({ visible: false, message: null });
            }}
            onRecall={() => {
              if (contextMenu.message) {
                handleRecall(contextMenu.message.id);
              }
              setContextMenu({ visible: false, message: null });
            }}
          />
        )}
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.DEFAULT_WHITE,
  },
  messageList: {
    flex: 1,
    paddingHorizontal: Display.setWidth(2.5),
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: Display.setHeight(1.5),
    alignItems: "flex-end",
  },
  userRow: {
    justifyContent: "flex-end",
  },
  otherRow: {
    justifyContent: "flex-start",
  },
  avatarColumn: {
    width: Display.setWidth(8),
    marginRight: Display.setWidth(1.5),
    justifyContent: "flex-end",
  },
  avatarPlaceholder: {
    width: Display.setWidth(8) + Display.setWidth(1.5),
  },
  messageAvatar: {
    width: Display.setWidth(8),
    height: Display.setWidth(8),
    borderRadius: Display.setWidth(4),
  },
  avatarInitialsCircle: {
    backgroundColor: Colors.PLACEHOLDER_AVATAR_BG,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitialsText: {
    color: Colors.DEFAULT_WHITE,
    fontSize: Display.setWidth(3.5),
    fontWeight: "bold",
  },
  messageBubble: {
    paddingVertical: Display.setHeight(1),
    paddingHorizontal: Display.setWidth(3),
    borderRadius: 18,
    maxWidth:Display.setWidth(70),
  },
  userMessage: {
    backgroundColor: Colors.DEFAULT_GREEN,
    borderBottomRightRadius: 5,
    alignSelf: "flex-end",
  },
  otherMessage: {
    backgroundColor: Colors.LIGHT_GREY,
    borderBottomLeftRadius: 5,
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: Display.setWidth(4),
    lineHeight: Display.setWidth(5),
  },
  userMessageText: {
    color: Colors.DEFAULT_WHITE,
  },
  otherMessageText: {
    color: Colors.DEFAULT_BLACK,
  },
  recalledMessage: {
    backgroundColor: Colors.LIGHT_GREY,
  },
  recalledMessageText: {
    color: Colors.DARK_GREY_TEXT,
    fontStyle: 'italic',
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Display.setWidth(2),
    paddingTop: Display.setHeight(1),
    borderTopWidth: 1,
    borderTopColor: Colors.GRAY_BORDER,
    backgroundColor: Colors.DEFAULT_WHITE,
  },
  textInput: {
    flex: 1,
    minHeight: Display.setHeight(5),
    maxHeight: Display.setHeight(15),
    borderColor: Colors.GRAY_BORDER,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: Display.setWidth(3.5),
    paddingVertical: Platform.OS === "ios" ? Display.setHeight(1.2) : Display.setHeight(0.8),
    fontSize: Display.setWidth(4),
    marginRight: Display.setWidth(2),
    backgroundColor: "#f0f0f0",
    color: Colors.DEFAULT_BLACK,
  },
  sendButton: {
    backgroundColor: Colors.DEFAULT_BLUE,
    width: Display.setHeight(5.5),
    height: Display.setHeight(5.5),
    borderRadius: Display.setHeight(2.75),
    justifyContent: "center",
    alignItems: "center",
  },
  cancelEditButton: {
    padding: Display.setWidth(1.5),
    marginRight: Display.setWidth(1.5),
    justifyContent: "center",
    alignItems: "center",
  },
  contextMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Display.setHeight(1.2),
    paddingHorizontal: Display.setWidth(3),
  },
  contextMenuText: {
    marginLeft: Display.setWidth(2.5),
    fontSize: Display.setWidth(3.8),
    color: Colors.DEFAULT_BLACK,
  },


});