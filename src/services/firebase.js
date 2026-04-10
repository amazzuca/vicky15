import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCvRiO58S6nOxINosmYdA83vy7F8dlkoGk",
  authDomain: "cumplevicky-d11ce.firebaseapp.com",
  projectId: "cumplevicky-d11ce",
  storageBucket: "cumplevicky-d11ce.firebasestorage.app",
  messagingSenderId: "840764117039",
  appId: "1:840764117039:web:f61f2d00fbe77dd5e476da",
  measurementId: "G-2DY9JX2DSW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
