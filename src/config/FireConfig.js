import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/messaging";

const config = {
  apiKey: "AIzaSyDMRoy5HwH6cFiLqg_kDzs1dPAvopCZ3QI",
  authDomain: "fiipracticol.firebaseapp.com",
  databaseURL: "https://fiipracticol.firebaseio.com",
  projectId: "fiipracticol",
  storageBucket: "fiipracticol.appspot.com",
  messagingSenderId: "897673905673"
};

const firebaseProvider = firebase.initializeApp(config);
export default firebaseProvider;
