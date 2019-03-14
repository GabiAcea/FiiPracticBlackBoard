import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/messaging";

const config = {
  apiKey: "AIzaSyCm7gLw_Si3hStFNQOLdtxd8Q6T_OShJCI",
  authDomain: "fiipracticapp.firebaseapp.com",
  databaseURL: "https://fiipracticapp.firebaseio.com",
  projectId: "fiipracticapp",
  storageBucket: "fiipracticapp.appspot.com",
  messagingSenderId: "203114474396"
};

const firebaseProvider = firebase.initializeApp(config);
export default firebaseProvider;
