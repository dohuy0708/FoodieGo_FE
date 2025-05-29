// src/services/chatService.js
import { database } from '../config/firebase';
import { ref, push, onValue, off, update } from 'firebase/database';

// Lắng nghe tin nhắn realtime của một cuộc chat
export const listenMessages = (chatId, callback) => {
  const messagesRef = ref(database, `chats/${chatId}/messages`);
  const unsubscribe = onValue(messagesRef, (snapshot) => {
    const data = snapshot.val() || {};
    // Chuyển object thành array, sort theo timestamp
    const messages = Object.entries(data)
      .map(([id, value]) => ({ id, ...value }))
      .sort((a, b) => a.timestamp - b.timestamp);
    callback(messages);
  });
  return () => off(messagesRef, 'value', unsubscribe);
};

// Lắng nghe danh sách các cuộc chat mà user là thành viên
export const listenUserChats = (userId, callback) => {
  const chatsRef = ref(database, 'chats');
  const unsubscribe = onValue(chatsRef, (snapshot) => {
    const data = snapshot.val() || {};
    // Lọc các chat mà userId là thành viên
    const chatList = Object.entries(data)
      .filter(([chatId, chat]) => chat.members && chat.members[userId])
      .map(([chatId, chat]) => {
        let lastMessage = null;
        if (chat.messages) {
          const messagesArr = Object.entries(chat.messages).map(([id, value]) => ({ id, ...value }));
          if (messagesArr.length > 0) {
            lastMessage = messagesArr.sort((a, b) => b.timestamp - a.timestamp)[0];
          }
        }
        // Lấy thông tin đối tác (bạn có thể mở rộng thêm nếu muốn)
        return {
          id: chatId,
          ...chat,
          lastMessage,
        };
      });
    callback(chatList);
  });
  return () => off(chatsRef, 'value', unsubscribe);
};

// Gửi tin nhắn mới
export const sendMessage = (chatId, senderId, text) => {
  const messagesRef = ref(database, `chats/${chatId}/messages`);
  return push(messagesRef, {
    sender: senderId,
    text,
    timestamp: Date.now(),
    recalled: false,
  });
};

// Thu hồi tin nhắn
export const recallMessage = (chatId, messageId) => {
  const messageRef = ref(database, `chats/${chatId}/messages/${messageId}`);
  return update(messageRef, {
    text: 'Tin nhắn đã được thu hồi',
    recalled: true,
  });
};