import AsyncStorage from "@react-native-async-storage/async-storage";
import GRAPHQL_ENDPOINT from "../../config";

export const createOrder = async (
  totalPrice,
  status,
  shippingFee,
  userId,
  restaurantId,
  addressId
) => {
  const token = await AsyncStorage.getItem("token");

  console.log("Creating order with details:", {
    totalPrice,
    status,
    shippingFee,
    userId,
    restaurantId,
    addressId,
  });
  const query = `
    mutation {
      createOrder(createOrderInput: {
        totalPrice: ${totalPrice},
        status: "${status}",
        shippingFee: ${shippingFee},
        userId: ${userId},
        restaurantId: ${restaurantId},
        addressId: ${addressId}
      }) {
        id
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    if (result?.data?.createOrder) {
      return result.data.createOrder;
    } else {
      throw new Error(result?.errors?.[0]?.message || "Order creation failed");
    }
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};
export const createPaypalOrder = async (paymentMethod, orderId, status) => {
  const token = await AsyncStorage.getItem("token");

  const query = `
    mutation {
      createPaypalOrder(createPaymentInput: {
        paymentMethod: "${paymentMethod}",
        orderId: ${orderId},
        status: "${status}"
      })
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    if (result?.data?.createPaypalOrder) {
      return result.data.createPaypalOrder;
    } else {
      throw new Error(
        result?.errors?.[0]?.message || "Paypal order creation failed"
      );
    }
  } catch (error) {
    console.error("Error creating PayPal order:", error);
    throw error;
  }
};
export const createOrderDetail = async (quantity, note, orderId, menuId) => {
  const token = await AsyncStorage.getItem("token");

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
          mutation {
            createOrderDetail(
              createOrderDetailInput: {
                quantity: ${quantity},
                note: "${note.replace(/"/g, '\\"')}",
                orderId: ${orderId},
                menuId: ${menuId}
              }
            ) {
              id
            }
          }
        `,
      }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error("GraphQL error:", result.errors);
      return null;
    }

    return result.data.createOrderDetail;
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
};
