import React from 'react';
import Box from '@mui/material/Box';
import FirebaseStatus from './components/FirebaseStatus';
import AppRoutes from './routes';

function App() {
  return (
    <>
      <AppRoutes />
      
      {/* Only show Firebase status in development */}
      {import.meta.env.DEV && (
        <Box sx={{ 
          position: 'fixed', 
          bottom: 0, 
          right: 0, 
          maxWidth: '100%', 
          width: 'auto', 
          m: 2, 
          p: 2, 
          bgcolor: 'background.paper', 
          borderRadius: 1, 
          boxShadow: 3,
          opacity: 0.9,
          zIndex: 1000
        }}>
          <FirebaseStatus />
        </Box>
      )}
    </>
  );
}

export default App;
