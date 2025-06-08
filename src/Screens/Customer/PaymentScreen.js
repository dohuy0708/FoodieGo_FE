import React, { useState, useRef } from "react";
import { WebView } from "react-native-webview";
import { View, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants";

export default function PaymentScreen({ route, navigation }) {
  const { payUrl, orderId } = route.params;
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const handleNavigationChange = (navState) => {
    const { url } = navState;

    if (url.includes("/payment/success")) {
      setLoading(false);
      Alert.alert(
        "Thanh toán thành công",
        "Cảm ơn bạn đã thanh toán đơn hàng.",
        [{ text: "OK", onPress: () => navigation.replace("MainApp") }]
      );
    } else if (url.includes("/payment/cancel")) {
      setLoading(false);
      Alert.alert("Hủy thanh toán", "Bạn đã hủy thanh toán.");
      navigation.replace("MainApp");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <WebView
          ref={webViewRef}
          source={{ uri: payUrl }}
          onNavigationStateChange={handleNavigationChange}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
        />
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.DEFAULT_GREEN} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});
