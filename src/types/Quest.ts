/**
 * Interface representing a quest document in Firestore
 */
export interface QuestDocument {
  id?: string; // Optional as it's assigned by Firestore
  tripId: string;
  creatorId: string;
  creatorPseudo: string;
  title: string;
  description: string;
  questType: 'single-user'; // For future extensibility
  points: number;
  deadline: Date | null;
  imageUrl: string | null;
  createdAt: Date | null;
  isActive: boolean;
}

/**
 * Interface for quest creation form data
 */
export interface QuestFormData {
  title: string;
  description: string;
  points: number;
  deadline: string; // Use string for form inputs initially
}
