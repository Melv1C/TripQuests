import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  Button, 
  Chip,
  CircularProgress,
  CardActions,
  Divider,
  Paper
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { SubmissionDocument } from '../../types/Submission';
import { QuestDocument } from '../../types/Quest';

interface ReviewCardProps {
  submission: SubmissionDocument;
  quest: QuestDocument;
  onReview: (submissionId: string, questId: string, decision: 'approved' | 'rejected') => void;
  isReviewing: boolean;
}

/**
 * Component to display a submission for review
 */
const ReviewCard: React.FC<ReviewCardProps> = ({ submission, quest, onReview, isReviewing }) => {
  if (!submission.id) return null;

  return (
    <Card sx={{ mb: 2, overflow: 'visible' }}>
      <Box sx={{ p: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box>
            <Typography variant="h6" component="div" sx={{ lineHeight: 1.2 }}>
              {quest.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Submission by: {submission.submitterPseudo}
            </Typography>
          </Box>
          <Chip 
            label={`${quest.points} points`}
            color="primary"
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
      </Box>

      {submission.evidence.imageUrl && (
        <CardMedia
          component="img"
          height="200"
          image={submission.evidence.imageUrl}
          alt="Quest evidence"
          sx={{ objectFit: 'cover' }}
        />
      )}

      <CardContent sx={{ pt: 1 }}>
        {submission.evidence.notes && (
          <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
            <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
              {submission.evidence.notes}
            </Typography>
          </Paper>
        )}
      </CardContent>

      <Divider />
      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Review this submission:
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="error"
            startIcon={isReviewing ? <CircularProgress size={16} color="error" /> : <CancelIcon />}
            onClick={() => onReview(submission.id!, quest.id!, 'rejected')}
            disabled={isReviewing}
            sx={{ mr: 1 }}
          >
            Reject
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={isReviewing ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
            onClick={() => onReview(submission.id!, quest.id!, 'approved')}
            disabled={isReviewing}
          >
            Approve
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};

export default ReviewCard; 