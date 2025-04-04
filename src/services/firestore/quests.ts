import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { QuestFormData, QuestDocument } from '../../types/Quest';

/**
 * Create a new quest in Firestore
 * @param formData The quest form data
 * @param tripId The ID of the trip this quest belongs to
 * @param userId The ID of the quest creator
 * @param userPseudo The display name of the quest creator
 * @returns The created quest document
 */
export const createQuest = async (
  formData: QuestFormData,
  tripId: string,
  userId: string,
  userPseudo: string
): Promise<QuestDocument> => {
  try {
    // Convert deadline string to Date if provided, otherwise null
    const deadlineDate = formData.deadline ? new Date(formData.deadline) : null;
    
    // Prepare the quest document
    const questData: Omit<QuestDocument, 'id'> = {
      tripId,
      creatorId: userId,
      creatorPseudo: userPseudo,
      title: formData.title,
      description: formData.description,
      questType: 'single-user',
      points: formData.points,
      deadline: deadlineDate,
      imageUrl: null, // No image initially
      createdAt: null, // Will be set by serverTimestamp()
      isActive: true,
    };
    
    // Add timestamp
    const questWithTimestamp = {
      ...questData,
      createdAt: serverTimestamp(),
    };
    
    // Save to Firestore
    const questsRef = collection(db, 'quests');
    const docRef = await addDoc(questsRef, questWithTimestamp);
    
    // Return the created quest with ID
    return {
      id: docRef.id,
      ...questData,
    };
  } catch (error) {
    console.error('Error creating quest:', error);
    throw error;
  }
};
