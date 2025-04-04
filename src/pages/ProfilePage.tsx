import React from 'react';
import { Container, Typography, Box, Paper, Avatar, Grid } from '@mui/material';

const ProfilePage: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Profile
        </Typography>
        
        <Paper elevation={3} sx={{ p: 4, mt: 2 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Avatar 
                sx={{ width: 120, height: 120 }}
                alt="Profile Picture"
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <Typography variant="h5" component="h2" gutterBottom>
                Profile Information
              </Typography>
              <Typography variant="body1">
                This is a placeholder for the user profile details that will be implemented in a future step.
              </Typography>
            </Grid>
          </Grid>
        </Paper>
        
        <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Activity History
          </Typography>
          <Typography variant="body1">
            This is a placeholder for the user's activity history that will be implemented in a future step.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProfilePage; 