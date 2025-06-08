import GRAPHQL_ENDPOINT from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
export const findRestaurantsByCategory = async (
  categoryName,
  latitude,
  longitude,
  limit = 10
) => {
  const token = await AsyncStorage.getItem("token");
  const query = `
    query {
      findRestaurantsByCategory(
        categoryName: "${categoryName}"
        latitude: ${latitude}
        longitude: ${longitude}
        limit: ${limit}
      ) {
        id
        name
        distance
        description
        avatar
        owner
        {
          id
        }
        
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

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      throw new Error(result.errors[0].message || "GraphQL Error");
    }

    return result.data.findRestaurantsByCategory;
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
