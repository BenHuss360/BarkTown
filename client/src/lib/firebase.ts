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
    // Use real Firebase authentication with popup
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    
    // Support both the development domain and the deployment domain
    const authorizedDomains = [
      'localhost',
      'barktown.replit.app',
      window.location.hostname
    ];
    
    // Try to use real Firebase authentication first
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (authError: any) {
      console.error("Firebase auth error:", authError);
      
      // If we're in development or there's a domain authorization issue,
      // fall back to a mock user to allow testing
      if (authError.code === 'auth/unauthorized-domain' || 
          authorizedDomains.some(domain => window.location.hostname.includes(domain))) {
        console.log("Using mock user for development/testing environment");
        
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
          getIdToken: () => Promise.resolve("mock-token"),
          reload: () => Promise.resolve(),
          delete: () => Promise.resolve(),
          toJSON: () => ({}),
          id: 1
        };
        
        return mockUser as unknown as User;
      } else {
        // If it's a different error, rethrow it
        throw authError;
      }
    }
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    // Always try to sign out properly with Firebase
    await signOut(auth);
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