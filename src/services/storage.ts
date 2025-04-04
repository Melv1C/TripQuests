import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Uploads an image file for a submission and returns the download URL
 * @param imageFile The image file to upload
 * @param tripId The trip ID
 * @param questId The quest ID
 * @param userId The user ID of the submitter
 * @returns The download URL of the uploaded image
 */
export const uploadSubmissionImage = async (
  imageFile: File,
  tripId: string,
  questId: string,
  userId: string
): Promise<string> => {
  try {
    // Generate a unique file name with timestamp
    const timestamp = Date.now();
    const fileExtension = imageFile.name.split('.').pop();
    const fileName = `${userId}_${timestamp}.${fileExtension}`;
    
    // Define the storage path
    const storagePath = `trips/${tripId}/quests/${questId}/submissions/${fileName}`;
    const storageRef = ref(storage, storagePath);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, imageFile);
    
    // Get and return the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading submission image:', error);
    throw new Error('Failed to upload image. Please try again.');
  }
};
