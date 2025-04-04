import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { SubmissionDocument } from '../../types/Submission';

/**
 * Creates a new submission document in Firestore
 * @param questId The ID of the quest being submitted
 * @param tripId The ID of the trip
 * @param submitterData The submitter's data (uid, pseudo)
 * @param imageUrl The URL of the uploaded image
 * @param notes Optional notes for the submission
 * @returns The created submission document
 */
export const createSubmission = async (
  questId: string,
  tripId: string,
  submitterData: { uid: string; pseudo: string },
  imageUrl: string,
  notes?: string
): Promise<SubmissionDocument> => {
  try {
    // Prepare the submission document
    const submissionData: Omit<SubmissionDocument, 'id'> = {
      questId,
      tripId,
      submitterId: submitterData.uid,
      submitterPseudo: submitterData.pseudo,
      evidence: {
        imageUrl,
        notes: notes || '',
      },
      submittedAt: null, // Will be set by serverTimestamp()
      status: 'pending',
      pointsAwarded: 0,
      reviewedAt: null,
      reviewerId: null,
    };
    
    // Add timestamp
    const submissionWithTimestamp = {
      ...submissionData,
      submittedAt: serverTimestamp(),
    };
    
    // Save to Firestore
    const submissionsRef = collection(db, 'submissions');
    const docRef = await addDoc(submissionsRef, submissionWithTimestamp);
    
    // Return the created submission with ID
    return {
      id: docRef.id,
      ...submissionData,
    };
  } catch (error) {
    console.error('Error creating submission:', error);
    throw error;
  }
};
