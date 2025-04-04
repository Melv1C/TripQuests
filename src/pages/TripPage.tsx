import React from 'react';
import { Container, Typography, Box, Paper, Tabs, Tab } from '@mui/material';
import { useParams } from 'react-router-dom';

const TripPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Trip Details
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Trip ID: {tripId}
        </Typography>
        
        <Paper sx={{ width: '100%', mt: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Quests" />
            <Tab label="Leaderboard" />
            <Tab label="Members" />
            <Tab label="Info" />
          </Tabs>
          
          <Box sx={{ p: 3 }}>
            {tabValue === 0 && (
              <Typography variant="body1">
                Quests tab content will appear here. This is a placeholder.
              </Typography>
            )}
            {tabValue === 1 && (
              <Typography variant="body1">
                Leaderboard tab content will appear here. This is a placeholder.
              </Typography>
            )}
            {tabValue === 2 && (
              <Typography variant="body1">
                Members tab content will appear here. This is a placeholder.
              </Typography>
            )}
            {tabValue === 3 && (
              <Typography variant="body1">
                Trip information tab content will appear here. This is a placeholder.
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default TripPage; 