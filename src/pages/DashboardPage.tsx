import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  CircularProgress, 
  TextField,
  Button,
  Alert,
  Snackbar,
  Skeleton
} from '@mui/material';
import { useAtomValue } from 'jotai';
import { currentUserAtom, userDataAtom, isAuthLoadingAtom } from '../store/atoms/authAtoms';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { joinTripSchema, JoinTripFormData } from '../lib/schemas/trip';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getTripsByIds, joinTripByInviteCode } from '../services/firestore/trips';
import TripCard from '../components/Trip/TripCard';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAtomValue(currentUserAtom);
  const userData = useAtomValue(userDataAtom);
  const isAuthLoading = useAtomValue(isAuthLoadingAtom);
  const queryClient = useQueryClient();
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Join trip form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<JoinTripFormData>({
    resolver: zodResolver(joinTripSchema),
    defaultValues: {
      inviteCode: '',
    }
  });

  // Fetch user's trips
  const { 
    data: tripsData, 
    isLoading: isTripsLoading, 
    isError: isTripsError,
    error: tripsError 
  } = useQuery({
    queryKey: ['userTrips', userData?.uid, userData?.participatingTripIds],
    queryFn: () => getTripsByIds(userData?.participatingTripIds || []),
    enabled: !!userData && userData.participatingTripIds.length > 0
  });

  // Join trip mutation
  const joinTripMutation = useMutation({
    mutationFn: ({ inviteCode }: JoinTripFormData) => {
      if (!userData) {
        throw new Error('You must be logged in to join a trip');
      }
      return joinTripByInviteCode(inviteCode, userData);
    },
    onSuccess: (data) => {
      // Show success message
      setSnackbar({
        open: true,
        message: `Successfully joined trip "${data.tripName}"!`,
        severity: 'success',
      });
      // Reset form
      reset();
      // Invalidate the trips query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['userTrips', userData?.uid] });
    },
    onError: (error: Error) => {
      // Show error message
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error',
      });
    }
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !currentUser) {
      navigate('/login');
    }
  }, [isAuthLoading, currentUser, navigate]);

  // Handle join trip form submission
  const onSubmitJoinTrip = (data: JoinTripFormData) => {
    joinTripMutation.mutate(data);
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Show loading state while auth state is being determined
  if (isAuthLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  // If user data is still loading or not available, show simplified loading
  if (!userData) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Render trip list or appropriate message
  const renderTripList = () => {
    if (isTripsLoading) {
      // Show skeleton loading state for trips
      return (
        <Grid container spacing={3}>
          {[1, 2, 3].map((item) => (
            <Grid key={item} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
            </Grid>
          ))}
        </Grid>
      );
    }

    if (isTripsError) {
      return (
        <Alert severity="error" sx={{ my: 2 }}>
          {tripsError instanceof Error ? tripsError.message : 'Failed to load your trips. Please try again later.'}
        </Alert>
      );
    }

    if (!tripsData || tripsData.length === 0) {
      return (
        <Typography variant="body2" sx={{ my: 2 }}>
          You haven't joined any trips yet. Create a new trip or join an existing one using an invite code!
        </Typography>
      );
    }

    // Display trip cards in a grid
    return (
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {tripsData.map((trip) => (
          <Grid key={trip.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <TripCard trip={trip} />
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome, {userData.pseudo}
        </Typography>
        <Typography variant="body1" paragraph>
          This is your TripQuest dashboard. Here you'll see your trips and upcoming quests.
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Your Trips
              </Typography>
              {renderTripList()}
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={() => navigate('/create-trip')}
                >
                  Create New Trip
                </Button>
              </Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Pending Quests
              </Typography>
              <Typography variant="body2">
                Your pending quests will be displayed here. This is a placeholder for the quests list.
              </Typography>
            </Paper>
          </Grid>
          
          {/* Join Trip Section */}
          <Grid size={12} sx={{ mt: 2 }}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Join a Trip
              </Typography>
              <Typography variant="body2" paragraph>
                Enter a 6-character invite code to join an existing trip.
              </Typography>
              
              <form onSubmit={handleSubmit(onSubmitJoinTrip)}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'flex-start' }}>
                  <TextField
                    label="Invite Code"
                    {...register('inviteCode')}
                    error={!!errors.inviteCode}
                    helperText={errors.inviteCode?.message}
                    placeholder="ABCD12"
                    inputProps={{ 
                      style: { textTransform: 'uppercase' },
                      maxLength: 6
                    }}
                    sx={{ 
                      flexGrow: 1,
                      '& input': { fontFamily: 'monospace' }
                    }}
                  />
                  <Button 
                    type="submit" 
                    variant="contained" 
                    disabled={joinTripMutation.isPending}
                    sx={{ mt: { xs: 1, sm: 0 }, minWidth: '120px' }}
                  >
                    {joinTripMutation.isPending ? <CircularProgress size={24} /> : 'Join Trip'}
                  </Button>
                </Box>
                {joinTripMutation.isError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {joinTripMutation.error instanceof Error ? joinTripMutation.error.message : 'An error occurred'}
                  </Alert>
                )}
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};
