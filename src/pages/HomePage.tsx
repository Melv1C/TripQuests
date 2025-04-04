import React from 'react';
import { Container, Typography, Box, Button, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to TripQuest
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Your gamified travel companion!
        </Typography>
        <Typography variant="body1" paragraph sx={{ textAlign: 'center', mb: 4 }}>
          Create and join trips, complete quests, and compete with your friends for the top spot on the leaderboard.
        </Typography>
        
        <Stack spacing={2} direction="column" sx={{ mt: 2 }}>
          <Typography variant="h6" component="h3" gutterBottom>
            Navigation Links (Temporary for Testing)
          </Typography>
          <Button component={RouterLink} to="/login" variant="contained" color="primary">
            Login
          </Button>
          <Button component={RouterLink} to="/register" variant="outlined" color="primary">
            Register
          </Button>
          <Button component={RouterLink} to="/dashboard" variant="outlined">
            Dashboard
          </Button>
          <Button component={RouterLink} to="/profile" variant="outlined">
            Profile
          </Button>
          <Button component={RouterLink} to="/create-trip" variant="outlined">
            Create Trip
          </Button>
          <Button component={RouterLink} to="/trip/test-trip-id" variant="outlined">
            View Sample Trip
          </Button>
          <Button component={RouterLink} to="/non-existent-page" variant="outlined" color="error">
            Test 404 Page
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default HomePage; 