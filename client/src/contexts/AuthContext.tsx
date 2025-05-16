import React, { createContext, useContext, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { signInWithGoogle, signOutUser } from '@/lib/firebase';

// App user type
interface User {
  id: number;
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: () => Promise<User | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async () => {
    try {
      setIsLoading(true);
      const firebaseUser = await signInWithGoogle();
      
      // Create app user with our simplified structure
      if (firebaseUser) {
        // For demo purposes, assign ID 1 to the signed-in user
        // In a real app, this would be retrieved from the database
        const appUser: User = {
          id: 1,
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL
        };
        
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

  const value = {
    user,
    isLoading,
    signIn,
    signOut,
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