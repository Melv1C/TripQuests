import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useSetAtom } from 'jotai';
import { auth, db } from '../config/firebase';
import { User } from '../types/User';
import { currentUserAtom, userDataAtom, isAuthLoadingAtom } from '../store/atoms/authAtoms';

/**
 * A component that listens to Firebase authentication state changes
 * and updates Jotai atoms accordingly.
 * 
 * This component doesn't render any UI.
 */
const AuthListener = () => {
  // Get the setter functions for the auth atoms
  const setCurrentUser = useSetAtom(currentUserAtom);
  const setUserData = useSetAtom(userDataAtom);
  const setIsAuthLoading = useSetAtom(isAuthLoadingAtom);

  useEffect(() => {
    // Subscribe to authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Update the current user atom
      setCurrentUser(user);
      
      if (user) {
        // User is signed in, fetch additional user data from Firestore
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
        // User is signed out
        setUserData(null);
      }
      
      // Mark authentication loading as complete
      setIsAuthLoading(false);
    });

    // Clean up subscription on component unmount
    return () => unsubscribe();
  }, [setCurrentUser, setUserData, setIsAuthLoading]);

  // This component doesn't render anything
  return null;
};

export default AuthListener; 