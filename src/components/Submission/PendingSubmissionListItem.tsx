import React from 'react';
import { 
  ListItem, 
  ListItemButton, 
  Typography, 
  Box, 
  Chip, 
  ListItemText,
  Avatar,
  ListItemAvatar,
  Paper,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { formatDistanceToNow } from 'date-fns';
import { SubmissionDocument } from '../../types/Submission';
import { Timestamp } from 'firebase/firestore';

type PendingSubmissionListItemProps = {
  submission: SubmissionDocument;
  questTitle: string;
  questPoints: number;
  onClick: () => void;
}

/**
 * A compact list item that displays a summary of a pending submission
 */
export function PendingSubmissionListItem(props: PendingSubmissionListItemProps) {
  const { submission, questTitle, questPoints, onClick } = props;
  
  // Format the submitted time in a relative format (e.g., "2 hours ago")
  const formattedTime = React.useMemo(() => {
    if (!submission.submittedAt) return 'recently';
    
    try {
      // Check if it's a Firestore Timestamp and convert accordingly
      if (submission.submittedAt instanceof Timestamp) {
        return formatDistanceToNow(submission.submittedAt.toDate(), { addSuffix: true });
      }
      // Handle regular Date objects
      else if (submission.submittedAt instanceof Date) {
        return formatDistanceToNow(submission.submittedAt, { addSuffix: true });
      }
      // Handle string or number timestamps by converting to Date
      return formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'recently';
    }
  }, [submission.submittedAt]);

  return (
    <Paper variant="outlined" sx={{ mb: 1, overflow: 'hidden' }}>
      <ListItem disablePadding>
        <ListItemButton onClick={onClick} sx={{ py: 1.5 }}>
          <ListItemAvatar>
            <Avatar>
              <AssignmentIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pr: 1 }}>
                <Typography variant="subtitle1" component="span">
                  {questTitle}
                </Typography>
                <Chip 
                  label={`${questPoints} pts`}
                  color="primary"
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Box>
            }
            secondary={
              <Box sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}>
                <Typography variant="body2" component="span">
                  Submitted by: {submission.submitterPseudo}
                </Typography>
                <Typography variant="caption" color="text.secondary" component="span">
                  Submitted {formattedTime}
                </Typography>
              </Box>
            }
          />
        </ListItemButton>
      </ListItem>
    </Paper>
  );
} 