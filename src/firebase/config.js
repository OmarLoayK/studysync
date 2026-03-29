import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBIKZCb8cpK1Yhsp14eFMSpq6fmG9GDFBE",
  authDomain: "studysync-000.firebaseapp.com",
  projectId: "studysync-000",
  storageBucket: "studysync-000.firebasestorage.app",
  messagingSenderId: "595543431646",
  appId: "1:595543431646:web:6c9d0fb25e011c75f8654f"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);