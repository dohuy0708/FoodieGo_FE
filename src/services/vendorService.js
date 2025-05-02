const GRAPHQL_ENDPOINT = "http://192.168.1.2:3001/graphql";
export const uploadImageToServer = async (selectedImage) => {
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
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    const responseText = await response.text();
    console.log("4");
    console.log("Server Response Text:", responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse server response as JSON:", parseError);
      Alert.alert(
        "Lỗi",
        `Không thể phân tích phản hồi từ server: ${responseText}`
      );
      return null;
    }

    console.log("Server Response JSON:", result);
    if (!response.ok) {
      const errorMessage =
        result?.errors?.[0]?.message ||
        `Yêu cầu thất bại với mã trạng thái: ${response.status}`;
      console.error("Upload failed (HTTP Status):", errorMessage);
      Alert.alert("Lỗi Upload", errorMessage);
      return null;
    }

    if (result.errors) {
      const errorMessage =
        result.errors[0].message || "Lỗi không xác định từ GraphQL.";
      console.error("Upload failed (GraphQL Errors):", errorMessage);
      Alert.alert("Lỗi Upload", errorMessage);
      return null;
    }

    if (result.data && result.data.uploadToCloudinary) {
      console.log("Upload successful:", result.data.uploadToCloudinary);

      return result.data.uploadToCloudinary;
    } else {
      console.error("Upload failed: Unexpected response structure", result);
      Alert.alert("Lỗi", "Cấu trúc phản hồi từ server không đúng.");
      return null;
    }
  } catch (error) {
    console.error("Upload Error (Network/Fetch):", error);
    Alert.alert("Lỗi Mạng", `Không thể kết nối đến server: ${error.message}`);
    return null;
  }
};
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
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
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
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
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
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
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
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
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
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
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
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
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
      }
    }
  `;

  const variables = {
    categoryId: categoryId,
  };

  console.log("Fetching menus by categoryId:", categoryId);

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
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
}
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
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: headers,
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
        restaurantId: $restaurantId
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
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: headers,
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

export const deleteCategory = async (categoryId) => {
  if (
    categoryId === null ||
    categoryId === undefined ||
    typeof categoryId !== "number" ||
    !Number.isInteger(categoryId)
  ) {
    console.error("deleteCategoryAPI requires a valid integer categoryId.");
    return null;
  }

  const query = `
    mutation RemoveCategory($id: Int!) {
      removeCategory(id: $id) {
        id
      }
    }
  `;

  const variables = {
    id: categoryId,
  };

  console.log("Attempting to delete category with ID:", categoryId);

  try {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        query: query,
        variables: variables,
      }),
    });

    const result = await response.json();
    console.log("Server Response (Delete Category):", result);

    if (!response.ok) {
      const errorMessage = `Request failed with status code: ${response.status}`;
      console.error(
        "Delete category failed (HTTP Status):",
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
        "Delete category failed (GraphQL Errors):",
        errorMessage,
        result.errors
      );
      return null;
    }

    if (result.data && result.data.removeCategory) {
      console.log(
        "Category deleted successfully (Server confirmed removal for ID):",
        result.data.removeCategory.id
      );
      return true;
    } else {
      console.error(
        "Delete category failed: Unexpected response structure or category not found by server",
        result
      );
      return null;
    }
  } catch (error) {
    console.error("Delete category Error (Network/Fetch):", error);
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
    input: updateData,
  };

  console.log("Updating restaurant with data:", updateData);

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
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
    typeof addressUpdateData.id !== 'number' ||
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
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json();
    console.log("Server Response (Update Address):", result);

    if (!response.ok && !result.errors) {
      const errorMessage = `Request failed with status code: ${response.status}`;
      console.error("Update address failed (HTTP Status):", errorMessage, result);
      return null;
    }

    if (result.errors) {
      const errorMessage =
        result.errors[0]?.message || "Unknown error from GraphQL.";
      console.error("Update address failed (GraphQL Errors):", errorMessage, result.errors);
      return null;
    }

    if (result.data && result.data.updateAddress) {
      console.log(
        "Address updated successfully:",
        result.data.updateAddress
      );
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