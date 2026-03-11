import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAaLM8CjQ-ObD0lNGWRfvRL8MwoAgTF1fk",
  authDomain: "stock-ml-b6fb9.firebaseapp.com",
  projectId: "stock-ml-b6fb9",
  storageBucket: "stock-ml-b6fb9.firebasestorage.app",
  messagingSenderId: "1070705170988",
  appId: "1:1070705170988:web:f277480bd46f92dc4f8f89"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);