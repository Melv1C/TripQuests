/**
 * Interface representing a trip document in Firestore
 */
export interface TripDocument {
    id?: string; // Optional as it's assigned by Firestore
    name: string;
    description: string;
    location: string;
    startDate: Date | null;
    endDate: Date | null;
    creatorId: string;
    inviteCode: string;
    createdAt: Date | null;
}

/**
 * Interface for trip creation form data
 */
export interface CreateTripFormData {
    name: string;
    description?: string;
    location?: string;
    startDate: string;
    endDate: string;
}

/**
 * Interface representing a participant in a trip
 */
export interface ParticipantData {
    id: string;
    pseudo: string;
    avatarUrl: string | null;
    role: 'organizer' | 'participant'; // Role within the trip
    joinedAt: Date | null;
    manualPointsAdjustment: number; // New field to track manual adjustments
    lastAdjustmentReason: string | null; // New field to track reason
}

/**
 * Interface representing a leaderboard entry for a trip
 */
export interface LeaderboardEntry {
    rank: number;
    userId: string;
    pseudo: string;
    avatarUrl: string | null;
    totalPoints: number;
}
