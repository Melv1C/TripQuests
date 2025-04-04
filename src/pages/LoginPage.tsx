import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const LoginPage: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Login Page
          </Typography>
          <Typography variant="body1" align="center">
            This is a placeholder for the login form that will be implemented in a future step.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage; 