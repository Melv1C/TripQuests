import { 
  collection, 
  addDoc, 
  doc, 
  setDoc, 
  serverTimestamp, 
  Timestamp,
  updateDoc,
  arrayUnion,
  query,
  where,
  getDocs,
  getDoc,
  limit
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

/**
 * Allows a user to join a trip using an invite code
 * 
 * @param inviteCode The trip invite code to join
 * @param userData The current user's data
 * @returns Object containing joined trip information
 */
export const joinTripByInviteCode = async (
  inviteCode: string,
  userData: User
): Promise<{ tripId: string; tripName: string }> => {
  try {
    // Find trip with matching invite code
    const tripsRef = collection(db, 'trips');
    const tripQuery = query(
      tripsRef,
      where('inviteCode', '==', inviteCode.toUpperCase()),
      limit(1)
    );
    
    const querySnapshot = await getDocs(tripQuery);
    
    // Handle case where no trip is found with the given invite code
    if (querySnapshot.empty) {
      throw new Error('Invalid or expired invite code');
    }
    
    // Get trip data from first (and only) document
    const tripDoc = querySnapshot.docs[0];
    const tripId = tripDoc.id;
    const tripData = tripDoc.data() as Omit<TripDocument, 'id'>;
    
    // Check if user is already a participant in this trip
    const participantRef = doc(db, 'trips', tripId, 'participants', userData.uid);
    const participantDoc = await getDoc(participantRef);
    
    if (participantDoc.exists()) {
      throw new Error('You are already a member of this trip');
    }
    
    // Add user as a participant
    await setDoc(participantRef, {
      pseudo: userData.pseudo,
      avatarUrl: userData.avatarUrl,
      role: 'participant',
      joinedAt: serverTimestamp(),
    });
    
    // Update user's participating trips
    await updateDoc(doc(db, 'users', userData.uid), {
      participatingTripIds: arrayUnion(tripId)
    });
    
    return {
      tripId,
      tripName: tripData.name,
    };
  } catch (error) {
    console.error('Error joining trip:', error);
    
    // Re-throw original error if it's our custom error message
    if (error instanceof Error && 
        (error.message === 'Invalid or expired invite code' || 
         error.message === 'You are already a member of this trip')) {
      throw error;
    }
    
    // Otherwise throw a generic error
    throw new Error('Failed to join trip. Please try again later.');
  }
};
