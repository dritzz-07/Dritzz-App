import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';

export interface UserProfile {
  uid: string;
  fullName: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  address?: string | null;
  addresses?: string[];
  carModel: string | null;
  vehicles?: string[];
  profileCompleted: boolean;
  provider: string | null;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const adminEmails = ['dritzz.info@gmail.com', 'sujitsinghguw@gmail.com', 'admin@dritzz.info'];
          const isUserAdmin = currentUser.email ? adminEmails.some(email => currentUser.email?.toLowerCase() === email.toLowerCase()) : false;

          const initDoc = await getDoc(userRef);
          const existingData = initDoc.exists() ? initDoc.data() : null;
          const currentIsAdmin = existingData?.isAdmin === true;
          const finalIsAdmin = isUserAdmin || currentIsAdmin;

          if (!initDoc.exists()) {
            const savedName = localStorage.getItem('authFullName');
            await setDoc(userRef, {
              uid: currentUser.uid,
              fullName: currentUser.displayName || savedName || null,
              phone: currentUser.phoneNumber || null,
              email: currentUser.email || null,
              city: null,
              carModel: null,
              profileCompleted: !!(currentUser.displayName || savedName),
              provider: currentUser.providerData[0]?.providerId || null,
              isAdmin: finalIsAdmin,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp()
            });
            if (savedName) {
              localStorage.removeItem('authFullName');
              if (!currentUser.displayName) {
                await updateProfile(currentUser, { displayName: savedName });
              }
            }
          } else {
            const savedName = localStorage.getItem('authFullName');
            const updates: any = {
              isAdmin: finalIsAdmin,
              phone: currentUser.phoneNumber || initDoc.data().phone || null,
              lastLogin: serverTimestamp()
            };
            if (savedName) {
              updates.fullName = savedName;
              updates.profileCompleted = true;
              localStorage.removeItem('authFullName');
            }
            await setDoc(userRef, updates, { merge: true });
            
            if (savedName && !currentUser.displayName) {
              await updateProfile(currentUser, { displayName: savedName });
            }
          }

          unsubscribeProfile = onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
              setUserProfile(doc.data() as UserProfile);
            }
            setLoading(false);
          });
        } catch (error) {
          console.error('Error syncing user info to Firestore:', error);
          setLoading(false);
        }
      } else {
        setUserProfile(null);
        if (unsubscribeProfile) unsubscribeProfile();
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error logging in with Google:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      throw error;
    }
  };

  const signupWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(result.user, { displayName: name });
      
      const adminEmails = ['dritzz.info@gmail.com', 'sujitsinghguw@gmail.com', 'admin@dritzz.info'];
      const isUserAdmin = result.user.email ? adminEmails.some(aEmail => result.user.email?.toLowerCase() === aEmail.toLowerCase()) : false;

      const userRef = doc(db, 'users', result.user.uid);
      await setDoc(userRef, {
        uid: result.user.uid,
        fullName: name,
        phone: null,
        email: result.user.email,
        city: null,
        carModel: null,
        profileCompleted: true,
        provider: 'password',
        isAdmin: isUserAdmin,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { ...data, profileCompleted: true }, { merge: true });
      if (data.fullName && user.displayName !== data.fullName) {
        await updateProfile(user, { displayName: data.fullName });
      }
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      alert('Error saving data: ' + (error.message || error));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, loginWithGoogle, loginWithEmail, signupWithEmail, resetPassword, updateUserProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

