import GRAPHQL_ENDPOINT from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const uploadImageToServer = async (selectedImage) => {
  const token = await AsyncStorage.getItem("token");
  const uploadHeaders = {
    // KHÔNG ĐẶT 'Content-Type' ở đây, fetch sẽ tự làm
    'Accept': 'application/json', // Server có thể vẫn cần cái này để biết client chấp nhận kiểu response nào
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
  if (!selectedImage || !selectedImage.uri) {
    Alert.alert("Lỗi", "Không có ảnh nào được chọn hoặc ảnh không hợp lệ.");
    return null;
  }
  console.log("1");
  console.log("Uploading image:", selectedImage.uri);
  const formData = new FormData();
  const operations = JSON.stringify({
    query: `
      mutation UploadMyAvatar($file: Upload!) {
        uploadToCloudinary(file: $file)
      }
    `,
    variables: {
      file: null,
    },
    operationName: "UploadMyAvatar",
  });

  const map = JSON.stringify({
    0: ["variables.file"],
  });

  formData.append("operations", operations);
  formData.append("map", map);
  let fileName = selectedImage.fileName;
  let mimeType = selectedImage.mimeType;
  const uri = selectedImage.uri;
  if (!fileName) {
    fileName = uri.split("/").pop();
  }
  console.log("2");
  if (!mimeType && fileName) {
    const fileExtension = fileName.split(".").pop()?.toLowerCase();
    if (fileExtension === "jpg" || fileExtension === "jpeg") {
      mimeType = "image/jpeg";
    } else if (fileExtension === "png") {
      mimeType = "image/png";
    } else if (fileExtension === "gif") {
      mimeType = "image/gif";
    }
  }

  if (!mimeType) {
    console.warn("Could not determine MIME type, defaulting to image/jpeg");
    mimeType = "image/jpeg";
  }
  const fileData = {
    uri: uri,
    name: fileName,
    type: mimeType,
  };

  formData.append("0", fileData);

  console.log("FormData prepared:", {
    operations,
    map,
    fileKey: "0",
    fileData,
  });
  console.log("3");
  try {
    console.log("[uploadImageToServer] GRAPHQL_ENDPOINT:", GRAPHQL_ENDPOINT);
  console.log("[uploadImageToServer] Token for this request:", token);
  console.log("[uploadImageToServer] Upload Headers for this request:", JSON.stringify(uploadHeaders));
  console.log("[uploadImageToServer] FormData keys:", Array.from(formData.keys()));
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      body: formData,
      headers: uploadHeaders,
    });

    const responseText = await response.text();
    console.log("4");
    console.log("Server Response Text:", responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse server response as JSON:", parseError);
     
      return null;
    }

    console.log("Server Response JSON:", result);
    if (!response.ok) {
      const errorMessage =
        result?.errors?.[0]?.message ||
        `Yêu cầu thất bại với mã trạng thái: ${response.status}`;
      console.error("Upload failed (HTTP Status):", errorMessage);
   
      return null;
    }

    if (result.errors) {
      const errorMessage =
        result.errors[0].message || "Lỗi không xác định từ GraphQL.";
      console.error("Upload failed (GraphQL Errors):", errorMessage);
      
      return null;
    }

    if (result.data && result.data.uploadToCloudinary) {
      console.log("Upload successful:", result.data.uploadToCloudinary);

      return result.data.uploadToCloudinary;
    } else {
      console.error("Upload failed: Unexpected response structure", result);
     
      return null;
    }
  } catch (error) {
    console.error("Upload Error (Network/Fetch):", error);
   
    return null;
  }
};

// Hàm tiện ích lấy token
async function getAuthHeaders() {
  const token = await AsyncStorage.getItem("token");
  console.log("token", token);
  return {
  
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const getCoordinatesOfLocation = async (address) => {
  if (!address || typeof address !== "string" || address.trim() === "") {
    console.error(
      "getCoordinatesOfLocation requires a non-empty address string."
    );
    return null;
  }

  const query = `
    query SearchAddressByInput($addressInput: String!) {
      searchAddress(input: $addressInput) {
        longitude
        latitude
        placeId
      }
    }
  `;

  const variables = {
    addressInput: address,
  };

  console.log("Searching coordinates for address:", address);

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json();
    console.log("Server Response:", result);

    if (!response.ok) {
      const errorMessage =
        result?.errors?.[0]?.message ||
        `Request failed with status code: ${response.status}`;
      console.error("Search coordinates failed (HTTP Status):", errorMessage);
      return null;
    }

    if (result.errors) {
      const errorMessage =
        result.errors[0].message || "Unknown error from GraphQL.";
      console.error(
        "Search coordinates failed (GraphQL Errors):",
        errorMessage
      );
      return null;
    }

    if (result.data && result.data.searchAddress) {
      console.log("Coordinates found successfully:", result.data.searchAddress);
      return result.data.searchAddress;
    } else {
      console.error(
        "Search coordinates failed: Unexpected response structure",
        result
      );
      return null;
    }
  } catch (error) {
    console.error("Search coordinates Error (Network/Fetch):", error);
    const message =
      error instanceof TypeError &&
      error.message.includes("Network request failed")
        ? "Unable to connect to the server. Please check your network connection."
        : `An error occurred: ${error.message}`;

    return null;
  }
};

export const createNewAddress = async (addressData) => {
  if (!addressData || typeof addressData !== "object" || !addressData.street) {
    console.error(
      "createNewAddress requires an addressData object with at least a street name."
    );
    return null;
  }

  const query = `
    mutation CallCreateAddress($data: CreateAddressInput!) {  
                                                             
      createAddress(createAddressInput: $data) {           
                                                              
        
        id
        
      }
    }
  `;

  const variables = {
    data: addressData,
  };

  console.log("Creating new address with data (variables):", variables);

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json();
    console.log("Server Response:", result);

    if (!response.ok && !result.errors) {
      const errorMessage = `Request failed with status code: ${response.status}`;
      console.error("Create new address failed (HTTP Status):", errorMessage);
      return null;
    }

    if (result.errors) {
      const errorMessage =
        result.errors[0].message || "Unknown error from GraphQL.";
      console.error(
        "Create new address failed (GraphQL Errors):",
        errorMessage
      );
      return null;
    }

    if (result.data && result.data.createAddress) {
      console.log("Address created successfully:", result.data.createAddress);
      return result.data.createAddress;
    } else {
      console.error(
        "Create new address failed: Unexpected response structure",
        result
      );
      return null;
    }
  } catch (error) {
    console.error("Create new address Error (Network/Fetch):", error);
    return null;
  }
};

export const createNewRestaurant = async (restaurantData) => {
  console.log("restaurantData",restaurantData);
  if (
    !restaurantData ||
    typeof restaurantData !== "object" ||
    !restaurantData.name ||
    !restaurantData.addressId ||
    !restaurantData.ownerId
  ) {
    console.error(
      "createRestaurantApi requires restaurantData object with at least name, addressId, and ownerId."
    );
    return null;
  }

  const query = `
    mutation CreateNewRestaurant($input: CreateRestaurantInput!) {
      createRestaurant(createRestaurantInput: $input) {
        id
        
      }
    }
  `;

  const variables = {
    input: restaurantData,
  };

  console.log("Creating new restaurant with data:", restaurantData);

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json();
    console.log("Server Response:", result);

    if (!response.ok && !result.errors) {
      const errorMessage = `Request failed with status code: ${response.status}`;
      console.error("Create restaurant failed (HTTP Status):", errorMessage);
      return null;
    }

    if (result.errors) {
      const errorMessage =
        result.errors[0].message || "Unknown error from GraphQL.";
      console.error("Create restaurant failed (GraphQL Errors):", errorMessage);
      return null;
    }

    if (result.data && result.data.createRestaurant) {
      console.log(
        "Restaurant created successfully:",
        result.data.createRestaurant
      );
      return result.data.createRestaurant;
    } else {
      console.error(
        "Create restaurant failed: Unexpected response structure",
        result
      );
      return null;
    }
  } catch (error) {
    console.error("Create restaurant Error (Network/Fetch):", error);
    return null;
  }
};

