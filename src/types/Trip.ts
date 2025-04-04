/**
 * Interface representing a trip document in Firestore
 */
export interface TripDocument {
  id?: string; // Optional as it's assigned by Firestore
  name: string;
  description: string;
  location: string;
  startDate: Date | null;
  endDate: Date | null;
  creatorId: string;
  inviteCode: string;
  createdAt: Date | null;
}

/**
 * Interface for trip creation form data
 */
export interface CreateTripFormData {
  name: string;
  description: string;
  location: string;
  startDate: string; // Use string for form inputs initially
  endDate: string; // Use string for form inputs initially
}
