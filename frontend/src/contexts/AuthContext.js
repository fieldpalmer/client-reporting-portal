import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
     return useContext(AuthContext);
}

export function AuthProvider({ children }) {
     const [currentUser, setCurrentUser] = useState(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);

     async function signInWithGoogle() {
          try {
               setError(null);
               const result = await signInWithPopup(auth, googleProvider);
               console.log('Google Sign-In successful:', result.user);
          } catch (error) {
               console.error('Error signing in with Google:', error);
               setError(error.message);
               throw error;
          }
     }

     async function logout() {
          try {
               setError(null);
               await signOut(auth);
               console.log('User signed out successfully');
          } catch (error) {
               console.error('Error signing out:', error);
               setError(error.message);
               throw error;
          }
     }

     useEffect(() => {
          const unsubscribe = onAuthStateChanged(auth, (user) => {
               console.log('Auth state changed:', user);
               setCurrentUser(user);
               setLoading(false);
          });

          return unsubscribe;
     }, []);

     const value = {
          currentUser,
          signInWithGoogle,
          logout,
          loading,
          error
     };

     return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
