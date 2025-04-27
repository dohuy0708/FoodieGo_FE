import GRAPHQL_ENDPOINT from "../../config";

const registerUser = async ({
  name,
  email,
  gender,
  username,
  password,
  phone,
}) => {
  const mutation = `
      mutation {
        register(createUser: {
          name: "${name}",
          email: "${email}",
          gender: "${gender}",
          username: "${username}",
          password: "${password}",
          phone: "${phone}",
          roleId: 1
        }) {
          token
        }
      }
    `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: mutation }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("GraphQL error:", error);
    throw error;
  }
};

const verifySignup = async (otp) => {
  const mutation = `
      mutation {
        verifySignup(token: "${otp}") {
          token
        }
      }
    `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: mutation }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("GraphQL error:", error);
    throw error;
  }
};

const loginUser = async (username, password) => {
  const query = `
      mutation {
        login(loginDto: {
          username: "${username}",
          password: "${password}"
        }) {
          token
        }
      }
    `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
      }),
    });

    const data = await response.json();
    return data; // Return the data to be used in the component
  } catch (error) {
    throw new Error("Login error: " + error.message); // Handle the error
  }
};

export { registerUser, verifySignup, loginUser };
