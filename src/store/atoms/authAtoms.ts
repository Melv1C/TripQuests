import { atom } from 'jotai';
import { User as FirebaseUser } from 'firebase/auth';
import { User } from '../../types/User';

/**
 * Atom holding the Firebase User object
 * Will be null if the user is not logged in
 */
export const currentUserAtom = atom<FirebaseUser | null>(null);

/**
 * Atom holding the user data from Firestore
 * Contains application-specific user information
 */
export const userDataAtom = atom<User | null>(null);

/**
 * Atom indicating if the initial authentication state check is complete
 * Starts as true (loading) and becomes false once the initial auth check is done
 */
export const isAuthLoadingAtom = atom<boolean>(true); 