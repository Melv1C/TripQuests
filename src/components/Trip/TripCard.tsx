import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Button, 
  Box,
  Chip
} from '@mui/material';
import { TripDocument } from '../../types/Trip';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

interface TripCardProps {
  trip: TripDocument;
}

/**
 * A reusable card component to display trip summary information
 */
const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  // Format dates nicely if available
  const formatDate = (date: Date | null) => {
    if (!date) return 'TBD';
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Prepare date display text
  const dateText = trip.startDate && trip.endDate
    ? `${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}`
    : trip.startDate
      ? `From ${formatDate(trip.startDate)}`
      : 'Dates not set';

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="div">
          {trip.name}
        </Typography>
        
        {trip.location && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOnIcon color="action" sx={{ mr: 1, fontSize: 18 }} />
            <Typography variant="body2" color="text.secondary">
              {trip.location}
            </Typography>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CalendarTodayIcon color="action" sx={{ mr: 1, fontSize: 18 }} />
          <Typography variant="body2" color="text.secondary">
            {dateText}
          </Typography>
        </Box>
        
        {trip.description && (
          <Typography variant="body2" color="text.secondary" sx={{ 
            mb: 1,
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {trip.description}
          </Typography>
        )}
      </CardContent>
      
      <CardActions>
        <Button 
          size="small" 
          component={RouterLink} 
          to={`/trip/${trip.id}`}
          variant="contained"
          sx={{ ml: 'auto' }}
        >
          View Trip
        </Button>
      </CardActions>
    </Card>
  );
};

export default TripCard; 