export const getRestaurantByOwnerId = async (ownerId) => {
  if (
    ownerId === null ||
    ownerId === undefined ||
    typeof ownerId !== "number" ||
    !Number.isInteger(ownerId)
  ) {
    console.error("getRestaurantByOwnerId requires a valid integer ownerId.");
    return null;
  }

  const query = `
    query GetRestaurantByOwnerId($ownerId: Int!) {
      findRestaurantsByOwnerId(ownerId: $ownerId) {
        id
        name
        description
        phone
        openTime
        closeTime
        rating
        status
        avatar
        address {
          id
          street
          ward
          district
          province
        }
      }
    }
  `;
  const variables = {
    ownerId: ownerId,
  };

  console.log("Fetching restaurant by ownerId:", ownerId);
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json();
    console.log("Server Response:", result);

    if (!response.ok) {
      const errorMessage = `Request failed with status code: ${response.status}`;
      console.error(
        "Get restaurant by ownerId failed (HTTP Status):",
        errorMessage,
        result
      );
      if (result && result.errors) {
        const graphqlError =
          result.errors[0]?.message || "Unknown GraphQL error.";
        console.error("GraphQL Errors:", graphqlError);
      }
      return null;
    }

    if (result.errors) {
      const errorMessage =
        result.errors[0]?.message || "Unknown error from GraphQL.";
      console.error(
        "Get restaurant by ownerId failed (GraphQL Errors):",
        errorMessage
      );
      return null;
    }

    if (result.data && result.data.findRestaurantsByOwnerId) {
      console.log(
        "Restaurants found successfully:",
        result.data.findRestaurantsByOwnerId
      );
      return result.data.findRestaurantsByOwnerId;
    } else {
      if (result.data && result.data.findRestaurantsByOwnerId === null) {
        console.log("No restaurants found for ownerId:", ownerId);
        return [];
      }
      console.error(
        "Get restaurant by ownerId failed: Unexpected response structure",
        result
      );
      return null;
    }
  } catch (error) {
    console.error("Get restaurant by ownerId Error (Network/Fetch):", error);
    return null;
  }
};

export const checkRestaurantByOwnerId = async (ownerId) => {
  if (
    ownerId === null ||
    ownerId === undefined ||
    typeof ownerId !== "number" ||
    !Number.isInteger(ownerId)
  ) {
    console.error("getRestaurantByOwnerId requires a valid integer ownerId.");
    return null;
  }

  const query = `
    query GetRestaurantByOwnerId($ownerId: Int!) {
      findRestaurantsByOwnerId(ownerId: $ownerId) {
        id
      }
    }
  `;
  const variables = { ownerId };

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
    });

    const result = await response.json();
    console.log("Server Response:", result);

    // Nếu có lỗi và data là null => không có nhà hàng
    if (result.errors && result.data === null) {
      return false;
    }

    // Nếu có data và mảng rỗng => không có nhà hàng
    if (result.data && Array.isArray(result.data.findRestaurantsByOwnerId) && result.data.findRestaurantsByOwnerId.length === 0) {
      return false;
    }

    // Nếu có data và có nhà hàng
    if (result.data && Array.isArray(result.data.findRestaurantsByOwnerId) && result.data.findRestaurantsByOwnerId.length > 0) {
      return true;
    }

    // Trường hợp khác (không xác định)
    return false;
  } catch (error) {
    console.error("Lỗi khi kiểm tra nhà hàng theo ownerId:", error);
    return null;
  }
};

export const getRestaurantById = async (restaurantId) => {
  if (
    restaurantId === null ||
    restaurantId === undefined ||
    typeof restaurantId !== "number" ||
    !Number.isInteger(restaurantId)
  ) {
    console.error("getRestaurantById requires a valid integer restaurantId.");
    return null;
  }

  const query = `
    query FindRestaurantById($restaurantId: Int!) {
     findByIdNotLocation(id: $restaurantId) {
        id
        name
        avatar
        owner
        {
        id
        }
      }
    }
  `;
  const variables = {
    restaurantId: restaurantId,
  };
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });
    const result = await response.json();
    console.log("result",result);
    return result.data.findByIdNotLocation;
  } catch (error) {
    console.error("Get restaurant by id Error (Network/Fetch):", error);
    return null;
  }
};

export const getAddressById = async (addressId) => {
  if (!addressId) {
    console.error("getAddressById requires a valid addressId.");
    return null;
  }

  const query = `
    query GetAddressById($addressId: number!) {
      getAddressById(id: $addressId) {
        district
        province
        street
        ward
      }
}`;
  const variables = {
    addressId: addressId,
  };
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json();
    console.log("Server Response:", result);

    if (!response.ok && !result.errors) {
      const errorMessage = `Request failed with status code: ${response.status}`;
      console.error("Get address by ID failed (HTTP Status):", errorMessage);
      return null;
    }

    if (result.errors) {
      const errorMessage =
        result.errors[0].message || "Unknown error from GraphQL.";
      console.error("Get address by ID failed (GraphQL Errors):", errorMessage);
      return null;
    }

    if (result.data && result.data.getAddressById) {
      console.log("Address found successfully:", result.data.getAddressById);
      return result.data.getAddressById;
    } else {
      console.error(
        "Get address by ID failed: Unexpected response structure",
        result
      );
      return null;
    }
  } catch (error) {
    console.error("Get restaurant by ownerId Error (Network/Fetch):", error);
    return null;
  }
};

export const getCategoriesByRestaurantId = async (restaurantId) => {
  if (
    restaurantId === null ||
    restaurantId === undefined ||
    typeof restaurantId !== "number" ||
    !Number.isInteger(restaurantId)
  ) {
    console.error(
      "getCategoriesByRestaurantId requires a valid integer restaurantId."
    );
    return null;
  }

  const query = `
    query GetCategoriesByRestaurantId($restaurantId: Int!) {
      findCategoriesByRestaurantId(restaurantId: $restaurantId) {
        id
        name
        isActive
      }
    }
  `;

  const variables = {
    restaurantId: restaurantId,
  };

  console.log("Fetching categories by restaurantId:", restaurantId);

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json();
    console.log("Server Response (Categories):", result);

    if (!response.ok) {
      const errorMessage = `Request failed with status code: ${response.status}`;
      console.error(
        "Get categories by restaurantId failed (HTTP Status):",
        errorMessage,
        result
      );
      if (result && result.errors) {
        const graphqlError =
          result.errors[0]?.message || "Unknown GraphQL error.";
        console.error("GraphQL Errors:", graphqlError);
      }
      return null;
    }

    if (result.errors) {
      const errorMessage =
        result.errors[0]?.message || "Unknown error from GraphQL.";
      console.error(
        "Get categories by restaurantId failed (GraphQL Errors):",
        errorMessage
      );
      return null;
    }

    if (result.data && result.data.findCategoriesByRestaurantId !== undefined) {
      if (result.data.findCategoriesByRestaurantId === null) {
        console.log("No categories found for restaurantId:", restaurantId);
        return [];
      }
      console.log(
        "Categories found successfully:",
        result.data.findCategoriesByRestaurantId
      );
      return result.data.findCategoriesByRestaurantId;
    } else {
      console.error(
        "Get categories by restaurantId failed: Unexpected response structure",
        result
      );
      return null;
    }
  } catch (error) {
    console.error(
      "Get categories by restaurantId Error (Network/Fetch):",
      error
    );
    return null;
  }
};

