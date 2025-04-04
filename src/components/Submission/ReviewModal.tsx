import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { SubmissionDocument } from '../../types/Submission';
import { QuestDocument } from '../../types/Quest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewSubmission } from '../../services/firestore/submissions';
import { useAtomValue, useSetAtom } from 'jotai';
import { userDataAtom } from '../../store/atoms/authAtoms';
import { showNotification } from '../../store/atoms/notificationAtom';

type ReviewModalProps = {
  open: boolean;
  onClose: () => void;
  submission: SubmissionDocument | null;
  quest: QuestDocument | null;
}

/**
 * Modal component to display a submission for review
 */
export function ReviewModal(props: ReviewModalProps) {
  const { open, onClose, submission, quest } = props;
  const userData = useAtomValue(userDataAtom);
  const setNotification = useSetAtom(showNotification);
  const queryClient = useQueryClient();

  const reviewMutation = useMutation({
    mutationFn: async ({
      submissionId,
      questId,
      decision
    }: {
      submissionId: string;
      questId: string;
      decision: 'approved' | 'rejected';
    }) => {
      if (!userData?.uid) {
        throw new Error('User must be logged in to review submissions');
      }
      return reviewSubmission(submissionId, questId, userData.uid, decision);
    },
    onSuccess: (_, variables) => {
      // Invalidate submissions queries to refresh data
      queryClient.invalidateQueries({ 
        queryKey: ['collection', 'submissions'] 
      });
      
      // Invalidate userTrips query to refresh dashboard data including scores
      queryClient.invalidateQueries({ 
        queryKey: ['userTrips'] 
      });
      
      // Show notification
      setNotification({
        message: `Submission ${variables.decision === 'approved' ? 'approved' : 'rejected'} successfully!`,
        severity: variables.decision === 'approved' ? 'success' : 'info'
      });

      // Close the modal
      onClose();
    },
    onError: (error) => {
      console.error('Error reviewing submission:', error);
      setNotification({
        message: `Error reviewing submission: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
    }
  });

  const handleReview = (decision: 'approved' | 'rejected') => {
    if (!submission?.id || !quest?.id) return;
    
    reviewMutation.mutate({
      submissionId: submission.id,
      questId: quest.id,
      decision
    });
  };

  // Early return if no submission or quest
  if (!open || !submission || !quest) {
    return null;
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6">{quest.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              Submitted by {submission.submitterPseudo}
            </Typography>
          </Box>
          <Chip 
            label={`${quest.points} points`}
            color="primary"
            size="medium"
          />
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {reviewMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {reviewMutation.error instanceof Error 
              ? reviewMutation.error.message 
              : 'An error occurred while reviewing the submission'
            }
          </Alert>
        )}

        {/* Evidence Image */}
        {submission.evidence.imageUrl && (
          <Box 
            sx={{ 
              width: '100%', 
              maxHeight: 'calc(70vh - 200px)',
              overflow: 'hidden',
              mb: 2,
              borderRadius: 1,
              boxShadow: 1
            }}
          >
            <img 
              src={submission.evidence.imageUrl} 
              alt="Quest evidence" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain',
                maxHeight: 'calc(70vh - 200px)',
                display: 'block'
              }} 
            />
          </Box>
        )}

        {/* Evidence Notes */}
        {submission.evidence.notes && (
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>
              Notes from submitter:
            </Typography>
            <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
              {submission.evidence.notes}
            </Typography>
          </Paper>
        )}
      </DialogContent>

      <DialogActions 
        sx={{ 
          p: 2, 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          '& .MuiButton-root': {
            my: { xs: 0.5, sm: 0 }
          }
        }}
      >
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ mb: { xs: 1, sm: 0 } }}
        >
          Review this submission:
        </Typography>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            width: { xs: '100%', sm: 'auto' },
            gap: 1,
            marginLeft: 'auto !important'
          }}
        >
          <Button
            variant="outlined"
            color="error"
            fullWidth={true}
            size="large"
            startIcon={reviewMutation.isPending ? <CircularProgress size={16} color="error" /> : <CancelIcon />}
            onClick={() => handleReview('rejected')}
            disabled={reviewMutation.isPending}
          >
            Reject
          </Button>
          <Button
            variant="contained"
            color="success"
            fullWidth={true}
            size="large"
            startIcon={reviewMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
            onClick={() => handleReview('approved')}
            disabled={reviewMutation.isPending}
          >
            Approve
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
} 