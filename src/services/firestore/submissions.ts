import { collection, addDoc, serverTimestamp, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { SubmissionDocument } from '../../types/Submission';
import { QuestDocument } from '../../types/Quest';

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

/**
 * Reviews a submission (approves or rejects)
 * @param submissionId The ID of the submission being reviewed
 * @param questId The ID of the quest
 * @param reviewerId The ID of the reviewer
 * @param decision The review decision ('approved' or 'rejected')
 * @returns The updated submission
 */
export const reviewSubmission = async (
  submissionId: string,
  questId: string,
  reviewerId: string,
  decision: 'approved' | 'rejected'
): Promise<SubmissionDocument> => {
  try {
    // Get the quest to retrieve points value
    const questRef = doc(db, 'quests', questId);
    const questSnap = await getDoc(questRef);
    
    if (!questSnap.exists()) {
      throw new Error(`Quest with ID ${questId} not found`);
    }
    
    const questData = questSnap.data() as QuestDocument;
    const points = decision === 'approved' ? questData.points : 0;
    
    // Update the submission document
    const submissionRef = doc(db, 'submissions', submissionId);
    
    const updateData = {
      status: decision,
      reviewedAt: serverTimestamp(),
      reviewerId: reviewerId,
      pointsAwarded: points
    };
    
    await updateDoc(submissionRef, updateData);
    
    // Return the updated submission document
    // Note: This is a simplified return and doesn't fetch the actual updated document
    // In a real application, you might want to fetch the updated document
    return {
      id: submissionId,
      questId,
      tripId: '', // This would be available in the actual document
      submitterId: '',
      submitterPseudo: '',
      evidence: {
        imageUrl: '',
        notes: '',
      },
      submittedAt: null,
      status: decision,
      pointsAwarded: points,
      reviewedAt: new Date(), // Client-side date, will differ from server timestamp
      reviewerId,
    };
  } catch (error) {
    console.error('Error reviewing submission:', error);
    throw error;
  }
};
