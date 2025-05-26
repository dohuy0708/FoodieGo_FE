// firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBIB3t2qgKyfbOejLpLO9LNeQnkWMYvdj8",
  authDomain: "food-ordering-app-66aa8.firebaseapp.com",
  databaseURL:
    "https://food-ordering-app-66aa8-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "food-ordering-app-66aa8",
  storageBucket: "food-ordering-app-66aa8.firebasestorage.app",
  messagingSenderId: "638020323119",
  appId: "1:638020323119:android:888c82b4887f9d658843da",
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
