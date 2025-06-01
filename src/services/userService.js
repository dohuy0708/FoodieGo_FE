import GRAPHQL_ENDPOINT from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
export const updateUser = async (userId, field, value) => {
  console.log("Gọi service updateUser", userId, field, value);

  try {
    // Escape giá trị nếu là chuỗi
    const mutation = `
        mutation {
          updateUser(updateUserInput: {
            id: ${userId},
            ${field}: "${value}"
          }) {
            id
          }
        }
      `;
      const token = await AsyncStorage.getItem("token");
    const res = await fetch(GRAPHQL_ENDPOINT, {
     
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ query: mutation }),
    });

    // Kiểm tra phản hồi từ server
    const data = await res.json();
    if (data.errors) {
      throw new Error(data.errors[0].message); // Nếu có lỗi từ GraphQL
    }
    return data.data.updateUser;
  } catch (err) {
    console.error("Lỗi trong quá trình gọi API:", err.message); // In ra lỗi
    throw new Error(
      "Cập nhật thông tin người dùng thất bại. Vui lòng thử lại!"
    ); // Hiển thị thông báo lỗi cho người dùng
  }
};
