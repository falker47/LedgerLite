import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// TODO: Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBIwMwVJaWA6qQJA3MjT0DG2H4jVbw3rDg",
  authDomain: "ledgerlitex.firebaseapp.com",
  projectId: "ledgerlitex",
  storageBucket: "ledgerlitex.firebasestorage.app",
  messagingSenderId: "681350396378",
  appId: "1:681350396378:web:e893543cc99c84c2f9e8e3",
  measurementId: "G-P3ZS6YB04X",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export { auth, db, provider };
