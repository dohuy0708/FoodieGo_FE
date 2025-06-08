import AsyncStorage from "@react-native-async-storage/async-storage";
import GRAPHQL_ENDPOINT from "../../config";

export const deleteReview = async (id) => {
  const token = await AsyncStorage.getItem("token");
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Thêm Authorization nếu cần
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: `
        mutation DeleteReview($id: Int!) {
          removeReview(id: $id) {
            id
            order {
              id
            }
            imageUrl
          }
        }
      `,
      variables: {
        id: id,
      },
    }),
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data.removeReview;
};

export const createReview = async (rating, content, imageUrl, orderId) => {
  console.log("Creating review with data:", {
    rating,
    content,
    imageUrl,
    orderId,
  });
  const token = await AsyncStorage.getItem("token");
  console.log("Token gửi lên:", token);
  const query = `
    mutation {
      createReview(
        createReviewInput: {
          rating: ${rating},
          content: "${content}",
          imageUrl: "${imageUrl}",
          orderId: ${orderId}
        }
      ) {
        id
      }
    }
  `;

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query }),
  });

  const result = await response.json();

  console.log("Create review response:", result);
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data.createReview;
};
export const uploadImageToServer = async (selectedImage) => {
  const token = await AsyncStorage.getItem("token");
  if (!selectedImage?.uri) {
    Alert.alert("Lỗi", "Không có ảnh hợp lệ.");
    return null;
  }

  const formData = new FormData();

  // GraphQL multipart request chuẩn
  formData.append(
    "operations",
    JSON.stringify({
      query: `
        mutation UploadMyAvatar($file: Upload!) {
          uploadToCloudinary(file: $file)
        }
      `,
      variables: { file: null },
    })
  );

  formData.append("map", JSON.stringify({ 0: ["variables.file"] }));

  const fileName = selectedImage.fileName || selectedImage.uri.split("/").pop();
  const ext = fileName.split(".").pop()?.toLowerCase();
  const mimeType =
    selectedImage.mimeType ||
    {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
    }[ext] ||
    "image/jpeg";

  formData.append("0", {
    uri: selectedImage.uri,
    name: fileName,
    type: mimeType,
  });

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (response.ok && result?.data?.uploadToCloudinary) {
      return result.data.uploadToCloudinary;
    }

    const errorMessage =
      result?.errors?.[0]?.message || `Upload thất bại (${response.status})`;
    Alert.alert("Lỗi Upload", errorMessage);
    return null;
  } catch (error) {
    Alert.alert("Lỗi Mạng", `Không thể kết nối: ${error.message}`);
    return null;
  }
};
