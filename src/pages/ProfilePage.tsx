import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Paper, Avatar, CircularProgress, Button } from '@mui/material';
import { useAtomValue } from 'jotai';
import { currentUserAtom, userDataAtom, isAuthLoadingAtom } from '../store/atoms/authAtoms';
import { signOut } from '../services/auth';

export const ProfilePage: React.FC = () => {
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

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Show loading state while auth state is being determined
  if (isAuthLoading || !userData) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Your Profile
        </Typography>
        
        <Paper elevation={2} sx={{ p: 4, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar 
              sx={{ width: 80, height: 80, mr: 3 }} 
              alt={userData.pseudo}
              src={userData.avatarUrl || undefined}
            />
            <Box>
              <Typography variant="h5" gutterBottom>
                {userData.pseudo}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {userData.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Member since: {userData.createdAt ? userData.createdAt.toLocaleDateString() : 'N/A'}
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="body1" paragraph>
            Participating in {userData.participatingTripIds.length} {userData.participatingTripIds.length === 1 ? 'trip' : 'trips'}
          </Typography>
          
          <Button 
            variant="outlined" 
            color="error" 
            onClick={handleLogout}
            sx={{ mt: 2 }}
          >
            Sign Out
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};
