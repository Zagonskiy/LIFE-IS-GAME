import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyApdR6xbfV3J2UMWubicsAuwRb3biH9Wnw",
  authDomain: "life-is-game-8f170.firebaseapp.com",
  projectId: "life-is-game-8f170",
  storageBucket: "life-is-game-8f170.firebasestorage.app",
  messagingSenderId: "861554529321",
  appId: "1:861554529321:web:dda30b5d6c879433de7838",
  measurementId: "G-ELFHWJMHBP"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
