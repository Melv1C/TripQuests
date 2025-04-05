import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Paper,
    Tab,
    Tabs,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { orderBy, Timestamp, where } from 'firebase/firestore';
import { useAtomValue, useSetAtom } from 'jotai';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { AdjustPointsModal } from '../components/Trip/AdjustPointsModal';
import { AdminTab } from '../components/Trip/Tabs/AdminTab';
import { InfoTab } from '../components/Trip/Tabs/InfoTab';
import { LeaderboardTab } from '../components/Trip/Tabs/LeaderboardTab';
import { MembersTab } from '../components/Trip/Tabs/MembersTab';
import { QuestsTab } from '../components/Trip/Tabs/QuestsTab';
import { SubmissionsTab } from '../components/Trip/Tabs/SubmissionsTab';

import { useCollection, useDocument } from '../hooks/useFirestore';
import {
    adjustParticipantPoints,
    leaveTrip,
} from '../services/firestore/trips';
import { userDataAtom } from '../store/atoms/authAtoms';
import { showNotification } from '../store/atoms/notificationAtom';
import { QuestDocument } from '../types/Quest';
import { SubmissionDocument } from '../types/Submission';
import { ParticipantData, TripDocument } from '../types/Trip';

export const TripPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { tripId } = useParams<{ tripId: string }>();
    const [tabValue, setTabValue] = React.useState(0);
    const userData = useAtomValue(userDataAtom);
    const setNotification = useSetAtom(showNotification);
    const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
    const navigate = useNavigate();

    // State for points adjustment modal
    const [isAdjustPointsModalOpen, setIsAdjustPointsModalOpen] =
        useState(false);
    const [selectedParticipantForPoints, setSelectedParticipantForPoints] =
        useState<ParticipantData | null>(null);

    // Fetch trip data
    const {
        data: trip,
        isLoading: isTripLoading,
        isError: isTripError,
        error: tripError,
    } = useDocument<TripDocument>('trips', tripId, { enabled: !!tripId });

    // Fetch participants data
    const {
        data: participants,
        isLoading: isParticipantsLoading,
        isError: isParticipantsError,
        error: participantsError,
    } = useCollection<ParticipantData>(`trips/${tripId}/participants`, [], {
        enabled: !!tripId,
    });

    // Fetch quests for this trip
    const {
        data: quests,
        isLoading: isQuestsLoading,
        isError: isQuestsError,
        error: questsError,
    } = useCollection<QuestDocument>(
        'quests',
        [where('tripId', '==', tripId || ''), orderBy('createdAt', 'desc')],
        { enabled: !!tripId }
    );

    // Check all submissions regardless of status
    const {
        data: allSubmissions,
        isLoading: isSubmissionsLoading,
        isError: isSubmissionsError,
        error: submissionsError,
    } = useCollection<SubmissionDocument>(
        'submissions',
        [where('tripId', '==', tripId || '')],
        { enabled: !!tripId }
    );

    const approvedSubmissions = React.useMemo(() => {
        if (!allSubmissions) return [];
        return allSubmissions.filter((sub) => sub.status === 'approved');
    }, [allSubmissions]);

    const pendingSubmissions = React.useMemo(() => {
        if (!allSubmissions) return [];
        return allSubmissions.filter((sub) => sub.status === 'pending');
    }, [allSubmissions]);

    // Filter out user's own submissions
    const submissionsToReview = React.useMemo(() => {
        if (!pendingSubmissions || !userData) return [];
        return pendingSubmissions.filter(
            (submission) => submission.submitterId !== userData.uid
        );
    }, [pendingSubmissions, userData]);

    // Create a lookup object for quests by ID
    const questsById = React.useMemo(() => {
        if (!quests) return {};
        return quests.reduce((acc, quest) => {
            if (quest.id) {
                acc[quest.id] = quest;
            }
            return acc;
        }, {} as Record<string, QuestDocument>);
    }, [quests]);

    // Calculate leaderboard data
    const leaderboardData = React.useMemo(() => {
        if (!participants || !approvedSubmissions) return [];

        // Initialize points map
        const pointsMap: Record<string, number> = {};

        // Sum up points for each user from approved submissions
        approvedSubmissions.forEach((submission) => {
            if (!pointsMap[submission.submitterId]) {
                pointsMap[submission.submitterId] = 0;
            }
            pointsMap[submission.submitterId] += submission.pointsAwarded;
        });

        // Create leaderboard entries
        let entries = participants.map((participant) => {
            // Add manual adjustments to the total points (default to 0 if not present)
            const manualAdjustment = participant.manualPointsAdjustment || 0;
            const submissionPoints = pointsMap[participant.id] || 0;

            return {
                userId: participant.id,
                pseudo: participant.pseudo,
                avatarUrl: participant.avatarUrl,
                totalPoints: submissionPoints + manualAdjustment,
                rank: 0, // Placeholder, will be calculated after sorting
                // Store these separately for display purposes if needed
                questPoints: submissionPoints,
                adjustedPoints: manualAdjustment,
            };
        });

        // Sort by points (descending)
        entries.sort((a, b) => b.totalPoints - a.totalPoints);

        // Assign ranks (handling ties)
        let currentRank = 1;
        let currentPoints = entries[0]?.totalPoints ?? -1;

        entries = entries.map((entry, index) => {
            if (entry.totalPoints !== currentPoints) {
                // New points value, so rank becomes the current position + 1
                currentRank = index + 1;
                currentPoints = entry.totalPoints;
            }
            // Same points as previous, so keep same rank

            return {
                ...entry,
                rank: currentRank,
            };
        });

        return entries;
    }, [participants, approvedSubmissions]);

    const handleTabChange = (
        _event: React.SyntheticEvent,
        newValue: number
    ) => {
        setTabValue(newValue);
    };

    const handleOpenAdjustPointsModal = (participant: ParticipantData) => {
        setSelectedParticipantForPoints(participant);
        setIsAdjustPointsModalOpen(true);
    };

    const handleCloseAdjustPointsModal = () => {
        setIsAdjustPointsModalOpen(false);
        setSelectedParticipantForPoints(null);
    };

    const handleAdjustPoints = (points: number, reason: string | null) => {
        if (selectedParticipantForPoints?.id) {
            adjustPointsMutation.mutate({
                participantId: selectedParticipantForPoints.id,
                points,
                reason,
            });
        }
    };

    // Check if current user is a participant in this trip
    const isUserParticipant = React.useMemo(() => {
        if (!userData || !tripId) return false;

        // Check if the trip ID is in the user's participatingTripIds array
        if (
            userData.participatingTripIds &&
            userData.participatingTripIds.includes(tripId)
        ) {
            return true;
        }

        // Check if user exists in the participants collection
        if (participants) {
            return participants.some(
                (participant) => participant.id === userData.uid
            );
        }

        return false;
    }, [userData, participants, tripId]);

    // Format dates for display - handle both Date and Firestore Timestamp
    const formatDate = (date: Date | Timestamp | null) => {
        if (!date) return 'Not specified';

        try {
            // If it's a Firestore Timestamp, convert to Date
            if (date instanceof Timestamp) {
                return format(date.toDate(), 'PPP');
            }
            // If it's already a Date object
            if (date instanceof Date) {
                return format(date, 'PPP');
            }
            return 'Invalid date';
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid date';
        }
    };

    // Check if current user is an organizer for this trip
    const isCurrentUserOrganizer = React.useMemo(() => {
        if (!userData || !participants) return false;

        const currentUserParticipant = participants.find(
            (p) => p.id === userData.uid
        );
        return (
            !!currentUserParticipant &&
            currentUserParticipant.role === 'organizer'
        );
    }, [userData, participants]);

    const leaveTripMutation = useMutation({
        mutationFn: () => {
            if (!userData?.uid) {
                throw new Error('User data not available');
            }
            return leaveTrip(tripId || '', userData.uid);
        },
        onSuccess: () => {
            setNotification({
                message: `You have successfully left the trip '${trip?.name}'`,
                severity: 'success',
            });
            queryClient.invalidateQueries({
                queryKey: ['userTrips', userData?.uid],
            });
            navigate('/dashboard');
        },
        onError: () => {
            setNotification({
                message: `Failed to leave trip. Please try again.`,
                severity: 'error',
            });
        },
    });

    const adjustPointsMutation = useMutation({
        mutationFn: ({
            participantId,
            points,
            reason,
        }: {
            participantId: string;
            points: number;
            reason: string | null;
        }) => {
            if (!tripId) throw new Error('Trip ID is required');
            return adjustParticipantPoints(
                tripId,
                participantId,
                points,
                reason
            );
        },
        onSuccess: () => {
            setNotification({
                message: 'Points adjusted successfully',
                severity: 'success',
            });
            // Invalidate the participants query to refresh the data
            queryClient.invalidateQueries({
                queryKey: ['collection', `trips/${tripId}/participants`],
            });
            // Close the modal
            setIsAdjustPointsModalOpen(false);
            setSelectedParticipantForPoints(null);
        },
        onError: (error) => {
            setNotification({
                message:
                    error instanceof Error
                        ? error.message
                        : 'Failed to adjust points',
                severity: 'error',
            });
        },
    });

    const handleOpenLeaveDialog = () => {
        setLeaveDialogOpen(true);
    };

    const handleCloseLeaveDialog = () => {
        setLeaveDialogOpen(false);
    };

    const handleConfirmLeave = () => {
        leaveTripMutation.mutate();
    };

    // Loading state
    if (isTripLoading) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    // Error state
    if (isTripError) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ my: 4 }}>
                    <Alert severity="error">
                        Error loading trip details:{' '}
                        {tripError instanceof Error
                            ? tripError.message
                            : 'Unknown error'}
                    </Alert>
                </Box>
            </Container>
        );
    }

    // Trip not found
    if (!trip) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ my: 4 }}>
                    <Alert severity="warning">
                        Trip not found. The trip may have been deleted or you
                        may not have access.
                    </Alert>
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                        onClick={() => window.history.back()}
                    >
                        Go Back
                    </Button>
                </Box>
            </Container>
        );
    }

    // Access denied - user is not a participant
    if (!isUserParticipant) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ my: 4 }}>
                    <Alert severity="warning">
                        Access denied. You are not a member of this trip.
                    </Alert>
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                        onClick={() => window.history.back()}
                    >
                        Go Back
                    </Button>
                </Box>
            </Container>
        );
    }

    // User is a participant and trip exists - render the trip page
    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Box sx={{ mb: 3 }}>
                    <h1 style={{ margin: 0 }}>{trip.name}</h1>
                    <p
                        style={{
                            color: 'rgba(0, 0, 0, 0.6)',
                            margin: '8px 0 0 0',
                        }}
                    >
                        {trip.location} • {formatDate(trip.startDate)} -{' '}
                        {formatDate(trip.endDate)}
                    </p>
                </Box>

                <Paper sx={{ width: '100%' }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        <Tab label="Quests" />
                        <Tab label="Leaderboard" />
                        <Tab label="Members" />
                        <Tab label="Info" />
                        <Tab label="Submissions" />
                        {isCurrentUserOrganizer && <Tab label="Admin" />}
                    </Tabs>

                    <Box sx={{ p: 3 }}>
                        {tabValue === 0 && (
                            <QuestsTab
                                tripId={tripId || ''}
                                quests={quests}
                                isQuestsLoading={isQuestsLoading}
                                isQuestsError={isQuestsError}
                                questsError={questsError}
                                submissionsToReview={submissionsToReview}
                                questsById={questsById}
                                isSubmissionsLoading={isSubmissionsLoading}
                                isSubmissionsError={isSubmissionsError}
                                submissionsError={submissionsError}
                            />
                        )}

                        {tabValue === 1 && (
                            <LeaderboardTab
                                leaderboardData={leaderboardData}
                                isParticipantsLoading={isParticipantsLoading}
                                isSubmissionsLoading={isSubmissionsLoading}
                                isParticipantsError={isParticipantsError}
                                isSubmissionsError={isSubmissionsError}
                                participantsError={participantsError}
                                submissionsError={submissionsError}
                            />
                        )}

                        {tabValue === 2 && (
                            <MembersTab
                                participants={participants}
                                isParticipantsLoading={isParticipantsLoading}
                                isParticipantsError={isParticipantsError}
                                participantsError={participantsError}
                                formatDate={formatDate}
                            />
                        )}

                        {tabValue === 3 && (
                            <InfoTab
                                trip={trip}
                                formatDate={formatDate}
                                handleOpenLeaveDialog={handleOpenLeaveDialog}
                            />
                        )}

                        {tabValue === 4 && (
                            <SubmissionsTab
                                allSubmissions={allSubmissions}
                                isSubmissionsLoading={isSubmissionsLoading}
                                isSubmissionsError={isSubmissionsError}
                                submissionsError={submissionsError}
                                questsById={questsById}
                            />
                        )}

                        {tabValue === 5 && isCurrentUserOrganizer && (
                            <AdminTab
                                participants={participants}
                                isParticipantsLoading={isParticipantsLoading}
                                isParticipantsError={isParticipantsError}
                                participantsError={participantsError}
                                handleOpenAdjustPointsModal={
                                    handleOpenAdjustPointsModal
                                }
                            />
                        )}
                    </Box>
                </Paper>
            </Box>

            {/* Adjust Points Modal */}
            {selectedParticipantForPoints && (
                <AdjustPointsModal
                    open={isAdjustPointsModalOpen}
                    onClose={handleCloseAdjustPointsModal}
                    onSubmit={handleAdjustPoints}
                    isSubmitting={adjustPointsMutation.isPending}
                    participantName={selectedParticipantForPoints.pseudo}
                    currentAdjustment={
                        selectedParticipantForPoints.manualPointsAdjustment || 0
                    }
                />
            )}

            {/* Leave Trip Confirmation Dialog */}
            <Dialog open={leaveDialogOpen} onClose={handleCloseLeaveDialog}>
                <DialogTitle>Leave Trip?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to leave '{trip?.name}'? You will
                        lose access to its quests and submissions, and this
                        action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseLeaveDialog}>Cancel</Button>
                    <Button
                        onClick={handleConfirmLeave}
                        color="error"
                        disabled={leaveTripMutation.isPending}
                    >
                        {leaveTripMutation.isPending
                            ? 'Leaving...'
                            : 'Confirm Leave'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};
