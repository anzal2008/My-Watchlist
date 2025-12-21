// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAcxgXzcC_7AwttJnyzoTXAbmFr1ybJ4cg",
  authDomain: "my-watchlist-8701f.firebaseapp.com",
  projectId: "my-watchlist-8701f",
  storageBucket: "my-watchlist-8701f.firebasestorage.app",
  messagingSenderId: "915163834050",
  appId: "1:915163834050:web:e28803ace6288a4e4d3d5b",
  measurementId: "G-9PCB2K7HR7"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);