export const getMenusByCategoryId = async (categoryId) => {
  if (
    categoryId === null ||
    categoryId === undefined ||
    typeof categoryId !== "number" ||
    !Number.isInteger(categoryId)
  ) {
    console.error("getMenusByCategoryId requires a valid integer categoryId.");
    return null;
  }

  const query = `
    query GetMenusByCategoryId($categoryId: Int!) {
      findMenusByCategoryId(categoryId: $categoryId) {
        id
        name
        description
        price
        available
        imageUrl
        quantity
       
      }
    }
  `;

  const variables = {
    categoryId: categoryId,
  };

  console.log("Fetching menus by categoryId:", categoryId);

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json();
    console.log("Server Response (Menus):", result);

    if (!response.ok) {
      const errorMessage = `Request failed with status code: ${response.status}`;
      console.error(
        "Get menus by categoryId failed (HTTP Status):",
        errorMessage,
        result
      );
      if (result && result.errors) {
        const graphqlError =
          result.errors[0]?.message || "Unknown GraphQL error.";
        console.error("GraphQL Errors:", graphqlError);
      }
      return null;
    }

    if (result.errors) {
      const errorMessage =
        result.errors[0]?.message || "Unknown error from GraphQL.";
      console.error(
        "Get menus by categoryId failed (GraphQL Errors):",
        errorMessage
      );
      return null;
    }

    if (result.data && result.data.findMenusByCategoryId !== undefined) {
      if (result.data.findMenusByCategoryId === null) {
        console.log("No menus found for categoryId:", categoryId);
        return [];
      }
      console.log(
        "Menus found successfully:",
        result.data.findMenusByCategoryId
      );
      return result.data.findMenusByCategoryId;
    } else {
      console.error(
        "Get menus by categoryId failed: Unexpected response structure",
        result
      );
      return null;
    }
  } catch (error) {
    console.error("Get menus by categoryId Error (Network/Fetch):", error);
    return null;
  }
};

export const getMenusIdByCategoryId = async (categoryId) => {
  if (
    categoryId === null ||
    categoryId === undefined ||
    typeof categoryId !== "number" ||
    !Number.isInteger(categoryId)
  ) {
    console.error("getMenusByCategoryId requires a valid integer categoryId.");
    return null;
  }

  const query = `
    query GetMenusByCategoryId($categoryId: Int!) {
      findMenusByCategoryId(categoryId: $categoryId) {
        id
        
       
      }
    }
  `;

  const variables = {
    categoryId: categoryId,
  };

  console.log("Fetching menus by categoryId:", categoryId);

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json();
    console.log("Server Response (Menus):", result);

    if (!response.ok) {
      const errorMessage = `Request failed with status code: ${response.status}`;
      console.error(
        "Get menus by categoryId failed (HTTP Status):",
        errorMessage,
        result
      );
      if (result && result.errors) {
        const graphqlError =
          result.errors[0]?.message || "Unknown GraphQL error.";
        console.error("GraphQL Errors:", graphqlError);
      }
      return null;
    }

    if (result.errors) {
      const errorMessage =
        result.errors[0]?.message || "Unknown error from GraphQL.";
      console.error(
        "Get menus by categoryId failed (GraphQL Errors):",
        errorMessage
      );
      return null;
    }

    if (result.data && result.data.findMenusByCategoryId !== undefined) {
      if (result.data.findMenusByCategoryId === null) {
        console.log("No menus found for categoryId:", categoryId);
        return [];
      }
      console.log(
        "Menus found successfully:",
        result.data.findMenusByCategoryId
      );
      return result.data.findMenusByCategoryId;
    } else {
      console.error(
        "Get menus by categoryId failed: Unexpected response structure",
        result
      );
      return null;
    }
  } catch (error) {
    console.error("Get menus by categoryId Error (Network/Fetch):", error);
    return null;
  }
};

export const updateCategory = async (categoryId, newName) => {
  if (
    categoryId === null ||
    categoryId === undefined ||
    typeof categoryId !== "number" ||
    !Number.isInteger(categoryId)
  ) {
    console.error("updateCategoryAPI requires a valid integer categoryId.");
    return null;
  }
  if (
    newName === null ||
    newName === undefined ||
    typeof newName !== "string" ||
    newName.trim() === ""
  ) {
    console.error("updateCategoryAPI requires a non-empty string newName.");
    return null;
  }

  const query = `
    mutation UpdateCategory($id: Int!, $name: String!) {
      updateCategory(updateCategoryInput: {
        id: $id,
        name: $name
        
      }) {
        id
        name
        
      }
    }
  `;

  const variables = {
    id: categoryId,
    name: newName.trim(),
  };

  console.log("Updating category:", categoryId, "to name:", newName.trim());

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: query,
        variables: variables,
      }),
    });

    const result = await response.json();
    console.log("Server Response (Update Category):", result);

    if (!response.ok) {
      const errorMessage = `Request failed with status code: ${response.status}`;
      console.error(
        "Update category failed (HTTP Status):",
        errorMessage,
        result
      );
      if (result && result.errors) {
        const graphqlError =
          result.errors[0]?.message ||
          "Unknown GraphQL error in HTTP error response.";
        console.error("GraphQL Errors in HTTP error response:", graphqlError);
      }
      return null;
    }

    if (result.errors) {
      const errorMessage =
        result.errors[0]?.message || "Unknown error from GraphQL.";
      console.error(
        "Update category failed (GraphQL Errors):",
        errorMessage,
        result.errors
      );
      return null;
    }

    if (result.data && result.data.updateCategory) {
      console.log("Category updated successfully:", result.data.updateCategory);
      return result.data.updateCategory;
    } else {
      console.error(
        "Update category failed: Unexpected response structure",
        result
      );
      return null;
    }
  } catch (error) {
    console.error("Update category Error (Network/Fetch):", error);
    return null;
  }
};

export const updateCategoryStatus = async (categoryId, status) => {
  if (
    categoryId === null ||
    categoryId === undefined ||
    typeof categoryId !== "number" ||
    !Number.isInteger(categoryId)
  ) {
    console.error("updateCategoryAPI requires a valid integer categoryId.");
    return null;
  }
  console.log("status", status);
  const query = `
    mutation UpdateCategory($id: Int!, $status: String!) {
      updateCategory(updateCategoryInput: {
        id: $id,
        
        isActive:$status
      }) {
        id
       
        isActive
      }
    }
  `;

  const variables = {
    id: categoryId,
    status: status,
  };
  console.log("variables", variables);
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: query,
        variables: variables,
      }),
    });

    const result = await response.json();
    console.log("Server Response (Update Category):", result);

    if (!response.ok) {
      const errorMessage = `Request failed with status code: ${response.status}`;
      console.error(
        "Update category failed (HTTP Status):",
        errorMessage,
        result
      );
      if (result && result.errors) {
        const graphqlError =
          result.errors[0]?.message ||
          "Unknown GraphQL error in HTTP error response.";
        console.error("GraphQL Errors in HTTP error response:", graphqlError);
      }
      return null;
    }

    if (result.errors) {
      const errorMessage =
        result.errors[0]?.message || "Unknown error from GraphQL.";
      console.error(
        "Update category failed (GraphQL Errors):",
        errorMessage,
        result.errors
      );
      return null;
    }

    if (result.data && result.data.updateCategory) {
      console.log("Category updated successfully:", result.data.updateCategory);
      return result.data.updateCategory;
    } else {
      console.error(
        "Update category failed: Unexpected response structure",
        result
      );
      return null;
    }
  } catch (error) {
    console.error("Update category Error (Network/Fetch):", error);
    return null;
  }
};

