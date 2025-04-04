import React from 'react';
import { Container, Typography, Box, Paper, Grid } from '@mui/material';

const DashboardPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" paragraph>
          Welcome to your TripQuest dashboard. This is where you'll see your trips and upcoming quests.
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Your Trips
              </Typography>
              <Typography variant="body2">
                Your trips will be displayed here. This is a placeholder for the trips list.
              </Typography>
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