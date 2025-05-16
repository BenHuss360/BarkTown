import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { signInWithGoogle, signOutUser } from '@/lib/firebase';

// App user type
interface User {
  id: number;
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: () => Promise<User | null>;
  signOut: () => Promise<void>;
  makeAdmin: (enabled: boolean) => void; // New function to toggle admin status
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Function to make a user an admin or revoke admin privileges
  const makeAdmin = (enabled: boolean) => {
    if (user) {
      // Create a new user object with admin flag
      const updatedUser = {
        ...user,
        isAdmin: enabled
      };
      
      setUser(updatedUser);
      
      // Save to localStorage to persist admin status
      if (enabled) {
        localStorage.setItem('poodlemaps_admin', 'true');
      } else {
        localStorage.removeItem('poodlemaps_admin');
      }
    }
  };

  const signIn = async () => {
    try {
      setIsLoading(true);
      const firebaseUser = await signInWithGoogle();
      
      // Create app user with our simplified structure
      if (firebaseUser) {
        // Generate a user ID based on the user's email or UID to ensure different users get different IDs
        // This is for demonstration purposes only - in a real app, this would come from the database
        let userId = 3; // Default user
        let isAdmin = false;
        
        // Check if this is the specific admin email (ben@immersi.co.uk)
        if (firebaseUser.email === "ben@immersi.co.uk") {
          userId = 1; // Admin user
          isAdmin = true;
        } else if (firebaseUser.email === "dog.lover@example.com") {
          userId = 2; // Test user
        } else if (firebaseUser.uid && firebaseUser.uid !== "user123") {
          // Generate a predictable but different ID based on the UID
          userId = Math.abs(firebaseUser.uid.split("").reduce((a, b) => a + b.charCodeAt(0), 0) % 100) + 3;
        }
        
        const appUser: User = {
          id: userId,
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          isAdmin: isAdmin
        };
        
        // Apply admin status if saved in localStorage
        if (localStorage.getItem('poodlemaps_admin') === 'true' || isAdmin) {
          // Only apply if it's the admin email
          if (firebaseUser.email === "ben@immersi.co.uk") {
            appUser.isAdmin = true;
            localStorage.setItem('poodlemaps_admin', 'true');
          }
        }
        
        setUser(appUser);
        setIsLoading(false);
        return appUser;
      }
      
      setIsLoading(false);
      return null;
    } catch (error) {
      console.error('Error signing in:', error);
      setIsLoading(false);
      return null;
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await signOutUser();
      setUser(null);
      setIsLoading(false);
    } catch (error) {
      console.error('Error signing out:', error);
      setIsLoading(false);
    }
  };

  // Check for stored admin status on initialization
  useEffect(() => {
    if (user && localStorage.getItem('poodlemaps_admin') === 'true') {
      // Apply admin status if saved in localStorage
      makeAdmin(true);
    }
  }, [user]);

  const value = {
    user,
    isLoading,
    signIn,
    signOut,
    makeAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}