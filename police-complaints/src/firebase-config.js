// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBxn9z_Q_mwO1fHjZv2yzuOyJ-3kmb3k18",
  authDomain: "complaint-register-e513b.firebaseapp.com",
  projectId: "complaint-register-e513b",
  storageBucket: "complaint-register-e513b.appspot.com",
  messagingSenderId: "1775021718",
  appId: "1:1775021718:web:902a6159dc07eb3e859cb7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
