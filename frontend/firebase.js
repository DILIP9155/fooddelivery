// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API,
  authDomain: "anupamfoodie-1fd09.firebaseapp.com",
  projectId: "anupamfoodie-1fd09",
  storageBucket: "anupamfoodie-1fd09.firebasestorage.app",
  messagingSenderId: "796105458460",
  appId: "1:796105458460:web:7bfc294ba6f0f1c4b8b0d9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export { app, auth };
