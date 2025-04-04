import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const CreateTripPage: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Trip
        </Typography>
        <Typography variant="body1" paragraph>
          Use this form to create a new trip adventure for you and your friends.
        </Typography>
        
        <Paper elevation={3} sx={{ p: 4, mt: 2 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Trip Creation Form
          </Typography>
          <Typography variant="body2">
            This is a placeholder for the trip creation form that will be implemented in a future step.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateTripPage; 