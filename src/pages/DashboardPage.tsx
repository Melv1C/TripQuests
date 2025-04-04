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
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import { useAtomValue } from 'jotai';
import { currentUserAtom, userDataAtom, isAuthLoadingAtom } from '../store/atoms/authAtoms';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { joinTripSchema, JoinTripFormData } from '../lib/schemas/trip';
import { useMutation } from '@tanstack/react-query';
import { joinTripByInviteCode } from '../services/firestore/trips';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAtomValue(currentUserAtom);
  const userData = useAtomValue(userDataAtom);
  const isAuthLoading = useAtomValue(isAuthLoadingAtom);
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
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Your Trips
              </Typography>
              {userData.participatingTripIds.length > 0 ? (
                <Typography>
                  You have {userData.participatingTripIds.length} {userData.participatingTripIds.length === 1 ? 'trip' : 'trips'}.
                </Typography>
              ) : (
                <Typography variant="body2">
                  You haven't joined any trips yet. Create a new trip or join an existing one!
                </Typography>
              )}
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
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

export default DashboardPage; 