export const createCategory = async (categoryName, restaurantId) => {
  if (
    categoryName === null ||
    categoryName === undefined ||
    typeof categoryName !== "string" ||
    categoryName.trim() === ""
  ) {
    console.error(
      "createCategoryAPI requires a non-empty string categoryName."
    );
    return null;
  }
  if (
    restaurantId === null ||
    restaurantId === undefined ||
    typeof restaurantId !== "number" ||
    !Number.isInteger(restaurantId)
  ) {
    console.error("createCategoryAPI requires a valid integer restaurantId.");
    return null;
  }

  const query = `
    mutation CreateCategory($name: String!, $restaurantId: Int!) {
      createCategory(createCategoryInput: {
        name: $name,
        restaurantId: $restaurantId,
        isActive: "accepted"
      }) {
        id
        name
      }
    }
  `;

  const variables = {
    name: categoryName.trim(),
    restaurantId: restaurantId,
  };

  console.log(
    "Creating category:",
    categoryName.trim(),
    "for restaurant:",
    restaurantId
  );

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: query,
        variables: variables,
      }),
    });

    const result = await response.json();
    console.log("Server Response (Create Category):", result);

    if (!response.ok) {
      const errorMessage = `Request failed with status code: ${response.status}`;
      console.error(
        "Create category failed (HTTP Status):",
        errorMessage,
        result
      );
      if (result && result.errors) {
        const graphqlError =
          result.errors[0]?.message ||
          "Unknown GraphQL error in HTTP error response.";
        console.error("GraphQL Errors in HTTP error response:", graphqlError);
      }
      return null;
    }

    if (result.errors) {
      const errorMessage =
        result.errors[0]?.message || "Unknown error from GraphQL.";
      console.error(
        "Create category failed (GraphQL Errors):",
        errorMessage,
        result.errors
      );
      return null;
    }

    if (result.data && result.data.createCategory) {
      console.log("Category created successfully:", result.data.createCategory);
      return result.data.createCategory;
    } else {
      console.error(
        "Create category failed: Unexpected response structure",
        result
      );
      return null;
    }
  } catch (error) {
    console.error("Create category Error (Network/Fetch):", error);
    return null;
  }
};

export const updateRestaurantAPI = async (updateData) => {
  if (
    !updateData ||
    typeof updateData !== "object" ||
    updateData.id === null ||
    updateData.id === undefined ||
    typeof updateData.id !== "number" ||
    !Number.isInteger(updateData.id)
  ) {
    console.error(
      "updateRestaurantAPI requires updateData object with an integer 'id'."
    );
    return null;
  }

  const query = `
    mutation UpdateRestaurantMutation($input: UpdateRestaurantInput!) {
      updateRestaurant(updateRestaurantInput: $input) {
        id
        name
         description
         status
         phone
      openTime
         closeTime
        avatar
      }
    }
  `;

  const variables = {
    input: updateData,
  };

  console.log("Updating restaurant with data:", updateData);

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json();
    console.log("Server Response (Update Restaurant):", result);

    if (!response.ok && !result.errors) {
      const errorMessage = `Request failed with status code: ${response.status}`;
      console.error(
        "Update restaurant failed (HTTP Status):",
        errorMessage,
        result
      );
      return null;
    }

    if (result.errors) {
      const errorMessage =
        result.errors[0]?.message || "Unknown error from GraphQL.";
      console.error(
        "Update restaurant failed (GraphQL Errors):",
        errorMessage,
        result.errors
      );
      return null;
    }

    if (result.data && result.data.updateRestaurant) {
      console.log(
        "Restaurant updated successfully:",
        result.data.updateRestaurant
      );
      return result.data.updateRestaurant;
    } else {
      console.error(
        "Update restaurant failed: Unexpected response structure",
        result
      );
      return null;
    }
  } catch (error) {
    console.error("Update restaurant Error (Network/Fetch):", error);
    return null;
  }
};

export const updateAddressAPI = async (addressUpdateData) => {
  if (
    !addressUpdateData ||
    typeof addressUpdateData !== "object" ||
    addressUpdateData.id === null ||
    addressUpdateData.id === undefined ||
    typeof addressUpdateData.id !== "number" ||
    !Number.isInteger(addressUpdateData.id)
  ) {
    console.error(
      "updateAddressAPI requires addressUpdateData object with an integer 'id'."
    );
    return null;
  }

  const query = `
    mutation UpdateAddressMutation($input: UpdateAddressInput!) {
      updateAddress(updateAddressInput: $input) {
        id
        street
        ward
        district
        province
      }
    }
  `;

  const variables = {
    input: addressUpdateData,
  };

  console.log("Updating address with data:", addressUpdateData);

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json();
    console.log("Server Response (Update Address):", result);

    if (!response.ok && !result.errors) {
      const errorMessage = `Request failed with status code: ${response.status}`;
      console.error(
        "Update address failed (HTTP Status):",
        errorMessage,
        result
      );
      return null;
    }

    if (result.errors) {
      const errorMessage =
        result.errors[0]?.message || "Unknown error from GraphQL.";
      console.error(
        "Update address failed (GraphQL Errors):",
        errorMessage,
        result.errors
      );
      return null;
    }

    if (result.data && result.data.updateAddress) {
      console.log("Address updated successfully:", result.data.updateAddress);
      return result.data.updateAddress;
    } else {
      console.error(
        "Update address failed: Unexpected response structure",
        result
      );
      return null;
    }
  } catch (error) {
    console.error("Update address Error (Network/Fetch):", error);
    return null;
  }
};

export const createMenu = async (menuData) => {
  if (
    !menuData ||
    !menuData.name ||
    menuData.price == null ||
    menuData.quantity == null ||
    !menuData.available ||
    menuData.categoryId == null
  ) {
    console.error("createMenuAPI: Dữ liệu đầu vào không hợp lệ.", menuData);
    return null;
  }

  const mutation = `
    mutation CreateNewMenu($createMenuInput: CreateMenuInput!) {
      createMenu(createMenuInput: $createMenuInput) {
        id
        name
        description
        price
        quantity
        imageUrl
        available
        
      }
    }
  `;

  const variables = {
    createMenuInput: menuData,
  };

  console.log("Sending Create Menu Request:", { query: mutation, variables });

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: mutation,
        variables: variables,
      }),
    });

    const result = await response.json();
    console.log("Server Response (Create Menu):", result);

    if (!response.ok) {
      const errorMessage = `Request failed with status: ${response.status}`;
      console.error(
        "Create menu failed (HTTP Status):",
        errorMessage,
        result?.errors || "No GraphQL errors field"
      );
      if (result && result.errors) {
        result.errors.forEach((err) =>
          console.error("GraphQL Error:", err.message)
        );
      }
      return null;
    }

    if (result.errors) {
      console.error("Create menu failed (GraphQL Errors):", result.errors);
      result.errors.forEach((err) =>
        console.error("GraphQL Error:", err.message)
      );
      return null;
    }

    if (result.data && result.data.createMenu) {
      console.log("Menu created successfully:", result.data.createMenu);
      return result.data.createMenu;
    } else {
      console.error(
        "Create menu failed: Unexpected response structure.",
        result
      );
      return null;
    }
  } catch (error) {
    console.error("Create menu Error (Network/Fetch):", error);
    return null;
  }
};

