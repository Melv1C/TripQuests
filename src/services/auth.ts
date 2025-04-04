import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  UserCredential 
} from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { RegisterFormData, User } from '../types/User';

/**
 * Check if a pseudo is already taken
 * @param pseudo The pseudo to check
 * @returns True if the pseudo is already taken, false otherwise
 */
export async function isPseudoTaken(pseudo: string): Promise<boolean> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('pseudo', '==', pseudo));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking pseudo uniqueness:', error);
    throw new Error('Failed to check if pseudo is available');
  }
}

/**
 * Register a new user with email, password, and pseudo
 * @param formData Registration form data including pseudo, email, and password
 * @returns The newly created user credential
 * @throws Error if registration fails or pseudo is already taken
 */
export async function registerUser(formData: RegisterFormData): Promise<UserCredential> {
  const { pseudo, email, password } = formData;
  
  // Check if pseudo is already taken
  const pseudoTaken = await isPseudoTaken(pseudo);
  if (pseudoTaken) {
    throw new Error('Pseudo already taken');
  }
  
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { uid } = userCredential.user;
    
    // Create user document in Firestore
    const userData: Omit<User, 'uid'> = {
      pseudo,
      email,
      avatarUrl: null,
      createdAt: null, // Will be set to serverTimestamp() below
      participatingTripIds: [],
    };
    
    // Add server timestamp
    await setDoc(doc(db, 'users', uid), {
      ...userData,
      createdAt: serverTimestamp(),
    });
    
    return userCredential;
  } catch (error: any) {
    // Handle Firebase Auth specific errors
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Email already in use');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak');
    } else if (error.code) {
      // Handle other Firebase Auth errors
      throw new Error(`Registration failed: ${error.message}`);
    }
    
    // Re-throw other errors
    throw error;
  }
}

/**
 * Sign in a user with email and password
 * @param email User's email
 * @param password User's password
 * @returns User credential
 */
export async function signIn(email: string, password: string): Promise<UserCredential> {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      throw new Error('Invalid email or password');
    }
    throw new Error('Failed to sign in');
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw new Error('Failed to sign out');
  }
}
