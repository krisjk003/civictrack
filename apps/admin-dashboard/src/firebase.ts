import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDl4K-N5izYksBUpDtEX_MNvgefJCGHGHU",
  authDomain: "civictrack-b98b3.firebaseapp.com",
  projectId: "civictrack-b98b3",
  storageBucket: "civictrack-b98b3.firebasestorage.app",
  messagingSenderId: "294025925697",
  appId: "1:294025925697:web:8b467269b78a52b81a62c0",
  measurementId: "G-VFC37ELXW7"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);


export default app;