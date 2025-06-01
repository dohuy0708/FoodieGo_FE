import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { updateUser } from './userService';
import { Platform } from 'react-native';

// 1. Đăng ký và lấy expoPushToken
export async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    alert('Must use physical device for Push Notifications');
  }
  return token;
}

// 2. Gửi token lên server sử dụng userService.updateUser
export async function sendPushTokenToServer(userId, expoPushToken) {
  try {
    console.log('expoPushToken', expoPushToken);
    console.log('userId', userId);
    const result = await updateUser(userId, 'expoMessageToken', expoPushToken);
    return result;
  } catch (error) {
    console.error('Lỗi gửi push token lên server:', error);
    return null;
  }
}

// 3. Lắng nghe khi nhận thông báo (foreground)
export function addNotificationReceivedListener(callback) {
  return Notifications.addNotificationReceivedListener(callback);
}

// 4. Lắng nghe khi user nhấn vào thông báo (background/foreground)
export function addNotificationResponseReceivedListener(callback) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

// 5. Gửi notification test từ client (chỉ dùng cho dev, không dùng cho production)
export async function sendTestPushNotification(expoPushToken, title, body) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data: { test: true },
  };
  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    return await response.json();
  } catch (error) {
    console.error('Lỗi gửi test push notification:', error);
    return null;
  }
}
