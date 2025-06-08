import { View, Text } from "react-native";
import React, { useState } from "react";
import * as Location from "expo-location";
import { useEffect } from "react";
const NotificationScreen = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {location ? (
        <Text>
          Vị trí: {location.coords.latitude}, {location.coords.longitude}
        </Text>
      ) : (
        <Text>{errorMsg || "Đang lấy vị trí..."}</Text>
      )}
    </View>
  );
};

export default NotificationScreen;
