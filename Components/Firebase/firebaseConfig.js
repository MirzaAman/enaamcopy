import { initializeApp } from "firebase/app";
import { getAuth,initializeAuth, getReactNativePersistence  } from "firebase/auth";
import {getFirestore} from  'firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyAADTWqK6v6vrn3Hr_oJ3_ps332dbehfMo",
    authDomain: "enaam-93f5a.firebaseapp.com",
    projectId: "enaam-93f5a",
    storageBucket: "enaam-93f5a.appspot.com",
    messagingSenderId: "671192629872",
    appId: "1:671192629872:web:aec5bc6f576a225614eab5",
    measurementId: "G-FY2S24HK6Z"
};

const app = initializeApp(firebaseConfig);

const persistence = getReactNativePersistence(AsyncStorage);

const auth = initializeAuth(app, { persistence });

const db = getFirestore(app);

export { auth, db };