import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import FirebaseStatus from './components/FirebaseStatus';

function App() {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Trip Quest App
        </Typography>
        <Typography variant="body1" gutterBottom>
          Welcome to Trip Quest - Your gamified travel companion!
        </Typography>
        
        {/* Only show Firebase status in development */}
        {import.meta.env.DEV && (
          <Box sx={{ width: '100%', mt: 3 }}>
            <FirebaseStatus />
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default App;
