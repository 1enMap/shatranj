import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyApqp43zpqKYtSH-ao6nBOPS5RUDNH-XjE",
  authDomain: "shatranj-3fc00.firebaseapp.com",
  projectId: "shatranj-3fc00",
  storageBucket: "shatranj-3fc00.firebasestorage.app",
  messagingSenderId: "498090122677",
  appId: "1:498090122677:web:9fd27b47bfe3adaf278dfc",
  measurementId: "G-40KB830MVN"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Authentication functions
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Game history functions
export const saveGame = async (userId: string, gameData: any) => {
  try {
    const gamesRef = collection(db, 'games');
    const docRef = await addDoc(gamesRef, {
      userId,
      ...gameData,
      timestamp: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving game:', error);
    throw error;
  }
};

export const getUserGames = async (userId: string) => {
  try {
    const gamesRef = collection(db, 'games');
    const q = query(
      gamesRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching user games:', error);
    throw error;
  }
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};