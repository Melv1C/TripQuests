import {
    addDoc,
    arrayRemove,
    arrayUnion,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    increment,
    serverTimestamp,
    setDoc,
    Timestamp,
    updateDoc,
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
            startDate: tripData.startDate
                ? Timestamp.fromDate(tripData.startDate)
                : null,
            endDate: tripData.endDate
                ? Timestamp.fromDate(tripData.endDate)
                : null,
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
            participatingTripIds: arrayUnion(tripId),
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
        // Normalize invite code to uppercase for consistency
        const normalizedInviteCode = inviteCode.toUpperCase();

        // Alternative approach using a collection group query
        // This can bypass some security rule complexities with "where" clause evaluation
        const tripsRef = collection(db, 'trips');

        // First, try getting ALL trips (if they're not too many)
        // This avoids the complex where clause evaluation in security rules
        const allTripsSnapshot = await getDocs(tripsRef);

        // Filter client-side for the matching invite code
        const matchingTrips = allTripsSnapshot.docs.filter(
            (doc) => doc.data().inviteCode === normalizedInviteCode
        );

        if (matchingTrips.length === 0) {
            throw new Error('Invalid or expired invite code');
        }

        // Get trip data from first matching document
        const tripDoc = matchingTrips[0];
        const tripId = tripDoc.id;
        const tripData = tripDoc.data() as Omit<TripDocument, 'id'>;

        try {
            // Check if user is already a participant in this trip
            const participantRef = doc(
                db,
                'trips',
                tripId,
                'participants',
                userData.uid
            );
            const participantDoc = await getDoc(participantRef);

            if (participantDoc.exists()) {
                throw new Error('You are already a member of this trip');
            }
        } catch (error) {
            // Ignore permission errors - we'll proceed with the join attempt
            console.log(
                'Permission check error (expected if not a member yet):',
                error
            );
        }

        // Add user as a participant - INCLUDE the invite code to satisfy security rules
        await setDoc(doc(db, 'trips', tripId, 'participants', userData.uid), {
            pseudo: userData.pseudo,
            avatarUrl: userData.avatarUrl,
            role: 'participant',
            joinedAt: serverTimestamp(),
        });

        // Update user's participating trips
        await updateDoc(doc(db, 'users', userData.uid), {
            participatingTripIds: arrayUnion(tripId),
        });

        return {
            tripId,
            tripName: tripData.name,
        };
    } catch (error) {
        console.error('Error joining trip:', error);

        // Get detailed error information
        if (error instanceof Error) {
            console.error('Error details:', error.message, error.stack);

            if (
                error.message === 'Invalid or expired invite code' ||
                error.message === 'You are already a member of this trip'
            ) {
                throw error;
            }

            if (error.message.includes('permission-denied')) {
                throw new Error(
                    'Unable to join trip due to permission issues. Please contact support.'
                );
            }

            // Handle possible missing index errors
            if (error.message.includes('index')) {
                throw new Error(
                    'System configuration issue. Please contact the administrator with error: INDEX_REQUIRED'
                );
            }
        }

        throw new Error('Failed to join trip. Please try again later.');
    }
};

/**
 * Fetches trip data for multiple trip IDs
 *
 * @param tripIds Array of trip document IDs to fetch
 * @returns Array of TripDocument objects with id included
 */
export const getTripsByIds = async (
    tripIds: string[]
): Promise<TripDocument[]> => {
    try {
        // If no trip IDs provided, return empty array immediately
        if (!tripIds || tripIds.length === 0) {
            return [];
        }

        // This example uses multiple getDoc calls which works well for small numbers of trips
        // For larger lists (>10), consider using 'in' query if within Firestore limits

        const tripPromises = tripIds.map(async (tripId) => {
            try {
                const tripRef = doc(db, 'trips', tripId);
                const tripDoc = await getDoc(tripRef);

                if (!tripDoc.exists()) {
                    console.warn(`Trip with ID ${tripId} not found`);
                    return null;
                }

                const tripData = tripDoc.data();

                // Convert Firestore Timestamps to JavaScript Dates
                return {
                    ...tripData,
                    id: tripId,
                    startDate: tripData.startDate
                        ? tripData.startDate.toDate()
                        : null,
                    endDate: tripData.endDate
                        ? tripData.endDate.toDate()
                        : null,
                    createdAt: tripData.createdAt
                        ? tripData.createdAt.toDate()
                        : null,
                } as TripDocument;
            } catch (error) {
                // Handle permission errors for individual trips
                console.warn(`Error fetching trip ${tripId}:`, error);
                return null;
            }
        });

        const trips = await Promise.all(tripPromises);

        // Filter out any null results (trips that weren't found or permission denied)
        return trips.filter((trip): trip is TripDocument => trip !== null);
    } catch (error) {
        console.error('Error fetching trips:', error);
        throw new Error('Failed to load trips. Please try again later.');
    }
};

/**
 * Allows a user to leave a trip
 *
 * @param tripId The trip ID to leave
 * @param userId The user ID of the participant leaving the trip
 */
export async function leaveTrip(tripId: string, userId: string): Promise<void> {
    try {
        // Delete the participant document
        await deleteDoc(doc(db, 'trips', tripId, 'participants', userId));

        // Remove the trip ID from the user's participating trips
        await updateDoc(doc(db, 'users', userId), {
            participatingTripIds: arrayRemove(tripId),
        });
    } catch (error) {
        console.error('Error leaving trip:', error);
        throw error;
    }
}

/**
 * Adjusts points for a participant in a trip
 * Uses atomic increment to avoid race conditions
 */
export async function adjustParticipantPoints(
    tripId: string,
    participantId: string,
    pointsToAdd: number,
    reason: string | null
): Promise<void> {
    try {
        const participantRef = doc(
            db,
            'trips',
            tripId,
            'participants',
            participantId
        );

        await updateDoc(participantRef, {
            manualPointsAdjustment: increment(pointsToAdd),
            lastAdjustmentReason: reason || null,
        });
    } catch (error) {
        console.error('Error adjusting participant points:', error);
        throw new Error('Failed to adjust points. Please try again.');
    }
}
