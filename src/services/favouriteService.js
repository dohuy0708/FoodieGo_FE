import AsyncStorage from "@react-native-async-storage/async-storage";
import GRAPHQL_ENDPOINT from "../../config";

export const createFavorite = async (restaurantId, userId) => {
  const token = await AsyncStorage.getItem("token");
  const mutation = `
    mutation {
      createFavorite(createFavoriteInput: {
        restaurantId: ${restaurantId}
        userId: ${userId}
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
      body: JSON.stringify({ query: mutation }),
    });

    const result = await response.json();
    console.log("Favorite created successfully:", result);
    return result?.data?.createFavorite;
  } catch (error) {
    console.error("Error creating favorite:", error);
    throw error;
  }
};
export const fetchFavoritesByUserId = async ({
  userId,
  page = 1,
  limit = 10,
}) => {
  console.log(
    "Fetching favorites for userId:",
    userId,
    "page:",
    page,
    "limit:",
    limit
  );
  const token = await AsyncStorage.getItem("token");

  const query = `
    query {
      findFavoritesByUserId(
        userId: ${userId}
        page: ${page}
        limit: ${limit}
      ) {
        total
        data {
          id
          restaurant {
            id
            name
            description
            avatar
          }
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
    console.log("GraphQL response:", result);
    return result?.data?.findFavoritesByUserId.data ?? [];
  } catch (error) {
    console.error("Error fetching favorites:", error);
    throw error;
  }
};
