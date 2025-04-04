import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box, 
  Chip, 
  IconButton,
  Tab,
  Tabs
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import PersonIcon from '@mui/icons-material/Person';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { QuestDocument } from '../../types/Quest';
import SubmissionForm from '../Submission/SubmissionForm';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`quest-tabpanel-${index}`}
      aria-labelledby={`quest-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

interface QuestDetailsModalProps {
  quest: QuestDocument;
  open: boolean;
  onClose: (success?: boolean) => void;
}

const QuestDetailsModal: React.FC<QuestDetailsModalProps> = ({ 
  quest, 
  open, 
  onClose 
}) => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSubmissionSuccess = () => {
    onClose(true);
  };

  const handleClose = () => {
    onClose();
  };

  // Format date helper (handles both Date and Firestore Timestamp)
  const formatDate = (date: Date | Timestamp | null) => {
    if (!date) return 'No deadline';
    
    try {
      // If it's a Firestore Timestamp, convert to Date
      if (date instanceof Timestamp) {
        return format(date.toDate(), 'PPP');
      }
      // If it's already a Date object
      if (date instanceof Date) {
        return format(date, 'PPP');
      }
      return 'Invalid date';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div">
          {quest.title}
        </Typography>
        <IconButton 
          aria-label="close" 
          onClick={() => onClose()} 
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ px: 3, py: 0 }}>
        {/* Quest info section */}
        <Box sx={{ mb: 2, mt: 2 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip 
              icon={<StarIcon />} 
              label={`${quest.points} points`} 
              color="primary"
              size="small"
            />
            {quest.deadline && (
              <Chip
                icon={<AccessTimeIcon />}
                label={`Due: ${formatDate(quest.deadline)}`}
                variant="outlined"
                size="small"
              />
            )}
            <Chip
              icon={<PersonIcon />}
              label={`Created by: ${quest.creatorPseudo}`}
              variant="outlined"
              size="small"
            />
          </Box>
          
          {quest.imageUrl && (
            <Box sx={{ mb: 2, maxHeight: 200, overflow: 'hidden', borderRadius: 1 }}>
              <img
                src={quest.imageUrl}
                alt={quest.title}
                style={{ width: '100%', objectFit: 'cover' }}
              />
            </Box>
          )}
        </Box>
        
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="quest details tabs"
          variant="fullWidth"
        >
          <Tab label="Details" id="quest-tab-0" aria-controls="quest-tabpanel-0" />
          <Tab label="Submit Evidence" id="quest-tab-1" aria-controls="quest-tabpanel-1" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line', minHeight: 100 }}>
            {quest.description}
          </Typography>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <SubmissionForm 
            questId={quest.id || ''} 
            tripId={quest.tripId}
            onSubmissionSuccess={handleSubmissionSuccess}
          />
        </TabPanel>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={() => onClose()}>Close</Button>
        {tabValue === 0 && (
          <Button 
            variant="contained" 
            onClick={() => setTabValue(1)}
          >
            Submit Evidence
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default QuestDetailsModal; 