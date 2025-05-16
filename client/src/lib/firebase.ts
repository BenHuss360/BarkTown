import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    // For development/testing, we'll simulate a successful login
    // since Firebase requires domain authorization
    
    // In a production app, this would be real Firebase authentication
    // const result = await signInWithPopup(auth, googleProvider);
    // return result.user;
    
    // Instead, let's create a mock user for testing purposes
    const mockUser = {
      uid: "user123",
      displayName: "Dog Lover",
      email: "dog.lover@example.com",
      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=doggo",
      emailVerified: true,
      providerData: [
        {
          providerId: "google.com",
          uid: "user123",
          displayName: "Dog Lover",
          email: "dog.lover@example.com",
          phoneNumber: null,
          photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=doggo"
        }
      ],
      // Add any other User properties that might be needed
      getIdToken: () => Promise.resolve("mock-token"),
      reload: () => Promise.resolve(),
      delete: () => Promise.resolve(),
      toJSON: () => ({}),
      // Add custom property for our app
      id: 1
    };
    
    return mockUser as unknown as User;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    // For production
    // await signOut(auth);
    
    // For development/testing with our mock user
    return Promise.resolve();
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Auth state observer - not used in current implementation
export const observeAuthState = (callback: (user: User | null) => void) => {
  // In production, we would use this:
  // return onAuthStateChanged(auth, callback);
  
  // For our testing environment, just call the callback once with null
  setTimeout(() => callback(null), 0);
  return () => {}; // return dummy unsubscribe function
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

export { auth };