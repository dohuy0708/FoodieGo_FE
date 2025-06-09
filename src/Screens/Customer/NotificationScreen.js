import React, { useEffect, useState,useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import Colors from "../../constants/Colors";
import Nav from "../../components/Nav";
import Display from "../../utils/Display";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { addNotificationReceivedListener } from "../../services/pushNotification";
import { findNotificationByUserId } from "../../services/vendorService";
import { UserContext } from "../../context/UserContext";
import Icon from "react-native-vector-icons/Ionicons";
const NAV_COMPONENT_HEIGHT = Display.setHeight(7);

export default function Notification({ navigation }) {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState([]);
  const { userInfo } = useContext(UserContext);
  useEffect(() => {
    // Lắng nghe thông báo mới
    const subscription = addNotificationReceivedListener((notification) => {
      const { title, body } = notification.request.content;
      const date = notification.date
        ? new Date(notification.date)
        : new Date();
      setNotifications((prev) => [
        {
          id: Date.now().toString() + Math.random(),
          title,
          body,
          date,
        },
        ...prev,
      ]);
    });
    return () => {
      if (subscription && subscription.remove) subscription.remove();
    };
  }, []);
  useEffect(() => {
    const fetchNotifications = async () => {
      const userId = userInfo.id; // Thay thế bằng userId thực tế
      const notifications = await findNotificationByUserId(userId);
      const sortedNotifications = [...notifications].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setNotifications(sortedNotifications);
    };
    fetchNotifications();
  }, []);
  
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    const hour = d.getHours().toString().padStart(2, "0");
    const minute = d.getMinutes().toString().padStart(2, "0");
    return `${day}/${month}/${year} ${hour}:${minute}`;
  };
  const toVietnamTime = (isoString) => {
    const date = new Date(isoString);
    // Cộng thêm 7 tiếng (7 * 60 * 60 * 1000 ms)
    date.setHours(date.getHours() + 7);
    return date;
  };
  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => {
      if(item.title.includes("Đơn hàng")){
        navigation.navigate("OrderList");
      }
      else{
        navigation.navigate("ChatListScreen");
      }
    }}>
    <View style={styles.orderItem}>
      <Text style={{ fontWeight: "bold", fontSize: 16, color: Colors.DEFAULT_GREEN }}>
        {item.title}
      </Text>
      <Text style={{ fontSize: 15, color: Colors.DEFAULT_BLACK, marginVertical: 2 }}>
        {item.content || item.body}
      </Text>
      <Text style={{ fontSize: 13, color: Colors.GRAY_DARK, alignSelf: "flex-end" }}>
        {formatDate(item.date)||formatDate(toVietnamTime(item.createdAt))}
      </Text>
      <View style={{width: "100%", height: 1, backgroundColor: Colors.LIGHT_GREY2}}></View>
    </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.header}>Thông báo</Text>
      </View>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.flatListStyle}
        contentContainerStyle={styles.listContentContainer}
        ListEmptyComponent={
          <Text style={{ color: Colors.GRAY_DARK, textAlign: "center", marginTop: 30 }}>
            Chưa có thông báo nào.
          </Text>
        }
      />
      <View style={[styles.navContainer, { bottom: insets.bottom }]}> 
        <Nav nav={navigation} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
   navContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    height: NAV_COMPONENT_HEIGHT,
    backgroundColor: Colors.DEFAULT_WHITE || "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    zIndex: 10,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: Colors.LIGHT_GREY2,
  },
  container: {
    paddingHorizontal: Display.setWidth(3),
    paddingTop: Display.setHeight(5),
    paddingBottom: NAV_COMPONENT_HEIGHT,
    flex: 1,
    width: "100%",
    backgroundColor: "#fff",
    alignItems: "center",
    gap: Display.setHeight(2.5),
  },
  header: {
    textAlign: "center",
    color: Colors.DEFAULT_GREEN,
    fontWeight: "bold",
    fontSize: 28,
  
  },
  flatListStyle: {
    width: "100%",
  },
  listContentContainer: {
    gap: Display.setHeight(1.2),
  },
  orderItem: {
    width: "100%",
    paddingVertical: Display.setHeight(1.2),
    paddingHorizontal: Display.setWidth(5),
    backgroundColor: "#fff",
    gap: Display.setHeight(1.2),
  },
  viewText: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  textStyle: {
    fontSize: 15,
    color: Colors.DEFAULT_BLACK,
  },
  button: {
    backgroundColor: Colors.DEFAULT_GREEN,
    paddingVertical: Display.setHeight(1.2),
    paddingHorizontal: Display.setWidth(5),
    borderRadius: 5,
    alignSelf: "flex-end",
    marginTop: Display.setHeight(0.5),
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
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