export const updateMenu = async (menuUpdateData) => {
  if (!menuUpdateData || menuUpdateData.id == null) {
    console.error(
      "updateMenuAPI: ID món ăn là bắt buộc để cập nhật.",
      menuUpdateData
    );
    return null;
  }

  const { id, ...updateFields } = menuUpdateData;
  if (Object.keys(updateFields).length === 0) {
    console.warn(
      "updateMenuAPI: Không có trường nào được cung cấp để cập nhật ngoài ID."
    );
  }

  const mutation = `
    mutation UpdateExistingMenu($updateMenuInput: UpdateMenuInput!) {
      updateMenu(updateMenuInput: $updateMenuInput) {
        id
        name
        description
        price
        quantity
        imageUrl
        available
        
      }
    }
  `;

  const variables = {
    updateMenuInput: menuUpdateData,
  };

  console.log("Sending Update Menu Request:", { query: mutation, variables });

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: mutation,
        variables: variables,
      }),
    });

    const result = await response.json();
    console.log("Server Response (Update Menu):", result);

    if (!response.ok) {
      const errorMessage = `Request failed with status: ${response.status}`;
      console.error(
        "Update menu failed (HTTP Status):",
        errorMessage,
        result?.errors || "No GraphQL errors field"
      );
      if (result && result.errors) {
        result.errors.forEach((err) =>
          console.error("GraphQL Error:", err.message)
        );
      }
      return null;
    }

    if (result.errors) {
      console.error("Update menu failed (GraphQL Errors):", result.errors);
      result.errors.forEach((err) =>
        console.error("GraphQL Error:", err.message)
      );
      return null;
    }

    if (result.data && result.data.updateMenu) {
      console.log("Menu updated successfully:", result.data.updateMenu);
      return result.data.updateMenu;
    } else {
      console.error(
        "Update menu failed: Unexpected response structure.",
        result
      );
      return null;
    }
  } catch (error) {
    console.error("Update menu Error (Network/Fetch):", error);
    return null;
  }
};

export const updateMenuStatus = async (menuId, status) => {
  console.log("Update menu status", menuId, status);
  if (!menuId || menuId == null) {
    console.error(
      "updateMenuStatusAPI: ID món ăn là bắt buộc để cập nhật.",
      menuUpdateData
    );
    return null;
  }



  const mutation = `
    mutation UpdateExistingMenu($updateMenuInput: UpdateMenuInput!) {
      updateMenu(updateMenuInput: $updateMenuInput) {
        id
        available
        
      }
    }
  `;

  const variables = {
    updateMenuInput: {
      id: parseInt(menuId.id),
      available: status,
    },
  };

  console.log("Sending Update Menu Request:", { query: mutation, variables });

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: mutation,
        variables: variables,
      }),
    });

    const result = await response.json();
    console.log("Server Response (Update Menu):", result);

    if (!response.ok) {
      const errorMessage = `Request failed with status: ${response.status}`;
      console.error(
        "Update menu failed (HTTP Status):",
        errorMessage,
        result?.errors || "No GraphQL errors field"
      );
      if (result && result.errors) {
        result.errors.forEach((err) =>
          console.error("GraphQL Error:", err.message)
        );
      }
      return null;
    }

    if (result.errors) {
      console.error("Update menu failed (GraphQL Errors):", result.errors);
      result.errors.forEach((err) =>
        console.error("GraphQL Error:", err.message)
      );
      return null;
    }

    if (result.data && result.data.updateMenu) {
      console.log("Menu updated successfully:", result.data.updateMenu);
      return result.data.updateMenu;
    } else {
      console.error(
        "Update menu failed: Unexpected response structure.",
        result
      );
      return null;
    }
  } catch (error) {
    console.error("Update menu Error (Network/Fetch):", error);
    return null;
  }
};

export const getMenuById = async (menuId) => {
  if (
    menuId === null ||
    menuId === undefined ||
    typeof menuId !== "number" ||
    !Number.isInteger(menuId)
  ) {
    console.error("getMenuById requires a valid integer ownerId.");
    return null;
  }
  const query = `
    query GetMenuByIdQuery($id: Int!) {
      menu(id: $id) {
        id
        name
        description
        price
        quantity
        imageUrl
        available
        category
        {
          id
          name
        }
      }
    }
  `;
  const variables = {
    id: menuId,
  };

  console.log("Sending Get Menu Request:", { query, variables });

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: query,
        variables: variables,
      }),
    });

    const result = await response.json();
    console.log("Server Response (Get Menu):", result);

    if (!response.ok) {
      const errorMessage = `Yêu cầu thất bại với trạng thái: ${response.status}`;
      console.error(
        "Lấy món ăn thất bại (HTTP Status):",
        errorMessage,
        result?.errors || "Không có trường lỗi GraphQL"
      );
      if (result && result.errors) {
        result.errors.forEach((err) =>
          console.error("GraphQL Error:", err.message)
        );
      }
    }

    if (result.errors) {
      console.error("Update menu failed (GraphQL Errors):", result.errors);
      result.errors.forEach((err) =>
        console.error("GraphQL Error:", err.message)
      );
      return null;
    }

    if (result.data && result.data.menu) {
      console.log("Lấy món ăn thành công:", result.data.menu);
      return result.data.menu;
    } else if (result.data && result.data.menu === null) {
      console.log("Không tìm thấy món ăn với ID:", menuId);
      return null;
    } else {
      console.error(
        "Lấy món ăn thất bại: Cấu trúc response không mong muốn.",
        result
      );
      return null;
    }
  } catch (error) {
    console.error("Lỗi khi lấy món ăn (Network/Fetch):", error);
    return null;
  }
};

export const getAllOrdersByRestaurantId = async (restaurantId) => {
  const token = await AsyncStorage.getItem("token");
  if (
    restaurantId === null ||
    restaurantId === undefined ||
    typeof restaurantId !== "number" ||
    !Number.isInteger(restaurantId)
  ) {
    console.error(
      "getAllOrdersByRestaurantId requires a valid integer restaurantId."
    );
    return [];
  }

  const query = `
    query FindOrdersByRestaurantIdPaginated($restaurantId: Int!, $page: Int!, $limit: Int!) {
      findOrdersByRestaurantId(
          restaurantId: $restaurantId
          page: $page
          limit: $limit
      ) {
        data {
          id
          totalPrice
          status
          createdAt
          user
            {
                id
                name
                phone
            }
          address
          {
          province
          district
          ward
          street
          }
          shippingFee
        }
      }
    }
  `;

  let allOrders = [];
  let currentPage = 1;
  const limitPerPage = 100;
  let hasMorePages = true;

  console.log(`Bắt đầu lấy tất cả đơn hàng cho nhà hàng ID: ${restaurantId}`);

  while (hasMorePages) {
    const variables = {
      restaurantId: restaurantId,
      page: currentPage,
      limit: limitPerPage,
    };

    console.log(`Đang lấy trang ${currentPage} (limit: ${limitPerPage})...`);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers,
        body: JSON.stringify({
          query: query,
          variables: variables,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = `Yêu cầu trang ${currentPage} thất bại với trạng thái: ${response.status}`;
        console.error(
          "Lấy đơn hàng thất bại (HTTP Status):",
          errorMessage,
          result?.errors || "Không có trường lỗi GraphQL"
        );
        if (result && result.errors) {
          result.errors.forEach((err) =>
            console.error("GraphQL Error:", err.message)
          );
        }
        return [];
      }

      if (result.errors) {
        // console.error(
        //   `Lấy đơn hàng trang ${currentPage} thất bại (GraphQL Errors):`,
        //   result.errors
        // );
        // result.errors.forEach((err) =>
        //   console.error("GraphQL Error:", err.message)
        // );
        return [];
      }

      const pageData = result?.data?.findOrdersByRestaurantId?.data;

      if (!pageData || !Array.isArray(pageData)) {
        console.error(
          `Lấy đơn hàng trang ${currentPage} thất bại: Cấu trúc response không mong muốn hoặc không có data.`,
          result
        );
        return [];
      }

      if (pageData.length > 0) {
        console.log(
          `Lấy thành công ${pageData.length} đơn hàng trên trang ${currentPage}.`
        );
        allOrders = allOrders.concat(pageData);
      } else {
        console.log(`Trang ${currentPage} không có đơn hàng nào.`);
      }

      if (pageData.length < limitPerPage) {
        hasMorePages = false;
        console.log("Đã lấy hết các trang.");
      } else {
        currentPage++;
      }
    } catch (error) {
      console.error(
        `Lỗi khi lấy đơn hàng trang ${currentPage} (Network/Fetch):`,
        error
      );
      return [];
    }
  }

  console.log(`Hoàn tất. Tổng số đơn hàng lấy được: ${allOrders.length}`);
  return allOrders;
};

