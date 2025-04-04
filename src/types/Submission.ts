/**
 * Interface representing a submission document in Firestore
 */
export interface SubmissionDocument {
  id?: string; // Optional as it's assigned by Firestore
  questId: string;
  tripId: string;
  submitterId: string;
  submitterPseudo: string;
  evidence: {
    imageUrl: string;
    notes: string; // Optional, but stored as empty string if not provided
  };
  submittedAt: Date | null;
  status: 'pending' | 'approved' | 'rejected';
  pointsAwarded: number;
  reviewedAt: Date | null;
  reviewerId: string | null;
}

/**
 * Interface for submission form data
 */
export interface SubmissionFormData {
  imageFile: File;
  notes?: string;
}
