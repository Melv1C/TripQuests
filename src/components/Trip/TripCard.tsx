import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Card, 
  CardContent,
  Typography, 
  Box,
  Chip,
  Skeleton
} from '@mui/material';
import { TripDocument } from '../../types/Trip';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import StarIcon from '@mui/icons-material/Star';
import { useAtomValue } from 'jotai';
import { userDataAtom } from '../../store/atoms/authAtoms';
import { useUserTripScore } from '../../hooks/useUserTripScore';

interface TripCardProps {
  trip: TripDocument;
}

/**
 * A reusable card component to display trip summary information
 * The entire card is clickable and navigates to the trip details
 */
const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  // Get current user
  const userData = useAtomValue(userDataAtom);
  
  // Get user's score for this trip
  const { score, isLoading: isScoreLoading } = useUserTripScore(
    trip.id || '', // Provide empty string as fallback if trip.id is undefined
    userData?.uid
  );
  
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
      component={RouterLink} 
      to={`/trip/${trip.id}`}
      sx={{ 
        textDecoration: 'none',
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
          '&:after': {
            opacity: 1
          }
        },
        cursor: 'pointer'
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography 
            gutterBottom 
            variant="h5" 
            component="div" 
            color="text.primary"
            fontWeight="500"
            sx={{ mb: 0 }}
          >
            {trip.name}
          </Typography>
          
          {/* User's score for this trip */}
          {isScoreLoading ? (
            <Skeleton variant="rounded" width={80} height={32} />
          ) : (
            <Chip
              icon={<StarIcon />}
              label={`${score} pts`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 500 }}
            />
          )}
        </Box>
        
        {trip.location && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            <LocationOnIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
            <Typography variant="body2" color="text.primary">
              {trip.location}
            </Typography>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CalendarTodayIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant="body2" color="text.primary">
            {dateText}
          </Typography>
        </Box>
        
        {trip.description && (
          <Typography variant="body2" color="text.primary" sx={{ 
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
    </Card>
  );
};

export default TripCard; 