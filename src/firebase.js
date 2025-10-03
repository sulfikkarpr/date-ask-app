// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAGpXc8OjoOgGWP17XKnOyVToDeFMxig7Y",
  authDomain: "date-ask-app.firebaseapp.com",
  projectId: "date-ask-app",
  storageBucket: "date-ask-app.firebasestorage.app",
  messagingSenderId: "728430334103",
  appId: "1:728430334103:web:ce25506c74deb37aebd9d2",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const saveResponse = async ({ name, date, type }) => {
  try {
    await addDoc(collection(db, "responses"), { name, date, type, timestamp: new Date() });
  } catch (e) {
    console.error("Error saving response:", e);
  }
};
