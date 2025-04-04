import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Fab,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { orderBy, Timestamp, where } from 'firebase/firestore';
import { useAtomValue, useSetAtom } from 'jotai';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreateQuestForm } from '../components/Quest/CreateQuestForm';
import { QuestCard } from '../components/Quest/QuestCard';
import { QuestDetailsModal } from '../components/Quest/QuestDetailsModal';
import { PendingSubmissionListItem } from '../components/Submission/PendingSubmissionListItem';
import { ReviewModal } from '../components/Submission/ReviewModal';
import { TripSubmissionListItem } from '../components/Submission/TripSubmissionListItem';
import { LeaderboardTable } from '../components/Trip/LeaderboardTable';

import { useCollection, useDocument } from '../hooks/useFirestore';
import { leaveTrip } from '../services/firestore/trips';
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
    const [copySuccess, setCopySuccess] = React.useState(false);
    const [createQuestDialogOpen, setCreateQuestDialogOpen] =
        React.useState(false);
    const [selectedQuest, setSelectedQuest] =
        React.useState<QuestDocument | null>(null);
    const setNotification = useSetAtom(showNotification);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
    const navigate = useNavigate();

    // Add state for review modal
    const [isReviewModalOpen, setIsReviewModalOpen] = React.useState(false);
    const [selectedSubmissionForReview, setSelectedSubmissionForReview] =
        React.useState<SubmissionDocument | null>(null);

    // Add state for submission filter
    const [submissionFilter, setSubmissionFilter] = React.useState<
        'all' | 'pending' | 'approved' | 'rejected'
    >('all');

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
        let entries = participants.map((participant) => ({
            userId: participant.id,
            pseudo: participant.pseudo,
            avatarUrl: participant.avatarUrl,
            totalPoints: pointsMap[participant.id] || 0,
            rank: 0, // Placeholder, will be calculated after sorting
        }));

        // Sort by points (descending)
        entries.sort((a, b) => b.totalPoints - a.totalPoints);

        console.log('entries', entries);

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

        console.log('Final leaderboard entries:', entries);
        return entries;
    }, [participants, approvedSubmissions]);

    // Filter submissions based on selected filter
    const filteredSubmissions = React.useMemo(() => {
        if (!allSubmissions) return [];

        switch (submissionFilter) {
            case 'pending':
                return allSubmissions.filter((sub) => sub.status === 'pending');
            case 'approved':
                return allSubmissions.filter(
                    (sub) => sub.status === 'approved'
                );
            case 'rejected':
                return allSubmissions.filter(
                    (sub) => sub.status === 'rejected'
                );
            case 'all':
            default:
                return allSubmissions;
        }
    }, [allSubmissions, submissionFilter]);

    const handleTabChange = (
        _event: React.SyntheticEvent,
        newValue: number
    ) => {
        setTabValue(newValue);
    };

    const copyInviteCode = () => {
        if (trip?.inviteCode) {
            navigator.clipboard.writeText(trip.inviteCode);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    const handleOpenCreateQuestDialog = () => {
        setCreateQuestDialogOpen(true);
    };

    const handleCloseCreateQuestDialog = () => {
        setCreateQuestDialogOpen(false);
    };

    const handleQuestClick = (quest: QuestDocument) => {
        setSelectedQuest(quest);
    };

    const handleCloseQuestDetails = (success?: boolean) => {
        setSelectedQuest(null);
        if (success) {
            setNotification({
                message: 'Submission received! Pending review.',
                severity: 'success',
            });
        }
    };

    // Add handler for opening the review modal
    const handleOpenReviewModal = (submission: SubmissionDocument) => {
        setSelectedSubmissionForReview(submission);
        setIsReviewModalOpen(true);
    };

    // Add handler for closing the review modal
    const handleCloseReviewModal = () => {
        setIsReviewModalOpen(false);
        setSelectedSubmissionForReview(null);
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
                <Typography variant="h4" component="h1" gutterBottom>
                    {trip.name}
                </Typography>
                <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    gutterBottom
                >
                    {trip.location} • {formatDate(trip.startDate)} -{' '}
                    {formatDate(trip.endDate)}
                </Typography>

                <Paper sx={{ width: '100%', mt: 3 }}>
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
                            <Box sx={{ position: 'relative' }}>
                                <Typography variant="h6" gutterBottom>
                                    Quests
                                </Typography>

                                {isQuestsLoading ? (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            my: 4,
                                        }}
                                    >
                                        <CircularProgress />
                                    </Box>
                                ) : isQuestsError ? (
                                    <Alert severity="error" sx={{ my: 2 }}>
                                        Error loading quests:{' '}
                                        {questsError instanceof Error
                                            ? questsError.message
                                            : 'Unknown error'}
                                    </Alert>
                                ) : quests && quests.length > 0 ? (
                                    <Grid container spacing={2}>
                                        {quests.map((quest) => (
                                            <Grid
                                                key={quest.id}
                                                size={{ xs: 12, sm: 6, md: 4 }}
                                            >
                                                <QuestCard
                                                    quest={quest}
                                                    onClick={() =>
                                                        quest.id &&
                                                        handleQuestClick(quest)
                                                    }
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                ) : (
                                    <Box sx={{ my: 4, textAlign: 'center' }}>
                                        <Typography
                                            variant="body1"
                                            gutterBottom
                                        >
                                            No quests created yet. Be the first!
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            startIcon={<AddIcon />}
                                            onClick={
                                                handleOpenCreateQuestDialog
                                            }
                                            sx={{ mt: 2 }}
                                        >
                                            Create Your First Quest
                                        </Button>
                                    </Box>
                                )}

                                {/* Pending Submissions for Review Section - Updated to use the new list and modal approach */}
                                {submissionsToReview &&
                                    submissionsToReview.length > 0 && (
                                        <Box sx={{ mt: 4 }}>
                                            <Divider sx={{ mb: 3 }} />
                                            <Typography
                                                variant="h6"
                                                gutterBottom
                                            >
                                                Pending Submissions for Review
                                            </Typography>

                                            <List disablePadding>
                                                {submissionsToReview.map(
                                                    (submission) => {
                                                        const quest =
                                                            submission.questId &&
                                                            questsById[
                                                                submission
                                                                    .questId
                                                            ];

                                                        if (!quest) {
                                                            return null; // Skip if quest not found
                                                        }

                                                        return (
                                                            <PendingSubmissionListItem
                                                                key={
                                                                    submission.id
                                                                }
                                                                submission={
                                                                    submission
                                                                }
                                                                questTitle={
                                                                    quest.title
                                                                }
                                                                questPoints={
                                                                    quest.points
                                                                }
                                                                onClick={() =>
                                                                    handleOpenReviewModal(
                                                                        submission
                                                                    )
                                                                }
                                                            />
                                                        );
                                                    }
                                                )}
                                            </List>
                                        </Box>
                                    )}

                                {isSubmissionsLoading ? (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            my: 2,
                                        }}
                                    >
                                        <CircularProgress size={24} />
                                    </Box>
                                ) : (
                                    !isSubmissionsError &&
                                    submissionsToReview &&
                                    submissionsToReview.length === 0 && (
                                        <Box sx={{ mt: 4 }}>
                                            <Divider sx={{ mb: 3 }} />
                                            <Typography
                                                variant="h6"
                                                gutterBottom
                                            >
                                                Pending Submissions for Review
                                            </Typography>
                                            <Box
                                                sx={{
                                                    textAlign: 'center',
                                                    py: 3,
                                                }}
                                            >
                                                <Typography
                                                    variant="body1"
                                                    color="text.secondary"
                                                >
                                                    No pending submissions to
                                                    review at this time.
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )
                                )}

                                {isSubmissionsError && (
                                    <Box sx={{ mt: 4 }}>
                                        <Alert severity="error" sx={{ my: 2 }}>
                                            Error loading submissions:{' '}
                                            {submissionsError instanceof Error
                                                ? submissionsError.message
                                                : 'Unknown error'}
                                        </Alert>
                                    </Box>
                                )}

                                {/* Floating action button to create a new quest */}
                                {quests && quests.length > 0 && (
                                    <Fab
                                        color="primary"
                                        aria-label="add quest"
                                        onClick={handleOpenCreateQuestDialog}
                                        sx={{
                                            position: 'fixed',
                                            bottom: 24,
                                            right: 24,
                                        }}
                                    >
                                        <AddIcon />
                                    </Fab>
                                )}

                                {/* Create Quest Dialog */}
                                <Dialog
                                    open={createQuestDialogOpen}
                                    onClose={handleCloseCreateQuestDialog}
                                    maxWidth="sm"
                                    fullWidth
                                >
                                    <Box sx={{ p: 3 }}>
                                        <CreateQuestForm
                                            tripId={tripId || ''}
                                            onClose={
                                                handleCloseCreateQuestDialog
                                            }
                                        />
                                    </Box>
                                </Dialog>

                                {/* Quest Details Modal */}
                                {selectedQuest && (
                                    <QuestDetailsModal
                                        quest={selectedQuest}
                                        open={!!selectedQuest}
                                        onClose={handleCloseQuestDetails}
                                    />
                                )}

                                {/* Review Modal - New component */}
                                <ReviewModal
                                    open={isReviewModalOpen}
                                    onClose={handleCloseReviewModal}
                                    submission={selectedSubmissionForReview}
                                    quest={
                                        selectedSubmissionForReview?.questId
                                            ? questsById[
                                                  selectedSubmissionForReview
                                                      .questId
                                              ]
                                            : null
                                    }
                                />
                            </Box>
                        )}

                        {tabValue === 1 && (
                            <Box>
                                <Typography variant="h6" gutterBottom>
                                    Leaderboard
                                </Typography>

                                {isParticipantsLoading ||
                                isSubmissionsLoading ? (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            my: 4,
                                        }}
                                    >
                                        <CircularProgress />
                                    </Box>
                                ) : isParticipantsError ||
                                  isSubmissionsError ? (
                                    <Alert severity="error" sx={{ my: 2 }}>
                                        Error loading leaderboard data:{' '}
                                        {isParticipantsError &&
                                        participantsError instanceof Error
                                            ? participantsError.message
                                            : isSubmissionsError &&
                                              submissionsError instanceof Error
                                            ? submissionsError.message
                                            : 'Unknown error'}
                                    </Alert>
                                ) : (
                                    <LeaderboardTable
                                        leaderboardData={leaderboardData}
                                    />
                                )}
                            </Box>
                        )}

                        {tabValue === 2 && (
                            <Box>
                                <Typography variant="h6" gutterBottom>
                                    Trip Members
                                </Typography>

                                {isParticipantsLoading ? (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            my: 2,
                                        }}
                                    >
                                        <CircularProgress size={24} />
                                    </Box>
                                ) : isParticipantsError ? (
                                    <Alert severity="error" sx={{ my: 2 }}>
                                        Error loading participants:{' '}
                                        {participantsError instanceof Error
                                            ? participantsError.message
                                            : 'Unknown error'}
                                    </Alert>
                                ) : participants && participants.length > 0 ? (
                                    <List>
                                        {participants.map((participant) => (
                                            <ListItem key={participant.id}>
                                                <ListItemAvatar>
                                                    <Avatar
                                                        src={
                                                            participant.avatarUrl ||
                                                            undefined
                                                        }
                                                        alt={participant.pseudo}
                                                    >
                                                        {participant.pseudo
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={participant.pseudo}
                                                    secondary={formatDate(
                                                        participant.joinedAt
                                                    )}
                                                />
                                                <Chip
                                                    label={participant.role}
                                                    color={
                                                        participant.role ===
                                                        'organizer'
                                                            ? 'primary'
                                                            : 'default'
                                                    }
                                                    size="small"
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                ) : (
                                    <Typography variant="body1">
                                        No participants found.
                                    </Typography>
                                )}
                            </Box>
                        )}

                        {tabValue === 3 && (
                            <Box>
                                <Typography variant="h6" gutterBottom>
                                    Trip Information
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid size={12}>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight="bold"
                                        >
                                            Description
                                        </Typography>
                                        <Typography variant="body1" paragraph>
                                            {trip.description}
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight="bold"
                                        >
                                            Location
                                        </Typography>
                                        <Typography variant="body1" paragraph>
                                            {trip.location}
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight="bold"
                                        >
                                            Dates
                                        </Typography>
                                        <Typography variant="body1" paragraph>
                                            {formatDate(trip.startDate)} -{' '}
                                            {formatDate(trip.endDate)}
                                        </Typography>
                                    </Grid>

                                    <Grid size={12}>
                                        <Divider sx={{ my: 2 }} />
                                    </Grid>

                                    {/* Show invite code to all participants - could be restricted to organizer only */}
                                    <Grid size={12}>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight="bold"
                                        >
                                            Invite Code
                                        </Typography>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                mt: 1,
                                            }}
                                        >
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    fontFamily: 'monospace',
                                                    mr: 1,
                                                }}
                                            >
                                                {trip.inviteCode}
                                            </Typography>
                                            <IconButton
                                                onClick={copyInviteCode}
                                                color={
                                                    copySuccess
                                                        ? 'success'
                                                        : 'default'
                                                }
                                                size="small"
                                            >
                                                <ContentCopyIcon />
                                            </IconButton>
                                            {copySuccess && (
                                                <Typography
                                                    variant="caption"
                                                    color="success.main"
                                                    sx={{ ml: 1 }}
                                                >
                                                    Copied!
                                                </Typography>
                                            )}
                                        </Box>
                                    </Grid>

                                    <Grid size={12}>
                                        <Box sx={{ mt: 4 }}>
                                            <Typography
                                                variant="h6"
                                                sx={{ mb: 2 }}
                                            >
                                                Trip Membership
                                            </Typography>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                onClick={handleOpenLeaveDialog}
                                            >
                                                Leave Trip
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}

                        {tabValue === 4 && (
                            <Box>
                                <Typography variant="h6" gutterBottom>
                                    Submissions
                                </Typography>

                                {isSubmissionsLoading ? (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            my: 4,
                                        }}
                                    >
                                        <CircularProgress />
                                    </Box>
                                ) : isSubmissionsError ? (
                                    <Alert severity="error" sx={{ my: 2 }}>
                                        Error loading submissions:{' '}
                                        {submissionsError instanceof Error
                                            ? submissionsError.message
                                            : 'Unknown error'}
                                    </Alert>
                                ) : allSubmissions &&
                                  allSubmissions.length > 0 ? (
                                    <>
                                        {/* Submission status filter chips */}
                                        <Box
                                            sx={{
                                                mb: 2,
                                                display: 'flex',
                                                gap: 0.5,
                                                flexWrap: 'wrap',
                                                justifyContent: isMobile
                                                    ? 'center'
                                                    : 'flex-start',
                                            }}
                                        >
                                            <Chip
                                                label={`All (${allSubmissions.length})`}
                                                color="primary"
                                                variant={
                                                    submissionFilter === 'all'
                                                        ? 'filled'
                                                        : 'outlined'
                                                }
                                                onClick={() =>
                                                    setSubmissionFilter('all')
                                                }
                                                sx={{
                                                    fontSize: isMobile
                                                        ? '0.7rem'
                                                        : '0.8rem',
                                                    height: isMobile
                                                        ? '28px'
                                                        : '32px',
                                                    mb: 0.5,
                                                    '& .MuiChip-label': {
                                                        px: isMobile ? 1 : 1.5,
                                                    },
                                                }}
                                            />
                                            <Chip
                                                label={`Pending (${pendingSubmissions.length})`}
                                                color="default"
                                                variant={
                                                    submissionFilter ===
                                                    'pending'
                                                        ? 'filled'
                                                        : 'outlined'
                                                }
                                                onClick={() =>
                                                    setSubmissionFilter(
                                                        'pending'
                                                    )
                                                }
                                                sx={{
                                                    fontSize: isMobile
                                                        ? '0.7rem'
                                                        : '0.8rem',
                                                    height: isMobile
                                                        ? '28px'
                                                        : '32px',
                                                    mb: 0.5,
                                                    '& .MuiChip-label': {
                                                        px: isMobile ? 1 : 1.5,
                                                    },
                                                }}
                                            />
                                            <Chip
                                                label={`Approved (${approvedSubmissions.length})`}
                                                color="success"
                                                variant={
                                                    submissionFilter ===
                                                    'approved'
                                                        ? 'filled'
                                                        : 'outlined'
                                                }
                                                onClick={() =>
                                                    setSubmissionFilter(
                                                        'approved'
                                                    )
                                                }
                                                sx={{
                                                    fontSize: isMobile
                                                        ? '0.7rem'
                                                        : '0.8rem',
                                                    height: isMobile
                                                        ? '28px'
                                                        : '32px',
                                                    mb: 0.5,
                                                    '& .MuiChip-label': {
                                                        px: isMobile ? 1 : 1.5,
                                                    },
                                                }}
                                            />
                                            <Chip
                                                label={`Rejected (${
                                                    allSubmissions.filter(
                                                        (s) =>
                                                            s.status ===
                                                            'rejected'
                                                    ).length
                                                })`}
                                                color="error"
                                                variant={
                                                    submissionFilter ===
                                                    'rejected'
                                                        ? 'filled'
                                                        : 'outlined'
                                                }
                                                onClick={() =>
                                                    setSubmissionFilter(
                                                        'rejected'
                                                    )
                                                }
                                                sx={{
                                                    fontSize: isMobile
                                                        ? '0.7rem'
                                                        : '0.8rem',
                                                    height: isMobile
                                                        ? '28px'
                                                        : '32px',
                                                    mb: 0.5,
                                                    '& .MuiChip-label': {
                                                        px: isMobile ? 1 : 1.5,
                                                    },
                                                }}
                                            />
                                        </Box>

                                        <List>
                                            {filteredSubmissions
                                                .sort((a, b) => {
                                                    // Sort by submission date (newest first)
                                                    const dateA =
                                                        a.submittedAt instanceof
                                                        Timestamp
                                                            ? a.submittedAt
                                                                  .toDate()
                                                                  .getTime()
                                                            : a.submittedAt?.getTime() ||
                                                              0;
                                                    const dateB =
                                                        b.submittedAt instanceof
                                                        Timestamp
                                                            ? b.submittedAt
                                                                  .toDate()
                                                                  .getTime()
                                                            : b.submittedAt?.getTime() ||
                                                              0;
                                                    return dateB - dateA;
                                                })
                                                .map((submission) => {
                                                    const quest =
                                                        submission.questId &&
                                                        questsById[
                                                            submission.questId
                                                        ];

                                                    if (!quest) {
                                                        return null; // Skip if quest not found
                                                    }

                                                    return (
                                                        <TripSubmissionListItem
                                                            key={submission.id}
                                                            submission={
                                                                submission
                                                            }
                                                            questTitle={
                                                                quest.title
                                                            }
                                                            questPoints={
                                                                quest.points
                                                            }
                                                        />
                                                    );
                                                })}
                                        </List>
                                    </>
                                ) : (
                                    <Typography variant="body1">
                                        No submissions found.
                                    </Typography>
                                )}
                            </Box>
                        )}

                        {/* Admin Tab - Visible only to organizers */}
                        {tabValue === 5 && isCurrentUserOrganizer && (
                            <Box>
                                <Typography variant="h6" gutterBottom>
                                    Trip Administration
                                </Typography>

                                <Typography
                                    variant="subtitle1"
                                    sx={{ mt: 3, mb: 2 }}
                                >
                                    Participant Management
                                </Typography>

                                {isParticipantsLoading ? (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            my: 2,
                                        }}
                                    >
                                        <CircularProgress size={24} />
                                    </Box>
                                ) : isParticipantsError ? (
                                    <Alert severity="error" sx={{ my: 2 }}>
                                        Error loading participants:{' '}
                                        {participantsError instanceof Error
                                            ? participantsError.message
                                            : 'Unknown error'}
                                    </Alert>
                                ) : participants && participants.length > 0 ? (
                                    <TableContainer
                                        component={Paper}
                                        variant="outlined"
                                    >
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>
                                                        Participant
                                                    </TableCell>
                                                    <TableCell>Role</TableCell>
                                                    <TableCell>
                                                        Joined Date
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {participants.map(
                                                    (participant) => (
                                                        <TableRow
                                                            key={participant.id}
                                                        >
                                                            <TableCell>
                                                                <Box
                                                                    sx={{
                                                                        display:
                                                                            'flex',
                                                                        alignItems:
                                                                            'center',
                                                                    }}
                                                                >
                                                                    <Avatar
                                                                        src={
                                                                            participant.avatarUrl ||
                                                                            undefined
                                                                        }
                                                                        alt={
                                                                            participant.pseudo
                                                                        }
                                                                        sx={{
                                                                            mr: 2,
                                                                        }}
                                                                    >
                                                                        {participant.pseudo
                                                                            .charAt(
                                                                                0
                                                                            )
                                                                            .toUpperCase()}
                                                                    </Avatar>
                                                                    <Typography variant="body1">
                                                                        {
                                                                            participant.pseudo
                                                                        }
                                                                    </Typography>
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={
                                                                        participant.role
                                                                    }
                                                                    color={
                                                                        participant.role ===
                                                                        'organizer'
                                                                            ? 'primary'
                                                                            : 'default'
                                                                    }
                                                                    size="small"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                {formatDate(
                                                                    participant.joinedAt
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Typography variant="body1">
                                        No participants found.
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Box>
                </Paper>
            </Box>

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
