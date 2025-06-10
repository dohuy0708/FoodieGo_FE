import Navigation from "./src/navigation/navigation.js";
import * as Notifications from "expo-notifications";
import { LocaleConfig } from "react-native-calendars";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as RootNavigation from "./src/navigation/RootNavigation";
import AsyncStorage from "@react-native-async-storage/async-storage";
LocaleConfig.locales["vi"] = {
  monthNames: [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ],
  monthNamesShort: [
    // Có thể cần hoặc không, tùy thuộc vào theme/cách hiển thị
    "Thg 1",
    "Thg 2",
    "Thg 3",
    "Thg 4",
    "Thg 5",
    "Thg 6",
    "Thg 7",
    "Thg 8",
    "Thg 9",
    "Thg 10",
    "Thg 11",
    "Thg 12",
  ],
  dayNames: [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ],
  dayNamesShort: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
  today: "Hôm nay", // Văn bản cho nút "Hôm nay" nếu có
};
LocaleConfig.defaultLocale = "vi";

export default function App() {
  useEffect(() => {
    // Lắng nghe sự kiện khi người dùng nhấn vào thông báo
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        // Điều hướng đến trang Notification
        RootNavigation.navigate("Notification");
      }
    );

    return () => subscription.remove();
  }, []);
  return (
    <SafeAreaProvider>
      <Navigation />
    </SafeAreaProvider>
  );
}
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Hiện banner
    shouldPlaySound: true, // Có thể bật âm thanh nếu muốn
    shouldSetBadge: false,
  }),
  onPress: async (notification) => {
    const user = await AsyncStorage.getItem("user");
    if (user.roleId === 1) {
      RootNavigation.navigate("NotificationScreen");
    } else {
      RootNavigation.navigate("Notification");
    }
  },
});
