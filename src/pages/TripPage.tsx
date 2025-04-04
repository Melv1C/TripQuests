import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Tabs, 
  Tab, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Avatar, 
  Chip, 
  Button, 
  IconButton, 
  CircularProgress, 
  Alert,
  Grid,
  Divider,
  Dialog,
  Fab
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import { useAtomValue } from 'jotai';
import { userDataAtom } from '../store/atoms/authAtoms';
import { useDocument, useCollection, useUpdateDocument } from '../hooks/useFirestore';
import { TripDocument, ParticipantData } from '../types/Trip';
import { QuestDocument } from '../types/Quest';
import { SubmissionDocument } from '../types/Submission';
import { where, orderBy } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import CreateQuestForm from '../components/Quest/CreateQuestForm';
import QuestCard from '../components/Quest/QuestCard';
import QuestDetailsModal from '../components/Quest/QuestDetailsModal';
import ReviewCard from '../components/Submission/ReviewCard';
import { showNotification } from '../store/atoms/notificationAtom';
import { useSetAtom } from 'jotai';
import { reviewSubmission } from '../services/firestore/submissions';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const TripPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const [tabValue, setTabValue] = React.useState(0);
  const userData = useAtomValue(userDataAtom);
  const [copySuccess, setCopySuccess] = React.useState(false);
  const [createQuestDialogOpen, setCreateQuestDialogOpen] = React.useState(false);
  const [selectedQuest, setSelectedQuest] = React.useState<QuestDocument | null>(null);
  const setNotification = useSetAtom(showNotification);
  const queryClient = useQueryClient();
  
  // Fetch trip data
  const { 
    data: trip, 
    isLoading: isTripLoading, 
    isError: isTripError,
    error: tripError
  } = useDocument<TripDocument>(
    'trips', 
    tripId, 
    { enabled: !!tripId }
  );
  
  // Fetch participants data
  const { 
    data: participants, 
    isLoading: isParticipantsLoading, 
    isError: isParticipantsError,
    error: participantsError
  } = useCollection<ParticipantData>(
    `trips/${tripId}/participants`, 
    [], 
    { enabled: !!tripId }
  );

  // Fetch quests for this trip
  const {
    data: quests,
    isLoading: isQuestsLoading,
    isError: isQuestsError,
    error: questsError
  } = useCollection<QuestDocument>(
    'quests',
    [
      where('tripId', '==', tripId || ''),
      orderBy('createdAt', 'desc')
    ],
    { enabled: !!tripId }
  );
  
  // Fetch pending submissions for review
  const {
    data: pendingSubmissions,
    isLoading: isPendingSubmissionsLoading,
    isError: isPendingSubmissionsError,
    error: pendingSubmissionsError
  } = useCollection<SubmissionDocument>(
    'submissions',
    [
      where('tripId', '==', tripId || ''),
      where('status', '==', 'pending'),
      orderBy('submittedAt', 'asc')
    ],
    { enabled: !!tripId }
  );

  // Filter out user's own submissions
  const submissionsToReview = React.useMemo(() => {
    if (!pendingSubmissions || !userData) return [];
    return pendingSubmissions.filter(
      submission => submission.submitterId !== userData.uid
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

  // Review submission mutation
  const reviewMutation = useMutation({
    mutationFn: async ({
      submissionId,
      questId,
      decision
    }: {
      submissionId: string;
      questId: string;
      decision: 'approved' | 'rejected';
    }) => {
      if (!userData?.uid) {
        throw new Error('User must be logged in to review submissions');
      }
      return reviewSubmission(submissionId, questId, userData.uid, decision);
    },
    onSuccess: (_, variables) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ 
        queryKey: ['collection', 'submissions'] 
      });
      
      // Show notification
      setNotification({
        message: `Submission ${variables.decision === 'approved' ? 'approved' : 'rejected'} successfully!`,
        severity: variables.decision === 'approved' ? 'success' : 'info'
      });
    },
    onError: (error) => {
      console.error('Error reviewing submission:', error);
      setNotification({
        message: `Error reviewing submission: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
    }
  });

  const handleReviewSubmission = (
    submissionId: string,
    questId: string,
    decision: 'approved' | 'rejected'
  ) => {
    reviewMutation.mutate({ submissionId, questId, decision });
  };
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
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
        severity: 'success'
      });
    }
  };
  
  // Check if current user is a participant in this trip
  // - Either through the participants collection
  // - Or through the participatingTripIds array in user data
  const isUserParticipant = React.useMemo(() => {
    if (!userData || !tripId) return false;
    
    // Check if the trip ID is in the user's participatingTripIds array
    if (userData.participatingTripIds && userData.participatingTripIds.includes(tripId)) {
      return true;
    }
    
    // Check if user exists in the participants collection
    if (participants) {
      return participants.some(participant => participant.uid === userData.uid);
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
            Error loading trip details: {tripError instanceof Error ? tripError.message : 'Unknown error'}
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
            Trip not found. The trip may have been deleted or you may not have access.
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
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {trip.location} • {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
        </Typography>
        
        <Paper sx={{ width: '100%', mt: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Quests" />
            <Tab label="Leaderboard" />
            <Tab label="Members" />
            <Tab label="Info" />
          </Tabs>
          
          <Box sx={{ p: 3 }}>
            {tabValue === 0 && (
              <Box sx={{ position: 'relative' }}>
                <Typography variant="h6" gutterBottom>
                  Quests
                </Typography>
                
                {isQuestsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : isQuestsError ? (
                  <Alert severity="error" sx={{ my: 2 }}>
                    Error loading quests: {questsError instanceof Error ? questsError.message : 'Unknown error'}
                  </Alert>
                ) : quests && quests.length > 0 ? (
                  <Grid container spacing={2}>
                    {quests.map((quest) => (
                      <Grid key={quest.id} size={{ xs: 12, sm: 6, md: 4 }}>
                        <QuestCard 
                          quest={quest} 
                          onClick={() => quest.id && handleQuestClick(quest)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ my: 4, textAlign: 'center' }}>
                    <Typography variant="body1" gutterBottom>
                      No quests created yet. Be the first!
                    </Typography>
                    <Button 
                      variant="contained" 
                      startIcon={<AddIcon />}
                      onClick={handleOpenCreateQuestDialog}
                      sx={{ mt: 2 }}
                    >
                      Create Your First Quest
                    </Button>
                  </Box>
                )}
                
                {/* Pending Submissions for Review Section */}
                {submissionsToReview && submissionsToReview.length > 0 && (
                  <Box sx={{ mt: 4 }}>
                    <Divider sx={{ mb: 3 }} />
                    <Typography variant="h6" gutterBottom>
                      Pending Submissions for Review
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {submissionsToReview.map((submission) => {
                        const quest = submission.questId && questsById[submission.questId];
                        
                        if (!quest) {
                          return null; // Skip if quest not found
                        }
                        
                        return (
                          <Grid key={submission.id} size={12}>
                            <ReviewCard
                              submission={submission}
                              quest={quest}
                              onReview={handleReviewSubmission}
                              isReviewing={reviewMutation.isPending && reviewMutation.variables?.submissionId === submission.id}
                            />
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                )}
                
                {isPendingSubmissionsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : !isPendingSubmissionsError && submissionsToReview && submissionsToReview.length === 0 && (
                  <Box sx={{ mt: 4 }}>
                    <Divider sx={{ mb: 3 }} />
                    <Typography variant="h6" gutterBottom>
                      Pending Submissions for Review
                    </Typography>
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="body1" color="text.secondary">
                        No pending submissions to review at this time.
                      </Typography>
                    </Box>
                  </Box>
                )}
                
                {isPendingSubmissionsError && (
                  <Box sx={{ mt: 4 }}>
                    <Alert severity="error" sx={{ my: 2 }}>
                      Error loading submissions: {pendingSubmissionsError instanceof Error ? pendingSubmissionsError.message : 'Unknown error'}
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
                      onClose={handleCloseCreateQuestDialog}
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
              </Box>
            )}
            
            {tabValue === 1 && (
              <Typography variant="body1">
                Leaderboard tab content will appear here. This is a placeholder.
              </Typography>
            )}
            
            {tabValue === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Trip Members
                </Typography>
                
                {isParticipantsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : isParticipantsError ? (
                  <Alert severity="error" sx={{ my: 2 }}>
                    Error loading participants: {participantsError instanceof Error ? participantsError.message : 'Unknown error'}
                  </Alert>
                ) : participants && participants.length > 0 ? (
                  <List>
                    {participants.map((participant) => (
                      <ListItem key={participant.uid}>
                        <ListItemAvatar>
                          <Avatar src={participant.avatarUrl || undefined} alt={participant.pseudo}>
                            {participant.pseudo.charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={participant.pseudo}
                          secondary={formatDate(participant.joinedAt)}
                        />
                        <Chip 
                          label={participant.role} 
                          color={participant.role === 'organizer' ? 'primary' : 'default'}
                          size="small"
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body1">No participants found.</Typography>
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
                    <Typography variant="subtitle1" fontWeight="bold">Description</Typography>
                    <Typography variant="body1" paragraph>
                      {trip.description}
                    </Typography>
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle1" fontWeight="bold">Location</Typography>
                    <Typography variant="body1" paragraph>
                      {trip.location}
                    </Typography>
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle1" fontWeight="bold">Dates</Typography>
                    <Typography variant="body1" paragraph>
                      {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                    </Typography>
                  </Grid>
                  
                  <Grid size={12}>
                    <Divider sx={{ my: 2 }} />
                  </Grid>
                  
                  {/* Show invite code to all participants - could be restricted to organizer only */}
                  <Grid size={12}>
                    <Typography variant="subtitle1" fontWeight="bold">Invite Code</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Typography variant="body1" sx={{ fontFamily: 'monospace', mr: 1 }}>
                        {trip.inviteCode}
                      </Typography>
                      <IconButton 
                        onClick={copyInviteCode} 
                        color={copySuccess ? 'success' : 'default'}
                        size="small"
                      >
                        <ContentCopyIcon />
                      </IconButton>
                      {copySuccess && (
                        <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
                          Copied!
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default TripPage; 