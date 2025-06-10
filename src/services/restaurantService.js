import GRAPHQL_ENDPOINT from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
export const findRestaurantsByCategory = async (
  categoryName,
  latitude,
  longitude,
  page = 1,
  limit = 10
) => {
  const token = await AsyncStorage.getItem("token");

  const query = `
    query {
      findRestaurantsByCategory(
        categoryName: "${categoryName}"
        latitude: ${latitude}
        longitude: ${longitude}
        page: ${page}
        limit: ${limit}
      ) {
        total
        data {
          id
          name
          description
          avatar
          distance
          averageRating
        }
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

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      throw new Error(result.errors[0].message || "GraphQL Error");
    }

    return result.data.findRestaurantsByCategory.data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export const searchNearestRestaurants = async (
  latitude,
  longitude,
  page = 1,
  limit = 10
) => {
  const token = await AsyncStorage.getItem("token");
  const query = `
    query {
      searchNearestRestaurants(
        latitude: ${latitude}
        longitude: ${longitude}
        page: ${page}
        limit: ${limit}
      ) {
        data {
          id
          name
          description
          avatar
          distance
          averageRating
          owner
          {
            id
          }

        }
        total
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // nếu cần
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    // Kiểm tra lỗi GraphQL
    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      throw new Error(result.errors[0].message || "GraphQL Error");
    }

    // Kiểm tra data null
    if (!result.data || !result.data.searchNearestRestaurants) {
      console.error("GraphQL response missing data:", result);
      throw new Error("No data returned from searchNearestRestaurants");
    }

    return {
      data: result.data.searchNearestRestaurants.data,
      total: result.data.searchNearestRestaurants.total,
    };
  } catch (error) {
    console.error("GraphQL Nearest request error:", error);
    throw error;
  }
};
export const searchTopRatedRestaurants = async (
  latitude,
  longitude,
  page = 1,
  limit = 5
) => {
  const token = await AsyncStorage.getItem("token");
  const query = `
    query {
      findTopRatedRestaurants(
        latitude: ${latitude},
        longitude: ${longitude},
        page: ${page},
        limit: ${limit}
      ) {
        data {
          restaurant {
            id
            name
            description
            avatar
            owner
            {
              id
            }
          }
          averageRating
          distance
        }
        total
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
    return {
      data: result.data.findTopRatedRestaurants.data.map((item) => ({
        ...item.restaurant,
        averageRating: item.averageRating,
        distance: item.distance,
      })),
      total: result.data.findTopRatedRestaurants.total,
    };
  } catch (error) {
    console.error("GraphQL Top Rated request error:", error);
    throw error;
  }
};

export const searchMostOrderedRestaurants = async (
  latitude,
  longitude,
  page = 1,
  limit = 5
) => {
  const token = await AsyncStorage.getItem("token");
  const query = `
    query {
      findMostOrderedRestaurants(
        latitude: ${latitude},
        longitude: ${longitude},
        page: ${page},
        limit: ${limit}
      ) {
        data {
          restaurant {
            id
            name
            description
            avatar
            owner
            {
              id
            }
          }
          totalOrders
          distance
          averageRating
        }
        total
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
    return {
      data: result.data.findMostOrderedRestaurants.data.map((item) => ({
        ...item.restaurant,
        totalOrders: item.totalOrders,
        distance: item.distance,
        averageRating: item.averageRating,
      })),
      total: result.data.findMostOrderedRestaurants.total,
    };
  } catch (error) {
    console.error("GraphQL Most Ordered request error:", error);
    throw error;
  }
};

export const fetchCategoriesByRestaurantId = async (restaurantId) => {
  const token = await AsyncStorage.getItem("token");
  const query = `
    query {
      findCategoriesByRestaurantId(restaurantId: ${restaurantId}) {
        id
        name
        menu {
          id
          name
        }
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      // 👈 sửa URL phù hợp backend của bạn
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // nếu cần
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    return result.data.findCategoriesByRestaurantId;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const fetchFoodsByCategoryId = async (categoryId) => {
  const token = await AsyncStorage.getItem("token");
  const query = `
    query {
      findMenusByCategoryId(categoryId: ${categoryId}) {
        id
        name
        description
        price
        available
        imageUrl
      
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Nếu có token:
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    if (result?.data?.findMenusByCategoryId) {
      return result.data.findMenusByCategoryId;
    } else {
      throw new Error("No data found");
    }
  } catch (error) {
    console.error("Error fetching foods:", error);
    throw error;
  }
};

export const fetchNearestRestaurantsByName = async ({
  latitude,
  longitude,
  keyword,
  page = 1,
  limit = 10,
}) => {
  const token = await AsyncStorage.getItem("token");
  console.log("Fetching nearest restaurants by name:", {
    latitude,
    longitude,
    keyword,
    page,
    limit,
  });
  const query = `
    query {
      searchNearestRestaurantsByName(
        latitude: ${latitude}
        longitude: ${longitude}
        keyword: "${keyword}"
        page: ${page}
        limit: ${limit}
      ) {
        data {
          id
          name
          description
          avatar
          distance
          averageRating
        }
        total
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
    console.log("GraphQL response:", result);
    return result?.data?.searchNearestRestaurantsByName.data ?? [];
  } catch (error) {
    console.error("Error fetching nearest restaurants:", error);
    throw error;
  }
};
export const findMenusByImage = async (selectedImage, limit = 10) => {
  console.log("Selected image:", selectedImage);

  const token = await AsyncStorage.getItem("token");
  if (!selectedImage?.uri) {
    throw new Error("No image selected");
  }

  const formData = new FormData();

  formData.append(
    "operations",
    JSON.stringify({
      query: `
        query($file: Upload!, $limit: Int!) {
          findMenusByImageUrl(file: $file, limit: $limit) {
            id
            name
            imageUrl
            description
            category {
              id
              restaurant {
                id
              }
            }
            price
          }
        }
      `,
      variables: {
        file: null,
        limit: limit,
      },
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
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();
    console.log("GraphQL response:", result);
    return result?.data?.findMenusByImageUrl || [];
  } catch (error) {
    throw error;
  }
};
export const findRestaurantById = async (id, latitude, longitude) => {
  const token = localStorage.getItem("token"); // Nếu là React Native, dùng AsyncStorage

  const query = `
    query {
      findRestaurantById(id: ${id}, latitude: ${latitude}, longitude: ${longitude}) {
        id
        name
        description
        avatar
        distance
        averageRating
      }
    }
  `;

  try {
    const response = await fetch("http://localhost:3001/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    if (response.ok && result?.data?.findRestaurantById) {
      return result.data.findRestaurantById;
    } else {
      const errorMessage =
        result?.errors?.[0]?.message || `Query thất bại (${response.status})`;
      console.error("Lỗi:", errorMessage);
      return null;
    }
  } catch (error) {
    console.error("Lỗi mạng:", error.message);
    return null;
  }
};

if (!GRAPHQL_ENDPOINT) {
  console.error(
    "GRAPHQL_ENDPOINT is not defined. Please check your configuration."
  );
  throw new Error("API endpoint is missing.");
}
