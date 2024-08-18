import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';


const firebaseConfig = {
    apiKey: "AIzaSyCQqlPpq6PsZlzoi5vrF7qdac1EQLKCAu0",
    authDomain: "map-test-8dc7c.firebaseapp.com",
    projectId: "map-test-8dc7c",
    storageBucket: "map-test-8dc7c.appspot.com",
    messagingSenderId: "959592249839",
    appId: "1:959592249839:web:c9145034e66ec96702de1a"
  };

  const app = initializeApp(firebaseConfig);

  // Ініціалізація Firestore
  const db = getFirestore(app);
  
  // Експорт Firestore для використання у вашому проекті
  export { db, collection, addDoc, updateDoc, deleteDoc, doc, getDocs };