
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB3GKttBZRLBhFuDdW_TEKOLWyawE9L_6Y",
  authDomain: "finalyearproject-3020907-10a54.firebaseapp.com",
  projectId: "finalyearproject-3020907-10a54",
  storageBucket: "finalyearproject-3020907-10a54.firebasestorage.app",
  messagingSenderId: "384748767693",
  appId: "1:384748767693:web:7240c34416eba589ebdc84"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { db };
