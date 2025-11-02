

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";  // Ajoutez cette ligne

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdCDBUZnoPJ8ihfIT3pyyyIvd3MQY0ZlQ",
  authDomain: "restaurant-ai-f6ce4.firebaseapp.com",
  projectId: "restaurant-ai-f6ce4",
  storageBucket: "restaurant-ai-f6ce4.firebasestorage.app",
  messagingSenderId: "973176772803",
  appId: "1:973176772803:web:e5365ee1fadd53477a2a76"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);  // Ajoutez cette ligne

export { db };  // Ajoutez cette ligne