export const findUserById = async (userId) => {
  if (
    userId === null ||
    userId === undefined ||
    typeof userId !== "number" ||
    !Number.isInteger(userId)
  ) {
    console.error("findUserById yêu cầu một userId là số nguyên hợp lệ.");
    return null;
  }

  const query = `
    query FindUserByIdQuery($id: Int!) {
      findUserById(id: $id) {
        id
        name
        phone
      }
    }
  `;

  const variables = {
    id: userId,
  };

  console.log("Gửi yêu cầu lấy thông tin người dùng:", { query, variables });

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: query,
        variables: variables,
      }),
    });

    const result = await response.json();
    console.log("Phản hồi từ Server (Lấy người dùng):", result);

    if (!response.ok) {
      const errorMessage = `Yêu cầu thất bại với trạng thái: ${response.status}`;
      console.error(
        "Lấy người dùng thất bại (HTTP Status):",
        errorMessage,
        result?.errors || "Không có trường lỗi GraphQL"
      );

      if (result && result.errors) {
        result.errors.forEach((err) =>
          console.error(
            "Lỗi GraphQL:",
            err.message,
            err.extensions ? JSON.stringify(err.extensions) : ""
          )
        );
      }
      return null;
    }

    if (result.errors) {
      console.error("Lấy người dùng thất bại (Lỗi GraphQL):", result.errors);
      result.errors.forEach((err) =>
        console.error(
          "Lỗi GraphQL:",
          err.message,
          err.extensions ? JSON.stringify(err.extensions) : ""
        )
      );
      return null;
    }

    if (result.data && result.data.findUserById) {
      console.log(
        "Lấy thông tin người dùng thành công:",
        result.data.findUserById
      );
      return result.data.findUserById;
    } else if (result.data && result.data.findUserById === null) {
      console.log("Không tìm thấy người dùng với ID:", userId);
      return null;
    } else {
      console.error(
        "Lấy người dùng thất bại: Cấu trúc response không mong muốn.",
        result
      );
      return null;
    }
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng (Network/Fetch):", error);
    return null;
  }
};

export const findOrderDetailByOrderId = async (orderId) => {
  if (
    orderId === null ||
    orderId === undefined ||
    typeof orderId !== "number" ||
    !Number.isInteger(orderId)
  ) {
    console.error(
      "findOrderDetailByOrderId yêu cầu một orderId là số nguyên hợp lệ."
    );
    return null;
  }

  const query = `
    query FindOrderDetailQuery($orderId: Int!) {
      findOrderDetailByOrderId(orderId: $orderId) {
        id
        quantity
        note
        menu {
          name
          price
        }
      }
    }
  `;

  const variables = {
    orderId: orderId,
  };

  console.log("Gửi yêu cầu lấy chi tiết đơn hàng:", { query, variables });

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: query,
        variables: variables,
      }),
    });

    const result = await response.json();
    console.log("Phản hồi từ Server (Lấy chi tiết đơn hàng):", result);

    if (!response.ok) {
      const errorMessage = `Yêu cầu thất bại với trạng thái: ${response.status}`;
      console.error(
        "Lấy chi tiết đơn hàng thất bại (HTTP Status):",
        errorMessage,
        result?.errors || "Không có trường lỗi GraphQL"
      );
      if (result && result.errors) {
        result.errors.forEach((err) =>
          console.error("Lỗi GraphQL:", err.message)
        );
      }
      return null;
    }

    if (result.errors) {
      console.error(
        "Lấy chi tiết đơn hàng thất bại (Lỗi GraphQL):",
        result.errors
      );
      result.errors.forEach((err) =>
        console.error("Lỗi GraphQL:", err.message)
      );
      return null;
    }

    if (result.data && result.data.findOrderDetailByOrderId !== undefined) {
      const orderDetails = result.data.findOrderDetailByOrderId;
      if (orderDetails === null) {
        console.log(
          "Không tìm thấy chi tiết đơn hàng hoặc đơn hàng không tồn tại với ID:",
          orderId
        );
        return null;
      } else {
        console.log("Lấy chi tiết đơn hàng thành công:", orderDetails);
        return orderDetails;
      }
    } else {
      console.error(
        "Lấy chi tiết đơn hàng thất bại: Cấu trúc response không mong muốn.",
        result
      );
      return null;
    }
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết đơn hàng (Network/Fetch):", error);
    return null;
  }
};

export const updateOrderStatus = async (orderId, newStatus) => {
  if (
    orderId === null ||
    orderId === undefined ||
    typeof orderId !== "number" ||
    !Number.isInteger(orderId)
  ) {
    console.error("updateOrderStatus yêu cầu một orderId là số nguyên hợp lệ.");
    return { success: false, error: [{ message: "orderId không hợp lệ." }] };
  }

  const mutation = `
    mutation UpdateOrderStatusMutation($id: Int!, $status: String!) {
      updateOrderStatus(id: $id, status: $status) {
        id
        status
      }
    }
  `;

  const variables = {
    id: orderId,
    status: newStatus,
  };

  console.log("Gửi yêu cầu cập nhật trạng thái đơn hàng:", {
    query: mutation,
    variables,
  });

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: mutation,
        variables: variables,
      }),
    });

    const result = await response.json();
    console.log("Phản hồi từ Server (Cập nhật trạng thái):", result);

    if (!response.ok) {
      const errorMessage = `Yêu cầu thất bại với trạng thái: ${response.status}`;
      console.error(
        "Cập nhật trạng thái thất bại (HTTP Status):",
        errorMessage,
        result?.errors || "Không có trường lỗi GraphQL"
      );
      if (result && result.errors) {
        result.errors.forEach((err) =>
          console.error(
            "Lỗi GraphQL:",
            err.message,
            err.extensions ? JSON.stringify(err.extensions) : ""
          )
        );
      }
      return {
        success: false,
        error: result?.errors || [{ message: errorMessage }],
      };
    }

    if (result.errors) {
      console.error(
        "Cập nhật trạng thái thất bại (Lỗi GraphQL):",
        result.errors
      );
      result.errors.forEach((err) =>
        console.error(
          "Lỗi GraphQL:",
          err.message,
          err.extensions ? JSON.stringify(err.extensions) : ""
        )
      );
      return { success: false, error: result.errors };
    }

    if (result.data && result.data.updateOrderStatus) {
      console.log("Cập nhật trạng thái thành công:", result.data.updateOrderStatus);
      return { success: true, data: result.data.updateOrderStatus };
    } else if (result.data && result.data.updateOrderStatus === null) {
      console.log(
        "Cập nhật trạng thái trả về null, có thể không tìm thấy ID:",
        orderId
      );
      return {
        success: false,
        error: [
          { message: `Không tìm thấy đơn hàng với ID ${orderId} để cập nhật.` },
        ],
      };
    } else {
      console.error(
        "Cập nhật trạng thái thất bại: Cấu trúc response không mong muốn.",
        result
      );
      return {
        success: false,
        error: [{ message: "Cấu trúc response không mong muốn." }],
      };
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái (Network/Fetch):", error);
    return {
      success: false,
      error: [{ message: `Lỗi mạng hoặc fetch: ${error.message}` }],
    };
  }
};

