import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types/User';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  isAuthReady: boolean;
  isLoading: boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userData: null,
  isAuthReady: false,
  isLoading: true,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch additional user data from Firestore
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            // Convert Firestore timestamp to Date object if needed
            const data = userDoc.data();
            const userData: User = {
              uid: user.uid,
              pseudo: data.pseudo,
              email: data.email,
              avatarUrl: data.avatarUrl,
              createdAt: data.createdAt?.toDate() || null,
              participatingTripIds: data.participatingTripIds || [],
            };
            setUserData(userData);
          } else {
            console.error('User document not found in Firestore');
            setUserData(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      
      setIsAuthReady(true);
      setIsLoading(false);
    });

    // Clean up subscription
    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    userData,
    isAuthReady,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
}; 