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
  Divider 
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useAtomValue } from 'jotai';
import { userDataAtom } from '../store/atoms/authAtoms';
import { useDocument, useCollection } from '../hooks/useFirestore';
import { TripDocument, ParticipantData } from '../types/Trip';
import { Timestamp } from 'firebase/firestore';

const TripPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const [tabValue, setTabValue] = React.useState(0);
  const userData = useAtomValue(userDataAtom);
  const [copySuccess, setCopySuccess] = React.useState(false);
  
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
              <Typography variant="body1">
                Quests tab content will appear here. This is a placeholder.
              </Typography>
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