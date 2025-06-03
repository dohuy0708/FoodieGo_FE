import React, { useState, useRef } from "react";
import { WebView } from "react-native-webview";
import { View, Button, ActivityIndicator } from "react-native";
import GRAPHQL_ENDPOINT from "../../../config";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PaymentScreen({ route, navigation }) {
  //const [payUrl, setPayUrl] = useState(null);
  const webViewRef = useRef(null);
  const payUrl =
    "https://www.sandbox.paypal.com/checkoutnow?token=50L236079K826364V";
  const startPayment = async () => {
    console.log("Start payment with PayPal");
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
        mutation {
          createPaypalOrder(createPaymentInput: {
            paymentMethod: "paypal"
            orderId: 1
            status: "pending"
          })
        }
      `,
      }),
    });

    const data = await response.json();
    console.log("Response from PayPal:", data);

    console.log("Response from PayPal:", data.data.createPaypalOrder);
    if (data.errors) {
      console.error("Error creating PayPal order:", data.errors);
      return;
    }
    setPayUrl(data.createPaypalOrder);
  };

  const handleNavigationChange = (navState) => {
    const { url } = navState;

    if (url.includes("/payment/success")) {
      // 👉 Thành công
      navigation.replace("PaymentSuccessScreen");
    } else if (url.includes("/payment/cancel")) {
      // 👉 Hủy thanh toán
      navigation.replace("PaymentCancelScreen");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {!payUrl ? (
          <Button title="Thanh toán với PayPal" onPress={startPayment} />
        ) : (
          <WebView
            ref={webViewRef}
            source={{ uri: payUrl }}
            onNavigationStateChange={handleNavigationChange}
            startInLoadingState={true}
            renderLoading={() => <ActivityIndicator size="large" />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
