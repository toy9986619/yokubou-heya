import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

let firebaseApp = null;
let firebaseDatabase = null;

const firebaseConfig = {
  apiKey: "AIzaSyAYvF3CqjijqHlHCI_o7lGiIkyJB2RoGps",
  authDomain: "yokubou-heya.firebaseapp.com",
  projectId: "yokubou-heya",
  storageBucket: "yokubou-heya.appspot.com",
  messagingSenderId: "761094030774",
  appId: "1:761094030774:web:2ade7eba6e456a37fb6d17",
  measurementId: "G-TZLG64K8Y2",
  databaseURL: "https://yokubou-heya-default-rtdb.firebaseio.com/",
};

export const initFirebase = () => {
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);

  firebaseApp = app;
  firebaseDatabase = database;
};

export const getFirebaseApp = () => {
  if (!firebaseApp) {
    throw new Error("Firebase app is not initialized");
  }
  return firebaseApp;
};

export const getFirebaseDatabase = () => {
  if (!firebaseDatabase) {
    throw new Error("Firebase database is not initialized");
  }
  return firebaseDatabase;
}
