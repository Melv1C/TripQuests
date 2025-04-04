import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  CardActions, 
  Button, 
  Chip, 
  Box,
  CardActionArea
} from '@mui/material';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { QuestDocument } from '../../types/Quest';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';

interface QuestCardProps {
  quest: QuestDocument;
  onClick?: () => void;
}

const QuestCard: React.FC<QuestCardProps> = ({ quest, onClick }) => {
  // Format date helper (handles both Date and Firestore Timestamp)
  const formatDate = (date: Date | Timestamp | null) => {
    if (!date) return null;
    
    try {
      // If it's a Firestore Timestamp, convert to Date
      if (date instanceof Timestamp) {
        return format(date.toDate(), 'PPP');
      }
      // If it's already a Date object
      if (date instanceof Date) {
        return format(date, 'PPP');
      }
      return null;
    } catch (error) {
      console.error('Error formatting date:', error);
      return null;
    }
  };
  
  const formattedDeadline = formatDate(quest.deadline);
  
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
      <CardActionArea 
        onClick={onClick}
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'flex-start', 
          height: '100%' 
        }}
      >
        <CardContent sx={{ flexGrow: 1, width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              {quest.title}
            </Typography>
            <Chip 
              icon={<StarIcon />}
              label={`${quest.points} pts`}
              color="primary"
              size="small"
              sx={{ ml: 1 }}
            />
          </Box>
          
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              mb: 2, 
              // Truncate long descriptions
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {quest.description}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
            <Typography variant="body2" color="text.secondary">
              Created by {quest.creatorPseudo}
            </Typography>
            
            {formattedDeadline && (
              <Chip
                icon={<AccessTimeIcon />}
                label={`Due: ${formattedDeadline}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </CardContent>
      </CardActionArea>
      
      <CardActions>
        <Button size="small" onClick={onClick}>
          View Details
        </Button>
      </CardActions>
    </Card>
  );
};

export default QuestCard; 