import { useMemo } from 'react';
import { useCollection } from './useFirestore';
import { where } from 'firebase/firestore';
import { SubmissionDocument } from '../types/Submission';

/**
 * Custom hook to calculate a user's total score for a specific trip
 * @param tripId The trip ID to calculate the score for
 * @param userId The user ID to calculate the score for
 * @returns Object containing the calculated score and loading/error states
 */
export function useUserTripScore(tripId: string, userId: string | undefined) {
  const { 
    data: approvedSubmissions,
    isLoading,
    isError,
    error
  } = useCollection<SubmissionDocument>(
    'submissions',
    [
      where('tripId', '==', tripId),
      where('submitterId', '==', userId),
      where('status', '==', 'approved')
    ],
    {
      enabled: !!tripId && !!userId
    }
  );

  // Calculate the total score using useMemo to avoid recalculation on each render
  const score = useMemo(() => {
    if (!approvedSubmissions || approvedSubmissions.length === 0) {
      return 0;
    }

    return approvedSubmissions.reduce((total, submission) => {
      return total + (submission.pointsAwarded || 0);
    }, 0);
  }, [approvedSubmissions]);

  return {
    score,
    isLoading,
    isError,
    error
  };
} 