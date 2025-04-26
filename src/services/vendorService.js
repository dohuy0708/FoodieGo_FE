const GRAPHQL_ENDPOINT = "http://192.168.2.2:3001/graphql";

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
export const createRestaurant = async (restaurantData) => {
  if (!restaurantData) {
    console.error("createRestaurant requires restaurantData.");
    return null; 
  }

  const query = `
    mutation CreateRestaurant($input: RestaurantInput!) {
      createRestaurant(input: $input) {
        id
        name
        address
        phoneNumber
        imageUrl
      }
    }
  `;
  const variables = {
    input: restaurantData,
  };
  console.log("Creating restaurant with data:", restaurantData);
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
      console.error("Create restaurant failed (HTTP Status):", errorMessage);
      Alert.alert("Error", errorMessage);
      return null;
    }

    if (result.errors) {
      const errorMessage =
        result.errors[0].message || "Unknown error from GraphQL.";
      console.error("Create restaurant failed (GraphQL Errors):", errorMessage);
      Alert.alert("Error", errorMessage);
      return null;
    }

    if (result.data && result.data.createRestaurant) {
      console.log("Restaurant created successfully:", result.data.createRestaurant);
      return result.data.createRestaurant;
    } else {
      console.error("Create restaurant failed: Unexpected response structure", result);
      Alert.alert("Error", "Unexpected response structure from server.");
      return null;
    }
  } catch (error) {
    console.error("Create restaurant Error (Network/Fetch):", error);
    Alert.alert("Network Error", `Unable to connect to server: ${error.message}`);
    return null;
  }
};
export const getCoordinatesOfLocation = async (address) => {
  if (!address || typeof address !== 'string' || address.trim() === '') {
    console.error("getCoordinatesOfLocation requires a non-empty address string.");
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
        "Accept": "application/json",
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
      console.error("Search coordinates failed (GraphQL Errors):", errorMessage);
      return null;
    }

    if (result.data && result.data.searchAddress) {
      console.log("Coordinates found successfully:", result.data.searchAddress);
      return result.data.searchAddress;
    } else {
      console.error("Search coordinates failed: Unexpected response structure", result);
      return null;
    }
  } catch (error) {
    console.error("Search coordinates Error (Network/Fetch):", error);
     const message = error instanceof TypeError && error.message.includes('Network request failed')
      ? 'Unable to connect to the server. Please check your network connection.'
      : `An error occurred: ${error.message}`;
  
    return null;
  }
};


export const createNewAddress = async (addressData) => {
 
  if (!addressData || typeof addressData !== 'object' || !addressData.street) {
    console.error("createNewAddress requires an addressData object with at least a street name.");
    return null;
  }

 
  const query = `
    mutation CallCreateAddress($data: CreateAddressInput!) {  
                                                             
      createAddress(createAddressInput: $data) {           
                                                              
        
        id
        label
        province
        district
        ward
        street
        latitude
        longitude
        placeId
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
        "Accept": "application/json",
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
      const errorMessage = result.errors[0].message || "Unknown error from GraphQL.";
      console.error("Create new address failed (GraphQL Errors):", errorMessage);
      return null;
    }

    
    if (result.data && result.data.createAddress) {
      console.log("Address created successfully:", result.data.createAddress);
      return result.data.createAddress; 
    } else {
      console.error("Create new address failed: Unexpected response structure", result);
      return null;
    }

  } catch (error) {
    console.error("Create new address Error (Network/Fetch):", error);
    return null;
  }
};