import { 
  collection, 
  addDoc, 
  doc, 
  setDoc, 
  serverTimestamp, 
  Timestamp,
  updateDoc,
  arrayUnion
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { CreateTripFormData, TripDocument } from '../../types/Trip';
import { User } from '../../types/User';
import { generateInviteCode } from '../../utils/inviteCode';

/**
 * Creates a new trip in Firestore
 * 
 * @param formData The validated trip form data
 * @param creator The creator user data
 * @returns The created trip document with ID
 */
export const createTrip = async (
  formData: CreateTripFormData, 
  creator: User
): Promise<TripDocument> => {
  try {
    // Generate a unique invite code
    const inviteCode = generateInviteCode();
    
    // Prepare trip document
    const tripData: Omit<TripDocument, 'id'> = {
      name: formData.name,
      description: formData.description || '',
      location: formData.location || '',
      startDate: formData.startDate ? new Date(formData.startDate) : null,
      endDate: formData.endDate ? new Date(formData.endDate) : null,
      creatorId: creator.uid,
      inviteCode,
      createdAt: new Date(), // Will be converted to Timestamp in Firestore
    };
    
    // Add trip document to Firestore
    const tripRef = await addDoc(collection(db, 'trips'), {
      ...tripData,
      startDate: tripData.startDate ? Timestamp.fromDate(tripData.startDate) : null,
      endDate: tripData.endDate ? Timestamp.fromDate(tripData.endDate) : null,
      createdAt: serverTimestamp(),
    });
    
    const tripId = tripRef.id;
    
    // Add creator as participant
    await setDoc(doc(db, 'trips', tripId, 'participants', creator.uid), {
      pseudo: creator.pseudo,
      avatarUrl: creator.avatarUrl,
      role: 'organizer',
      joinedAt: serverTimestamp(),
    });
    
    // Update user's participating trips
    await updateDoc(doc(db, 'users', creator.uid), {
      participatingTripIds: arrayUnion(tripId)
    });
    
    // Return created trip with ID
    return {
      ...tripData,
      id: tripId,
    };
  } catch (error) {
    console.error('Error creating trip:', error);
    throw new Error('Failed to create trip. Please try again later.');
  }
};
