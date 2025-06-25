import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
  collectionGroup,
  where,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";


// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCjfIJ0FuH-VWRdj0rHFapnEKkr6bIUlvY",
  authDomain: "tech-box-cb857.firebaseapp.com",
  projectId: "tech-box-cb857",
  storageBucket: "tech-box-cb857.firebasestorage.app",
  messagingSenderId: "792563612882",
  appId: "1:792563612882:web:8466799e268140dfcb010b"
};

// Inicializa Firebase
export const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
const auth = getAuth(app);

export { db, auth, provider };