export const getTop10MenuByRestaurantId = async (restaurantId, year, month) => {
  if (
    restaurantId === null ||
    restaurantId === undefined ||
    typeof restaurantId !== "number" ||
    !Number.isInteger(restaurantId)
  ) {
    console.error(
      "getTop10MenuByRestaurantId requires a valid integer restaurantId."
    );
    return null;
  }

  const query = `
    query GetTop10MenuByRestaurantId($restaurantId: Int!,$year: Int!, $month: Int) {
      findTop10MenuByRestaurantId(restaurantId: $restaurantId, year: $year, month: $month) {
       menu
       {
          id
          name
         
        }
        totalOrders
       
       }
        
      }
    
  `;
  const variables = {
    restaurantId: restaurantId,
    year: year,
    month: month,
  };

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: query,
        variables: variables,
      }),
    });

    const result = await response.json();
    console.log(
      "Phản hồi từ Server (Lấy 10 món ăn hàng đầu):",
      result.data.findTop10MenuByRestaurantId
    );

    if (!response.ok) {
      const errorMessage = `Yêu cầu thất bại với trạng thái: ${response.status}`;
      console.error(
        "Lấy 10 món ăn hàng đầu thất bại (HTTP Status):",
        errorMessage,
        result?.errors || "Không có trường lỗi GraphQL"
      );
     
      return [];
    }

    if (result.errors) {
     
      return [];
    }

    if (result.data && result.data.findTop10MenuByRestaurantId) {
      console.log(
        "Lấy 10 món ăn hàng đầu thành công:",
        result.data.findTop10MenuByRestaurantId
      );
      return result.data.findTop10MenuByRestaurantId;
    } else if (
      result.data &&
      result.data.findTop10MenuByRestaurantId === null
    ) {
      console.log("Không tìm thấy món ăn nào cho nhà hàng ID:", restaurantId);
      return [];
    } else {
      
      return [];
    }
  } catch (error) {
   
    return [];
  }
};

export const getTotalOrderByRestaurantId = async (
  restaurantId,
  year,
  month
) => {
  if (
    restaurantId === null ||
    restaurantId === undefined ||
    typeof restaurantId !== "number" ||
    !Number.isInteger(restaurantId)
  ) {
    console.error(
      "getTotalOrderByRestaurantId requires a valid integer restaurantId."
    );
    return null;
  }

  const query = `
    query getTotalOrderByRestaurantId($restaurantId: Int!,$year: Int!, $month: Int) {
      getTotalOrderByRestaurantId(restaurantId: $restaurantId, year: $year, month: $month) 
      }
    
  `;
  const variables = {
    restaurantId: restaurantId,
    year: year,
    month: month,
  };

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: query,
        variables: variables,
      }),
    });

    const result = await response.json();
    console.log("order:", result.data.getTotalOrderByRestaurantId);

    if (!response.ok) {
      const errorMessage = `Yêu cầu thất bại với trạng thái: ${response.status}`;
      console.error(
        "Lấy 10 món ăn hàng đầu thất bại (HTTP Status):",
        errorMessage,
        result?.errors || "Không có trường lỗi GraphQL"
      );
      if (result && result.errors) {
        result.errors.forEach((err) =>
          console.error("Lỗi GraphQL:", err.message)
        );
      }
      return null;
    }

    if (result.errors) {
      console.error(
        "Tổng đơn thất bại (Lỗi GraphQL):",
        result.errors
      );
      result.errors.forEach((err) =>
        console.error("Lỗi GraphQL:", err.message)
      );
      return 0;
    }

    if (
      result.data &&
      result.data.getTotalOrderByRestaurantId !== undefined &&
      result.data.getTotalOrderByRestaurantId !== null
    ) {
      // Giá trị có thể là 0, hợp lệ
      console.log(
        "Lấy order real thành công:",
        result.data.getTotalOrderByRestaurantId
      );
      return result.data.getTotalOrderByRestaurantId;
    } else if (
      result.data &&
      result.data.getTotalOrderByRestaurantId === null
    ) {
      console.log(" getTotalOrderByRestaurantId nhà hàng ID:", restaurantId);
      return 0;
    } else {
      console.error(
        "Lấy order real thất bại: Cấu trúc response không mong muốn.",
        result
      );
      return 0;
    }
  } catch (error) {
   
    return 0;
  }
};

export const getTotalRevenueByRestaurantId = async (
  restaurantId,
  year,
  month
) => {
  if (
    restaurantId === null ||
    restaurantId === undefined ||
    typeof restaurantId !== "number" ||
    !Number.isInteger(restaurantId)
  ) {
    console.error(
      "getTotalRevenueByRestaurantId requires a valid integer restaurantId."
    );
    return null;
  }

  const query = `
    query getTotalRevenueByRestaurantId($restaurantId: Int!,$year: Int!, $month: Int) {
      getTotalRevenueByRestaurantId(restaurantId: $restaurantId, year: $year, month: $month) 
      }
    
  `;
  const variables = {
    restaurantId: restaurantId,
    year: year,
    month: month,
  };

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: query,
        variables: variables,
      }),
    });

    const result = await response.json();
    console.log("order:", result.data.getTotalRevenueByRestaurantId);

    if (!response.ok) {
      const errorMessage = `Yêu cầu thất bại với trạng thái: ${response.status}`;
      console.error(
        "Lấy 10 món ăn hàng đầu thất bại (HTTP Status):",
        errorMessage,
        result?.errors || "Không có trường lỗi GraphQL"
      );
      if (result && result.errors) {
        result.errors.forEach((err) =>
          console.error("Lỗi GraphQL:", err.message)
        );
      }
      return null;
    }

    if (result.errors) {
      console.error(
        "Tổng đơn thất bại (Lỗi GraphQL):",
        result.errors
      );
      result.errors.forEach((err) =>
        console.error("Lỗi GraphQL:", err.message)
      );
      return 0;
    }

    if (
      result.data &&
      result.data.getTotalRevenueByRestaurantId !== undefined &&
      result.data.getTotalRevenueByRestaurantId !== null
    ) {
      // Giá trị có thể là 0, hợp lệ
      console.log(
        "Lấy order thành công:",
        result.data.getTotalRevenueByRestaurantId
      );
      return result.data.getTotalRevenueByRestaurantId;
    } else if (
      result.data &&
      result.data.getTotalRevenueByRestaurantId === null
    ) {
      console.log("Không getTotalRevenueByRestaurantId cho nhà hàng ID:", restaurantId);
      return 0;
    } else {
      console.error(
        "Lấy doanh thu thất bại: Cấu trúc response không mong muốn.",
        result
      );
      return 0;
    }
  } catch (error) {
    console.error("Lỗi getTotalRevenueByRestaurantId (Network/Fetch):", error);
    return 0;
  }
};

