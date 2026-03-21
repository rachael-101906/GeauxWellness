// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCR_WVVUdQeCmu2zmQvPxzO6HLsmcy2HUE",
  authDomain: "geauxwellness-4b645.firebaseapp.com",
  projectId: "geauxwellness-4b645",
  storageBucket: "geauxwellness-4b645.firebasestorage.app",
  messagingSenderId: "350661489394",
  appId: "1:350661489394:web:da05a2e597f92492c9166b",
  measurementId: "G-X6PKFC5ZP9"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { auth, db, firestore, storage };