import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Paper, Grid, CircularProgress } from '@mui/material';
import { useAtomValue } from 'jotai';
import { currentUserAtom, userDataAtom, isAuthLoadingAtom } from '../store/atoms/authAtoms';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAtomValue(currentUserAtom);
  const userData = useAtomValue(userDataAtom);
  const isAuthLoading = useAtomValue(isAuthLoadingAtom);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !currentUser) {
      navigate('/login');
    }
  }, [isAuthLoading, currentUser, navigate]);

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
          <Grid item xs={12} md={6}>
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
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Pending Quests
              </Typography>
              <Typography variant="body2">
                Your pending quests will be displayed here. This is a placeholder for the quests list.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default DashboardPage; 