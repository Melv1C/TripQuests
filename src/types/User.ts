/**
 * User interface representing a user document in Firestore
 */
export interface User {
  uid: string;
  pseudo: string;
  email: string;
  avatarUrl: string | null;
  createdAt: Date | null;
  participatingTripIds: string[];
}

/**
 * Interface for registration form data
 */
export interface RegisterFormData {
  pseudo: string;
  email: string;
  password: string;
  confirmPassword: string;
}
