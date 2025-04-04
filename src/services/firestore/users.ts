import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { isPseudoTaken } from '../auth';

/**
 * Interface for user profile updates
 */
interface ProfileUpdates {
  pseudo?: string;
  avatarUrl?: string;
}

/**
 * Updates a user's profile in Firestore and propagates changes to all trips where the user is a participant
 * and all quests created by the user
 * @param userId The ID of the user to update
 * @param updates Object containing the fields to update (pseudo and/or avatarUrl)
 * @throws Error if update fails or if the new pseudo is already taken
 */
export const updateUserProfile = async (
  userId: string,
  updates: ProfileUpdates
): Promise<void> => {
  try {
    // If updating pseudo, check if it's different from current and not taken
    if (updates.pseudo) {
      // Get current user data to check if pseudo is actually changing
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data();
      
      // Only check for uniqueness if the pseudo is actually changing
      if (userData.pseudo !== updates.pseudo) {
        const pseudoTaken = await isPseudoTaken(updates.pseudo);
        
        if (pseudoTaken) {
          throw new Error('Pseudo already taken');
        }
      }
    }
    
    // Create an object with only the fields that are being updated
    const dataToUpdate: Record<string, string> = {};
    
    if (updates.pseudo) {
      dataToUpdate.pseudo = updates.pseudo;
    }
    
    if (updates.avatarUrl) {
      dataToUpdate.avatarUrl = updates.avatarUrl;
    }
    
    // Only update if there are fields to update
    if (Object.keys(dataToUpdate).length > 0) {
      // 1. Update the user document
      await updateDoc(doc(db, 'users', userId), dataToUpdate);
      
      // 2. Get all trips where the user is a participant
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      
      if (userData?.participatingTripIds && userData.participatingTripIds.length > 0) {
        // Create an array of promises to update each trip participant record
        const updatePromises = userData.participatingTripIds.map(async (tripId: string) => {
          try {
            // Update participant data in each trip
            await updateDoc(doc(db, 'trips', tripId, 'participants', userId), dataToUpdate);
          } catch (error) {
            console.warn(`Failed to update user data in trip ${tripId}:`, error);
            // Continue with other updates even if one fails
          }
        });
        
        // Wait for all updates to complete
        await Promise.all(updatePromises);
      }
      
      // 3. If pseudo is being updated, also update all quests created by this user
      if (updates.pseudo) {
        try {
          console.log(`Attempting to update quests for user ${userId} with new pseudo: ${updates.pseudo}`);
          
          // Query for all quests created by this user
          const questsRef = collection(db, 'quests');
          const questsQuery = query(questsRef, where('creatorId', '==', userId));
          const questsSnapshot = await getDocs(questsQuery);
          
          console.log(`Found ${questsSnapshot.docs.length} quests created by this user`);
          
          if (!questsSnapshot.empty) {
            // Process quests in smaller batches to avoid overwhelming Firestore
            const MAX_BATCH_SIZE = 5;
            let successCount = 0;
            let errorCount = 0;
            
            // Process the quests in small batches
            for (let i = 0; i < questsSnapshot.docs.length; i += MAX_BATCH_SIZE) {
              const batch = questsSnapshot.docs.slice(i, i + MAX_BATCH_SIZE);
              console.log(`Processing batch ${Math.floor(i/MAX_BATCH_SIZE) + 1}/${Math.ceil(questsSnapshot.docs.length/MAX_BATCH_SIZE)} with ${batch.length} quests`);
              
              // Process each quest individually for better error reporting
              for (const questDoc of batch) {
                try {
                  const questData = questDoc.data();
                  console.log(`Updating quest ${questDoc.id} in trip ${questData.tripId}`);
                  
                  // Try a different approach - explicitly only changing creatorPseudo
                  await updateDoc(doc(db, 'quests', questDoc.id), {
                    creatorPseudo: updates.pseudo
                  });
                  
                  console.log(`Successfully updated quest ${questDoc.id}`);
                  successCount++;
                } catch (error) {
                  console.error(`Failed to update quest ${questDoc.id}:`, error);
                  errorCount++;
                  // Continue with other updates even if one fails
                }
                
                // Small delay between individual updates to avoid overwhelming Firestore
                await new Promise(resolve => setTimeout(resolve, 100));
              }
              
              // Delay between batches
              if (i + MAX_BATCH_SIZE < questsSnapshot.docs.length) {
                await new Promise(resolve => setTimeout(resolve, 300));
              }
            }
            
            console.log(`Quest updates completed. Success: ${successCount}, Failed: ${errorCount}`);
          }
        } catch (error) {
          console.error('Error updating quests with new pseudo:', error);
          // Continue with function execution even if quest updates fail
        }
      }
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    
    // Rethrow the specific error for pseudo taken or a generic error
    if (error instanceof Error && error.message === 'Pseudo already taken') {
      throw error;
    }
    
    throw new Error('Failed to update profile. Please try again.');
  }
};