export const getTotalRevenueByRestaurantIdByYear = async (
  restaurantId,
  year
) => {
  if (
    restaurantId === null ||
    restaurantId === undefined ||
    typeof restaurantId !== "number" ||
    !Number.isInteger(restaurantId)
  ) {
    console.error(
      "getTotalRevenueByRestaurantIdByYear requires a valid integer restaurantId."
    );
    return null;
  }

  const query = `
    query getTotalRevenueByRestaurantIdByYear($restaurantId: Int!,$year: Int!) {
      getTotalRevenueByRestaurantIdByYear(restaurantId: $restaurantId, year: $year)
      {
        
        totalRevenue} 
      }
    
  `;
  const variables = {
    restaurantId: restaurantId,
    year: year,
  };

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: query,
        variables: variables,
      }),
    });

    const result = await response.json();
    console.log("order:", result.data.getTotalRevenueByRestaurantIdByYear);

    if (!response.ok) {
      const errorMessage = `Yêu cầu thất bại với trạng thái: ${response.status}`;
      console.error(
        "getTotalRevenueByRestaurantIdByYear thất bại (HTTP Status):",
        errorMessage,
        result?.errors || "Không có trường lỗi GraphQL"
      );
      if (result && result.errors) {
        result.errors.forEach((err) =>
          console.error("Lỗi GraphQL:", err.message)
        );
      }
      return null;
    }

    if (result.errors) {
      console.error(
        "getTotalRevenueByRestaurantIdByYear thất bại (Lỗi GraphQL):",
        result.errors
      );
      result.errors.forEach((err) =>
        console.error("Lỗi GraphQL:", err.message)
      );
      return 0;
    }

    if (
      result.data &&
      result.data.getTotalRevenueByRestaurantIdByYear !== undefined &&
      result.data.getTotalRevenueByRestaurantIdByYear !== null
    ) {
      // Giá trị có thể là 0 hoặc object hợp lệ
      console.log(
        "Lấy getTotalRevenueByRestaurantIdByYear thành công:",
        result.data.getTotalRevenueByRestaurantIdByYear
      );
      return result.data.getTotalRevenueByRestaurantIdByYear;
    } else if (
      result.data &&
      result.data.getTotalRevenueByRestaurantIdByYear === null
    ) {
      console.log("Không getTotalRevenueByRestaurantIdByYear ID:", restaurantId);
      return 0;
    } else {
      console.error(
        "Lấy getTotalRevenueByRestaurantIdByYear thất bại: Cấu trúc response không mong muốn.",
        result
      );
      return 0;
    }
  } catch (error) {
    console.error("Lỗi getTotalRevenueByRestaurantIdByYear (Network/Fetch):", error);
    return 0;
  }
};


export const findNotificationByUserId = async (userId) => {
  console.log("userId:", userId);
  if (
    userId === null ||
    userId === undefined ||
    typeof userId !== "number" ||
    !Number.isInteger(userId)
  ) {
    console.error("getAllNotificationsByUserId yêu cầu userId là số nguyên hợp lệ.");
    return [];
  }

  const query = `
    query FindNotificationByUserId($userId: Int!, $page: Int!, $limit: Int!) {
      findNotificationByUserId(userId: $userId, page: $page, limit: $limit) {
        data {
          id
          title
          content
          createdAt
        }
        total
      }
    }
  `;

  let allNotifications = [];
  let currentPage = 1;
  const limitPerPage = 100; // Có thể tăng nếu backend cho phép
  let hasMorePages = true;

  while (hasMorePages) {
    const variables = {
      userId,
      page: currentPage,
      limit: limitPerPage,
    };

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers,
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = `Yêu cầu trang ${currentPage} thất bại với trạng thái: ${response.status}`;
        console.error("Lấy thông báo thất bại (HTTP Status):", errorMessage, result?.errors || "Không có trường lỗi GraphQL");
        return allNotifications;
      }

      if (result.errors) {
        console.error(`Lấy thông báo trang ${currentPage} thất bại (GraphQL Errors):`, result.errors);
        return allNotifications;
      }

      const pageData = result?.data?.findNotificationByUserId?.data;
      const total = result?.data?.findNotificationByUserId?.total;

      if (!pageData || !Array.isArray(pageData)) {
        console.error(`Lấy thông báo trang ${currentPage} thất bại: Cấu trúc response không mong muốn hoặc không có data.`, result);
        return allNotifications;
      }

      allNotifications = allNotifications.concat(pageData);
      console.log("allNotifications:", allNotifications);

      if (allNotifications.length >= total || pageData.length < limitPerPage) {
        hasMorePages = false;
      } else {
        currentPage++;
      }
    } catch (error) {
      console.error(`Lỗi khi lấy thông báo trang ${currentPage} (Network/Fetch):`, error);
      return allNotifications;
    }
  }
  console.log("allNotifications:", allNotifications);
  return allNotifications;
};

export const sendNotification = async (notificationData) => {
  if (
    !notificationData ||
    typeof notificationData !== "object" ||
    !notificationData.title ||
    !notificationData.content ||
    !notificationData.type ||
    !notificationData.userId
  ) {
    console.error("sendNotification: Dữ liệu đầu vào không hợp lệ.", notificationData);
    return null;
  }

  const mutation = `
    mutation SendNotification($createNotificationDto: CreateNotificationInput!) {
      sendNotification(createNotificationDto: $createNotificationDto) {
        title
        content
      }
    }
  `;

  const variables = {
    createNotificationDto: {
      title: notificationData.title,
      content: notificationData.content,
      type: notificationData.type,
      userId: notificationData.userId,
    },
  };

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: mutation,
        variables: variables,
      }),
    });

    const result = await response.json();
    console.log("Server Response (Send Notification):", result);

    if (!response.ok) {
      const errorMessage = `Yêu cầu thất bại với trạng thái: ${response.status}`;
      console.error("Gửi thông báo thất bại (HTTP Status):", errorMessage, result?.errors || "Không có trường lỗi GraphQL");
      return null;
    }

    if (result.errors) {
      console.error("Gửi thông báo thất bại (GraphQL Errors):", result.errors);
      return null;
    }

    if (result.data && result.data.sendNotification) {
      console.log("Gửi thông báo thành công:", result.data.sendNotification);
      return result.data.sendNotification;
    } else {
      console.error("Gửi thông báo thất bại: Cấu trúc response không mong muốn.", result);
      return null;
    }
  } catch (error) {
    console.error("Lỗi khi gửi thông báo (Network/Fetch):", error);
    return null;
  }
};

// Lấy tất cả tên nhà hàng (chỉ trường name)
export const getAllRestaurantNames = async () => {
  console.log("getAllRestaurantNames");
  const query = `
    query {
      restaurants(page: 1, limit: 100) {
        data {
          id
          name
        }
        total
      }
    }
  `;
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({ query }),
    });
    const result = await response.json();
    console.log("result", result);
    if (result.data && result.data.restaurants && result.data.restaurants.data) {
      console.log("result.data.restaurants.data", result.data.restaurants.data);
      return result.data.restaurants.data;
    } else {
      console.error("Không lấy được danh sách tên nhà hàng:", result);
      return [];
    }
  } catch (error) {
    console.error("Lỗi khi lấy danh sách tên nhà hàng:", error);
    return [];
  }
};