import GRAPHQL_ENDPOINT from "../../config";

export const findRestaurantsByCategory = async (
  categoryName,
  latitude,
  longitude,
  limit = 10
) => {
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

        
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "Authorization": `Bearer ${token}` // nếu cần
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
  limit = 10
) => {
  const query = `
    query {
      searchNearestRestaurants(
        latitude: ${latitude}
        longitude: ${longitude}
        limit: ${limit}
      ) {
        id
        name
        distance
        description
        avatar
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    return result.data.searchNearestRestaurants;
  } catch (error) {
    console.error("GraphQL request error:", error);
    throw error;
  }
};
export const searchTopRatedRestaurants = async (
  latitude,
  longitude,
  limit = 10
) => {
  const query = `
    query {
      findTopRatedRestaurants(
        latitude: ${latitude},
        longitude: ${longitude},
        limit: ${limit}
      ) {
        restaurant {
          id
          name
          description
          avatar
        }
        averageRating
        distance
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    return result.data.findTopRatedRestaurants.map((item) => ({
      ...item.restaurant,
      averageRating: item.averageRating,
      distance: item.distance,
    }));
  } catch (error) {
    console.error("GraphQL Top Rated request error:", error);
    throw error;
  }
};

export const searchMostOrderedRestaurants = async (
  latitude,
  longitude,
  limit = 10
) => {
  const query = `
    query {
      findMostOrderedRestaurants(
        latitude: ${latitude},
        longitude: ${longitude},
        limit: ${limit}
      ) {
        restaurant {
          id
          name
          description
          avatar
        }
        totalOrders
        distance
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    return result.data.findMostOrderedRestaurants.map((item) => ({
      ...item.restaurant,
      totalOrders: item.totalOrders,
      distance: item.distance,
    }));
  } catch (error) {
    console.error("GraphQL Most Ordered request error:", error);
    throw error;
  }
};

export const fetchCategoriesByRestaurantId = async (restaurantId) => {
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
        // Authorization: `Bearer ${token}`,
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
